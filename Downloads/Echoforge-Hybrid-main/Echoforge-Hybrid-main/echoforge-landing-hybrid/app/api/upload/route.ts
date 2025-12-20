import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { uploadLimiter, getClientIdentifier, rateLimitResponse } from "@/lib/rate-limit"
import { checkUsageLimit, getMaxFileSize, recordUsage } from "@/lib/usage-limits"
import { AuthenticationError, ValidationError, InternalServerError, withErrorHandler } from "@/lib/errors"
import { log } from "@/lib/logger"
import { Plan } from "@prisma/client"

// Next.js 14 App Router handles request bodies automatically
// No config needed - formData() works out of the box

export const POST = withErrorHandler(async (req: Request) => {
  const startTime = Date.now();
  
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthenticationError("Please sign in to upload files");
  }

  const userId = session.user.id as string;
  const userPlan = (session.user.plan as Plan) || 'FREE';

  log.info("File upload request received", { userId, plan: userPlan });

  // Rate limiting
  const identifier = getClientIdentifier(req as unknown as NextRequest, userId);
  const rateLimit = await uploadLimiter.check(identifier);
  
  if (!rateLimit.success) {
    log.warn("Rate limit exceeded", { userId, identifier });
    return rateLimitResponse(rateLimit.reset);
  }

  // Check usage limits
  const usageCheck = await checkUsageLimit(userId, userPlan);
  
  if (!usageCheck.allowed) {
    log.warn("Usage limit exceeded", { userId, used: usageCheck.used, limit: usageCheck.limit });
    throw new ValidationError(
      `You've reached your daily limit of ${usageCheck.limit} analyses. Upgrade your plan for more.`
    );
  }

  // Parse form data
  const formData = await req.formData().catch(() => {
    throw new ValidationError("Invalid form data");
  });
  
  const file = formData.get('file') as File | null;
  
  if (!file) {
    throw new ValidationError("No file provided");
  }

  // Check file size limit
  const maxFileSize = getMaxFileSize(userPlan);
  if (file.size > maxFileSize) {
    log.warn("File too large", { 
      userId, 
      fileSize: file.size, 
      maxSize: maxFileSize,
      plan: userPlan 
    });
    throw new ValidationError(
      `File size exceeds your plan limit of ${Math.round(maxFileSize / 1024 / 1024)}MB. Please upgrade your plan.`
    );
  }

  const fileSize = file.size;
  const fileName = file.name;
  
  log.info("Processing file", { userId, fileName, fileSize });

  // Read file content for analysis
  const fileContent = await file.text().catch(() => {
    throw new InternalServerError("Failed to read file content");
  });
  
  let dataPoints = 0;
  let parsedData: number[][] = [];
  
  try {
    if (fileName.endsWith('.csv')) {
      const lines = fileContent.split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        const headers = lines[0].split(',');
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: Record<string, number | string> = {};
          headers.forEach((h, i) => {
            obj[h.trim()] = isNaN(parseFloat(values[i] || '')) ? values[i] || '' : parseFloat(values[i] || '');
          });
          return Object.values(obj).filter((v): v is number => typeof v === 'number');
        }).filter(row => row.length > 0);
        dataPoints = parsedData.length;
      }
    } else if (fileName.endsWith('.json')) {
      const jsonData = JSON.parse(fileContent);
      parsedData = Array.isArray(jsonData) ? jsonData.filter((row): row is number[] => 
        Array.isArray(row) && row.every(v => typeof v === 'number')
      ) : [];
      dataPoints = parsedData.length;
    } else {
      throw new ValidationError("Unsupported file format. Please upload CSV or JSON files.");
    }
  } catch (parseError) {
    log.error("File parsing error", parseError instanceof Error ? parseError : new Error(String(parseError)), {
      userId,
      fileName,
    });
    throw new ValidationError("Invalid file format. Please ensure the file is valid CSV or JSON.");
  }

  if (dataPoints === 0) {
    throw new ValidationError("No valid data points found in file. Please ensure the file contains numeric data.");
  }
    
    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        type: 'ANOMALY_DETECTION',
        fileName,
        fileSize,
        dataPoints,
        status: 'PROCESSING'
      }
    })

    // Record usage
    await recordUsage(session.user.id, 'ANALYSIS')

    // Process with real ML API
    const API_URL = (
      process.env.ECHOFORGE_API_URL ||
      process.env.ML_API_URL ||
      process.env.NEXT_PUBLIC_ECHOFORGE_API_URL ||
      ''
    ).replace(/\/$/, '')
    const API_KEY = process.env.ECHOFORGE_API_KEY || process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''

    if (!API_URL || !API_KEY) {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          results: { error: 'ML API not configured' }
        }
      })
      return NextResponse.json({ error: 'ML API not configured' }, { status: 503 })
    }

    // Call real detection API
    try {
      const detectResponse = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-echo-key': API_KEY
        },
        body: JSON.stringify({
          data: parsedData,
          method: 'isolation_forest',
          sensitivity: 0.1,
          expected_rate: 0.05,
          fileName
        })
      })

      if (!detectResponse.ok) {
        throw new Error(`Detection API returned ${detectResponse.status}`)
      }

      const detectResult = await detectResponse.json()

      // Update analysis with real results
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'COMPLETED',
          anomaliesFound: detectResult.anomaliesFound ?? detectResult.anomalies_found ?? 0,
          accuracy: detectResult.accuracy ?? null,
          processingTime: detectResult.processingTime ?? detectResult.processing_time ?? null,
          completedAt: new Date(),
          results: detectResult
        }
      })
    } catch (apiError) {
      log.error("Detection API error", apiError instanceof Error ? apiError : new Error(String(apiError)), {
        userId,
        analysisId: analysis.id,
      });
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          results: { error: 'Detection API failed', details: apiError instanceof Error ? apiError.message : 'Unknown error' }
        }
      });
    }

    const duration = Date.now() - startTime;
    log.request("POST", "/api/upload", 200, duration, { userId, analysisId: analysis.id });

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        status: analysis.status,
        fileName: analysis.fileName,
        fileSize: analysis.fileSize,
        dataPoints: analysis.dataPoints
      },
      usage: {
        used: usageCheck.used + 1,
        remaining: usageCheck.remaining - 1,
        limit: usageCheck.limit
      }
    });
});

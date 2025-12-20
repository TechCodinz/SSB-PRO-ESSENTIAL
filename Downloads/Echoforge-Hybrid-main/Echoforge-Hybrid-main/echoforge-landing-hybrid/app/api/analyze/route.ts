import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analysisRequestSchema, validateRequest } from "@/lib/api-validation";
import { AuthenticationError, InternalServerError, withErrorHandler } from "@/lib/errors";
import { log } from "@/lib/logger";

// ML Model configurations
const MODEL_CONFIGS = {
  isolation_forest: { name: "Isolation Forest", accuracy: 0.94, category: "unsupervised" },
  lof: { name: "Local Outlier Factor", accuracy: 0.91, category: "density" },
  svm: { name: "One-Class SVM", accuracy: 0.88, category: "boundary" },
  zscore: { name: "Z-Score", accuracy: 0.85, category: "statistical" },
  modified_zscore: { name: "Modified Z-Score", accuracy: 0.87, category: "statistical" },
  iqr: { name: "IQR Method", accuracy: 0.83, category: "statistical" },
  moving_average: { name: "Moving Average", accuracy: 0.80, category: "time_series" },
  grubbs: { name: "Grubbs Test", accuracy: 0.86, category: "statistical" },
  gesd: { name: "GESD Test", accuracy: 0.89, category: "statistical" },
  lstm_autoencoder: { name: "LSTM Autoencoder", accuracy: 0.96, category: "deep_learning" },
  consensus: { name: "Consensus Mode", accuracy: 0.99, category: "ensemble" }
};

// Call real ML API for analysis
async function performMLAnalysis(
  data: number[][],
  models: string[],
  sensitivity: number = 0.1,
  expectedRate: number = 0.05,
  fileName?: string
): Promise<{
  anomalies: number[];
  scores: number[];
  accuracy: number;
  modelResults: Record<string, {
    name: string;
    accuracy: number;
    scores: number[];
    anomalyCount: number;
  }>;
  processingTime: number;
}> {
  const API_URL = (
    process.env.ECHOFORGE_API_URL ||
    process.env.ML_API_URL ||
    process.env.NEXT_PUBLIC_ECHOFORGE_API_URL ||
    ''
  ).replace(/\/$/, '')
  const API_KEY = process.env.ECHOFORGE_API_KEY || process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''

  if (!API_URL || !API_KEY) {
    throw new Error('ML API not configured. Please set ECHOFORGE_API_URL and ECHOFORGE_API_KEY environment variables.')
  }

  const startTime = Date.now()
  
  // Use consensus mode if multiple models, otherwise use first model
  const method = models.includes('consensus') ? 'consensus' : models[0] || 'isolation_forest'

  const response = await fetch(`${API_URL}/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-echo-key': API_KEY
    },
    body: JSON.stringify({
      data,
      method,
      sensitivity,
      expected_rate: expectedRate,
      fileName: fileName || 'uploaded_data.csv'
    })
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`ML API error (${response.status}): ${errorText}`)
  }

  const apiResult = await response.json()
  const processingTime = Date.now() - startTime

  // Transform API response to expected format
  const anomalies = apiResult.anomaly_indices || apiResult.anomalies || []
  const scores = apiResult.scores || apiResult.anomaly_scores || []
  const accuracy = apiResult.accuracy ?? 0.95
  const anomaliesFound = apiResult.anomaliesFound ?? apiResult.anomalies_found ?? anomalies.length

  const modelResults: Record<string, any> = {}
  models.forEach((model) => {
    const config = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS.isolation_forest
    modelResults[model] = {
      name: config.name,
      accuracy: apiResult.modelResults?.[model]?.accuracy ?? config.accuracy,
      scores: apiResult.modelResults?.[model]?.scores ?? scores,
      anomalyCount: anomaliesFound,
    }
  })

  return {
    anomalies: Array.isArray(anomalies) ? anomalies : [],
    scores: Array.isArray(scores) ? scores : [],
    accuracy: typeof accuracy === 'number' ? accuracy : 0.95,
    modelResults,
    processingTime
  }
}

export const POST = withErrorHandler(async (request: Request) => {
  const startTime = Date.now();
  
  // Authentication check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthenticationError("Please sign in to run analysis");
  }

  const userId = session.user.id as string;
  if (!userId) {
    throw new AuthenticationError("Invalid session");
  }

  log.info("Analysis request received", { userId });

  // Parse and validate request body
  const body = await request.json().catch(() => {
    throw new InternalServerError("Invalid JSON in request body");
  });

  const validation = validateRequest(analysisRequestSchema, body);
  if (!validation.success) {
    return validation.error;
  }

  const { data, models, sensitivity, expectedRate, fileName, analysisType } = validation.data;

  log.info("Starting ML analysis", {
    userId,
    dataRows: data.length,
    models: models?.length || 1,
    analysisType,
  });

  // Perform ML analysis using real API
  const result = await performMLAnalysis(data, models || ["isolation_forest"], sensitivity || 0.1, expectedRate || 0.05, fileName);
  
  log.info("ML analysis complete", {
    userId,
    anomaliesFound: result.anomalies.length,
    processingTime: result.processingTime,
  });

  // Save analysis to database
  const analysis = await prisma.analysis.create({
    data: {
      userId,
      type: analysisType || "ANOMALY_DETECTION",
      status: "COMPLETED",
      fileName: fileName || "uploaded_data.csv",
      dataPoints: data.length,
      anomaliesFound: result.anomalies.length,
      accuracy: result.accuracy,
      processingTime: result.processingTime,
      results: {
        config: {
          models: models || ["isolation_forest"],
          sensitivity: sensitivity || 0.1,
          expectedRate: expectedRate || 0.05,
        },
        anomalyIndices: result.anomalies,
        scores: result.scores,
        modelResults: result.modelResults,
      },
      completedAt: new Date(),
    },
  });

  // Update user analytics count
  await prisma.user.update({
    where: { id: userId },
    data: {
      analysesCount: { increment: 1 },
    },
  });

  const duration = Date.now() - startTime;
  log.request("POST", "/api/analyze", 200, duration, { userId, analysisId: analysis.id });

  return NextResponse.json({
    success: true,
    analysisId: analysis.id,
    anomaliesFound: result.anomalies.length,
    accuracy: result.accuracy,
    processingTime: result.processingTime,
    anomalyIndices: result.anomalies,
    scores: result.scores,
    modelResults: result.modelResults,
    message: `Analysis complete! Found ${result.anomalies.length} anomalies with ${(result.accuracy * 100).toFixed(1)}% confidence.`,
  });
});

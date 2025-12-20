import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        status: true,
        fileName: true,
        anomaliesFound: true,
        accuracy: true,
        processingTime: true,
        createdAt: true,
        completedAt: true,
        results: true,
      }
    })

    return NextResponse.json({ analyses })
  } catch (error) {
    console.error("Analyses fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, fileName, fileSize, dataPoints, data, method, sensitivity, expectedRate } = body

    // Check user plan limits
    // Handle tokenBalanceMicro gracefully if column doesn't exist yet
    let user: any
    try {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true, analysesCount: true, tokenBalanceMicro: true }
      })
    } catch (error: any) {
      // If tokenBalanceMicro column doesn't exist, query without it
      if (error.message?.includes('tokenBalanceMicro')) {
        user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { plan: true, analysesCount: true }
        })
        if (user) {
          user.tokenBalanceMicro = 0n // Default to 0 if column doesn't exist
        }
      } else {
        throw error
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userPlan = user.plan ?? 'FREE';

    // Handle Pay As You Go plan differently
    if (userPlan === 'PAY_AS_YOU_GO') {
      // Import PAYG pricing functions
      const { calculateAnalysisCost, hasSufficientBalance, formatTokens } = await import('@/lib/payg-pricing')
      
      const costMicro = calculateAnalysisCost(dataPoints || 1000)
      
      if (!hasSufficientBalance(user.tokenBalanceMicro, costMicro)) {
        return NextResponse.json(
          { 
            error: "Insufficient token balance",
            required: formatTokens(costMicro),
            current: formatTokens(user.tokenBalanceMicro),
          },
          { status: 402 }
        )
      }
      
      // Deduct tokens (will be done after analysis creation)
    } else {
      // Plan limits for subscription plans
      const limits: Record<string, number> = {
        FREE: 3,
        STARTER: 50,
        PRO: 500,
        ENTERPRISE: Infinity,
      }

      const userLimit = limits[userPlan] ?? 3
      if (user.analysesCount >= userLimit) {
        return NextResponse.json(
          { error: "Plan limit reached. Please upgrade." },
          { status: 403 }
        )
      }
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Dataset is required for analysis" },
        { status: 400 }
      )
    }

    const API_URL = (process.env.ECHOFORGE_API_URL || process.env.ML_API_URL || process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || '').replace(/\/$/, '')
    const API_KEY = process.env.ECHOFORGE_API_KEY || process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: "Detection engine not configured" },
        { status: 503 }
      )
    }

    // Create analysis
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        type: type || 'ANOMALY_DETECTION',
        fileName,
        fileSize,
        dataPoints,
        status: 'PROCESSING'
      }
    })

    // Update user analytics count or deduct tokens for PAYG
    if (userPlan === 'PAY_AS_YOU_GO' && user.tokenBalanceMicro !== undefined) {
      // Only deduct tokens if the column actually exists
      try {
        const { calculateAnalysisCost } = await import('@/lib/payg-pricing')
        const costMicro = calculateAnalysisCost(dataPoints || 1000)
        
        await prisma.$transaction([
          // Deduct tokens
          prisma.user.update({
            where: { id: session.user.id },
            data: { 
              tokenBalanceMicro: { decrement: costMicro },
              analysesCount: { increment: 1 }
            }
          }),
          // Log transaction
          prisma.usageRecord.create({
            data: {
              userId: session.user.id,
              type: 'TOKEN_TRANSACTION',
              metadata: {
                transactionType: 'DEBIT',
                tokensMicro: costMicro.toString(),
                description: `Analysis: ${fileName || 'untitled'}`,
                analysisId: analysis.id,
              }
            }
          })
        ])
      } catch (error: any) {
        // If token deduction fails (column doesn't exist), just increment count
        console.log('⚠️ Token deduction skipped (column not migrated):', error.message)
        await prisma.user.update({
          where: { id: session.user.id },
          data: { analysesCount: { increment: 1 } }
        })
      }
    } else {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { analysesCount: { increment: 1 } }
      })
    }

    // Call external detection engine with provided dataset
    const processAnalysis = async () => {
      try {
        const payload = {
          data,
          method: method || 'isolation_forest',
          sensitivity: sensitivity ?? 0.1,
          expected_rate: expectedRate ?? 0.05,
          fileName: fileName || 'uploaded_dataset.csv',
        }

        const mlResponse = await fetch(`${API_URL}/detect`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-echo-key': API_KEY
          },
          body: JSON.stringify(payload)
        })

        if (!mlResponse.ok) {
          const errorDetails = await mlResponse.json().catch(() => ({}))
          throw new Error(errorDetails?.error || 'Detection engine failed')
        }

        const mlResult = await mlResponse.json()

        // Update with REAL results from YOUR ML models
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'COMPLETED',
            anomaliesFound: mlResult.anomalies_count || mlResult.anomalies_found || 0,
            accuracy: mlResult.accuracy ?? null,
            processingTime: mlResult.processing_time_ms || mlResult.processingTime || null,
            completedAt: new Date(),
            results: mlResult
          }
        })
      } catch (mlError) {
        console.error("ML API error:", mlError)
        await prisma.analysis.update({
          where: { id: analysis.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            results: {
              error: 'DETECTION_ENGINE_FAILURE',
              message: mlError instanceof Error ? mlError.message : 'Detection engine failure',
            }
          }
        })
      }
    }

    // Process async
    processAnalysis()

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analysis creation error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

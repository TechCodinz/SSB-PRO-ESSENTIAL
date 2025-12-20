import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/detect/proxy
 * Proxy for detection engine - used by sample datasets and quick analyses
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { data, method, sensitivity, expected_rate, fileName } = body

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Dataset is required for analysis' },
        { status: 400 }
      )
    }

    // Check user plan limits (same as /api/analyses)
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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userPlan = user.plan ?? 'FREE'

    // Handle Pay As You Go plan
    if (userPlan === 'PAY_AS_YOU_GO') {
      const { calculateAnalysisCost, hasSufficientBalance, formatTokens } = await import('@/lib/payg-pricing')
      const costMicro = calculateAnalysisCost(data.length)
      
      if (!hasSufficientBalance(user.tokenBalanceMicro, costMicro)) {
        return NextResponse.json(
          { 
            error: 'Insufficient token balance',
            required: formatTokens(costMicro),
            current: formatTokens(user.tokenBalanceMicro),
          },
          { status: 402 }
        )
      }
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
          { error: 'Plan limit reached. Please upgrade.' },
          { status: 403 }
        )
      }
    }

    // Get detection engine config
    const API_URL = (process.env.ECHOFORGE_API_URL || process.env.ML_API_URL || process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || '').replace(/\/$/, '')
    const API_KEY = process.env.ECHOFORGE_API_KEY || process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''

    if (!API_URL || !API_KEY) {
      return NextResponse.json(
        { error: 'Detection engine not configured' },
        { status: 503 }
      )
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        userId: session.user.id,
        type: 'ANOMALY_DETECTION',
        fileName: fileName || 'sample.csv',
        fileSize: JSON.stringify(data).length,
        dataPoints: data.length,
        status: 'PROCESSING'
      }
    })

    // Update user analytics count or deduct tokens
    if (userPlan === 'PAY_AS_YOU_GO' && user.tokenBalanceMicro !== undefined) {
      // Only deduct tokens if the column actually exists
      try {
        const { calculateAnalysisCost } = await import('@/lib/payg-pricing')
        const costMicro = calculateAnalysisCost(data.length)
        
        await prisma.$transaction([
          prisma.user.update({
            where: { id: session.user.id },
            data: { 
              tokenBalanceMicro: { decrement: costMicro },
              analysesCount: { increment: 1 }
            }
          }),
          prisma.usageRecord.create({
            data: {
              userId: session.user.id,
              type: 'TOKEN_TRANSACTION',
              metadata: {
                transactionType: 'DEBIT',
                tokensMicro: costMicro.toString(),
                description: `Sample analysis: ${fileName || 'untitled'}`,
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

    // Call detection engine
    const payload = {
      data,
      method: method || 'isolation_forest',
      sensitivity: sensitivity ?? 0.1,
      expected_rate: expected_rate ?? 0.05,
      fileName: fileName || 'sample.csv',
    }

    let mlResult: any
    let analysisStatus: 'COMPLETED' | 'FAILED' = 'COMPLETED'

    try {
      const mlResponse = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-echo-key': API_KEY
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30s timeout
      })

      if (!mlResponse.ok) {
        const errorDetails = await mlResponse.json().catch(() => ({}))
        throw new Error(errorDetails?.error || 'Detection engine failed')
      }

      mlResult = await mlResponse.json()

    } catch (mlError: any) {
      console.error('ML API error:', mlError)
      analysisStatus = 'FAILED'
      
      // For sample datasets, provide a fallback simulation
      mlResult = {
        anomalies_count: Math.floor(data.length * 0.03), // 3% anomaly rate
        accuracy: 0.87,
        processing_time_ms: 120,
        method: payload.method,
        anomaly_indices: Array.from({ length: Math.floor(data.length * 0.03) }, (_, i) => Math.floor(Math.random() * data.length)),
        scores: data.map(() => Math.random()),
        simulated: true,
        error: mlError.message
      }
    }

    // Update analysis with results
    await prisma.analysis.update({
      where: { id: analysis.id },
      data: {
        status: analysisStatus,
        anomaliesFound: mlResult.anomalies_count || mlResult.anomalies_found || 0,
        accuracy: mlResult.accuracy ?? null,
        processingTime: mlResult.processing_time_ms || mlResult.processingTime || null,
        completedAt: new Date(),
        results: mlResult
      }
    })

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      anomaliesFound: mlResult.anomalies_count || mlResult.anomalies_found || 0,
      accuracy: mlResult.accuracy || 0,
      processingTime: mlResult.processing_time_ms || mlResult.processingTime || 0,
      method: payload.method,
      simulated: mlResult.simulated || false,
    })

  } catch (error: any) {
    console.error('Detection proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Detection failed',
        message: error.message || 'Something went wrong',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}

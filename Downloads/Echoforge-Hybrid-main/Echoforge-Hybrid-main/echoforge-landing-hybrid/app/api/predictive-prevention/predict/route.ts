import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/predictive-prevention/predict
 * Generate new anomaly predictions based on historical data
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lookAheadHours = 24 } = body
    const now = new Date()

    // Get user's recent analyses to build prediction model
    const recentAnalyses = await prisma.analysis.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
        anomaliesFound: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        anomaliesFound: true,
        accuracy: true,
        processingTime: true,
        results: true,
        createdAt: true,
      }
    })

    // If insufficient data, provide demo predictions to showcase the feature
    if (recentAnalyses.length < 3) {
      const demoPredictions = [
        {
          predictedAnomalyType: 'DATA_CORRUPTION',
          predictedSeverity: 'HIGH',
          confidenceScore: 0.78,
          predictedTimestamp: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours
          preventionActions: [
            {
              type: 'ALERT',
              config: { notifyChannels: ['email', 'dashboard'] },
              priority: 1,
              estimatedEffectiveness: 0.75
            },
            {
              type: 'AUTO_QUARANTINE',
              config: { threshold: 30 },
              priority: 2,
              estimatedEffectiveness: 0.85
            }
          ],
          causalChain: [
            { from: 'Demo Pattern', to: 'DATA_CORRUPTION', confidence: 0.78 }
          ],
          status: 'PENDING'
        },
        {
          predictedAnomalyType: 'UNUSUAL_ACTIVITY',
          predictedSeverity: 'MEDIUM',
          confidenceScore: 0.65,
          predictedTimestamp: new Date(now.getTime() + 16 * 60 * 60 * 1000), // 16 hours
          preventionActions: [
            {
              type: 'RATE_LIMIT',
              config: { maxRequestsPerHour: 100 },
              priority: 2,
              estimatedEffectiveness: 0.70
            }
          ],
          causalChain: [
            { from: 'Demo Pattern', to: 'UNUSUAL_ACTIVITY', confidence: 0.65 }
          ],
          status: 'PENDING'
        },
        {
          predictedAnomalyType: 'PERFORMANCE_DEGRADATION',
          predictedSeverity: 'LOW',
          confidenceScore: 0.55,
          predictedTimestamp: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
          preventionActions: [
            {
              type: 'PRE_PROCESS',
              config: { maxRows: 5000 },
              priority: 3,
              estimatedEffectiveness: 0.60
            }
          ],
          causalChain: [
            { from: 'Demo Pattern', to: 'PERFORMANCE_DEGRADATION', confidence: 0.55 }
          ],
          status: 'PENDING'
        }
      ]

      // Store demo predictions
      const { storePredictions } = await import('@/lib/predictions-store')
      const storedPredictions = storePredictions(session.user.id, demoPredictions)

      console.log('📊 Demo predictions generated:', storedPredictions.length, 'predictions')
      console.log('📋 Historical data points:', recentAnalyses.length)

      return NextResponse.json({
        success: true,
        count: storedPredictions.length,
        predictions: storedPredictions,
        historicalDataPoints: recentAnalyses.length,
        lookAheadHours,
        demo: true,
        message: 'Demo predictions shown. Upload more datasets to get real predictions based on your data patterns.'
      })
    }

    // Analyze patterns and generate predictions
    const predictions: any[] = []

    // Pattern 1: Recurring anomaly types
    const anomalyTypes = recentAnalyses
      .map(a => (a.results as any)?.anomalyType || 'UNKNOWN')
      .filter((v, i, a) => a.indexOf(v) === i)

    for (const anomalyType of anomalyTypes.slice(0, 3)) {
      const occurrences = recentAnalyses.filter(
        a => (a.results as any)?.anomalyType === anomalyType
      )
      
      if (occurrences.length >= 2) {
        const avgTimeBetween = occurrences.length > 1
          ? (occurrences[0].createdAt.getTime() - occurrences[occurrences.length - 1].createdAt.getTime()) /
            (occurrences.length - 1)
          : 24 * 60 * 60 * 1000

        const nextPredictedTime = new Date(now.getTime() + avgTimeBetween)
        
        if (nextPredictedTime.getTime() <= now.getTime() + lookAheadHours * 60 * 60 * 1000) {
          const avgAnomalies = occurrences.reduce((sum, a) => sum + (a.anomaliesFound || 0), 0) / occurrences.length
          const avgAccuracy = occurrences.reduce((sum, a) => sum + (a.accuracy || 0), 0) / occurrences.length

          predictions.push({
            predictedAnomalyType: anomalyType,
            predictedSeverity: avgAnomalies > 100 ? 'CRITICAL' : avgAnomalies > 50 ? 'HIGH' : avgAnomalies > 10 ? 'MEDIUM' : 'LOW',
            confidenceScore: Math.min(0.95, avgAccuracy / 100),
            predictedTimestamp: nextPredictedTime,
            preventionActions: [
              {
                type: 'ALERT',
                config: { notifyChannels: ['email', 'dashboard'] },
                priority: avgAnomalies > 50 ? 1 : 2,
                estimatedEffectiveness: 0.7
              },
              {
                type: 'AUTO_QUARANTINE',
                config: { threshold: avgAnomalies * 0.8 },
                priority: 2,
                estimatedEffectiveness: 0.85
              }
            ],
            causalChain: [
              { from: 'Historical Pattern', to: anomalyType, confidence: 0.8 },
              { from: anomalyType, to: 'System Impact', confidence: 0.7 }
            ],
            status: 'PENDING'
          })
        }
      }
    }

    // Pattern 2: Increasing anomaly frequency
    const recentCount = recentAnalyses.slice(0, 10).filter(a => (a.anomaliesFound || 0) > 0).length
    const olderCount = recentAnalyses.slice(10, 20).filter(a => (a.anomaliesFound || 0) > 0).length

    if (recentCount > olderCount * 1.5) {
      predictions.push({
        predictedAnomalyType: 'FREQUENCY_SPIKE',
        predictedSeverity: 'HIGH',
        confidenceScore: 0.75,
        predictedTimestamp: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6 hours
        preventionActions: [
          {
            type: 'RATE_LIMIT',
            config: { maxRequestsPerHour: 100 },
            priority: 1,
            estimatedEffectiveness: 0.8
          }
        ],
        causalChain: [
          { from: 'Increasing Frequency', to: 'System Overload', confidence: 0.75 }
        ],
        status: 'PENDING'
      })
    }

    // Pattern 3: Large data size correlations
    const largeDataAnalyses = recentAnalyses.filter(a => (a.results as any)?.dataSize > 10000)
    if (largeDataAnalyses.length >= 3) {
      const avgAnomaliesLarge = largeDataAnalyses.reduce((sum, a) => sum + (a.anomaliesFound || 0), 0) / largeDataAnalyses.length
      
      if (avgAnomaliesLarge > 20) {
        predictions.push({
          predictedAnomalyType: 'LARGE_DATASET_ANOMALY',
          predictedSeverity: 'MEDIUM',
          confidenceScore: 0.70,
          predictedTimestamp: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours
          preventionActions: [
            {
              type: 'PRE_PROCESS',
              config: { maxRows: 10000, sampling: true },
              priority: 2,
              estimatedEffectiveness: 0.65
            }
          ],
          causalChain: [
            { from: 'Large Dataset', to: 'High Anomaly Count', confidence: 0.70 }
          ],
          status: 'PENDING'
        })
      }
    }

    // If no predictions generated from patterns, use AI to generate intelligent predictions
    if (predictions.length === 0) {
      console.log('⚠️ No pattern-based predictions found, using AI for intelligent predictions')
      
      // Query AI API for enhanced predictions
      const AI_API_URL = process.env.ECHOFORGE_API_URL || process.env.ML_API_URL || ''
      const AI_API_KEY = process.env.ECHOFORGE_API_KEY || ''
      
      let aiPredictions: any[] = []
      
      if (AI_API_URL && AI_API_KEY && recentAnalyses.length > 0) {
        try {
          // Prepare data for AI prediction engine
          const historicalData = recentAnalyses.map(a => ({
            id: a.id,
            type: a.type,
            anomaliesFound: a.anomaliesFound || 0,
            accuracy: a.accuracy || 0,
            processingTime: a.processingTime || 0,
            createdAt: a.createdAt.toISOString(),
            results: a.results
          }))

          const aiResponse = await fetch(`${AI_API_URL}/predict-anomalies`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-echo-key': AI_API_KEY
            },
            body: JSON.stringify({
              historical_data: historicalData,
              look_ahead_hours: lookAheadHours,
              user_id: session.user.id
            }),
            signal: AbortSignal.timeout(10000) // 10s timeout
          })

          if (aiResponse.ok) {
            const aiResult = await aiResponse.json()
            aiPredictions = (aiResult.predictions || []).map((pred: any) => ({
              predictedAnomalyType: pred.anomaly_type || pred.type || 'AI_DETECTED_ANOMALY',
              predictedSeverity: pred.severity || 'MEDIUM',
              confidenceScore: pred.confidence || 0.75,
              predictedTimestamp: new Date(now.getTime() + (pred.hours_ahead || 12) * 60 * 60 * 1000),
              preventionActions: pred.actions || [
                {
                  type: 'ALERT',
                  config: { notifyChannels: ['email', 'dashboard'] },
                  priority: 1,
                  estimatedEffectiveness: 0.75
                }
              ],
              causalChain: pred.causal_chain || [
                { from: 'AI Analysis', to: pred.anomaly_type || 'ANOMALY', confidence: pred.confidence || 0.75 }
              ],
              status: 'PENDING',
              aiGenerated: true
            }))
            
            console.log('🤖 AI-generated predictions:', aiPredictions.length)
          }
        } catch (aiError) {
          console.log('⚠️ AI prediction API unavailable, using fallback:', aiError)
        }
      }
      
      // If AI didn't return predictions, provide demo predictions
      if (aiPredictions.length === 0) {
        aiPredictions = [
          {
            predictedAnomalyType: 'PATTERN_BASED_ANOMALY',
            predictedSeverity: 'MEDIUM',
            confidenceScore: 0.70,
            predictedTimestamp: new Date(now.getTime() + 12 * 60 * 60 * 1000),
            preventionActions: [
              {
                type: 'ALERT',
                config: { notifyChannels: ['email', 'dashboard'] },
                priority: 1,
                estimatedEffectiveness: 0.70
              }
            ],
            causalChain: [
              { from: 'Historical Data', to: 'PATTERN_BASED_ANOMALY', confidence: 0.70 }
            ],
            status: 'PENDING',
            aiGenerated: false
          }
        ]
      }
      
      const { storePredictions } = await import('@/lib/predictions-store')
      const storedPredictions = storePredictions(session.user.id, aiPredictions)
      
      return NextResponse.json({
        success: true,
        count: storedPredictions.length,
        predictions: storedPredictions,
        historicalDataPoints: recentAnalyses.length,
        lookAheadHours,
        aiEnhanced: aiPredictions.some(p => p.aiGenerated),
        message: aiPredictions.some(p => p.aiGenerated) 
          ? 'AI-enhanced predictions generated. System learns from your data patterns.'
          : 'Baseline prediction generated. More data will improve prediction accuracy.'
      })
    }

    // Store predictions in memory for retrieval
    const { storePredictions } = await import('@/lib/predictions-store')
    const storedPredictions = storePredictions(session.user.id, predictions.slice(0, 10))

    console.log('✅ Real predictions generated:', storedPredictions.length, 'predictions')
    console.log('📊 Historical data points:', recentAnalyses.length)

    return NextResponse.json({
      success: true,
      count: storedPredictions.length,
      predictions: storedPredictions,
      historicalDataPoints: recentAnalyses.length,
      lookAheadHours,
    })
  } catch (error) {
    console.error('Predictive prevention error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

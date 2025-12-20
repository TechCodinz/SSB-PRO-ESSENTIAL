/**
 * ANOMALY DETECTION TRAINING SYSTEM
 * Enhances AI sentinel with self-training capabilities
 */

import { prisma } from '@/lib/db'

export async function getAnomalyDetectionTrainingData() {
  try {
    // Get all completed analyses with anomaly data
    const analyses = await prisma.analysis.findMany({
      where: {
        status: 'COMPLETED',
        anomaliesFound: { gt: 0 }
      },
      select: {
        id: true,
        type: true,
        anomaliesFound: true,
        accuracy: true,
        processingTime: true,
        results: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Last 1000 analyses for training
    })

    // Calculate detection metrics
    const totalAnomalies = analyses.reduce((sum, a) => sum + (a.anomaliesFound || 0), 0)
    const avgAccuracy = analyses.reduce((sum, a) => sum + (a.accuracy || 0), 0) / Math.max(analyses.length, 1)
    
    // Analyze detection methods performance
    const methodPerformance: Record<string, { count: number; avgAccuracy: number; avgAnomalies: number }> = {}
    
    analyses.forEach(analysis => {
      // Extract method from results if available
      const method = (analysis.results as any)?.method || 'UNKNOWN'
      if (!methodPerformance[method]) {
        methodPerformance[method] = { count: 0, avgAccuracy: 0, avgAnomalies: 0 }
      }
      methodPerformance[method].count++
      methodPerformance[method].avgAccuracy += analysis.accuracy || 0
      methodPerformance[method].avgAnomalies += analysis.anomaliesFound || 0
    })
    
    // Calculate averages
    Object.keys(methodPerformance).forEach(method => {
      const data = methodPerformance[method]
      data.avgAccuracy = data.avgAccuracy / data.count
      data.avgAnomalies = data.avgAnomalies / data.count
    })

    // Extract common anomaly patterns
    const patternCounts: Record<string, number> = {}
    analyses.forEach(analysis => {
      const type = analysis.type || 'UNKNOWN'
      patternCounts[type] = (patternCounts[type] || 0) + 1
    })
    
    const commonPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern]) => pattern)

    // Calculate false positive estimate (simplified)
    const lowAccuracyCount = analyses.filter(a => (a.accuracy || 0) < 70).length
    const falsePositiveRate = (lowAccuracyCount / Math.max(analyses.length, 1)) * 100

    // Generate recent insights
    const recentInsights = generateAnomalyInsights(analyses.slice(0, 100))

    return {
      totalAnomalies,
      analysisCount: analyses.length,
      detectionRate: avgAccuracy,
      falsePositiveRate: Number(falsePositiveRate.toFixed(2)),
      commonPatterns,
      methodPerformance,
      recentInsights,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error gathering anomaly training data:', error)
    // Return fallback data
    return {
      totalAnomalies: 0,
      analysisCount: 0,
      detectionRate: 0,
      falsePositiveRate: 0,
      commonPatterns: [],
      methodPerformance: {},
      recentInsights: 'No training data available yet.',
      lastUpdated: new Date().toISOString(),
    }
  }
}

function generateAnomalyInsights(recentAnalyses: any[]): string {
  if (recentAnalyses.length === 0) {
    return 'No recent analyses to generate insights from.'
  }

  const avgAnomalies = recentAnalyses.reduce((sum, a) => sum + (a.anomaliesFound || 0), 0) / recentAnalyses.length
  const avgAccuracy = recentAnalyses.reduce((sum, a) => sum + (a.accuracy || 0), 0) / recentAnalyses.length
  const highAnomalyCount = recentAnalyses.filter(a => (a.anomaliesFound || 0) > 10).length

  let insights = `Recent analysis trends (last ${recentAnalyses.length} analyses): `
  insights += `Average ${avgAnomalies.toFixed(1)} anomalies per analysis with ${avgAccuracy.toFixed(1)}% accuracy. `
  
  if (highAnomalyCount > recentAnalyses.length * 0.3) {
    insights += `Elevated anomaly activity detected (${highAnomalyCount} high-anomaly analyses). Consider investigating data sources or adjusting sensitivity thresholds.`
  } else {
    insights += `Normal anomaly detection patterns observed. System performing within expected parameters.`
  }

  return insights
}

export function calculateRecommendationConfidence(recommendation: any, trainingData: any): number {
  // Calculate confidence based on historical success rate and pattern matches
  let confidence = 50 // Base confidence
  
  // Boost confidence if detection rate is high
  if (trainingData.detectionRate > 90) confidence += 20
  else if (trainingData.detectionRate > 80) confidence += 15
  else if (trainingData.detectionRate > 70) confidence += 10
  
  // Reduce confidence if false positive rate is high
  if (trainingData.falsePositiveRate > 10) confidence -= 15
  else if (trainingData.falsePositiveRate > 5) confidence -= 10
  
  // Cap between 0-100
  return Math.max(0, Math.min(100, confidence))
}

export async function getSystemControlContext() {
  // Get comprehensive system data for AI sentinel
  const [analyses, users, feedback] = await Promise.all([
    prisma.analysis.count(),
    prisma.user.count(),
    prisma.feedback.count({ where: { processed: false } })
  ])

  const trainingData = await getAnomalyDetectionTrainingData()

  return {
    system: {
      totalAnalyses: analyses,
      totalUsers: users,
      pendingFeedback: feedback,
    },
    anomalyDetection: trainingData,
    capabilities: [
      'Anomaly Detection',
      'System Monitoring',
      'Performance Optimization',
      'Self-Learning',
      'Predictive Maintenance',
      'Security Analysis'
    ],
    lastTrainingUpdate: trainingData.lastUpdated,
  }
}

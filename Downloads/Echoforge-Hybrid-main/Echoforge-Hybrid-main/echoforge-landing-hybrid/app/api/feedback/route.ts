import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * USER FEEDBACK API
 * 
 * Collects user feedback for AI learning and system improvement
 */

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, rating, message, context } = body

    // Store feedback in database
    const feedback = await prisma.feedback.create({
      data: {
        userId: (session.user as any).id,
        type,
        rating: rating || null,
        message: message || '',
        context: context || {},
        sentiment: analyzeSentiment(message || ''),
        createdAt: new Date(),
      },
    })

    // Trigger AI learning asynchronously
    triggerAILearning(feedback).catch((err) => {
      console.error('AI learning error:', err)
    })

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
        createdAt: feedback.createdAt,
      },
    })
  } catch (error) {
    console.error('Feedback API Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const feedback = await prisma.feedback.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            plan: true,
          },
        },
      },
    })

    // Analyze feedback trends
    const analysis = analyzeFeedbackTrends(feedback)

    return NextResponse.json({
      feedback,
      analysis,
    })
  } catch (error) {
    console.error('Feedback GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function analyzeSentiment(text: string): number {
  // Simple sentiment analysis
  // In production, use a proper sentiment analysis library
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'love', 'perfect',
    'awesome', 'fantastic', 'wonderful', 'best', 'brilliant',
  ]
  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'worst', 'poor',
    'disappointing', 'useless', 'broken', 'buggy', 'slow',
  ]

  const words = text.toLowerCase().split(/\s+/)
  let score = 0.5 // neutral

  words.forEach((word) => {
    if (positiveWords.includes(word)) score += 0.1
    if (negativeWords.includes(word)) score -= 0.1
  })

  return Math.max(0, Math.min(1, score))
}

async function triggerAILearning(feedback: any) {
  // This would trigger ML model retraining or system adjustments
  // Based on user feedback patterns
  
  console.log('🤖 AI Learning triggered:', {
    type: feedback.type,
    sentiment: feedback.sentiment,
    timestamp: feedback.createdAt,
  })

  // In production:
  // - Queue feedback for batch processing
  // - Update recommendation algorithms
  // - Adjust ML model parameters
  // - Prioritize feature requests
  // - Identify common issues
}

function analyzeFeedbackTrends(feedback: any[]) {
  const total = feedback.length
  if (total === 0) {
    return {
      totalFeedback: 0,
      avgSentiment: 0.5,
      avgRating: 0,
      topIssues: [],
      topRequests: [],
    }
  }

  const avgSentiment =
    feedback.reduce((sum, f) => sum + (f.sentiment || 0.5), 0) / total

  const ratedFeedback = feedback.filter((f) => f.rating !== null)
  const avgRating =
    ratedFeedback.length > 0
      ? ratedFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
        ratedFeedback.length
      : 0

  // Extract common themes (simplified)
  const messages = feedback.map((f) => f.message.toLowerCase())
  const wordFrequency: Record<string, number> = {}

  messages.forEach((msg) => {
    const words = msg
      .split(/\s+/)
      .filter((w: string) => w.length > 4) // Only words longer than 4 chars
    words.forEach((word: string) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1
    })
  })

  const topWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }))

  return {
    totalFeedback: total,
    avgSentiment: avgSentiment.toFixed(2),
    avgRating: avgRating.toFixed(1),
    topIssues: feedback
      .filter((f) => f.type === 'bug' || f.type === 'issue')
      .slice(0, 5),
    topRequests: feedback
      .filter((f) => f.type === 'feature' || f.type === 'request')
      .slice(0, 5),
    commonThemes: topWords,
  }
}

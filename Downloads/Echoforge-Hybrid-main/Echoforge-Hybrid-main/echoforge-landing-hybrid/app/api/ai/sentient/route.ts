import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSentientAIResponse, getDetectionImprovementRecommendations } from '@/lib/ai-providers';
import { prisma } from '@/lib/db';
import { hasRequiredRole } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

/**
 * AI Sentient System Endpoint
 * Allows the sentient system to query AI models for self-improvement
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = String((session.user as any)?.role ?? '').toUpperCase();
    if (!hasRequiredRole(role, 'MODERATOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { query, type, analysisIds } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Gather system intelligence
    const [
      totalAnalyses,
      recentAnalyses,
      failedAnalyses,
      avgAccuracyAgg,
      avgProcessingAgg,
      recentFeedback,
    ] = await Promise.all([
      prisma.analysis.count(),
      prisma.analysis.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          type: true,
          status: true,
          anomaliesFound: true,
          accuracy: true,
          processingTime: true,
          results: true,
        },
      }),
      prisma.analysis.count({
        where: { status: 'FAILED' },
      }),
      prisma.analysis.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { accuracy: true },
      }),
      prisma.analysis.aggregate({
        where: { status: 'COMPLETED', processingTime: { not: null } },
        _avg: { processingTime: true },
      }),
      prisma.feedback.findMany({
        where: { processed: false },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          type: true,
          rating: true,
          sentiment: true,
          message: true,
        },
      }),
    ]);

    const currentMetrics = {
      totalAnalyses,
      avgAccuracy: avgAccuracyAgg._avg.accuracy || 0,
      avgProcessingTime: avgProcessingAgg._avg.processingTime || 0,
      errorRate: totalAnalyses > 0 ? (failedAnalyses / totalAnalyses) * 100 : 0,
    };

    let aiResponse;

    if (type === 'detection_improvement' && analysisIds && Array.isArray(analysisIds)) {
      // Get specific analyses for improvement recommendations
      const analyses = await prisma.analysis.findMany({
        where: { id: { in: analysisIds } },
        select: {
          accuracy: true,
          processingTime: true,
          anomaliesFound: true,
          dataPoints: true,
          results: true,
        },
      });

      const currentMethods = Array.from(
        new Set(analyses.map(a => (a.results as any)?.method || 'isolation_forest'))
      );

      aiResponse = await getDetectionImprovementRecommendations(analyses, currentMethods);
    } else {
      // General sentient system query
      aiResponse = await getSentientAIResponse(query, {
        currentMetrics,
        recentAnalyses,
        errorPatterns: recentAnalyses.filter(a => a.status === 'FAILED'),
        userFeedback: recentFeedback,
        performanceData: {
          avgAccuracy: currentMetrics.avgAccuracy,
          avgProcessingTime: currentMetrics.avgProcessingTime,
        },
      });
    }

    // Log the sentient system interaction
    try {
      await prisma.adminAuditLog.create({
        data: {
          actorId: session.user.id,
          actorEmail: (session.user as any)?.email || null,
          actorRole: role as any,
          action: 'ai-sentient.query',
          resource: 'ai-sentient',
          status: 'SUCCESS',
          description: `Sentient system AI query: ${query.substring(0, 200)}`,
          metadata: {
            type,
            provider: aiResponse.provider,
            model: aiResponse.model,
            tokensUsed: aiResponse.tokensUsed,
            latency: aiResponse.latency,
          },
        },
      });
    } catch (logError) {
      console.error('Failed to log sentient query:', logError);
    }

    return NextResponse.json({
      response: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      latency: aiResponse.latency,
      metrics: currentMetrics,
    });
  } catch (error) {
    console.error('Sentient AI error:', error);
    return NextResponse.json(
      { 
        error: 'AI sentient system unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

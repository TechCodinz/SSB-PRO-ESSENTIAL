import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupportAIResponse } from '@/lib/ai-providers';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user context for better responses
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        analysesCount: true,
        email: true,
        role: true,
      },
    });

    const recentAnalyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        status: true,
        anomaliesFound: true,
        accuracy: true,
      },
    });

    const userStats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        analysesCount: true,
        apiCallsCount: true,
      },
    });

    // Get system-wide anomaly detection insights for admins
    let anomalyInsights = null
    if (user?.role && ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(String(user.role).toUpperCase())) {
      try {
        const { getAnomalyDetectionTrainingData } = await import('../control-enhanced')
        anomalyInsights = await getAnomalyDetectionTrainingData()
      } catch (error) {
        console.log('Could not load anomaly insights:', error)
      }
    }

    // Get AI response with enhanced context (including anomaly insights for admins)
    const aiResponse = await getSupportAIResponse(message, {
      userId: session.user.id,
      plan: user?.plan || 'FREE',
      recentAnalyses,
      userStats,
      ...(anomalyInsights && { anomalyInsights, isAdmin: true, role: user?.role }),
    } as any);

    // Log the interaction
    try {
      await prisma.feedback.create({
        data: {
          userId: session.user.id,
          type: 'general',
          message: `Support Chat: ${message.substring(0, 200)}`,
          context: {
            aiResponse: aiResponse.content.substring(0, 500),
            provider: aiResponse.provider,
            model: aiResponse.model,
          },
        },
      });
    } catch (logError) {
      console.error('Failed to log support chat:', logError);
    }

    return NextResponse.json({
      response: aiResponse.content,
      provider: aiResponse.provider,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      latency: aiResponse.latency,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { 
        error: 'AI service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

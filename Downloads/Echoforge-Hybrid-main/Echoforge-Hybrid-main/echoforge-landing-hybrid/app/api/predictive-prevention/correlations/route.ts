import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findCorrelations } from '@/lib/predictive-prevention';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const analysisId = searchParams.get('analysisId');
    const temporalWindow = parseInt(searchParams.get('temporalWindow') || '24');

    if (!analysisId) {
      return NextResponse.json(
        { error: 'analysisId is required' },
        { status: 400 }
      );
    }

    const correlations = await findCorrelations(analysisId, temporalWindow);

    return NextResponse.json({
      success: true,
      correlations,
      count: correlations.length,
    });
  } catch (error) {
    console.error('Correlations error:', error);
    return NextResponse.json(
      { error: 'Failed to find correlations' },
      { status: 500 }
    );
  }
}

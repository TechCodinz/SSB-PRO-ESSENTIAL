import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPredictions } from '@/lib/predictions-store'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/predictive-prevention/predictions
 * Get active predictions
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    const userPredictions = getPredictions(session.user.id, status, limit)

    return NextResponse.json({
      predictions: userPredictions,
      total: userPredictions.length,
    })
  } catch (error) {
    console.error('Get predictions error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

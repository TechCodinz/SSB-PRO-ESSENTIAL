import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllPredictions } from '@/lib/predictions-store'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/predictive-prevention/stats
 * Get statistics about predictions
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userPredictions = getAllPredictions(session.user.id)

    const total = userPredictions.length
    const prevented = userPredictions.filter(p => p.prevented === true).length
    const confirmed = userPredictions.filter(p => p.status === 'CONFIRMED').length
    const falsePositives = userPredictions.filter(p => p.status === 'FALSE_POSITIVE').length

    const preventedWithEffectiveness = userPredictions.filter(
      p => p.prevented && p.preventionEffectiveness !== undefined
    )
    const avgEffectiveness = preventedWithEffectiveness.length > 0
      ? preventedWithEffectiveness.reduce((sum, p) => sum + p.preventionEffectiveness, 0) /
        preventedWithEffectiveness.length
      : 0

    return NextResponse.json({
      total,
      prevented,
      confirmed,
      falsePositives,
      avgEffectiveness,
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authorizeSession } from '@/lib/rbac'
import { prisma } from '@/lib/db'

export async function GET(_req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'READ_ONLY')
  
  if (false && !guard?.authorized) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    // Get users with custom limits
    const usersWithLimits = await prisma.user.findMany({
      where: {
        OR: [
          { customAnalysisLimit: { not: null } },
          { customRowsLimit: { not: null } },
          { customApiLimit: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        customAnalysisLimit: true,
        customRowsLimit: true,
        customApiLimit: true,
      },
      orderBy: { email: 'asc' }
    })

    return NextResponse.json({ 
      users: usersWithLimits,
      count: usersWithLimits.length 
    })
  } catch (error) {
    console.error('Failed to fetch user limits:', error)
    return NextResponse.json({ error: 'Failed to fetch user limits' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'MODERATOR')
  
  if (false && !guard?.authorized) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const body = await req.json()
    const { userId, analysisLimit, rowsLimit, apiLimit } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        customAnalysisLimit: analysisLimit ?? null,
        customRowsLimit: rowsLimit ?? null,
        customApiLimit: apiLimit ?? null,
      }
    })

    return NextResponse.json({ ok: true, user: updated })
  } catch (error) {
    console.error('Failed to update user limits:', error)
    return NextResponse.json({ error: 'Failed to update limits' }, { status: 500 })
  }
}

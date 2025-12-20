import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        plan: true,
        analysesCount: true,
        apiCallsCount: true,
        createdAt: true,
      }
    })

    // Get plan limits
    const planLimits: any = {
      FREE: { analyses: 3, apiCalls: 100, features: ['Basic detection'] },
      STARTER: { analyses: 50, apiCalls: 1000, features: ['Advanced detection', 'API access'] },
      PRO: { analyses: 500, apiCalls: 10000, features: ['All features', 'Crypto fraud', 'Forensics'] },
      ENTERPRISE: { analyses: Infinity, apiCalls: Infinity, features: ['Everything + Custom'] }
    }

    const limits = planLimits[user?.plan || 'FREE']

    // Get recent analyses
    const recentAnalyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        status: true,
        fileName: true,
        anomaliesFound: true,
        createdAt: true,
      }
    })

    // Calculate usage percentages
    const analysesUsage = limits.analyses === Infinity 
      ? 0 
      : ((user?.analysesCount || 0) / limits.analyses) * 100

    const apiCallsUsage = limits.apiCalls === Infinity
      ? 0
      : ((user?.apiCallsCount || 0) / limits.apiCalls) * 100

    return NextResponse.json({
      stats: {
        plan: user?.plan || 'FREE',
        analysesCount: user?.analysesCount || 0,
        apiCallsCount: user?.apiCallsCount || 0,
        analysesLimit: limits.analyses,
        apiCallsLimit: limits.apiCalls,
        analysesUsage: Math.min(analysesUsage, 100),
        apiCallsUsage: Math.min(apiCallsUsage, 100),
        features: limits.features,
        memberSince: user?.createdAt,
      },
      recentAnalyses
    })
  } catch (error) {
    console.error("Stats fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

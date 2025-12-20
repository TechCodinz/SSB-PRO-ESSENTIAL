import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        analysesCount: true,
        apiCallsCount: true,
        plan: true,
        createdAt: true,
      }
    })

    const recentAnalyses = await prisma.analysis.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        status: true,
        anomaliesFound: true,
        createdAt: true,
      }
    })

    const totalAnomalies = await prisma.analysis.aggregate({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      _sum: {
        anomaliesFound: true
      }
    })

    const avgAccuracy = await prisma.analysis.aggregate({
      where: {
        userId: session.user.id,
        status: 'COMPLETED'
      },
      _avg: {
        accuracy: true
      }
    })

    return NextResponse.json({
      stats: {
        totalAnalyses: user?.analysesCount || 0,
        totalAnomalies: totalAnomalies._sum.anomaliesFound || 0,
        avgAccuracy: avgAccuracy._avg.accuracy || 0,
        apiCalls: user?.apiCallsCount || 0,
        plan: user?.plan || 'FREE',
        memberSince: user?.createdAt || new Date(),
      },
      recentAnalyses
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

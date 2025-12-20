import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { formatTokens, microToTokens } from "@/lib/payg-pricing"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/payg/balance
 * Get user's current PAYG token balance
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        tokenBalanceMicro: true,
        plan: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recent token transactions
    const recentTransactions = await prisma.usageRecord.findMany({
      where: {
        userId: session.user.id,
        type: 'TOKEN_TRANSACTION'
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      balance: {
        microTokens: user.tokenBalanceMicro.toString(),
        tokens: microToTokens(user.tokenBalanceMicro),
        formatted: formatTokens(user.tokenBalanceMicro),
      },
      plan: user.plan,
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id,
        type: tx.metadata ? (tx.metadata as any).transactionType : 'unknown',
        amount: tx.metadata ? (tx.metadata as any).tokensMicro : '0',
        description: tx.metadata ? (tx.metadata as any).description : '',
        createdAt: tx.createdAt,
      })),
    })
  } catch (error) {
    console.error("Balance fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

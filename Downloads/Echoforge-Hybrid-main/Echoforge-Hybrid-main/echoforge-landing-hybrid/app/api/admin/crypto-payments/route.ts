import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

// GET - Fetch all crypto payments (admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin access
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // pending, verified, all
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    const where: any = {}
    if (status && status !== 'all') {
      if (status === 'pending') {
        where.status = 'PENDING_VERIFICATION'
      } else if (status === 'verified') {
        where.status = 'CONFIRMED'
      }
    }

    // Fetch crypto payments with user info
    const payments = await prisma.cryptoPayment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            plan: true
          }
        }
      }
    })

    // Calculate stats
    const totalVolume = await prisma.cryptoPayment.aggregate({
      _sum: { amount: true },
      where: { status: 'CONFIRMED' }
    })

    const statusCounts = await prisma.cryptoPayment.groupBy({
      by: ['status'],
      _count: true
    })

    const stats = {
      totalVolume: totalVolume._sum.amount || 0,
      totalTransactions: payments.length,
      pending: statusCounts.find(s => s.status === 'PENDING_VERIFICATION')?._count || 0,
      confirmed: statusCounts.find(s => s.status === 'CONFIRMED')?._count || 0,
      rejected: statusCounts.find(s => s.status === 'REJECTED')?._count || 0
    }

    return NextResponse.json({
      payments,
      stats
    })
  } catch (error) {
    console.error("Admin crypto payments fetch error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// POST - Confirm crypto payment (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin access
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { paymentId, action } = body  // action: 'confirm' or 'reject'

    if (!paymentId || !action) {
      return NextResponse.json(
        { error: "Payment ID and action required" },
        { status: 400 }
      )
    }

    // Get payment
    const payment = await prisma.cryptoPayment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status === 'CONFIRMED') {
      return NextResponse.json({ error: "Payment already confirmed" }, { status: 400 })
    }

    if (action === 'confirm') {
      // Update payment status
      await prisma.cryptoPayment.update({
        where: { id: paymentId },
        data: {
          status: 'CONFIRMED',
          verifiedAt: new Date(),
          verifiedBy: session.user.id
        }
      })

      // Upgrade user plan
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan,
          emailVerified: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: `Payment confirmed. User upgraded to ${payment.plan} plan.`,
        user: {
          email: payment.user.email,
          plan: payment.plan
        }
      })
    } else if (action === 'reject') {
      // Reject payment
      await prisma.cryptoPayment.update({
        where: { id: paymentId },
        data: {
          status: 'REJECTED',
          verifiedAt: new Date(),
          verifiedBy: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        message: "Payment rejected"
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Admin crypto payment confirmation error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

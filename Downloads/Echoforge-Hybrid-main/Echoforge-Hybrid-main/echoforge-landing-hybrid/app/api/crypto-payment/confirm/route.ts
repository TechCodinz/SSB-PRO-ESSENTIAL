import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { paymentId, txHash } = body

    if (!paymentId || !txHash) {
      return NextResponse.json(
        { error: "Payment ID and transaction hash required" },
        { status: 400 }
      )
    }

    // Get payment record
    const payment = await prisma.cryptoPayment.findUnique({
      where: { id: paymentId }
    })

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status === 'CONFIRMED') {
      return NextResponse.json({ error: "Payment already confirmed" }, { status: 400 })
    }

    // Update payment with transaction hash (will be verified by admin)
    const updatedPayment = await prisma.cryptoPayment.update({
      where: { id: paymentId },
      data: {
        txHash,
        status: 'PENDING_VERIFICATION',
        submittedAt: new Date()
      }
    })

    return NextResponse.json({
      message: "Payment submitted for verification",
      payment: {
        id: updatedPayment.id,
        status: updatedPayment.status
      }
    })
  } catch (error) {
    console.error("Crypto payment confirmation error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

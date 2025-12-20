import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payment = await prisma.cryptoPayment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        status: true,
        amount: true,
        currency: true,
        network: true,
        plan: true,
        txHash: true,
        createdAt: true,
        submittedAt: true,
        verifiedAt: true,
        expiresAt: true,
      }
    })

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

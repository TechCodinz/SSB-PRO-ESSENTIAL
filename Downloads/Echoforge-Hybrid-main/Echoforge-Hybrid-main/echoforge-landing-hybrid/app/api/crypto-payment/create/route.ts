import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import crypto from "crypto"

// Your USDT wallet addresses - ADD THESE IN VERCEL ENVIRONMENT VARIABLES!
const USDT_WALLETS = {
  TRC20: process.env.USDT_TRC20_WALLET || "TExampleWalletTRC20PleaseUpdateInEnvVars123",
  ERC20: process.env.USDT_ERC20_WALLET || "0xExampleWalletERC20PleaseUpdateInVercelEnv",
  BEP20: process.env.USDT_BEP20_WALLET || "0xExampleWalletBEP20PleaseUpdateInVercelEnv"
}

const PLAN_PRICES = {
  STARTER: 39,
  PRO: 129,
  ENTERPRISE: 1499,
  // PAY_AS_YOU_GO is handled separately in /api/payg/purchase
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { plan, network } = body

    // PAY_AS_YOU_GO uses a different endpoint (/api/payg/purchase)
    if (!['STARTER', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ 
        error: "Invalid plan. Use /api/payg/purchase for Pay As You Go." 
      }, { status: 400 })
    }

    if (!['TRC20', 'ERC20', 'BEP20'].includes(network)) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 })
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    const walletAddress = USDT_WALLETS[network as keyof typeof USDT_WALLETS]
    
    // Generate unique payment reference
    const paymentReference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

    // Create payment record
    const payment = await prisma.cryptoPayment.create({
      data: {
        userId: session.user.id,
        plan,
        amount,
        currency: 'USDT',
        network,
        walletAddress,
        paymentReference,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
      }
    })

    return NextResponse.json({
      payment: {
        id: payment.id,
        reference: paymentReference,
        amount,
        currency: 'USDT',
        network,
        walletAddress,
        expiresAt: payment.expiresAt
      }
    })
  } catch (error) {
    console.error("Crypto payment creation error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

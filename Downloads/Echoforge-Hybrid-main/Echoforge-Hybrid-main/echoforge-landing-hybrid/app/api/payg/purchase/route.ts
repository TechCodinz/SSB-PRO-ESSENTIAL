import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TOKEN_PACKAGES, MICRO_TOKEN_PRECISION } from "@/lib/payg-pricing"
import crypto from "crypto"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/payg/purchase
 * Purchase PAYG tokens via crypto payment
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { packageId, network, paymentMethod } = body

    // Validate package
    if (!packageId || !(packageId in TOKEN_PACKAGES)) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 })
    }

    const selectedPackage = TOKEN_PACKAGES[packageId as keyof typeof TOKEN_PACKAGES]

    // Validate network for crypto payments
    if (paymentMethod === 'crypto' && !['TRC20', 'ERC20', 'BEP20'].includes(network)) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 })
    }

    // For crypto payments, create a crypto payment record
    if (paymentMethod === 'crypto') {
      const USDT_WALLETS = {
        TRC20: process.env.USDT_TRC20_WALLET || "TExampleWalletTRC20PleaseUpdateInEnvVars123",
        ERC20: process.env.USDT_ERC20_WALLET || "0xExampleWalletERC20PleaseUpdateInVercelEnv",
        BEP20: process.env.USDT_BEP20_WALLET || "0xExampleWalletBEP20PleaseUpdateInVercelEnv"
      }

      const walletAddress = USDT_WALLETS[network as keyof typeof USDT_WALLETS]
      const paymentReference = `PAYG-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

      // Create crypto payment record
      const payment = await prisma.cryptoPayment.create({
        data: {
          userId: session.user.id,
          plan: 'PAY_AS_YOU_GO',
          amount: selectedPackage.priceUSD,
          currency: 'USDT',
          network,
          walletAddress,
          paymentReference,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
          // Store token amount in metadata
          metadata: {
            packageId,
            tokensMicro: selectedPackage.tokens.toString(),
            tokensDisplay: Number(selectedPackage.tokens) / Number(MICRO_TOKEN_PRECISION),
          }
        }
      })

      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          reference: paymentReference,
          amount: selectedPackage.priceUSD,
          currency: 'USDT',
          network,
          walletAddress,
          expiresAt: payment.expiresAt,
          tokens: Number(selectedPackage.tokens) / Number(MICRO_TOKEN_PRECISION),
        }
      })
    }

    // For other payment methods, implement accordingly
    return NextResponse.json(
      { error: "Only crypto payment is supported for PAYG currently" },
      { status: 400 }
    )

  } catch (error) {
    console.error("PAYG purchase error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

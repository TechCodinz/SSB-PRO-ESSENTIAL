import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const priceIds = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { plan, orderId } = body as { plan: 'STARTER'|'PRO'|'ENTERPRISE'; orderId?: string }

    if (!['STARTER', 'PRO', 'ENTERPRISE'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: priceIds[plan as keyof typeof priceIds],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan,
        ...(orderId ? { orderId } : {})
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

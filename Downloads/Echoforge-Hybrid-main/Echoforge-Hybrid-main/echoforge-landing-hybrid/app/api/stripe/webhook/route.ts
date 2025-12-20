import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
// Local email stub to avoid path resolution issues in build
async function sendPaymentSuccessEmail(to: string, plan: string, amountCents: number) {
  if (!to) return
  const amount = (amountCents / 100).toFixed(2)
  try {
    // Prefer SendGrid if configured
    const apiKey = process.env.SENDGRID_API_KEY
    if (apiKey) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(apiKey)
      await sgMail.send({
        to,
        from: process.env.SENDGRID_FROM || 'no-reply@echoforge.ai',
        subject: `Your EchoForge ${plan} subscription is active`,
        html: `<p>Thank you for your payment of <strong>$${amount}</strong>.</p><p>Your plan: <strong>${plan}</strong></p>`
      })
      return
    }
  } catch (e) {
    console.error('SendGrid error:', e)
  }
  console.log(`[email] (stub) Payment success: ${to} -> ${plan} $${amount}`)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('stripe-signature')
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle checkout completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan as 'STARTER' | 'PRO' | 'ENTERPRISE'
      const orderId = session.metadata?.orderId as string | undefined
      
      if (orderId) {
        // Mark order paid and issue license
        const order = await prisma.marketplaceOrder.update({ where: { id: orderId }, data: { status: 'SUCCEEDED', paidAt: new Date(), providerRef: String(session.payment_intent || '') } })
        try {
          const listing = await prisma.marketplaceListing.findUnique({ where: { id: order.listingId } })
          const key = `LIC-${order.id}-${Math.random().toString(36).slice(2,10).toUpperCase()}`
          await prisma.licenseKey.upsert({
            where: { orderId: order.id },
            update: { key, status: 'ACTIVE' },
            create: { orderId: order.id, buyerId: order.buyerId, listingId: order.listingId, key, status: 'ACTIVE' }
          })
          if (listing) {
            await prisma.marketplaceListing.update({ where: { id: listing.id }, data: { purchasesCount: { increment: 1 } } })
          }
        } catch (e) { console.error('License issue failed:', e) }
      } else if (userId && plan) {
        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: { plan }
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            amount: session.amount_total! / 100,
            currency: session.currency!,
            status: 'SUCCEEDED',
            stripePaymentId: session.payment_intent as string,
            plan
          }
        })

        // Email stub
        try { await sendPaymentSuccessEmail((await prisma.user.findUnique({ where: { id: userId } }))?.email || '', plan, session.amount_total || 0) } catch {}

        if (userId) console.log(`✅ User ${userId} upgraded to ${plan}`)
      }
    }

    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.userId
      
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { plan: 'FREE' }
        })
        console.log(`⚠️ User ${userId} downgraded to FREE`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

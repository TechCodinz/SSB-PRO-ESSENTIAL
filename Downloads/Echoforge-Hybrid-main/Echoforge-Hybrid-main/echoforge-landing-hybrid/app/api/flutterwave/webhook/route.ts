import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
// Local email stub to avoid path resolution issues in build
async function sendPaymentSuccessEmail(to: string, plan: string, amountCents: number) {
  if (!to) return
  const amount = (amountCents / 100).toFixed(2)
  try {
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

export async function POST(req: Request) {
  try {
    const bodyText = await req.text()
    const hash = req.headers.get('verif-hash')
    const secret = process.env.FLW_WEBHOOK_SECRET

    if (!secret || !hash || hash !== secret) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(bodyText)
    const status = event?.data?.status
    const meta = event?.data?.meta || {}
    const userId = meta.userId as string | undefined
    const plan = meta.plan as 'STARTER' | 'PRO' | 'ENTERPRISE' | undefined
    const orderId = meta.orderId as string | undefined

    if (status === 'successful') {
      if (orderId) {
        const order = await prisma.marketplaceOrder.update({ where: { id: orderId }, data: { status: 'SUCCEEDED', paidAt: new Date(), providerRef: String(event?.data?.id || '') } })
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
        await prisma.user.update({ where: { id: userId }, data: { plan } })
        await prisma.payment.create({
          data: {
            userId,
            amount: Math.round(Number(event?.data?.amount || 0) * 100),
            currency: (event?.data?.currency || 'USD').toLowerCase(),
            status: 'SUCCEEDED',
            plan,
          },
        })
        try { await sendPaymentSuccessEmail((await prisma.user.findUnique({ where: { id: userId } }))?.email || '', plan, Math.round(Number(event?.data?.amount || 0) * 100)) } catch {}
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('FLW webhook error:', e)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'

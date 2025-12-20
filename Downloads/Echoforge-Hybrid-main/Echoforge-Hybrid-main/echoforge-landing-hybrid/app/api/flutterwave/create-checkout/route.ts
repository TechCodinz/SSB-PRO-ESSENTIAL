import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plan, orderId } = body as { plan: 'STARTER' | 'PRO' | 'ENTERPRISE'; orderId?: string }
    if (!plan) return NextResponse.json({ error: 'Missing plan' }, { status: 400 })

    const flwSecret = process.env.FLW_SECRET_KEY
    if (!flwSecret) return NextResponse.json({ error: 'FLW_SECRET_KEY missing' }, { status: 500 })

    const baseUrl = 'https://api.flutterwave.com/v3/payments'
    const successUrl = `${process.env.NEXTAUTH_URL}/payment/success?provider=flutterwave&plan=${plan}`

    const amountMap = { STARTER: 39, PRO: 129, ENTERPRISE: 1499 }
    const amount = amountMap[plan]

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${flwSecret}`,
      },
      body: JSON.stringify({
        tx_ref: `ef_${Date.now()}`,
        amount,
        currency: 'USD',
        redirect_url: successUrl,
        customer: { email: session.user.email, name: (session.user as any).name || 'User' },
        meta: { userId: (session.user as any).id, plan, ...(orderId ? { orderId } : {}) },
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('Flutterwave error:', data)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    return NextResponse.json({ url: data.data?.link })
  } catch (e) {
    console.error('FLW create error:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

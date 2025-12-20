import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string

  const apiUrl = (process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || '').replace(/\/$/, '')
  const apiKey = process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''
  if (!apiUrl || !apiKey) {
    return NextResponse.json({ error: 'ML API not configured' }, { status: 503 })
  }

  let body: any
  try { body = await req.json() } catch { body = {} }
  const { address, currency } = body || {}
  if (!address || !currency) return NextResponse.json({ error: 'address and currency required' }, { status: 400 })

  const res = await fetch(`${apiUrl}/crypto/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-echo-key': apiKey },
    body: JSON.stringify({ address, currency }),
  }).catch(() => null as any)

  if (!res) return NextResponse.json({ error: 'Upstream error' }, { status: 502 })
  const data = await res.json().catch(() => ({}))

  try {
    await prisma.usageRecord.create({ data: { userId, type: 'API_CALL', count: 1, metadata: { kind: 'crypto_analyze', address, currency } } })
  } catch {}

  return NextResponse.json(data, { status: res.status })
}

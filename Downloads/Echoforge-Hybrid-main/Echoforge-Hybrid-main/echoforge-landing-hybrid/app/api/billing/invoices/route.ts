import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const invoices = await prisma.payment.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, amount: true, currency: true, status: true, plan: true }
  })
  return NextResponse.json({ invoices })
}

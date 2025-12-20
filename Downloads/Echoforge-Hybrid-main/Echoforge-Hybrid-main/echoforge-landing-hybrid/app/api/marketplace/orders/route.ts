import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await prisma.marketplaceOrder.findMany({
    where: { buyerId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
    include: { listing: { select: { title: true, assetUrl: true } }, license: true }
  })
  return NextResponse.json({ orders })
}

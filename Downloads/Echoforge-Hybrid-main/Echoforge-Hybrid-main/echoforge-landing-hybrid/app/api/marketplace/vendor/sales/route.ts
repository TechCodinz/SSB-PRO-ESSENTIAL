import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: (session.user as any).id } })
  if (!vendor || vendor.status !== 'APPROVED') return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 })

  const listings = await prisma.marketplaceListing.findMany({ where: { vendorId: (session.user as any).id } })
  const listingIds = listings.map(l => l.id)
  const orders = await prisma.marketplaceOrder.findMany({ where: { listingId: { in: listingIds }, status: 'SUCCEEDED' } })
  const revenueCents = orders.reduce((sum,o)=> sum + o.amountCents, 0)

  return NextResponse.json({
    totals: {
      listings: listings.length,
      orders: orders.length,
      revenueCents
    },
    recentOrders: await prisma.marketplaceOrder.findMany({ where: { listingId: { in: listingIds } }, orderBy: { createdAt: 'desc' }, take: 10, include: { listing: { select: { title: true } }, buyer: { select: { email: true } } } })
  })
}

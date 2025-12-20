import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || undefined
  const status = 'APPROVED'
  const listings = await prisma.marketplaceListing.findMany({
    where: { status, ...(category ? { category } : {}) },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, description: true, category: true, priceCents: true, currency: true, purchasesCount: true, downloads: true, rating: true }
  })
  return NextResponse.json({ listings })
}

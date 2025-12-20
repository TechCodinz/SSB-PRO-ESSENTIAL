import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const listings = await prisma.marketplaceListing.findMany({ where: { vendorId: (session.user as any).id }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ listings })
}

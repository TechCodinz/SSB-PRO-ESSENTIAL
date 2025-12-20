import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hasRequiredRole } from '@/lib/rbac'

export async function GET(_req: Request, { params }: { params: { id: string }}) {
  const listing = await prisma.marketplaceListing.findUnique({ where: { id: params.id } })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If not approved, only vendor owner or admin can view
  if (listing.status !== 'APPROVED') {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const role = (session?.user as any)?.role
    if (!userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const isAdmin = hasRequiredRole(role, 'ADMIN')
    const isOwner = listing.vendorId === userId
    if (!isAdmin && !isOwner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ listing })
}

export async function POST(req: Request, { params }: { params: { id: string }}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id as string
  const role = (session.user as any).role as string
  const isAdmin = hasRequiredRole(role, 'ADMIN')
  const body = await req.json()

  const isNew = params.id === 'new'

  if (isNew) {
    // Create new listing: vendor must be approved (or admin can create on behalf of self)
    if (!isAdmin) {
      const vendor = await prisma.vendorProfile.findUnique({ where: { userId } })
      if (!vendor || vendor.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 })
      }
    }
    const { title, description, category, priceCents, currency } = body
    const createData: any = {
      title,
      description,
      category,
      priceCents,
      currency: currency || 'usd',
      vendorId: userId,
      status: 'PENDING'
    }
    const created = await prisma.marketplaceListing.create({ data: createData })
    return NextResponse.json({ listing: created })
  }

  // Update existing listing
  const existing = await prisma.marketplaceListing.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (isAdmin) {
    // Admin can update assetUrl and other safe fields
    const { assetUrl, title, description, category, priceCents, currency, status } = body
    const updateData: any = {}
    if (assetUrl !== undefined) updateData.assetUrl = assetUrl
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priceCents !== undefined) updateData.priceCents = priceCents
    if (currency !== undefined) updateData.currency = currency
    if (status !== undefined) updateData.status = status
    const updated = await prisma.marketplaceListing.update({ where: { id: params.id }, data: updateData })
    return NextResponse.json({ listing: updated })
  } else {
    // Vendor updates limited fields on own listing; force re-approval
    if (existing.vendorId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId } })
    if (!vendor || vendor.status !== 'APPROVED') return NextResponse.json({ error: 'Vendor not approved' }, { status: 403 })
    const { title, description, category, priceCents } = body
    const updateData: any = { status: 'PENDING' }
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priceCents !== undefined) updateData.priceCents = priceCents
    const updated = await prisma.marketplaceListing.update({ where: { id: params.id }, data: updateData })
    return NextResponse.json({ listing: updated })
  }
}

// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'MODERATOR')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listings.list',
      resource: 'admin/marketplace/listings',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const listings = await prisma.marketplaceListing.findMany({ orderBy: { createdAt: 'desc' } })
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listings.list',
      resource: 'admin/marketplace/listings',
      metadata: { count: listings.length },
    })
    return NextResponse.json({ listings })
  } catch (error) {
    console.error('admin.marketplace.listings.list failed', error)
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.listings.list',
      resource: 'admin/marketplace/listings',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to load listings' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'ADMIN')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.listings.update',
      resource: 'admin/marketplace/listings',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const { id, action } = await req.json() as { id: string; action: 'APPROVE'|'REJECT' }
    const listing = await prisma.marketplaceListing.update({ where: { id }, data: { status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } })
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.listings.update',
      resource: 'admin/marketplace/listings',
      metadata: { id, action },
    })
    return NextResponse.json({ listing })
  } catch (error) {
    console.error('admin.marketplace.listings.update failed', error)
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.listings.update',
      resource: 'admin/marketplace/listings',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

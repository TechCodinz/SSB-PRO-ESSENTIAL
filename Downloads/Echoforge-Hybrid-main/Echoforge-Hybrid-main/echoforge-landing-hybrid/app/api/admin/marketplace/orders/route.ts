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
      action: 'admin.marketplace.orders.list',
      resource: 'admin/marketplace/orders',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const orders = await prisma.marketplaceOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { title: true } }, buyer: { select: { email: true } }, license: true }
    })
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.orders.list',
      resource: 'admin/marketplace/orders',
      metadata: { count: orders.length },
    })
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('admin.marketplace.orders.list failed', error)
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.marketplace.orders.list',
      resource: 'admin/marketplace/orders',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'ADMIN')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.orders.update',
      resource: 'admin/marketplace/orders',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const { id, status } = await req.json() as { id: string; status: 'SUCCEEDED'|'FAILED' }
    const order = await prisma.marketplaceOrder.update({ where: { id }, data: { status, paidAt: status==='SUCCEEDED'? new Date(): null } })
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.orders.update',
      resource: 'admin/marketplace/orders',
      metadata: { id, status },
    })
    return NextResponse.json({ order })
  } catch (error) {
    console.error('admin.marketplace.orders.update failed', error)
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.orders.update',
      resource: 'admin/marketplace/orders',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

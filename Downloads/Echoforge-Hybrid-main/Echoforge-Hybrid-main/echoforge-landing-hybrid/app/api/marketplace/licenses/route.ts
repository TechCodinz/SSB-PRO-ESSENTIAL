import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'

// GET /api/marketplace/licenses - list buyer's license keys
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await prisma.licenseKey.findMany({ where: { buyerId: (session.user as any).id }, orderBy: { issuedAt: 'desc' }, include: { listing: { select: { title: true } }, order: { select: { id: true, createdAt: true } } } })
  return NextResponse.json({ keys })
}

// POST /api/marketplace/licenses/revoke - revoke a key (admin only)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const guard = authorizeSession(session, 'ADMIN')
  if (!guard.authorized) return NextResponse.json({ error: guard.error }, { status: guard.status })
  const { id, action } = await req.json() as { id: string; action: 'revoke'|'activate' }
  const data = action === 'revoke' ? { status: 'REVOKED' as const, revokedAt: new Date() } : { status: 'ACTIVE' as const, revokedAt: null as any }
  const key = await prisma.licenseKey.update({ where: { id }, data })
  return NextResponse.json({ key })
}

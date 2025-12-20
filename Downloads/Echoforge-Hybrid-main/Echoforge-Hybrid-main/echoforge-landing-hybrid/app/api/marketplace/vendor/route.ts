import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: (session.user as any).id } })
  return NextResponse.json({ profile })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { displayName, bio } = body
  const created = await prisma.vendorProfile.upsert({
    where: { userId: (session.user as any).id },
    update: { displayName, bio, status: 'PENDING' },
    create: { userId: (session.user as any).id, displayName, bio, status: 'PENDING' }
  })
  return NextResponse.json({ profile: created })
}

// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'ADMIN')
  if (!guard.authorized || !session) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.seed',
      resource: 'admin/marketplace/seed',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  const adminId = (session.user as any).id as string

  const items = [
    { title: 'Anomaly Model: Isolation Forest Pro', category: 'Models', priceCents: 9900, description: 'Production-ready IF model tuned for finance anomalies', assetUrl: '' },
    { title: 'Dataset: Synthetic Transactions (100k rows)', category: 'Datasets', priceCents: 4900, description: 'Clean, labeled data for benchmarking detectors', assetUrl: '' },
    { title: 'Plugin: Real-time Stream Adapter (Kafka)', category: 'Plugins', priceCents: 14900, description: 'Drop-in adapter for Kafka streaming pipelines', assetUrl: '' },
    { title: 'Consulting: 2h Detection Architecture Review', category: 'Consulting', priceCents: 29900, description: 'Senior review with concrete action plan', assetUrl: '' },
    { title: 'Rules: IDS Signatures Pack v1', category: 'Rules', priceCents: 5900, description: 'High-signal signatures for common attacks', assetUrl: '' },
    { title: 'Playbook: Incident Response Templates', category: 'Playbooks', priceCents: 3900, description: 'Step-by-step IR templates for anomalies', assetUrl: '' },
  ]

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: adminId },
    update: { status: 'APPROVED' },
    create: { userId: adminId, displayName: 'EchoForge Official', status: 'APPROVED' }
  })

  try {
    for (const it of items) {
      const existing = await prisma.marketplaceListing.findFirst({ where: { vendorId: adminId, title: it.title } })
      if (existing) {
        await prisma.marketplaceListing.update({ where: { id: existing.id }, data: { description: it.description, category: it.category, priceCents: it.priceCents, assetUrl: it.assetUrl, status: 'APPROVED' } })
      } else {
        await prisma.marketplaceListing.create({ data: { vendorId: adminId, title: it.title, description: it.description, category: it.category, priceCents: it.priceCents, currency: 'usd', assetUrl: it.assetUrl, status: 'APPROVED' } })
      }
    }

    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.seed',
      resource: 'admin/marketplace/seed',
      metadata: { seeded: items.length, vendor: vendorProfile.displayName },
    })

    return NextResponse.json({ ok: true, seeded: items.length, vendor: vendorProfile.displayName })
  } catch (error) {
    console.error('admin.marketplace.seed failed', error)
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.marketplace.seed',
      resource: 'admin/marketplace/seed',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to seed marketplace' }, { status: 500 })
  }
}

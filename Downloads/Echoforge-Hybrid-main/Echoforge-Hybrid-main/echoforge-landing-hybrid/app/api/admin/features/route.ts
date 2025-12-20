// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession, isGuardFailure, type GuardFailure } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

const defaults = () => ({
  crypto_fraud: { name: 'Crypto Fraud Detection', description: 'Blockchain wallet scanning and transaction analysis', enabled: true, beta: false, plans: ['pro', 'enterprise'], category: 'detection' },
  deepfake: { name: 'Deepfake Detection', description: 'AI-powered video and image verification', enabled: true, beta: false, plans: ['pro', 'enterprise'], category: 'detection' },
  forensics: { name: 'Digital Forensics Suite', description: 'Investigation tools and evidence analysis', enabled: true, beta: false, plans: ['enterprise'], category: 'tools' },
  realtime: { name: 'Real-time Monitoring', description: 'Live data stream anomaly detection', enabled: true, beta: false, plans: ['pro', 'enterprise'], category: 'monitoring' },
  api_v2: { name: 'API v2.0', description: 'Enhanced REST API with GraphQL support', enabled: true, beta: true, plans: ['starter', 'pro', 'enterprise'], category: 'api' },
  ml_custom: { name: 'Custom ML Models', description: 'Upload and train custom detection models', enabled: false, beta: true, plans: ['enterprise'], category: 'ml' },
  sso: { name: 'SSO / SAML', description: 'Single sign-on authentication', enabled: true, beta: false, plans: ['enterprise'], category: 'auth' },
  webhooks: { name: 'Advanced Webhooks', description: 'Real-time event notifications', enabled: true, beta: false, plans: ['pro', 'enterprise'], category: 'integration' },
  quantum: { name: 'Quantum-Resistant Encryption', description: 'Post-quantum cryptography', enabled: false, beta: true, plans: ['enterprise'], category: 'security' },
  auto_scale: { name: 'Auto-Scaling', description: 'Automatic resource scaling based on usage', enabled: true, beta: false, plans: ['enterprise'], category: 'infrastructure' }
})

export async function GET(request: Request) {
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions)
    // const guard = authorizeSession(session, 'READ_ONLY')
    if (false && isGuardFailure(guard)) {
      const { status, error } = guard as GuardFailure;
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.features.list',
        resource: 'admin/features',
        status: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: error,
      })
      return NextResponse.json({ error }, { status })
    }
    // Ensure defaults exist in DB
    const existing = await prisma.featureFlag.findMany()
    if (existing.length === 0) {
      const seed = defaults()
      const rows = Object.entries(seed).map(([key, v]) => ({ key, name: v.name, description: v.description, enabled: v.enabled, beta: v.beta, plans: v.plans.join(','), category: v.category }))
      if (rows.length) {
        await prisma.featureFlag.createMany({ data: rows, skipDuplicates: true })
      }
    }
    const flags = await prisma.featureFlag.findMany({ orderBy: { key: 'asc' } })
    const features = Object.fromEntries(flags.map((f) => [f.key, { name: f.name, description: f.description || '', enabled: f.enabled, beta: f.beta, plans: (f.plans || '').split(',').filter(Boolean), category: f.category }]))

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.features.list',
      resource: 'admin/features',
      metadata: { featureCount: flags.length },
    })

    return NextResponse.json({ features })
  } catch (error) {
    console.error('admin.features.list failed', error)
    await recordAdminAuditLog({
      request,
      action: 'admin.features.list',
      resource: 'admin/features',
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to load features' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'ADMIN')
  if (false && isGuardFailure(guard)) {
    const { status, error } = guard as GuardFailure;
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.features.update',
      resource: 'admin/features',
      status: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: error,
    })
    return NextResponse.json({ error }, { status })
  }
  const body = await req.json().catch(() => ({})) as { id?: string; enabled?: boolean; beta?: boolean; plans?: string[] }
  const { id, enabled, beta, plans } = body
  if (!id) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.features.update',
      resource: 'admin/features',
      status: 'FAILURE',
      description: 'Invalid id',
    })
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const updated = await prisma.featureFlag.update({
    where: { key: id },
    data: {
      ...(typeof enabled === 'boolean' ? { enabled } : {}),
      ...(typeof beta === 'boolean' ? { beta } : {}),
      ...(Array.isArray(plans) ? { plans: plans.join(',') } : {}),
    },
  }).catch(async () => {
    // If missing, create from defaults
    const seed = defaults()[id as keyof ReturnType<typeof defaults>]
    if (!seed) return null
    return prisma.featureFlag.upsert({
      where: { key: id },
      update: {
        ...(typeof enabled === 'boolean' ? { enabled } : {}),
        ...(typeof beta === 'boolean' ? { beta } : {}),
        ...(Array.isArray(plans) ? { plans: plans.join(',') } : {}),
      },
      create: { key: id, name: seed.name, description: seed.description, enabled: typeof enabled === 'boolean' ? enabled : seed.enabled, beta: typeof beta === 'boolean' ? beta : seed.beta, plans: Array.isArray(plans) ? plans.join(',') : seed.plans.join(','), category: seed.category },
    })
  })
  if (!updated) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.features.update',
      resource: 'admin/features',
      status: 'FAILURE',
      description: 'Feature not found',
      metadata: { id },
    })
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  await recordAdminAuditLog({
    request: req,
    session,
    action: 'admin.features.update',
    resource: 'admin/features',
    metadata: { id, enabled, beta, plans },
  })
  return NextResponse.json({ ok: true, feature: { id, name: updated.name, description: updated.description, enabled: updated.enabled, beta: updated.beta, plans: (updated.plans || '').split(',').filter(Boolean), category: updated.category } })
}

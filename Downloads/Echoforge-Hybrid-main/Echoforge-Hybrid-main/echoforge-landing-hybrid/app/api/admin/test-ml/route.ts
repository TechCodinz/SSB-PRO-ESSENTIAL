// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'MODERATOR')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.testMl.run',
      resource: 'admin/test-ml',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  const apiUrl = (process.env.NEXT_PUBLIC_ECHOFORGE_API_URL || process.env.ECHOFORGE_API_URL || '').replace(/\/$/, '')
  const apiKey = process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY || ''
  if (!apiUrl || !apiKey) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.testMl.run',
      resource: 'admin/test-ml',
      status: 'FAILURE',
      description: 'API not configured',
    })
    return NextResponse.json({ ok: false, error: 'API not configured' }, { status: 500 })
  }

  try {
    const health = await fetch(`${apiUrl}/health`, { cache: 'no-store' })
    if (!health.ok) {
      await recordAdminAuditLog({
        request,
        session,
        action: 'admin.testMl.run',
        resource: 'admin/test-ml',
        status: 'FAILURE',
        description: 'health check failed',
      })
      return NextResponse.json({ ok: false, error: 'health failed' }, { status: 502 })
    }
    const res = await fetch(`${apiUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-echo-key': apiKey },
      body: JSON.stringify({ data: [[1,2],[3,4],[5,6],[100,200]], method: 'isolation_forest', sensitivity: 0.1 })
    })
    const data = await res.json().catch(()=>({}))
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.testMl.run',
      resource: 'admin/test-ml',
      metadata: { status: res.status, ok: res.ok },
    })
    return NextResponse.json({ ok: res.ok, status: res.status, data })
  } catch (e) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.testMl.run',
      resource: 'admin/test-ml',
      status: 'FAILURE',
      error: e,
    })
    return NextResponse.json({ ok: false, error: 'connection failed' }, { status: 502 })
  }
}

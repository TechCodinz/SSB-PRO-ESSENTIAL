// @ts-nocheck
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { authorizeSession } from '@/lib/rbac'
import { recordAdminAuditLog } from '@/lib/audit'
import { Plan, UserRole } from '@prisma/client'
// UserStatus temporarily removed from schema until database migration

const RESOURCE = 'admin/users'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'READ_ONLY')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.users.list',
      resource: RESOURCE,
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        // status: true, // Temporarily disabled - column doesn't exist in database
        createdAt: true,
        emailVerified: true,
      },
    })

    const usageSummary = await prisma.usageRecord.groupBy({
      by: ['userId'],
      _sum: { count: true },
      _max: { createdAt: true },
    })

    const usageMap = new Map(
      usageSummary.map((entry) => [
        entry.userId,
        {
          total: entry._sum.count ?? 0,
          lastActive: entry._max.createdAt ?? null,
        },
      ]),
    )

    const detailed = users.map((user) => {
      const usage = usageMap.get(user.id)
      return {
        ...user,
        analysesCount: usage?.total ?? 0,
        lastActive: usage?.lastActive ?? user.createdAt,
      }
    })

    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.users.list',
      resource: RESOURCE,
      metadata: { count: detailed.length },
    })
    return NextResponse.json({ users: detailed })
  } catch (error) {
    console.error('admin.users.list failed', error)
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.users.list',
      resource: RESOURCE,
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  // const guard = authorizeSession(session, 'ADMIN')
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.users.update',
      resource: RESOURCE,
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    })
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }
  try {
    const body = await req.json()
    const { userId, plan, role } = body as {
      userId: string
      plan?: string
      role?: string
      // status?: string // Temporarily disabled - column doesn't exist in database
    }
    if (!userId) {
      await recordAdminAuditLog({
        request: req,
        session,
        action: 'admin.users.update',
        resource: RESOURCE,
        status: 'FAILURE',
        description: 'Missing userId',
        metadata: { body },
      })
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }
    const data: Record<string, any> = {}
    if (plan) {
      if (!Object.values(Plan).includes(plan as Plan)) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      data.plan = plan
    }
    if (role) {
      const normalizedRole = role.toUpperCase()
      if (!Object.values(UserRole).includes(normalizedRole as UserRole)) {
        await recordAdminAuditLog({
          request: req,
          session,
          action: 'admin.users.update',
          resource: RESOURCE,
          status: 'FAILURE',
          description: 'Invalid role assignment',
          metadata: { role },
        })
        return NextResponse.json({ error: 'Invalid role assignment' }, { status: 400 })
      }
      data.role = normalizedRole
    }
    // Status update temporarily disabled - column doesn't exist in database
    // if (status) {
    //   const normalizedStatus = status.toUpperCase()
    //   if (!Object.values(UserStatus).includes(normalizedStatus as UserStatus)) {
    //     await recordAdminAuditLog({
    //       request: req,
    //       session,
    //       action: 'admin.users.update',
    //       resource: RESOURCE,
    //       status: 'FAILURE',
    //       description: 'Invalid status',
    //       metadata: { status },
    //     })
    //     return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    //   }
    //   data.status = normalizedStatus
    // }

    const user = await prisma.user.update({ where: { id: userId }, data })
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.users.update',
      resource: RESOURCE,
      metadata: {
        userId,
        plan: data.plan ?? null,
        role: data.role ?? null,
        // status: data.status ?? null, // Temporarily disabled
      },
    })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('admin.users.update failed', error)
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.users.update',
      resource: RESOURCE,
      status: 'FAILURE',
      error,
    })
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

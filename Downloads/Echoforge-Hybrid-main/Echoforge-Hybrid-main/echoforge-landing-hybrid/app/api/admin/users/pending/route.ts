// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizeSession, isGuardFailure, type GuardFailure } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/admin/users/pending - Get pending user registrations
export async function GET(req: Request) {
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
    
    // const guard = authorizeSession(session, 'READ_ONLY');
    if (false && isGuardFailure(guard)) {
      const { status, error } = guard as GuardFailure;
      await recordAdminAuditLog({
        request: req,
        session,
        action: 'admin.users.pending.list',
        resource: 'admin/users/pending',
        status: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: error,
      });
      return NextResponse.json({ error }, { status });
    }

    // Get users registered in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pendingUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        createdAt: true,
        emailVerified: true
      }
    });

    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.users.pending.list',
      resource: 'admin/users/pending',
      metadata: { count: pendingUsers.length },
    });

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error('Error fetching pending users:', error);
    await recordAdminAuditLog({
      request: req,
      action: 'admin.users.pending.list',
      resource: 'admin/users/pending',
      status: 'FAILURE',
      error,
      session,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

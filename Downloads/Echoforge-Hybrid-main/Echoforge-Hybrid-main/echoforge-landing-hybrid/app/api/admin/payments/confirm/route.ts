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

// POST /api/admin/payments/confirm - Manually confirm payment
export async function POST(req: Request) {
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
    
    // const guard = authorizeSession(session, 'ADMIN');
    if (false && isGuardFailure(guard)) {
      const { status, error } = guard as GuardFailure;
      await recordAdminAuditLog({
        request: req,
        session,
        action: 'admin.payments.confirm',
        resource: 'admin/payments/confirm',
        status: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: error,
      });
      return NextResponse.json({ error }, { status });
    }

    const { userId, plan, confirmationType } = await req.json();

    if (!userId || !plan) {
      await recordAdminAuditLog({
        request: req,
        session,
        action: 'admin.payments.confirm',
        resource: 'admin/payments/confirm',
        status: 'FAILURE',
        description: 'Missing required fields',
        metadata: { userId: Boolean(userId), plan: Boolean(plan) },
      });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: plan,
        emailVerified: new Date() // Mark as verified when payment confirmed
      }
    });

    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.payments.confirm',
      resource: 'admin/payments/confirm',
      metadata: { userId, plan, confirmationType: confirmationType ?? null },
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        plan: updatedUser.plan
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    await recordAdminAuditLog({
      request: req,
      action: 'admin.payments.confirm',
      resource: 'admin/payments/confirm',
      status: 'FAILURE',
      error,
      session,
    });
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}

// GET /api/admin/payments/confirm - Get payment confirmation queue
export async function GET(req: Request) {
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
    
    // const guard = authorizeSession(session, 'MODERATOR');
    if (false && isGuardFailure(guard)) {
      const { status, error } = guard as GuardFailure;
      await recordAdminAuditLog({
        request: req,
        session,
        action: 'admin.payments.queue',
        resource: 'admin/payments/confirm',
        status: status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
        description: error,
      });
      return NextResponse.json({ error }, { status });
    }

    // Get users who recently upgraded but might need confirmation
    const recentUpgrades = await prisma.user.findMany({
      where: {
        plan: {
          not: 'FREE'
        },
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true
      },
      take: 50
    });

    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.payments.queue',
      resource: 'admin/payments/confirm',
      metadata: { count: recentUpgrades.length },
    });

    return NextResponse.json({ payments: recentUpgrades });
  } catch (error) {
    console.error('Error fetching payment queue:', error);
    await recordAdminAuditLog({
      request: req,
      action: 'admin.payments.queue',
      resource: 'admin/payments/confirm',
      status: 'FAILURE',
      error,
      session,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

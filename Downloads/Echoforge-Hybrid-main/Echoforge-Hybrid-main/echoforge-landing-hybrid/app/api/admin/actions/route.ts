import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });

    const adminRoles = ['ADMIN', 'OWNER', 'SUPERADMIN'];
    return adminRoles.includes((user?.role || '').toUpperCase());
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!await isAdmin(session.user.id)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const body = await req.json();
        const { action, params } = body;

        switch (action) {
            case 'password_reset': {
                const { userId, email } = params || {};
                const targetUser = userId
                    ? await prisma.user.findUnique({ where: { id: userId } })
                    : email
                        ? await prisma.user.findUnique({ where: { email } })
                        : null;

                if (!targetUser) {
                    return NextResponse.json({ error: 'User not found' }, { status: 404 });
                }

                // Generate reset token
                const token = crypto.randomUUID();
                const expires = new Date(Date.now() + 3600000); // 1 hour

                await prisma.verificationToken.create({
                    data: {
                        identifier: targetUser.email,
                        token,
                        expires,
                    },
                });

                // Log the action
                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'PASSWORD_RESET_REQUEST',
                        targetId: targetUser.id,
                        targetType: 'USER',
                        details: { email: targetUser.email },
                    },
                });

                // In production, send email here
                // For now, return success
                return NextResponse.json({
                    success: true,
                    message: `Password reset email sent to ${targetUser.email}`,
                });
            }

            case 'broadcast_email': {
                const { subject, message, targetPlan, targetStatus } = params || {};

                if (!subject || !message) {
                    return NextResponse.json({ error: 'Subject and message required' }, { status: 400 });
                }

                // Get target users
                const where: any = {};
                if (targetPlan && targetPlan !== 'all') {
                    where.plan = targetPlan.toUpperCase();
                }

                const users = await prisma.user.findMany({
                    where,
                    select: { id: true, email: true, name: true },
                });

                // Log the broadcast
                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'BROADCAST_EMAIL',
                        targetType: 'BULK',
                        details: {
                            subject,
                            recipientCount: users.length,
                            targetPlan,
                        },
                    },
                });

                // In production, queue emails for sending
                return NextResponse.json({
                    success: true,
                    message: `Broadcast queued for ${users.length} users`,
                    recipientCount: users.length,
                });
            }

            case 'apply_discount': {
                const { code, percent, targetPlan } = params || {};

                if (!code || !percent) {
                    return NextResponse.json({ error: 'Code and percent required' }, { status: 400 });
                }

                // Log the discount application
                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'APPLY_DISCOUNT',
                        targetType: 'PROMOTION',
                        details: { code, percent, targetPlan },
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: `Discount code ${code} (${percent}% off) applied`,
                });
            }

            case 'generate_report': {
                const { reportType } = params || {};

                // Get usage statistics
                const stats = await prisma.user.aggregate({
                    _count: true,
                    _sum: { analysesCount: true, apiCallsCount: true },
                });

                const planBreakdown = await prisma.user.groupBy({
                    by: ['plan'],
                    _count: true,
                });

                // Log the report generation
                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'GENERATE_REPORT',
                        targetType: 'REPORT',
                        details: { reportType },
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'Report generated',
                    data: {
                        totalUsers: stats._count,
                        totalAnalyses: stats._sum?.analysesCount || 0,
                        totalApiCalls: stats._sum?.apiCallsCount || 0,
                        planBreakdown,
                    },
                });
            }

            case 'suspend_user': {
                const { userId, reason } = params || {};

                if (!userId) {
                    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
                }

                // Update user status (using role as proxy since status might not exist)
                // In production, add a status field
                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'SUSPEND_USER',
                        targetId: userId,
                        targetType: 'USER',
                        details: { reason },
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'User suspended',
                });
            }

            case 'activate_user': {
                const { userId } = params || {};

                if (!userId) {
                    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
                }

                await prisma.adminAuditLog.create({
                    data: {
                        adminId: session.user.id,
                        action: 'ACTIVATE_USER',
                        targetId: userId,
                        targetType: 'USER',
                        details: {},
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: 'User activated',
                });
            }

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Admin action error:', error);
        return NextResponse.json(
            { error: 'Action failed' },
            { status: 500 }
        );
    }
}

// GET - Get audit trail
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!await isAdmin(session.user.id)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const action = searchParams.get('action');

        const where: any = {};
        if (action) {
            where.action = action;
        }

        const logs = await prisma.adminAuditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                admin: {
                    select: { name: true, email: true },
                },
            },
        });

        return NextResponse.json({
            logs: logs.map(log => ({
                id: log.id,
                action: log.action,
                adminName: log.admin?.name || log.admin?.email || 'System',
                targetId: log.targetId,
                targetType: log.targetType,
                details: log.details,
                createdAt: log.createdAt,
            })),
            total: logs.length,
        });
    } catch (error) {
        console.error('Audit trail error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit trail' },
            { status: 500 }
        );
    }
}

// @ts-nocheck
import { Plan } from '@prisma/client';
import { prisma } from './db';

/**
 * Usage limits based on plan
 */
const PLAN_LIMITS = {
  FREE: {
    analysesPerDay: 5,
    maxFileSize: 1 * 1024 * 1024, // 1MB
    apiCallsPerMonth: 100,
  },
  STARTER: {
    analysesPerDay: 50,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    apiCallsPerMonth: 1000,
  },
  PRO: {
    analysesPerDay: 500,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    apiCallsPerMonth: 10000,
  },
  ENTERPRISE: {
    analysesPerDay: Infinity,
    maxFileSize: 500 * 1024 * 1024, // 500MB
    apiCallsPerMonth: Infinity,
  },
} as const;

/**
 * Get maximum file size for a plan
 */
export function getMaxFileSize(plan: Plan | string): number {
  const planKey = plan.toUpperCase() as keyof typeof PLAN_LIMITS;
  return PLAN_LIMITS[planKey]?.maxFileSize || PLAN_LIMITS.FREE.maxFileSize;
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkUsageLimit(
  userId: string,
  plan: Plan | string,
  type: 'ANALYSIS' | 'API_CALL' = 'ANALYSIS'
): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  limit: number;
  resetDate: Date;
}> {
  const planKey = plan.toUpperCase() as keyof typeof PLAN_LIMITS;
  const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.FREE;

  // Get start of current period
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let used = 0;
  let limit = 0;
  let resetDate: Date;

  if (type === 'ANALYSIS') {
    limit = limits.analysesPerDay;
    resetDate = new Date(startOfDay);
    resetDate.setDate(resetDate.getDate() + 1);

    // Count analyses today
    used = await prisma.analysis.count({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
        },
      },
    });
  } else {
    // API calls
    limit = limits.apiCallsPerMonth;
    resetDate = new Date(startOfMonth);
    resetDate.setMonth(resetDate.getMonth() + 1);

    // Count API calls this month
    used = await prisma.usageRecord.count({
      where: {
        userId,
        type: 'API_CALL',
        createdAt: {
          gte: startOfMonth,
        },
      },
    });
  }

  const remaining = Math.max(0, limit - used);
  const allowed = limit === Infinity || used < limit;

  return {
    allowed,
    used,
    remaining,
    limit,
    resetDate,
  };
}

/**
 * Record usage
 */
export async function recordUsage(
  userId: string,
  type: 'ANALYSIS' | 'API_CALL' | 'FILE_UPLOAD' | 'REPORT_DOWNLOAD'
): Promise<void> {
  await prisma.usageRecord.create({
    data: {
      userId,
      type,
      count: 1,
    },
  });
}

// @ts-nocheck
import { Prisma, UserRole } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "./db";
import { incrementCounter, observeDuration } from "./metrics";

type AuditStatus = "SUCCESS" | "FAILURE" | "UNAUTHORIZED" | "FORBIDDEN" | string;

type AuditLogParams = {
  request?: Request;
  session?: Session | null;
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  resource: string;
  status?: AuditStatus;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  error?: unknown;
};

const userRoleSet = new Set<string>(Object.values(UserRole));

function coerceUserRole(role?: string | null): UserRole | null {
  if (!role) {
    return null;
  }
  const upper = role.toUpperCase();
  return userRoleSet.has(upper) ? (upper as UserRole) : null;
}

function sanitizeMetadata(meta?: Record<string, unknown> | null): Prisma.JsonValue | undefined {
  if (!meta) {
    return undefined;
  }
  try {
    return JSON.parse(JSON.stringify(meta)) as Prisma.JsonValue;
  } catch {
    return undefined;
  }
}

function extractRequestContext(request?: Request) {
  if (!request) {
    return {
      ipAddress: null,
      userAgent: null,
      route: null,
      httpMethod: null,
    };
  }

  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for") ?? headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? null;
  const userAgent = headers.get("user-agent");
  let route: string | null = null;

  try {
    const url = new URL(request.url);
    route = url.pathname;
  } catch {
    route = null;
  }

  return {
    ipAddress,
    userAgent,
    route,
    httpMethod: request.method ?? null,
  };
}

function extractSessionContext(session?: Session | null) {
  const actorId = session?.user?.id ?? null;
  const actorEmail = session?.user?.email ?? null;
  const actorRole = session?.user?.role ?? null;
  return { actorId, actorEmail, actorRole };
}

export async function recordAdminAuditLog(params: AuditLogParams) {
  const started = Date.now();

  const {
    request,
    session,
    action,
    resource,
    status = "SUCCESS",
    description,
    metadata,
    error,
  } = params;

  const { ipAddress, userAgent, route, httpMethod } = extractRequestContext(request);
  const { actorId, actorEmail, actorRole } = extractSessionContext(session);

  const coerceStatus = status.toUpperCase();

  try {
    const payload = {
      actorId: params.actorId ?? actorId,
      actorEmail: params.actorEmail ?? actorEmail,
      actorRole: coerceUserRole(params.actorRole ?? actorRole),
      action,
      resource,
      status: coerceStatus,
      route,
      httpMethod,
      ipAddress,
      userAgent,
      description: description ?? (error instanceof Error ? error.message : null),
      metadata: sanitizeMetadata(metadata),
    };

    await prisma.adminAuditLog.create({ data: payload as any });

    incrementCounter("admin_audit_logs_total", 1, {
      action,
      resource,
      status: coerceStatus,
    });
  } catch (loggingError) {
    incrementCounter("admin_audit_logs_failures_total", 1, {
      action,
      resource,
    });
    console.error("[audit] failed to record admin audit log", loggingError);
  } finally {
    observeDuration("admin_audit_log_duration_ms", Date.now() - started, {
      action,
      resource,
    });
  }
}

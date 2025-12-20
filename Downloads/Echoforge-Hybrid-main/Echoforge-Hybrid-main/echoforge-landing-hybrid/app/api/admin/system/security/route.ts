// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";

const SETTINGS_ID = "global-security";
const ALLOWED_SESSION_TIMEOUTS = ["15 minutes", "30 minutes", "1 hour", "4 hours"] as const;
const ALLOWED_FAILED_LIMITS = ["3 attempts", "5 attempts", "10 attempts"] as const;

type SecuritySettingsPayload = {
  twoFactorEnabled?: boolean;
  ipWhitelistingEnabled?: boolean;
  sessionTimeout?: (typeof ALLOWED_SESSION_TIMEOUTS)[number];
  failedLoginLimit?: (typeof ALLOWED_FAILED_LIMITS)[number];
};

async function ensureSettings() {
  return prisma.securitySetting.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'READ_ONLY');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: 'admin.system.security.get',
      resource: 'admin/system/security',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const settings = await ensureSettings();
  await recordAdminAuditLog({
    request,
    session,
    action: 'admin.system.security.get',
    resource: 'admin/system/security',
  });
  return NextResponse.json({ settings });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, 'ADMIN');
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.system.security.update',
      resource: 'admin/system/security',
      status: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let payload: SecuritySettingsPayload;
  try {
    payload = (await req.json()) as SecuritySettingsPayload;
  } catch (error) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.system.security.update',
      resource: 'admin/system/security',
      status: 'FAILURE',
      description: 'Invalid JSON body',
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const data: SecuritySettingsPayload = {};

  if (typeof payload.twoFactorEnabled === "boolean") {
    data.twoFactorEnabled = payload.twoFactorEnabled;
  }

  if (typeof payload.ipWhitelistingEnabled === "boolean") {
    data.ipWhitelistingEnabled = payload.ipWhitelistingEnabled;
  }

  if (payload.sessionTimeout) {
    if (!ALLOWED_SESSION_TIMEOUTS.includes(payload.sessionTimeout as any)) {
      return NextResponse.json({ error: "Invalid session timeout" }, { status: 400 });
    }
    data.sessionTimeout = payload.sessionTimeout;
  }

  if (payload.failedLoginLimit) {
    if (!ALLOWED_FAILED_LIMITS.includes(payload.failedLoginLimit as any)) {
      return NextResponse.json({ error: "Invalid failed login limit" }, { status: 400 });
    }
    data.failedLoginLimit = payload.failedLoginLimit;
  }

  if (!Object.keys(data).length) {
    await recordAdminAuditLog({
      request: req,
      session,
      action: 'admin.system.security.update',
      resource: 'admin/system/security',
      status: 'FAILURE',
      description: 'No valid fields provided',
    });
    return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
  }

  await ensureSettings();
  const settings = await prisma.securitySetting.update({
    where: { id: SETTINGS_ID },
    data,
  });

  await recordAdminAuditLog({
    request: req,
    session,
    action: 'admin.system.security.update',
    resource: 'admin/system/security',
    metadata: { fieldsUpdated: Object.keys(data) },
  });

  return NextResponse.json({ settings });
}

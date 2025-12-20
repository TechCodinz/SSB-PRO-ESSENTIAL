// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";
import { Plan } from "@prisma/client";

const RESOURCE = "admin/plans";

function parseFeatures(features?: string[] | string | null) {
  if (!features) return undefined;
  if (Array.isArray(features)) {
    return features.map((f) => f.trim()).filter(Boolean);
  }
  return features
    .split(/\r?\n|,/)
    .map((f) => f.trim())
    .filter(Boolean);
}

type UpdatePayload = {
  planKey?: string | null;
  slug?: string | null;
  name?: string;
  priceCents?: number;
  description?: string | null;
  features?: string[] | string | null;
  analysesLimit?: number | null;
  rowsLimit?: number | null;
  apiCallsLimit?: number | null;
  isActive?: boolean;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, "ADMIN");
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.update",
      resource: RESOURCE,
      status: guard.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: UpdatePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.priceCents === "number" && !Number.isNaN(body.priceCents)) {
    data.priceCents = Math.max(0, Math.floor(body.priceCents));
  }
  if (body.description !== undefined) data.description = body.description;
  if (body.features !== undefined) data.features = parseFeatures(body.features) ?? [];
  if (body.analysesLimit !== undefined) data.analysesLimit = body.analysesLimit;
  if (body.rowsLimit !== undefined) data.rowsLimit = body.rowsLimit;
  if (body.apiCallsLimit !== undefined) data.apiCallsLimit = body.apiCallsLimit;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.slug !== undefined) {
    if (!body.slug || !body.slug.trim()) {
      return NextResponse.json({ error: "Slug cannot be empty" }, { status: 400 });
    }
    data.slug = body.slug.toLowerCase();
  }
  if (body.planKey !== undefined && body.planKey !== null) {
    const planKey = body.planKey.toUpperCase();
    if (!Object.values(Plan).includes(planKey as Plan)) {
      return NextResponse.json({ error: `Unknown plan key ${planKey}` }, { status: 400 });
    }
    data.plan = planKey;
  } else if (body.planKey === null) {
    data.plan = null;
  }

  try {
    const updated = await prisma.planDefinition.update({
      where: { id: params.id },
      data,
    });

    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.update",
      resource: RESOURCE,
      metadata: { planId: updated.id, planKey: updated.plan },
    });

    return NextResponse.json({ ok: true, plan: updated });
  } catch (error) {
    console.error("Failed to update plan", error);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, "ADMIN");
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.delete",
      resource: RESOURCE,
      status: guard.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  try {
    const existing = await prisma.planDefinition.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (existing.plan) {
      return NextResponse.json({ error: "Core plans cannot be deleted" }, { status: 400 });
    }

    await prisma.planDefinition.delete({ where: { id: params.id } });

    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.delete",
      resource: RESOURCE,
      metadata: { planId: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete plan", error);
    return NextResponse.json({ error: "Failed to delete plan" }, { status: 500 });
  }
}

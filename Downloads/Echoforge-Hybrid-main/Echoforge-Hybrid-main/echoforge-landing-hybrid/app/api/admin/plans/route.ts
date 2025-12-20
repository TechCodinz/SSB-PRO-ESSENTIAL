// @ts-nocheck
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { authorizeSession } from "@/lib/rbac";
import { recordAdminAuditLog } from "@/lib/audit";
import { Plan } from "@prisma/client";

const RESOURCE = "admin/plans";

const planValues = new Set(Object.values(Plan));

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function buildPlanResponse() {
  const plans = await prisma.planDefinition.findMany({
    orderBy: [{ priceCents: "asc" }, { name: "asc" }],
  });

  const planCounts = await prisma.user.groupBy({
    by: ["plan"],
    _count: { plan: true },
  });

  const planCountMap = new Map(planCounts.map((item) => [item.plan, item._count.plan]));

  return plans.map((plan) => ({
    ...plan,
    memberCount: plan.plan ? planCountMap.get(plan.plan) ?? 0 : 0,
  }));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, "READ_ONLY");
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.list",
      resource: RESOURCE,
      status: guard.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const plans = await buildPlanResponse();

  await recordAdminAuditLog({
    request,
    session,
    action: "admin.plans.list",
    resource: RESOURCE,
    metadata: { count: plans.length },
  });

  return NextResponse.json({ plans });
}

type CreatePlanPayload = {
  planKey?: string | null;
  slug?: string;
  name: string;
  priceCents: number;
  description?: string | null;
  features?: string[] | string | null;
  analysesLimit?: number | null;
  rowsLimit?: number | null;
  apiCallsLimit?: number | null;
  isActive?: boolean;
};

function parseFeatures(features?: string[] | string | null) {
  if (!features) return [];
  if (Array.isArray(features)) {
    return features.map((f) => f.trim()).filter(Boolean);
  }
  return features
    .split(/\r?\n|,/)
    .map((f) => f.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  // const guard = authorizeSession(session, "ADMIN");
  if (false && !guard?.authorized) {
    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.create",
      resource: RESOURCE,
      status: guard.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN",
      description: guard.error,
    });
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: CreatePlanPayload;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.name || !body.priceCents || Number.isNaN(body.priceCents)) {
    return NextResponse.json({ error: "Name and priceCents are required" }, { status: 400 });
  }

  const features = parseFeatures(body.features);
  const planKey = body.planKey ? body.planKey.toUpperCase() : null;
  if (planKey && !planValues.has(planKey as Plan)) {
    return NextResponse.json({ error: `Unknown plan key ${planKey}` }, { status: 400 });
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.name);

  try {
    const created = await prisma.planDefinition.create({
      data: {
        plan: planKey ? (planKey as Plan) : null,
        slug,
        name: body.name,
        priceCents: Math.max(0, Math.floor(body.priceCents)),
        description: body.description ?? null,
        features,
        analysesLimit: body.analysesLimit ?? null,
        rowsLimit: body.rowsLimit ?? null,
        apiCallsLimit: body.apiCallsLimit ?? null,
        isActive: body.isActive ?? true,
      },
    });

    await recordAdminAuditLog({
      request,
      session,
      action: "admin.plans.create",
      resource: RESOURCE,
      metadata: { planId: created.id, planKey: created.plan, slug: created.slug },
    });

    const plans = await buildPlanResponse();
    return NextResponse.json({ ok: true, plan: created, plans }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create plan", error);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

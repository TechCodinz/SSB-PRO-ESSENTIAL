import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSessionMock = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const recordAdminAuditLogMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/audit", () => ({
  recordAdminAuditLog: recordAdminAuditLogMock,
}));

const planDefinitionFindMany = vi.fn();
const planDefinitionCreate = vi.fn();
const planDefinitionUpdate = vi.fn();
const planDefinitionDelete = vi.fn();
const planDefinitionFindUnique = vi.fn();
const userGroupBy = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    planDefinition: {
      findMany: planDefinitionFindMany,
      create: planDefinitionCreate,
      update: planDefinitionUpdate,
      delete: planDefinitionDelete,
      findUnique: planDefinitionFindUnique,
    },
    user: {
      groupBy: userGroupBy,
    },
  },
}));

let plansRoute: typeof import("@/app/api/admin/plans/route");
let planDetailRoute: typeof import("@/app/api/admin/plans/[id]/route");

const adminSession = {
  user: {
    id: "admin-id",
    email: "admin@example.com",
    role: "ADMIN",
  },
} as any;

const readOnlySession = {
  user: {
    id: "viewer-id",
    email: "viewer@example.com",
    role: "READ_ONLY",
  },
} as any;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  plansRoute = await import("@/app/api/admin/plans/route");
  planDetailRoute = await import("@/app/api/admin/plans/[id]/route");
});

describe("admin plan API routes", () => {
  it("denies unauthenticated access to plan list", async () => {
    getServerSessionMock.mockResolvedValueOnce(null);

    const response = await plansRoute.GET(new Request("http://test.local/api/admin/plans"));

    expect(response.status).toBe(401);
    expect(recordAdminAuditLogMock).toHaveBeenCalled();
  });

  it("returns plan definitions with member counts", async () => {
    const now = new Date();
    getServerSessionMock.mockResolvedValueOnce(readOnlySession);
    planDefinitionFindMany.mockResolvedValueOnce([
      {
        id: "plan-pro",
        plan: "PRO",
        slug: "professional",
        name: "Professional",
        priceCents: 12900,
        description: "Full power",
        features: ["Feature A"],
        analysesLimit: 1000,
        rowsLimit: 50000,
        apiCallsLimit: 75000,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    userGroupBy.mockResolvedValueOnce([
      {
        plan: "PRO",
        _count: { plan: 7 },
      },
    ]);

    const response = await plansRoute.GET(new Request("http://test.local/api/admin/plans"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.plans).toEqual([
      expect.objectContaining({
        id: "plan-pro",
        memberCount: 7,
      }),
    ]);
  });

  it("rejects POST with unknown plan key", async () => {
    getServerSessionMock.mockResolvedValueOnce(adminSession);

    const response = await plansRoute.POST(
      new Request("http://test.local/api/admin/plans", {
        method: "POST",
        body: JSON.stringify({
          name: "Invalid",
          priceCents: 1000,
          planKey: "not-real",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(planDefinitionCreate).not.toHaveBeenCalled();
  });

  it("creates plan definitions and returns updated list", async () => {
    const now = new Date();
    getServerSessionMock.mockResolvedValueOnce(adminSession);
    planDefinitionCreate.mockResolvedValueOnce({
      id: "custom",
      plan: null,
      slug: "custom-plan",
      name: "Custom Plan",
      priceCents: 2500,
      description: null,
      features: ["Feature A"],
      analysesLimit: null,
      rowsLimit: null,
      apiCallsLimit: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    planDefinitionFindMany.mockResolvedValueOnce([
      {
        id: "custom",
        plan: null,
        slug: "custom-plan",
        name: "Custom Plan",
        priceCents: 2500,
        description: null,
        features: ["Feature A"],
        analysesLimit: null,
        rowsLimit: null,
        apiCallsLimit: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    userGroupBy.mockResolvedValueOnce([]);

    const response = await plansRoute.POST(
      new Request("http://test.local/api/admin/plans", {
        method: "POST",
        body: JSON.stringify({
          name: "Custom Plan",
          priceCents: 2500,
          features: "Feature A\nFeature B",
          isActive: true,
        }),
      }),
    );

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(planDefinitionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Custom Plan",
          features: ["Feature A", "Feature B"],
        }),
      }),
    );
    expect(payload.plan.slug).toBe("custom-plan");
  });

  it("updates plan definitions via PATCH", async () => {
    const now = new Date();
    getServerSessionMock.mockResolvedValueOnce(adminSession);
    planDefinitionUpdate.mockResolvedValueOnce({
      id: "custom",
      plan: null,
      slug: "custom-plan",
      name: "Custom Plan",
      priceCents: 4000,
      description: null,
      features: [],
      analysesLimit: null,
      rowsLimit: null,
      apiCallsLimit: null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const response = await planDetailRoute.PATCH(
      new Request("http://test.local/api/admin/plans/custom", {
        method: "PATCH",
        body: JSON.stringify({
          priceCents: 4000,
          slug: "custom-plan",
        }),
      }),
      { params: { id: "custom" } },
    );

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(planDefinitionUpdate).toHaveBeenCalledWith({
      where: { id: "custom" },
      data: expect.objectContaining({ priceCents: 4000 }),
    });
    expect(payload.plan.priceCents).toBe(4000);
  });

  it("prevents deleting core plans", async () => {
    getServerSessionMock.mockResolvedValueOnce(adminSession);
    planDefinitionFindUnique.mockResolvedValueOnce({
      id: "plan-pro",
      plan: "PRO",
    });

    const response = await planDetailRoute.DELETE(
      new Request("http://test.local/api/admin/plans/plan-pro", { method: "DELETE" }),
      { params: { id: "plan-pro" } },
    );

    expect(response.status).toBe(400);
    expect(planDefinitionDelete).not.toHaveBeenCalled();
  });
});

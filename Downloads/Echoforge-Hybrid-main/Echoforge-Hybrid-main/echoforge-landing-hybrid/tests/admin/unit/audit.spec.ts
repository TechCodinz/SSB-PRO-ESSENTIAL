import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();
const incrementCounterMock = vi.fn();
const observeDurationMock = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    adminAuditLog: {
      create: createMock,
    },
  },
}));

vi.mock("@/lib/metrics", () => ({
  incrementCounter: incrementCounterMock,
  observeDuration: observeDurationMock,
}));

let recordAdminAuditLog: (typeof import("@/lib/audit"))["recordAdminAuditLog"];

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ recordAdminAuditLog } = await import("@/lib/audit"));
});

describe("recordAdminAuditLog", () => {
  it("persists audit entry with sanitized metadata", async () => {
    createMock.mockResolvedValueOnce({});

    await recordAdminAuditLog({
      action: "admin.users.list",
      resource: "admin/users",
      session: {
        user: {
          id: "admin-1",
          email: "admin@example.com",
          role: "ADMIN",
        },
      } as any,
      metadata: {
        ok: true,
        unsafe: BigInt(10),
      },
    });

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "admin-1",
          actorEmail: "admin@example.com",
          actorRole: "ADMIN",
          metadata: undefined,
        }),
      }),
    );
    expect(incrementCounterMock).toHaveBeenCalledWith(
      "admin_audit_logs_total",
      1,
      expect.objectContaining({
        action: "admin.users.list",
        resource: "admin/users",
        status: "SUCCESS",
      }),
    );
    expect(observeDurationMock).toHaveBeenCalledWith(
      "admin_audit_log_duration_ms",
      expect.any(Number),
      expect.objectContaining({
        action: "admin.users.list",
        resource: "admin/users",
      }),
    );
  });

  it("records failure metric when persistence throws", async () => {
    createMock.mockRejectedValueOnce(new Error("db unavailable"));

    await recordAdminAuditLog({
      action: "admin.users.list",
      resource: "admin/users",
    });

    expect(incrementCounterMock).toHaveBeenLastCalledWith(
      "admin_audit_logs_failures_total",
      1,
      expect.objectContaining({
        action: "admin.users.list",
        resource: "admin/users",
      }),
    );
    expect(observeDurationMock).toHaveBeenCalled();
  });
});

import { describe, it, expect } from "vitest";
import { authorizeSession, hasRequiredRole, normalizeAdminRole } from "@/lib/rbac";

describe("RBAC utilities", () => {
  it("normalizes admin roles and rejects unknown roles", () => {
    expect(normalizeAdminRole("admin")).toBe("ADMIN");
    expect(normalizeAdminRole("owner")).toBe("OWNER");
    expect(normalizeAdminRole("user")).toBeNull();
    expect(normalizeAdminRole(undefined)).toBeNull();
  });

  it("allows higher priority roles to satisfy lower level requirements", () => {
    expect(hasRequiredRole("OWNER", "READ_ONLY")).toBe(true);
    expect(hasRequiredRole("ADMIN", ["MODERATOR", "OWNER"])).toBe(true);
    expect(hasRequiredRole("READ_ONLY", "ADMIN")).toBe(false);
    expect(hasRequiredRole(null, "READ_ONLY")).toBe(false);
  });

  it("authorizes sessions with sufficient role and rejects others", () => {
    const adminSession = {
      user: { id: "1", email: "admin@example.com", role: "ADMIN" },
    } as any;

    expect(authorizeSession(adminSession, "READ_ONLY")).toEqual({ authorized: true });
    expect(authorizeSession(null, "READ_ONLY")).toEqual({
      authorized: false,
      status: 401,
      error: "Unauthorized",
    });
    expect(authorizeSession({ user: { role: "READ_ONLY" } } as any, "ADMIN")).toEqual({
      authorized: false,
      status: 403,
      error: "Forbidden: insufficient role",
    });
  });
});

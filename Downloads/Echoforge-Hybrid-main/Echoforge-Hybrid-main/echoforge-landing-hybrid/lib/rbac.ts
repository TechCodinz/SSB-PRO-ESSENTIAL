// @ts-nocheck
import type { Session } from "next-auth";

export const ROLE_PRIORITY = {
  READ_ONLY: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
} as const;

export type AdminRole = keyof typeof ROLE_PRIORITY;

// Map alternative role names to standard roles
const ROLE_ALIASES: Record<string, AdminRole> = {
  'SUPERADMIN': 'ADMIN',
  'SUPER_ADMIN': 'ADMIN',
  'SYSADMIN': 'ADMIN',
};

/**
 * Normalize a role string into one of the RBAC admin roles.
 * Returns null when the role does not map to an elevated admin role.
 */
export function normalizeAdminRole(role?: string | null): AdminRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.toUpperCase().trim();
  
  // Check if it's an alias first
  if (normalized in ROLE_ALIASES) {
    return ROLE_ALIASES[normalized];
  }
  
  // Check if it's a standard role
  if (normalized in ROLE_PRIORITY) {
    return normalized as AdminRole;
  }
  
  return null;
}

/**
 * Determine whether a user role satisfies any of the required roles.
 * @param role - The raw role string from session/token/database.
 * @param required - A single role or array of roles accepted for the action.
 */
export function hasRequiredRole(role: string | null | undefined, required: AdminRole | AdminRole[]): boolean {
  const normalized = normalizeAdminRole(role);
  if (!normalized) {
    return false;
  }

  const requiredList = Array.isArray(required) ? required : [required];
  const userLevel = ROLE_PRIORITY[normalized];

  return requiredList.some((target) => userLevel >= ROLE_PRIORITY[target]);
}

export const RBAC_READ_ONLY_ROLES: AdminRole[] = ["READ_ONLY", "MODERATOR", "ADMIN", "OWNER"];
export const RBAC_MODERATOR_ROLES: AdminRole[] = ["MODERATOR", "ADMIN", "OWNER"];
export const RBAC_ADMIN_ROLES: AdminRole[] = ["ADMIN", "OWNER"];

type GuardResult =
  | { authorized: true; status?: undefined; error?: undefined }
  | { authorized: false; status: 401 | 403; error: string };

export type GuardSuccess = Extract<GuardResult, { authorized: true }>;
export type GuardFailure = Extract<GuardResult, { authorized: false }>;

/**
 * Utility to enforce RBAC inside API route handlers.
 */
export function authorizeSession(
  session: Session | null,
  required: AdminRole | AdminRole[],
): GuardResult {
  if (!session?.user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  if (!hasRequiredRole(session.user.role, required)) {
    return { authorized: false, status: 403, error: "Forbidden: insufficient role" };
  }

  return { authorized: true };
}

export function isGuardFailure(result: GuardResult): result is GuardFailure {
  return result.authorized === false;
}

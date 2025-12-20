// @ts-nocheck
/**
 * Enterprise-Grade Role Management System
 * Professional role hierarchy with granular permissions
 */

export const ROLES = {
  // User Roles
  USER: 'USER',
  ANALYST: 'ANALYST',
  TEAM_LEAD: 'TEAM_LEAD',
  MANAGER: 'MANAGER',
  
  // Admin Roles
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  
  // Enterprise Roles
  OWNER: 'OWNER',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const PERMISSIONS = {
  // Analysis Permissions
  'analysis:create': 'Create new analyses',
  'analysis:read': 'View analyses',
  'analysis:update': 'Update analyses',
  'analysis:delete': 'Delete analyses',
  'analysis:export': 'Export analysis results',
  
  // API Permissions
  'api:use': 'Use API endpoints',
  'api:keys': 'Manage API keys',
  'api:limits': 'View API usage limits',
  
  // Team Permissions
  'team:invite': 'Invite team members',
  'team:remove': 'Remove team members',
  'team:view': 'View team members',
  'team:manage_roles': 'Assign roles to team members',
  
  // Billing Permissions
  'billing:view': 'View billing information',
  'billing:manage': 'Manage subscriptions',
  'billing:history': 'View payment history',
  
  // Settings Permissions
  'settings:view': 'View organization settings',
  'settings:update': 'Update organization settings',
  'settings:integrations': 'Manage integrations',
  
  // Admin Permissions
  'admin:users': 'Manage all users',
  'admin:analytics': 'View system analytics',
  'admin:settings': 'System-wide settings',
  'admin:payments': 'Approve crypto payments',
  'admin:features': 'Toggle feature flags',
  
  // Data Permissions
  'data:export_all': 'Export all data',
  'data:delete_all': 'Delete all data',
  'data:audit_logs': 'View audit logs',
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Role Permission Matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Basic User - Can only create and view their own analyses
  USER: [
    'analysis:create',
    'analysis:read',
    'analysis:export',
    'billing:view',
  ],
  
  // Analyst - Can manage their analyses + use API
  ANALYST: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:limits',
    'billing:view',
    'team:view',
  ],
  
  // Team Lead - Analyst + can invite team members
  TEAM_LEAD: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:keys',
    'api:limits',
    'team:invite',
    'team:view',
    'billing:view',
    'billing:history',
    'settings:view',
  ],
  
  // Manager - Team Lead + can manage team and billing
  MANAGER: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:keys',
    'api:limits',
    'team:invite',
    'team:remove',
    'team:view',
    'team:manage_roles',
    'billing:view',
    'billing:manage',
    'billing:history',
    'settings:view',
    'settings:update',
    'settings:integrations',
    'data:audit_logs',
  ],
  
  // Admin - Can manage users and system settings
  ADMIN: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:keys',
    'api:limits',
    'team:invite',
    'team:remove',
    'team:view',
    'team:manage_roles',
    'billing:view',
    'billing:manage',
    'billing:history',
    'settings:view',
    'settings:update',
    'settings:integrations',
    'admin:users',
    'admin:analytics',
    'admin:payments',
    'data:audit_logs',
  ],
  
  // Super Admin - Admin + can toggle features
  SUPER_ADMIN: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:keys',
    'api:limits',
    'team:invite',
    'team:remove',
    'team:view',
    'team:manage_roles',
    'billing:view',
    'billing:manage',
    'billing:history',
    'settings:view',
    'settings:update',
    'settings:integrations',
    'admin:users',
    'admin:analytics',
    'admin:settings',
    'admin:payments',
    'admin:features',
    'data:export_all',
    'data:audit_logs',
  ],
  
  // Owner - Full access to everything
  OWNER: [
    'analysis:create',
    'analysis:read',
    'analysis:update',
    'analysis:delete',
    'analysis:export',
    'api:use',
    'api:keys',
    'api:limits',
    'team:invite',
    'team:remove',
    'team:view',
    'team:manage_roles',
    'billing:view',
    'billing:manage',
    'billing:history',
    'settings:view',
    'settings:update',
    'settings:integrations',
    'admin:users',
    'admin:analytics',
    'admin:settings',
    'admin:payments',
    'admin:features',
    'data:export_all',
    'data:delete_all',
    'data:audit_logs',
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false
}

/**
 * Check if a role can perform an action
 */
export function canPerformAction(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
export function getRoleLevel(role: Role): number {
  const levels: Record<Role, number> = {
    USER: 1,
    ANALYST: 2,
    TEAM_LEAD: 3,
    MANAGER: 4,
    ADMIN: 5,
    SUPER_ADMIN: 6,
    OWNER: 7,
  }
  return levels[role] || 0
}

/**
 * Check if role A can manage role B
 */
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  return getRoleLevel(managerRole) > getRoleLevel(targetRole)
}

/**
 * Get assignable roles for a manager
 */
export function getAssignableRoles(managerRole: Role): Role[] {
  const managerLevel = getRoleLevel(managerRole)
  return Object.values(ROLES).filter(role => {
    const roleLevel = getRoleLevel(role)
    return roleLevel < managerLevel
  })
}

/**
 * Role display information
 */
export const ROLE_INFO: Record<Role, { name: string; description: string; icon: string }> = {
  USER: {
    name: 'User',
    description: 'Basic user with analysis capabilities',
    icon: '👤'
  },
  ANALYST: {
    name: 'Analyst',
    description: 'Can manage analyses and use API',
    icon: '📊'
  },
  TEAM_LEAD: {
    name: 'Team Lead',
    description: 'Can invite team members and manage API keys',
    icon: '👥'
  },
  MANAGER: {
    name: 'Manager',
    description: 'Full team and billing management',
    icon: '💼'
  },
  ADMIN: {
    name: 'Admin',
    description: 'System administrator with user management',
    icon: '⚙️'
  },
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Advanced admin with feature control',
    icon: '🔧'
  },
  OWNER: {
    name: 'Owner',
    description: 'Full system ownership and control',
    icon: '👑'
  },
}

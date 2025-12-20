"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState("manager");
  const [permissions, setPermissions] = useState({
    manager: {
      user_management: ["view_users", "edit_users", "manage_roles"],
      employee_management: ["view_employees", "manage_employees", "view_reports", "approve_actions"],
      data_analytics: ["view_analyses", "view_analytics"],
      sales_revenue: ["view_leads", "view_revenue"],
      support_tickets: ["view_tickets", "escalate_tickets"],
      system_api: []
    },
    sales: {
      user_management: ["view_users"],
      employee_management: [],
      data_analytics: ["view_analytics"],
      sales_revenue: ["view_leads", "manage_leads", "view_revenue", "create_quotes"],
      support_tickets: ["view_tickets"],
      system_api: []
    },
    analyst: {
      user_management: [],
      employee_management: [],
      data_analytics: ["view_analyses", "run_analyses", "export_data", "view_analytics"],
      sales_revenue: ["view_revenue"],
      support_tickets: [],
      system_api: []
    },
    developer: {
      user_management: [],
      employee_management: [],
      data_analytics: ["view_analyses"],
      sales_revenue: [],
      support_tickets: [],
      system_api: ["view_api_logs", "manage_api_keys", "debug_mode", "view_system_logs"]
    },
    support: {
      user_management: ["view_users"],
      employee_management: [],
      data_analytics: ["view_analytics"],
      sales_revenue: [],
      support_tickets: ["view_tickets", "manage_tickets", "respond_tickets"],
      system_api: []
    }
  });

  const roles = [
    { id: "manager", name: "Manager", icon: "👨‍💼", color: "bg-pink-500/20 text-pink-400" },
    { id: "sales", name: "Sales", icon: "💼", color: "bg-yellow-500/20 text-yellow-400" },
    { id: "analyst", name: "Analyst", icon: "📊", color: "bg-green-500/20 text-green-400" },
    { id: "developer", name: "Developer", icon: "💻", color: "bg-purple-500/20 text-purple-400" },
    { id: "support", name: "Support", icon: "🎧", color: "bg-blue-500/20 text-blue-400" }
  ];

  const permissionGroups = {
    user_management: {
      name: "User Management",
      icon: "👥",
      permissions: [
        { id: "view_users", name: "View Users", desc: "View user accounts" },
        { id: "edit_users", name: "Edit Users", desc: "Modify user information" },
        { id: "delete_users", name: "Delete Users", desc: "Remove user accounts" },
        { id: "manage_roles", name: "Manage Roles", desc: "Assign user roles" }
      ]
    },
    employee_management: {
      name: "Employee Management",
      icon: "👔",
      permissions: [
        { id: "view_employees", name: "View Employees", desc: "View employee list" },
        { id: "manage_employees", name: "Manage Employees", desc: "Add/edit/remove employees" },
        { id: "view_reports", name: "View Reports", desc: "Access employee reports" },
        { id: "approve_actions", name: "Approve Actions", desc: "Approve requests" }
      ]
    },
    data_analytics: {
      name: "Data & Analytics",
      icon: "📊",
      permissions: [
        { id: "view_analyses", name: "View Analyses", desc: "View analysis results" },
        { id: "run_analyses", name: "Run Analyses", desc: "Execute analyses" },
        { id: "export_data", name: "Export Data", desc: "Download data" },
        { id: "view_analytics", name: "View Analytics", desc: "Access dashboards" }
      ]
    },
    sales_revenue: {
      name: "Sales & Revenue",
      icon: "💰",
      permissions: [
        { id: "view_leads", name: "View Leads", desc: "View sales leads" },
        { id: "manage_leads", name: "Manage Leads", desc: "Create/edit leads" },
        { id: "view_revenue", name: "View Revenue", desc: "Access revenue data" },
        { id: "create_quotes", name: "Create Quotes", desc: "Generate quotes" }
      ]
    },
    support_tickets: {
      name: "Support & Tickets",
      icon: "🎫",
      permissions: [
        { id: "view_tickets", name: "View Tickets", desc: "View support tickets" },
        { id: "manage_tickets", name: "Manage Tickets", desc: "Handle tickets" },
        { id: "respond_tickets", name: "Respond Tickets", desc: "Reply to tickets" },
        { id: "escalate_tickets", name: "Escalate Tickets", desc: "Escalate issues" }
      ]
    },
    system_api: {
      name: "System & API",
      icon: "⚙️",
      permissions: [
        { id: "view_api_logs", name: "View API Logs", desc: "Access API logs" },
        { id: "manage_api_keys", name: "Manage API Keys", desc: "Create/revoke keys" },
        { id: "debug_mode", name: "Debug Mode", desc: "Access debugging" },
        { id: "view_system_logs", name: "View System Logs", desc: "View system logs" }
      ]
    }
  };

  const togglePermission = (groupKey: string, permId: string) => {
    setPermissions(prev => {
      const rolePerms = prev[selectedRole as keyof typeof permissions];
      const groupPerms = rolePerms[groupKey as keyof typeof rolePerms] as string[];
      const newGroupPerms = groupPerms.includes(permId)
        ? groupPerms.filter(p => p !== permId)
        : [...groupPerms, permId];
      
      return {
        ...prev,
        [selectedRole]: {
          ...rolePerms,
          [groupKey]: newGroupPerms
        }
      };
    });
  };

  const totalPermissions = Object.values(permissionGroups).reduce(
    (sum, group) => sum + group.permissions.length,
    0
  );

  const rolePermissions = permissions[selectedRole as keyof typeof permissions];
  const activePermissions = Object.values(rolePermissions).reduce(
    (sum, perms) => sum + perms.length,
    0
  );

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-[#0f1630] border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔑 Permission Management</h1>
              <p className="text-white/60">Configure role-based access permissions</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/employees/access" className="btn btn-ghost">
                ← Back
              </Link>
              <button className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Permissions</span>
                <span className="text-2xl">🔑</span>
              </div>
              <div className="text-2xl font-bold">{totalPermissions}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Permission Groups</span>
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {Object.keys(permissionGroups).length}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Active for Role</span>
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{activePermissions}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Roles</span>
                <span className="text-2xl">🎭</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{roles.length}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Role Selector */}
          <div className="card mb-8">
            <h3 className="text-xl font-bold mb-4">Select Role to Configure</h3>
            <div className="grid md:grid-cols-5 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg transition-all ${
                    selectedRole === role.id
                      ? `${role.color} scale-105`
                      : "bg-black/20 hover:bg-black/30"
                  }`}
                >
                  <div className="text-3xl mb-2">{role.icon}</div>
                  <div className="font-bold">{role.name}</div>
                  <div className="text-sm text-white/60 mt-1">
                    {Object.values(permissions[role.id as keyof typeof permissions]).reduce(
                      (sum, perms) => sum + perms.length,
                      0
                    )} permissions
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permission Groups */}
          <div className="space-y-6">
          {Object.entries(permissionGroups).map(([groupKey, group]) => {
            const roleGroupPerms = rolePermissions[groupKey as keyof typeof rolePermissions] as string[];
            const enabledCount = roleGroupPerms.length;
              const totalCount = group.permissions.length;

              return (
                <div key={groupKey} className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{group.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold">{group.name}</h3>
                        <div className="text-sm text-white/60">
                          {enabledCount} of {totalCount} enabled
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-blue-400">
                          {Math.round((enabledCount / totalCount) * 100)}%
                        </div>
                        <div className="text-xs text-white/60">Coverage</div>
                      </div>
                      <button
                        onClick={() => {
                          const allEnabled = enabledCount === totalCount;
                          setPermissions(prev => ({
                            ...prev,
                            [selectedRole]: {
                              ...prev[selectedRole as keyof typeof permissions],
                              [groupKey]: allEnabled 
                                ? [] 
                                : group.permissions.map(p => p.id)
                            }
                          }));
                        }}
                        className="btn btn-ghost text-sm"
                      >
                        {enabledCount === totalCount ? "Disable All" : "Enable All"}
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {group.permissions.map((perm) => {
                      const isEnabled = roleGroupPerms.includes(perm.id);

                      return (
                        <div
                          key={perm.id}
                          onClick={() => togglePermission(groupKey, perm.id)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            isEnabled
                              ? "bg-blue-500/20 border-2 border-blue-500/50"
                              : "bg-black/20 border-2 border-transparent hover:bg-black/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-1 ${
                              isEnabled ? "bg-blue-500 text-white" : "bg-black/40"
                            }`}>
                              {isEnabled && "✓"}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold mb-1">{perm.name}</div>
                              <div className="text-sm text-white/60">{perm.desc}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permission Summary */}
          <div className="card mt-8">
            <h3 className="text-2xl font-bold mb-6">
              {roles.find(r => r.id === selectedRole)?.name} - Permission Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-black/20 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">✓</div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {activePermissions}
                  </div>
                  <div className="text-sm text-white/60">Active Permissions</div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">📊</div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {Math.round((activePermissions / totalPermissions) * 100)}%
                  </div>
                  <div className="text-sm text-white/60">Coverage</div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {roles.find(r => r.id === selectedRole)?.id === "manager" ? 1 :
                     roles.find(r => r.id === selectedRole)?.id === "sales" ? 3 :
                     roles.find(r => r.id === selectedRole)?.id === "analyst" ? 5 :
                     roles.find(r => r.id === selectedRole)?.id === "developer" ? 6 : 4}
                  </div>
                  <div className="text-sm text-white/60">Users with Role</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-bold mb-1">Permission Changes</div>
                  <div className="text-sm text-white/60">
                    Permission changes will take effect immediately for all users with this role.
                    Make sure to review changes before saving.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/dashboard/employees/access" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔐</div>
              <div className="font-bold mb-2">Access Control</div>
              <div className="text-sm text-white/60">Manage access rights</div>
            </Link>

            <Link href="/dashboard/employees/activity" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">📊</div>
              <div className="font-bold mb-2">Activity Logs</div>
              <div className="text-sm text-white/60">View permission usage</div>
            </Link>

            <Link href="/dashboard/employees" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold mb-2">Employee List</div>
              <div className="text-sm text-white/60">Back to employees</div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

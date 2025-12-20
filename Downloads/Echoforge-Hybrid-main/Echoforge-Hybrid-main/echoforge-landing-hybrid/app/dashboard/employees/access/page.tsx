"use client";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AccessControlPage() {
  const [selectedRole, setSelectedRole] = useState("all");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [ipWhitelistingEnabled, setIpWhitelistingEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30 minutes");
  const [failedLoginLimit, setFailedLoginLimit] = useState("5 attempts");
  const [loadingSettings, setLoadingSettings] = useState(true);

  type SecuritySettings = {
    twoFactorEnabled: boolean;
    ipWhitelistingEnabled: boolean;
    sessionTimeout: string;
    failedLoginLimit: string;
  };

  const applySettings = useCallback((settings: SecuritySettings | undefined) => {
    if (!settings) return;
    setTwoFactorEnabled(settings.twoFactorEnabled);
    setIpWhitelistingEnabled(settings.ipWhitelistingEnabled);
    setSessionTimeout(settings.sessionTimeout);
    setFailedLoginLimit(settings.failedLoginLimit);
  }, []);

  const updateSecuritySetting = useCallback(async (payload: Partial<SecuritySettings>) => {
    const res = await fetch("/api/admin/system/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to update security setting (${res.status})`);
    }

    const json = await res.json();
    applySettings(json.settings);
  }, [applySettings]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/system/security", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load settings (${res.status})`);
        }
        const json = await res.json();
        applySettings(json.settings);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load security settings");
      } finally {
        setLoadingSettings(false);
      }
    };

    loadSettings();
  }, [applySettings]);

  const roles = [
    {
      id: "admin",
      name: "Administrator",
      icon: "👑",
      color: "text-red-400 bg-red-500/20",
      users: 2,
      description: "Full system access and control",
      permissions: ["all"]
    },
    {
      id: "manager",
      name: "Manager",
      icon: "👨‍💼",
      color: "text-pink-400 bg-pink-500/20",
      users: 1,
      description: "Team management and oversight",
      permissions: ["view_all", "manage_employees", "approve_actions", "view_reports", "manage_teams"]
    },
    {
      id: "sales",
      name: "Sales",
      icon: "💼",
      color: "text-yellow-400 bg-yellow-500/20",
      users: 3,
      description: "Sales and revenue management",
      permissions: ["view_leads", "manage_leads", "view_revenue", "create_quotes", "manage_deals"]
    },
    {
      id: "analyst",
      name: "Data Analyst",
      icon: "📊",
      color: "text-green-400 bg-green-500/20",
      users: 5,
      description: "Data analysis and reporting",
      permissions: ["view_analyses", "run_analyses", "export_data", "view_reports", "create_dashboards"]
    },
    {
      id: "developer",
      name: "Developer",
      icon: "💻",
      color: "text-purple-400 bg-purple-500/20",
      users: 6,
      description: "Platform development",
      permissions: ["view_api_logs", "manage_api_keys", "debug_mode", "deploy_code", "view_system_logs"]
    },
    {
      id: "support",
      name: "Support Agent",
      icon: "🎧",
      color: "text-blue-400 bg-blue-500/20",
      users: 4,
      description: "Customer support",
      permissions: ["view_users", "view_tickets", "respond_tickets", "view_analytics", "manage_tickets"]
    }
  ];

  const allPermissions = {
    "User Management": [
      { id: "view_users", name: "View Users", description: "View user accounts and details" },
      { id: "edit_users", name: "Edit Users", description: "Modify user information" },
      { id: "delete_users", name: "Delete Users", description: "Remove user accounts" },
      { id: "manage_roles", name: "Manage Roles", description: "Assign and change user roles" }
    ],
    "Employee Management": [
      { id: "view_employees", name: "View Employees", description: "View employee list and details" },
      { id: "manage_employees", name: "Manage Employees", description: "Add, edit, remove employees" },
      { id: "view_reports", name: "View Reports", description: "Access employee reports" },
      { id: "approve_actions", name: "Approve Actions", description: "Approve employee requests" }
    ],
    "Data & Analytics": [
      { id: "view_analyses", name: "View Analyses", description: "View analysis results" },
      { id: "run_analyses", name: "Run Analyses", description: "Execute data analyses" },
      { id: "export_data", name: "Export Data", description: "Download and export data" },
      { id: "view_analytics", name: "View Analytics", description: "Access analytics dashboards" }
    ],
    "Sales & Revenue": [
      { id: "view_leads", name: "View Leads", description: "View sales leads" },
      { id: "manage_leads", name: "Manage Leads", description: "Create and manage leads" },
      { id: "view_revenue", name: "View Revenue", description: "Access revenue data" },
      { id: "create_quotes", name: "Create Quotes", description: "Generate sales quotes" }
    ],
    "Support & Tickets": [
      { id: "view_tickets", name: "View Tickets", description: "View support tickets" },
      { id: "manage_tickets", name: "Manage Tickets", description: "Handle support requests" },
      { id: "respond_tickets", name: "Respond Tickets", description: "Reply to tickets" },
      { id: "escalate_tickets", name: "Escalate Tickets", description: "Escalate to higher level" }
    ],
    "System & API": [
      { id: "view_api_logs", name: "View API Logs", description: "Access API request logs" },
      { id: "manage_api_keys", name: "Manage API Keys", description: "Create and revoke API keys" },
      { id: "debug_mode", name: "Debug Mode", description: "Access debugging tools" },
      { id: "view_system_logs", name: "View System Logs", description: "View system event logs" }
    ]
  };

  const accessLogs = [
    { user: "Alice Johnson", action: "Viewed employee list", resource: "Employee Management", time: "2m ago", status: "allowed" },
    { user: "Bob Smith", action: "Created new lead", resource: "Sales CRM", time: "15m ago", status: "allowed" },
    { user: "Carol White", action: "Exported analysis data", resource: "Analytics", time: "1h ago", status: "allowed" },
    { user: "David Brown", action: "Attempted admin access", resource: "Admin Panel", time: "2h ago", status: "denied" },
    { user: "Emma Davis", action: "Responded to ticket", resource: "Support System", time: "3h ago", status: "allowed" }
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-[#0f1630] border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">🔐 Access Control</h1>
              <p className="text-white/60">Manage role-based permissions and access rights</p>
            </div>
            <Link href="/dashboard/employees" className="btn btn-ghost">
              ← Back
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Roles</span>
                <span className="text-2xl">🎭</span>
              </div>
              <div className="text-2xl font-bold">{roles.length}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Active Users</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {roles.reduce((sum, role) => sum + role.users, 0)}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Permissions</span>
                <span className="text-2xl">🔑</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {Object.values(allPermissions).reduce((sum, group) => sum + group.length, 0)}
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Access Today</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">1,247</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Roles Overview */}
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">Roles & Permissions</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div key={role.id} className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`text-3xl ${role.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{role.name}</h4>
                      <div className="text-sm text-white/60">{role.users} users</div>
                    </div>
                  </div>
                  <p className="text-sm text-white/60 mb-4">{role.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-bold text-white/60 mb-2">KEY PERMISSIONS:</div>
                    {role.permissions.slice(0, 3).map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span>{perm.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                    {role.permissions.length > 3 && (
                      <div className="text-sm text-blue-400">
                        +{role.permissions.length - 3} more...
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/employees/permissions?role=${role.id}`} className="btn btn-primary text-sm flex-1">
                      Edit
                    </Link>
                    <button
                      className="btn btn-ghost text-sm"
                      onClick={() => toast.success(`${role.users} user${role.users === 1 ? "" : "s"} currently assigned to ${role.name}`)}
                    >
                      Users
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Permissions Matrix */}
          <div className="card mb-8">
            <h3 className="text-2xl font-bold mb-6">Permission Matrix</h3>
            <div className="space-y-6">
              {Object.entries(allPermissions).map(([category, perms]) => (
                <div key={category}>
                  <h4 className="font-bold mb-3 text-lg text-blue-400">{category}</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    {perms.map((perm) => (
                      <div key={perm.id} className="bg-black/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-400">🔑</span>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold mb-1">{perm.name}</div>
                            <div className="text-sm text-white/60">{perm.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Access Logs */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Recent Access Activity</h3>
              <Link href="/dashboard/employees/activity" className="btn btn-ghost text-sm">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {accessLogs.map((log, idx) => (
                <div key={idx} className="bg-black/20 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.status === "allowed" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      <span className={log.status === "allowed" ? "text-green-400" : "text-red-400"}>
                        {log.status === "allowed" ? "✓" : "⚠"}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold mb-1">{log.user}</div>
                      <div className="text-sm text-white/60">
                        {log.action} • {log.resource}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs mb-1 ${
                      log.status === "allowed" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {log.status.toUpperCase()}
                    </div>
                    <div className="text-sm text-white/60">{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="card mt-8">
            <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-bold mb-1">Two-Factor Authentication</div>
                  <div className="text-sm text-white/60">Require 2FA for all admin accounts</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={twoFactorEnabled}
                    disabled={loadingSettings}
                    onChange={async () => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      try {
                        await updateSecuritySetting({ twoFactorEnabled: next });
                        toast.success(`Two-factor authentication ${next ? "enabled" : "disabled"}`);
                      } catch (error) {
                        console.error(error);
                        setTwoFactorEnabled(!next);
                        toast.error("Unable to update two-factor setting");
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-bold mb-1">IP Whitelisting</div>
                  <div className="text-sm text-white/60">Restrict access to specific IP addresses</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={ipWhitelistingEnabled}
                    disabled={loadingSettings}
                    onChange={async () => {
                      const next = !ipWhitelistingEnabled;
                      setIpWhitelistingEnabled(next);
                      try {
                        await updateSecuritySetting({ ipWhitelistingEnabled: next });
                        toast(next ? "IP whitelisting enabled" : "IP whitelisting disabled");
                      } catch (error) {
                        console.error(error);
                        setIpWhitelistingEnabled(!next);
                        toast.error("Unable to update IP whitelisting setting");
                      }
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-bold mb-1">Session Timeout</div>
                  <div className="text-sm text-white/60">Auto-logout after inactivity</div>
                </div>
                <select
                  className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
                  value={sessionTimeout}
                  disabled={loadingSettings}
                  onChange={async (e) => {
                    const value = e.target.value;
                    const previous = sessionTimeout;
                    setSessionTimeout(value);
                    try {
                      await updateSecuritySetting({ sessionTimeout: value });
                      toast.success(`Session timeout set to ${value}`);
                    } catch (error) {
                      console.error(error);
                      setSessionTimeout(previous);
                      toast.error("Unable to update session timeout");
                    }
                  }}
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="4 hours">4 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-bold mb-1">Failed Login Attempts</div>
                  <div className="text-sm text-white/60">Lock account after failed attempts</div>
                </div>
                <select
                  className="px-4 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
                  value={failedLoginLimit}
                  disabled={loadingSettings}
                  onChange={async (e) => {
                    const value = e.target.value;
                    const previous = failedLoginLimit;
                    setFailedLoginLimit(value);
                    try {
                      await updateSecuritySetting({ failedLoginLimit: value });
                      toast(`Account lock threshold set to ${value}`);
                    } catch (error) {
                      console.error(error);
                      setFailedLoginLimit(previous);
                      toast.error("Unable to update login attempt policy");
                    }
                  }}
                >
                  <option value="3 attempts">3 attempts</option>
                  <option value="5 attempts">5 attempts</option>
                  <option value="10 attempts">10 attempts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/dashboard/employees/permissions" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔑</div>
              <div className="font-bold mb-2">Manage Permissions</div>
              <div className="text-sm text-white/60">Configure role permissions</div>
            </Link>

            <Link href="/dashboard/employees/activity" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">📊</div>
              <div className="font-bold mb-2">Activity Logs</div>
              <div className="text-sm text-white/60">View access history</div>
            </Link>

            <Link href="/dashboard/employees" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">👥</div>
              <div className="font-bold mb-2">Employee List</div>
              <div className="text-sm text-white/60">Manage employees</div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

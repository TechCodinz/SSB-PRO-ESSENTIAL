"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default function ActivityLogsPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");

  const activities = [
    {
      id: 1,
      user: "Alice Johnson",
      role: "Manager",
      action: "Approved leave request",
      resource: "Employee Management",
      type: "approval",
      status: "success",
      time: "2m ago",
      ip: "192.168.1.100",
      details: "Approved 3-day vacation for Bob Smith"
    },
    {
      id: 2,
      user: "Bob Smith",
      role: "Sales",
      action: "Created new lead",
      resource: "Sales CRM",
      type: "create",
      status: "success",
      time: "15m ago",
      ip: "192.168.1.101",
      details: "Added TechCorp as potential client"
    },
    {
      id: 3,
      user: "Carol White",
      role: "Analyst",
      action: "Exported analysis data",
      resource: "Data Analytics",
      type: "export",
      status: "success",
      time: "1h ago",
      ip: "192.168.1.102",
      details: "Downloaded Q3 fraud detection report (2.4MB)"
    },
    {
      id: 4,
      user: "David Brown",
      role: "Developer",
      action: "Attempted admin access",
      resource: "Admin Panel",
      type: "access",
      status: "denied",
      time: "2h ago",
      ip: "192.168.1.103",
      details: "Insufficient permissions for admin console"
    },
    {
      id: 5,
      user: "Emma Davis",
      role: "Support",
      action: "Responded to ticket #1234",
      resource: "Support System",
      type: "update",
      status: "success",
      time: "3h ago",
      ip: "192.168.1.104",
      details: "Resolved customer login issue"
    },
    {
      id: 6,
      user: "Frank Miller",
      role: "Analyst",
      action: "Generated report",
      resource: "Analytics Dashboard",
      type: "create",
      status: "success",
      time: "4h ago",
      ip: "192.168.1.105",
      details: "Created monthly performance report"
    },
    {
      id: 7,
      user: "Grace Lee",
      role: "Developer",
      action: "Modified API configuration",
      resource: "API Settings",
      type: "update",
      status: "success",
      time: "5h ago",
      ip: "192.168.1.106",
      details: "Updated rate limit to 10K requests/hour"
    },
    {
      id: 8,
      user: "Henry Wilson",
      role: "Support",
      action: "Escalated ticket #1230",
      resource: "Support System",
      type: "escalation",
      status: "success",
      time: "6h ago",
      ip: "192.168.1.107",
      details: "Escalated billing issue to manager"
    },
    {
      id: 9,
      user: "Alice Johnson",
      role: "Manager",
      action: "Modified team permissions",
      resource: "Access Control",
      type: "permission",
      status: "success",
      time: "7h ago",
      ip: "192.168.1.100",
      details: "Updated Sales team CRM permissions"
    },
    {
      id: 10,
      user: "Bob Smith",
      role: "Sales",
      action: "Updated lead status",
      resource: "Sales CRM",
      type: "update",
      status: "success",
      time: "8h ago",
      ip: "192.168.1.101",
      details: "Moved DataSolutions to negotiation stage"
    }
  ];

  const activityTypes = [
    { id: "all", name: "All Activities", icon: "📊", count: activities.length },
    { id: "create", name: "Create", icon: "➕", count: activities.filter(a => a.type === "create").length },
    { id: "update", name: "Update", icon: "✏️", count: activities.filter(a => a.type === "update").length },
    { id: "access", name: "Access", icon: "🔐", count: activities.filter(a => a.type === "access").length },
    { id: "export", name: "Export", icon: "📥", count: activities.filter(a => a.type === "export").length },
    { id: "approval", name: "Approval", icon: "✅", count: activities.filter(a => a.type === "approval").length }
  ];

  const users = ["All Users", "Alice Johnson", "Bob Smith", "Carol White", "David Brown", "Emma Davis"];

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesUser = filterUser === "all" || activity.user === filterUser;
    return matchesType && matchesUser;
  });

  const stats = {
    total: activities.length,
    success: activities.filter(a => a.status === "success").length,
    denied: activities.filter(a => a.status === "denied").length,
    unique: new Set(activities.map(a => a.user)).size
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-[#0f1630] border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">📊 Activity Logs</h1>
              <p className="text-white/60">Monitor employee actions and system events</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/employees" className="btn btn-ghost">
                ← Back
              </Link>
              <button className="btn btn-primary">
                📥 Export Logs
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total Activities</span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-white/60 mt-1">Last 24 hours</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Successful</span>
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.success}</div>
              <div className="text-xs text-white/60 mt-1">
                {Math.round((stats.success / stats.total) * 100)}% success rate
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Denied</span>
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.denied}</div>
              <div className="text-xs text-white/60 mt-1">Access denied attempts</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Active Users</span>
                <span className="text-2xl">👥</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.unique}</div>
              <div className="text-xs text-white/60 mt-1">Unique users</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="access">Access</option>
                <option value="export">Export</option>
                <option value="approval">Approval</option>
              </select>

              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                {users.map((user, idx) => (
                  <option key={idx} value={idx === 0 ? "all" : user}>
                    {user}
                  </option>
                ))}
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              <button className="btn btn-ghost ml-auto">
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Activity Type Cards */}
          <div className="grid md:grid-cols-6 gap-4 mb-6">
            {activityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`p-4 rounded-lg transition-all ${
                  filterType === type.id
                    ? "bg-blue-500/20 border-2 border-blue-500/50 scale-105"
                    : "bg-black/20 hover:bg-black/30"
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="font-bold text-sm mb-1">{type.name}</div>
                <div className="text-2xl text-blue-400">{type.count}</div>
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                Activity Log ({filteredActivities.length} entries)
              </h3>
            </div>

            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.status === "success" ? "bg-green-500/20" :
                      activity.status === "denied" ? "bg-red-500/20" : "bg-yellow-500/20"
                    }`}>
                      <span className={
                        activity.status === "success" ? "text-green-400 text-2xl" :
                        activity.status === "denied" ? "text-red-400 text-2xl" : "text-yellow-400 text-2xl"
                      }>
                        {activity.type === "create" ? "➕" :
                         activity.type === "update" ? "✏️" :
                         activity.type === "access" ? "🔐" :
                         activity.type === "export" ? "📥" :
                         activity.type === "approval" ? "✅" :
                         activity.type === "permission" ? "🔑" : "📊"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold">{activity.user}</div>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          {activity.role}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === "success" ? "bg-green-500/20 text-green-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {activity.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-sm mb-2">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-white/60"> • {activity.resource}</span>
                      </div>

                      <div className="text-sm text-white/60">{activity.details}</div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                        <span>⏱️ {activity.time}</span>
                        <span>📍 {activity.ip}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button className="btn btn-ghost text-sm">Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="card mt-8">
            <h3 className="text-2xl font-bold mb-6">Activity Heatmap</h3>
            <div className="grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }).map((_, hour) => {
                const intensity = Math.random();
                return (
                  <div
                    key={hour}
                    className="aspect-square rounded"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                    }}
                    title={`${hour}:00 - ${Math.round(intensity * 100)} activities`}
                  ></div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-white/60">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Top Users */}
          <div className="card mt-8">
            <h3 className="text-2xl font-bold mb-6">Most Active Users</h3>
            <div className="space-y-3">
              {[
                { name: "Alice Johnson", activities: 47, role: "Manager", trend: "+12%" },
                { name: "Emma Davis", activities: 39, role: "Support", trend: "+8%" },
                { name: "Carol White", activities: 34, role: "Analyst", trend: "+15%" },
                { name: "Bob Smith", activities: 28, role: "Sales", trend: "+5%" },
                { name: "David Brown", activities: 23, role: "Developer", trend: "-3%" }
              ].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-blue-400">#{idx + 1}</div>
                    <div>
                      <div className="font-bold mb-1">{user.name}</div>
                      <div className="text-sm text-white/60">{user.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{user.activities}</div>
                      <div className="text-xs text-white/60">activities</div>
                    </div>
                    <div className={`text-sm font-bold ${
                      user.trend.startsWith("+") ? "text-green-400" : "text-red-400"
                    }`}>
                      {user.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <Link href="/dashboard/employees/access" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔐</div>
              <div className="font-bold mb-2">Access Control</div>
              <div className="text-sm text-white/60">Manage permissions</div>
            </Link>

            <Link href="/dashboard/employees/permissions" className="card hover:scale-105 transition-transform text-center">
              <div className="text-4xl mb-3">🔑</div>
              <div className="font-bold mb-2">Permissions</div>
              <div className="text-sm text-white/60">Configure roles</div>
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

// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const PLAN_COLORS = ["#6B7280", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];
const ALERT_ICONS: Record<string, string> = { high: "⚠️", medium: "📋", low: "🔄" };

const DEFAULT_STATS = {
  totalUsers: 0,
  activeUsers: 0,
  totalAnalyses: 0,
  totalRevenueCents: 0,
  apiCalls: 0,
  threatsBlocked: 0,
  uptimePercent: 100,
  systemHealth: 100,
};

export default function UltraPremiumAdminDashboard() {
  const { data, mutate } = useAdminOverview();
  const [selectedRange, setSelectedRange] = useState<"24h" | "7d" | "30d">("7d");

  const stats = data?.stats ?? DEFAULT_STATS;
  const metrics = data?.metrics ?? {};
  const planDistribution = useMemo(
    () =>
      (data?.planDistribution ?? []).map((plan: any, index: number) => ({
        name: plan.label ?? plan.plan,
        value: plan.count,
        color: PLAN_COLORS[index % PLAN_COLORS.length],
      })),
    [data],
  );

  const roleDistribution = useMemo(
    () =>
      (data?.roleDistribution ?? []).map((role: any) => ({
        name: role.role,
        count: role.count,
      })),
    [data],
  );

  const usageTrend = useMemo(
    () =>
      (data?.usageTrend ?? []).map((entry: any) => ({
        date: entry.date,
        analyses: entry.analyses,
        apiCalls: entry.apiCalls,
      })),
    [data],
  );
  const displayTrend = useMemo(() => {
    if (usageTrend.length === 0) return usageTrend;
    if (selectedRange === "24h") return usageTrend.slice(-1);
    if (selectedRange === "7d") return usageTrend.slice(-7);
    return usageTrend.slice(-30);
  }, [usageTrend, selectedRange]);

  const alerts = data?.alerts ?? [];

  const recentActivity = useMemo(
    () =>
      (data?.recentActivity ?? []).map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        status: log.status,
        actor: log.actorEmail ?? "system",
        time: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
        description: log.description ?? log.action,
      })),
    [data],
  );

  const revenueDisplay = `$${((stats.totalRevenueCents ?? 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const quickActions = [
    { title: "User Management", description: "Manage users & privileges", icon: "👥", href: "/dashboard/admin/users" },
    { title: "Plan Controls", description: "Adjust plan definitions", icon: "💳", href: "/dashboard/admin/plans" },
    { title: "System Health", description: "Monitor platform uptime", icon: "⚙️", href: "/dashboard/admin/system" },
    { title: "Feature Flags", description: "Enable beta capabilities", icon: "🔧", href: "/dashboard/admin/features" },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              👑
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                System Admin Control Center
              </h1>
              <p className="text-white/70 text-lg">Complete system oversight and control across the entire platform.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => mutate()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              🔄 Refresh Overview
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          {(["24h", "7d", "30d"] as Array<"24h" | "7d" | "30d">).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedRange === range ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: "👥" },
          { label: "Active Users", value: stats.activeUsers.toLocaleString(), icon: "🟢" },
          { label: "Revenue (MTD)", value: revenueDisplay, icon: "💰" },
          { label: "System Health", value: `${(stats.systemHealth ?? 100).toFixed(1)}%`, icon: "💚" },
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-white/60">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-2xl font-bold text-white">System Alerts</h3>
          <div className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-300 text-sm rounded-full">
            {alerts.length} Active
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {(alerts.length ? alerts : [{ severity: "low", message: "All systems stable", href: "#", count: 0 }]).map(
            (alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  alert.severity === "high"
                    ? "bg-red-500/10 border-red-500/30"
                    : alert.severity === "medium"
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{ALERT_ICONS[alert.severity] ?? "ℹ️"}</span>
                  <span className="text-sm uppercase tracking-wide text-white/70">{alert.severity}</span>
                </div>
                <p className="text-white/80 text-sm mb-4">{alert.message}</p>
                {alert.href && (
                  <Link href={alert.href} className="text-xs px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20">
                    Open
                  </Link>
                )}
              </motion.div>
            ),
          )}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Usage Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.85)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Line type="monotone" dataKey="analyses" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="apiCalls" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 space-y-6"
        >
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Plan & Role Mix
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={planDistribution} innerRadius={45} outerRadius={80} paddingAngle={3}>
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.85)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.85)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      color: "white",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Link
              href={action.href}
              className="block bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="text-4xl mb-3">{action.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{action.title}</h4>
              <p className="text-white/60 text-sm">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Recent Admin Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.slice(0, 6).map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex-1">
                <div className="text-sm text-white/60 mb-1">{activity.time}</div>
                <div className="font-semibold text-white">{activity.description}</div>
                <div className="text-xs text-white/50 mt-1">
                  {activity.actor} • {activity.resource}
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                activity.status === "SUCCESS"
                  ? "bg-green-500/20 text-green-300"
                  : activity.status === "FORBIDDEN"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-red-500/20 text-red-300"
              }`}>
                {activity.status}
              </div>
            </div>
          ))}
          {!recentActivity.length && (
            <div className="text-center py-8 text-white/50">No recent administrative activity.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

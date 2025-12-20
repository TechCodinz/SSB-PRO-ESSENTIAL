"use client";

import { useMemo } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAdminOverview } from "@/hooks/useAdminOverview";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

const PLAN_OPTIONS = [
  { value: "FREE", label: "Free" },
  { value: "STARTER", label: "Starter" },
  { value: "PRO", label: "Pro" },
  { value: "ENTERPRISE", label: "Enterprise" },
];

const ROLE_OPTIONS = [
  "READ_ONLY",
  "MODERATOR",
  "ADMIN",
  "OWNER",
  "USER",
  "EMPLOYEE",
  "MANAGER",
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "PENDING", label: "Pending" },
];

export default function EnhancedAdminConsole() {
  const { data: overview } = useAdminOverview();
  const {
    data: userPayload,
    mutate: mutateUsers,
    isLoading: loadingUsers,
  } = useSWR("/api/admin/users", fetcher);

  const users = useMemo(() => userPayload?.users ?? [], [userPayload?.users]);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((user: any) => {
      counts[user.role] = (counts[user.role] ?? 0) + 1;
    });
    return Object.entries(counts).map(([role, count]) => ({ role, count }));
  }, [users]);

  const planSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((user: any) => {
      counts[user.plan] = (counts[user.plan] ?? 0) + 1;
    });
    return counts;
  }, [users]);

  const handleUserUpdate = async (userId: string, payload: Record<string, any>) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Update failed");
      }
      await mutateUsers();
      toast.success("User updated");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to update user");
    }
  };

  const metrics = overview?.metrics ?? {};

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Enhanced Admin Console
            </h2>
            <p className="text-white/70 text-lg">Deep visibility into users, plans, and operational metrics.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/admin/system"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🚨 Emergency Panel
            </Link>
            <Link
              href="/dashboard/admin/plans"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              ⚙️ Plan Controls
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: metrics.totalUsers ?? users.length, icon: "👥" },
          { label: "Active Users (24h)", value: metrics.activeUsers ?? "-", icon: "🟢" },
          { label: "Revenue (MTD)", value: metrics.totalRevenueCents ? `$${(metrics.totalRevenueCents / 100).toLocaleString()}` : "$0", icon: "💰" },
          { label: "API Calls (7d)", value: metrics.apiCalls ?? "-", icon: "📡" },
        ].map((metric) => (
          <div key={metric.label} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{metric.icon}</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-white/60">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">User Directory</h3>
          <span className="text-sm text-white/50">{loadingUsers ? "Loading users..." : `${users.length} users`}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-white/70">
            <thead className="text-xs uppercase tracking-wider text-white/60">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Analyses</th>
                <th className="px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{user.name ?? "—"}</div>
                    <div className="text-xs text-white/40">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                      value={user.role}
                      onChange={(event) => handleUserUpdate(user.id, { role: event.target.value })}
                    >
                      {ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                      value={user.plan}
                      onChange={(event) => handleUserUpdate(user.id, { plan: event.target.value })}
                    >
                      {PLAN_OPTIONS.map((plan) => (
                        <option key={plan.value} value={plan.value}>
                          {plan.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                      value={user.status}
                      onChange={(event) => handleUserUpdate(user.id, { status: event.target.value })}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{(user.analysesCount ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-white/50">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Role Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="role" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.85)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "white",
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Plan Summary</h3>
          <ul className="space-y-3">
            {PLAN_OPTIONS.map((plan) => (
              <li key={plan.value} className="flex items-center justify-between text-sm text-white/70">
                <span>{plan.label}</span>
                <span className="font-semibold text-white">{planSummary[plan.value] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

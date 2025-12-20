"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  EnvelopeIcon,
  MinusSmallIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  status: string;
  usage: { analyses: number; limit: number };
  joined: string;
  lastActive: string;
  customLimits: { analyses: number; rows: number; apiCalls: number } | null;
};

const PLAN_META: Record<string, { label: string; badgeClass: string; price: string; usageLimit: number }> = {
  free: {
    label: "Free",
    badgeClass: "border-slate-700 text-slate-300",
    price: "$0",
    usageLimit: 10,
  },
  starter: {
    label: "Starter",
    badgeClass: "border-blue-500/40 text-blue-200",
    price: "$39",
    usageLimit: 250,
  },
  pro: {
    label: "Pro",
    badgeClass: "border-purple-500/40 text-purple-200",
    price: "$129",
    usageLimit: 1000,
  },
  enterprise: {
    label: "Enterprise",
    badgeClass: "border-amber-500/40 text-amber-200",
    price: "$1,499",
    usageLimit: 100000,
  },
};

const STATUS_META: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  trial: { label: "Trial", className: "bg-amber-500/10 text-amber-300 border-amber-500/40" },
  suspended: { label: "Suspended", className: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
};

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(false);
  const [serverUsers, setServerUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast.error("Authentication error - please refresh the page");
          return;
        }
        throw new Error("Failed to load users");
      }
      const payload = await response.json();
      const mapped: AdminUser[] = (payload?.users ?? []).map((user: any) => {
        const planKey = String(user.plan ?? "FREE").toLowerCase();
        const usageLimit = PLAN_META[planKey]?.usageLimit ?? 10;
        return {
          id: user.id,
          name: user.name || user.email?.split("@")[0] || "User",
          email: user.email,
          company: user.company ?? "—",
          plan: planKey,
          status: (user.status ?? "ACTIVE").toLowerCase(),
          usage: {
            analyses: user.analytics?.analysesCount ?? 0,
            limit: usageLimit,
          },
          joined: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : "—",
          lastActive: user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString() : "—",
          customLimits: user.limits
            ? {
              analyses: user.limits.analysisPerDay ?? usageLimit,
              rows: user.limits.rowsPerAnalysis ?? 0,
              apiCalls: user.limits.apiCallsPerMonth ?? 100000,
            }
            : null,
        };
      });
      setServerUsers(mapped);
    } catch (error) {
      console.error("Failed to load users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const derivedUsers = useMemo(() => (serverUsers.length > 0 ? serverUsers : []), [serverUsers]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return derivedUsers.filter((user) => {
      const matchesSearch =
        term.length === 0 ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.company.toLowerCase().includes(term);
      const matchesPlan = planFilter === "all" || user.plan === planFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [derivedUsers, planFilter, searchTerm, statusFilter]);

  const planSummary = useMemo(() => {
    return derivedUsers.reduce(
      (acc, user) => {
        acc[user.plan] = (acc[user.plan] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }, [derivedUsers]);

  const handlePlanChange = async (userId: string, plan: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: plan.toUpperCase() }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to update plan");
      }
      toast.success("Plan updated");
      await loadUsers();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? "Failed to update plan");
    }
  };

  const handleLimitUpdate = async (
    userId: string,
    field: "analysisPerDay" | "rowsPerAnalysis" | "apiCallsPerMonth",
    value: number,
  ) => {
    try {
      const response = await fetch("/api/admin/users/limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, [field]: value }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error ?? "Unable to update limit");
      }
      toast.success("Limit saved");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? "Failed to update limit");
    }
  };

  const totalUsers = derivedUsers.length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-8 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Customer management</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-100">Accounts directory</h1>
                <p className="mt-3 max-w-xl text-sm text-slate-400">
                  Search, filter, and administer customer accounts. Adjust subscription plans, update limits, and trigger
                  bulk operations in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-blue-500/50"
                >
                  <MinusSmallIcon className="h-4 w-4" />
                  Back to overview
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    toast("The customer creation workflow is being finalized. Use billing to invite users for now.", {
                      icon: "ℹ️",
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  <UserPlusIcon className="h-4 w-4" />
                  Add customer
                </button>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <dt className="text-xs uppercase text-slate-500">Total accounts</dt>
                <dd className="mt-2 text-2xl font-semibold text-slate-100">
                  {loading ? "…" : totalUsers.toLocaleString()}
                </dd>
              </div>
              {Object.entries(PLAN_META).map(([key, meta]) => (
                <div key={key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <dt className="text-xs uppercase text-slate-500">{meta.label}</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {planSummary[key] ? planSummary[key].toLocaleString() : 0}
                  </dd>
                  <p className="mt-1 text-xs text-slate-500">{meta.price}/month</p>
                </div>
              ))}
            </dl>
          </header>

          <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                <input
                  type="search"
                  placeholder="Search by name, email, or company"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <div className="flex gap-3">
                  <select
                    value={planFilter}
                    onChange={(event) => setPlanFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:w-48"
                  >
                    <option value="all">All plans</option>
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:w-44"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => toast.success("Usage report queued — we will email you the CSV shortly.")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={loadUsers}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-600/40 bg-blue-600/10 px-4 py-2 text-xs font-semibold text-blue-200 hover:border-blue-500/50"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8 space-y-4">
            {filteredUsers.length === 0 && !loading ? (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
                No accounts match your filters. Adjust search criteria or reset filters to view all customers.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const planMeta = PLAN_META[user.plan] ?? PLAN_META.free;
                const statusMeta = STATUS_META[user.status] ?? STATUS_META.active;
                const usageRatio =
                  user.usage.limit === 0 ? 0 : Math.min((user.usage.analyses / user.usage.limit) * 100, 100);
                return (
                  <div
                    key={user.id}
                    className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/50"
                  >
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <div className="flex flex-1 gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-lg font-semibold text-blue-200">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="truncate text-base font-semibold text-slate-100">{user.name}</p>
                              <p className="truncate text-xs text-slate-400">{user.email}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${planMeta.badgeClass}`}
                              >
                                {planMeta.label}
                                <span className="text-slate-500">•</span>
                                {planMeta.price}/mo
                              </span>
                              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statusMeta.className}`}>
                                {statusMeta.label}
                              </span>
                            </div>
                          </div>
                          <dl className="grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                            <div>
                              <dt className="uppercase tracking-wide">Company</dt>
                              <dd className="mt-1 text-slate-200">{user.company}</dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-wide">Joined</dt>
                              <dd className="mt-1">{user.joined}</dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-wide">Last active</dt>
                              <dd className="mt-1">{user.lastActive}</dd>
                            </div>
                          </dl>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>
                                Analyses used:{" "}
                                <span className="font-semibold text-slate-100">
                                  {user.usage.analyses.toLocaleString()} / {user.usage.limit.toLocaleString()}
                                </span>
                              </span>
                              <span>{Math.round(usageRatio)}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
                                style={{ width: `${usageRatio}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-slate-300">
                        <button
                          type="button"
                          onClick={() => setSelectedUser((current) => (current === user.id ? null : user.id))}
                          className="w-full rounded-xl border border-slate-700 px-3 py-2 font-semibold hover:border-blue-500/50"
                        >
                          Manage plan & limits
                        </button>
                        <button
                          type="button"
                          onClick={() => toast(`Launch email composer for ${user.email}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 font-semibold hover:border-blue-500/50"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                          Contact
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/actions', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'password_reset', params: { userId: user.id, email: user.email } }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                toast.success(data.message || 'Password reset email sent!');
                              } else {
                                toast.error(data.error || 'Failed to send reset email');
                              }
                            } catch (err) {
                              toast.error('Failed to send reset email');
                            }
                          }}
                          className="rounded-xl border border-slate-700 px-3 py-2 font-semibold hover:border-blue-500/50"
                        >
                          Trigger password reset
                        </button>
                      </div>
                    </div>

                    {selectedUser === user.id && (
                      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-200">
                        <h3 className="text-base font-semibold text-slate-100">Plan configuration</h3>
                        <div className="mt-5 grid gap-5 lg:grid-cols-2">
                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-400">Subscription tier</label>
                            <select
                              defaultValue={user.plan}
                              onChange={(event) => handlePlanChange(user.id, event.target.value)}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                              {Object.entries(PLAN_META).map(([key, meta]) => (
                                <option key={key} value={key}>
                                  {meta.label} — {meta.price}/mo
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-400">Analyses per day</label>
                            <input
                              type="number"
                              defaultValue={user.customLimits?.analyses ?? user.usage.limit}
                              min={0}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              onBlur={(event) => {
                                const next = Number.parseInt(event.target.value, 10);
                                if (Number.isFinite(next)) {
                                  handleLimitUpdate(user.id, "analysisPerDay", next);
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-400">Rows per analysis</label>
                            <input
                              type="number"
                              defaultValue={user.customLimits?.rows ?? 0}
                              min={0}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              onBlur={(event) => {
                                const next = Number.parseInt(event.target.value, 10);
                                if (Number.isFinite(next)) {
                                  handleLimitUpdate(user.id, "rowsPerAnalysis", next);
                                }
                              }}
                            />
                            <p className="text-xs text-slate-500">0 = unlimited</p>
                          </div>
                          <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase text-slate-400">API calls / month</label>
                            <input
                              type="number"
                              defaultValue={user.customLimits?.apiCalls ?? 100000}
                              min={0}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                              onBlur={(event) => {
                                const next = Number.parseInt(event.target.value, 10);
                                if (Number.isFinite(next)) {
                                  handleLimitUpdate(user.id, "apiCallsPerMonth", next);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          <section className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Bulk operations</h2>
            <p className="mt-1 text-sm text-slate-400">
              Execute coordinated updates across cohorts. Full automation hooks into the notifications service.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/actions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'broadcast_email',
                        params: {
                          subject: 'Important Update from EchoForge',
                          message: 'Thank you for being a valued customer!',
                          targetPlan: 'all',
                        },
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success(`${data.message} (${data.recipientCount} recipients)`);
                    } else {
                      toast.error(data.error || 'Failed to queue broadcast');
                    }
                  } catch (err) {
                    toast.error('Failed to queue broadcast');
                  }
                }}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left text-sm text-slate-200 hover:border-blue-500/40"
              >
                <span className="font-semibold">Notify all active users</span>
                <span className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <EnvelopeIcon className="h-4 w-4" />
                  Delivered via SendGrid
                </span>
              </button>
              <button
                type="button"
                onClick={() => toast.success("Discount code applied to selected segment (simulation).")}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left text-sm text-slate-200 hover:border-blue-500/40"
              >
                <span className="font-semibold">Apply upgrade incentive</span>
                <span className="mt-2 text-xs text-slate-400">Configure via billing controls</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/actions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'generate_report', params: { reportType: 'usage' } }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      toast.success(`Report generated! Total users: ${data.data?.totalUsers}, Analyses: ${data.data?.totalAnalyses}`);
                    } else {
                      toast.error(data.error || 'Failed to generate report');
                    }
                  } catch (err) {
                    toast.error('Failed to generate report');
                  }
                }}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left text-sm text-slate-200 hover:border-blue-500/40"
              >
                <span className="font-semibold">Generate usage report</span>
                <span className="mt-2 text-xs text-slate-400">Instant analytics report</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

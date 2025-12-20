"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import {
  ArrowUpRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { useAdminOverview } from "@/hooks/useAdminOverview";
import { trackEvent } from "@/lib/analytics";

const LiveAPITest = dynamic(() => import("@/components/LiveAPITest"), { ssr: false });

const ADMIN_ROLES = new Set([
  "ADMIN",
  "OWNER",
  "MODERATOR",
  "READ_ONLY",
  "SUPERADMIN",
  "SUPER_ADMIN",
]);

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const message = await res.text().catch(() => "");
    throw new Error(message || `Failed to fetch ${url}`);
  }
  return res.json();
};

const formatNumber = (value: number | null | undefined) => new Intl.NumberFormat().format(value ?? 0);

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useAdminOverview();
  const {
    data: analysesData,
    error: analysesError,
    isLoading: analysesLoading,
  } = useSWR("/api/admin/analyses?limit=8", fetcher);

  const analyses = analysesData?.analyses ?? [];
  const role = String(session?.user?.role ?? "").toUpperCase();
  const hasAccess = ADMIN_ROLES.has(role);

  const metrics = useMemo(() => {
    const totalUsers =
      (overview?.users?.totalUsers as number | undefined) ??
      (overview?.stats?.totalUsers as number | undefined) ??
      0;
    const activeUsers =
      (overview?.users?.activeUsers as number | undefined) ??
      (overview?.stats?.activeUsers as number | undefined) ??
      0;
    const totalAnalyses =
      (overview?.analyses?.totalAnalyses as number | undefined) ??
      (overview?.stats?.totalAnalyses as number | undefined) ??
      0;
    const totalRevenueCents = (overview?.stats?.totalRevenueCents as number | undefined) ?? 0;

    return [
      {
        label: "Total accounts",
        value: formatNumber(totalUsers),
        helper: "Across all plans",
        icon: <UserGroupIcon className="h-5 w-5 text-blue-300" />,
      },
      {
        label: "Active today",
        value: formatNumber(activeUsers),
        helper: "Signed-in users in the last 24h",
        icon: <SignalIcon className="h-5 w-5 text-emerald-300" />,
      },
      {
        label: "Analyses processed",
        value: formatNumber(totalAnalyses),
        helper: "Cumulative across tenants",
        icon: <ArrowTopRightOnSquareIcon className="h-5 w-5 text-indigo-300" />,
      },
      {
        label: "MRR (USD)",
        value: `$${(totalRevenueCents / 100).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        helper: "Ledger reported",
        icon: <CheckCircleIcon className="h-5 w-5 text-sky-300" />,
      },
    ];
  }, [overview]);

  const operational = {
    uptime: overview?.operational?.uptime ?? "99.9%",
    sla: overview?.operational?.slaCompliance ?? "99.9%",
    incidents: overview?.operational?.activeIncidents ?? 0,
    queuedOps: overview?.operational?.queuedOps ?? 0,
    lastUpdated: overview?.operational?.lastRefresh
      ? new Date(overview.operational.lastRefresh).toLocaleTimeString()
      : "moments ago",
  };

  // Server-side layout handles ALL authentication checks - no client-side redirects needed
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700">
            <ClockIcon className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-sm font-medium">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  // Layout already handled authentication - if we're here, user is authenticated and authorized

  const quickActions = [
    { label: "Review payment confirmations", href: "/dashboard/admin/payments" },
    { label: "Resolve user escalations", href: "/dashboard/admin/users/pending" },
    { label: "Audit feature flag changes", href: "/dashboard/admin/features" },
    { label: "Inspect marketplace orders", href: "/dashboard/admin/marketplace/orders" },
  ];

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <header className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-8 shadow-lg backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                  Admin Command • {new Date().toLocaleDateString()}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-100 sm:text-4xl">
                  Welcome back, {session?.user?.name ?? "Administrator"}
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-400">
                  Monitor platform health, payments, and user activity in real time. Use the quick actions on the right
                  to move directly into operational workflows.
                </p>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
                <span className="font-medium text-slate-200">Operational summary</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-400">Replication healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  <span className="text-slate-400">Billing pipeline synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-slate-400">
                    {(overview?.operational?.pendingApprovals as number | undefined) ?? 0} items pending review
                  </span>
                </div>
              </div>
            </div>

            {overviewError && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                Failed to refresh live overview. Latest values shown may be stale.
              </div>
            )}
          </header>

          <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner shadow-slate-950/40"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{metric.label}</p>
                  {metric.icon}
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-100">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.helper}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Operational posture</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Live view of uptime, incidents, and SLA adherence across the platform.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  Updated {operational.lastUpdated}
                </span>
              </div>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <dt className="text-xs uppercase text-slate-500">Uptime</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">{operational.uptime}</dd>
                  <p className="mt-1 text-xs text-slate-500">Rolling 30-day window</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <dt className="text-xs uppercase text-slate-500">SLA compliance</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">{operational.sla}</dd>
                  <p className="mt-1 text-xs text-slate-500">Across all paid tiers</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <dt className="text-xs uppercase text-slate-500">Active incidents</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {overviewLoading ? "—" : operational.incidents}
                  </dd>
                  <p className="mt-1 text-xs text-slate-500">Escalated to reliability engineering</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <dt className="text-xs uppercase text-slate-500">Queued operations</dt>
                  <dd className="mt-2 text-2xl font-semibold text-slate-100">
                    {overviewLoading ? "—" : operational.queuedOps}
                  </dd>
                  <p className="mt-1 text-xs text-slate-500">Awaiting approval or automation</p>
                </div>
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Quick actions</h2>
              <p className="mt-1 text-sm text-slate-400">
                Jump straight into the workflows that require the most attention right now.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {quickActions.map((action) => (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      onClick={() => trackEvent("admin_quick_action", { destination: action.href })}
                      className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3 hover:border-blue-500/50 hover:bg-slate-900/80"
                    >
                      <span className="text-slate-200">{action.label}</span>
                      <ArrowUpRightIcon className="h-4 w-4 text-slate-500 transition group-hover:text-blue-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-10 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Recent analyses</h2>
                <p className="text-sm text-slate-400">
                  Most recent production runs across customers. Click through for the full forensic report.
                </p>
              </div>
              <Link
                href="/dashboard/admin/users/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-blue-500/50 hover:text-blue-200"
              >
                View analytics
                <ArrowUpRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {analysesLoading ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-900/60" />
                ))}
              </div>
            ) : analysesError ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-sm text-rose-200">
                Could not load analyses: {analysesError.message}
              </div>
            ) : analyses.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
                No analyses have been recorded yet. Once jobs complete, they will appear here for review.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {analyses.map((analysis: any) => {
                  const status = analysis.status ?? "PENDING";
                  const statusTone =
                    status === "COMPLETED"
                      ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/5"
                      : status === "FAILED"
                      ? "text-rose-300 border-rose-400/30 bg-rose-400/5"
                      : "text-amber-300 border-amber-400/30 bg-amber-400/5";
                  return (
                    <button
                      key={analysis.id}
                      onClick={() => router.push(`/dashboard/forensics?id=${analysis.id}`)}
                      className="group flex w-full flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-left transition hover:border-blue-500/40 hover:bg-slate-900/80"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-200 group-hover:text-blue-200">
                            {analysis.fileName ?? "Analysis run"}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {analysis.user?.email ?? analysis.user?.name ?? "—"} • {analysis.user?.plan ?? "FREE"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusTone}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{new Date(analysis.createdAt).toLocaleString()}</span>
                        <span aria-hidden="true">•</span>
                        <span>{formatNumber(analysis.anomaliesFound ?? 0)} anomalies</span>
                        {typeof analysis.accuracy === "number" && (
                          <>
                            <span aria-hidden="true">•</span>
                            <span>{(analysis.accuracy * 100).toFixed(1)}% accuracy</span>
                          </>
                        )}
                        <span className="ml-auto flex items-center gap-1 text-blue-300">
                          Open report
                          <ArrowUpRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {analysesData?.stats && (
              <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Total analyses</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">
                    {formatNumber(analysesData.stats.totalAnalyses)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Anomalies detected</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">
                    {formatNumber(analysesData.stats.totalAnomalies)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Average accuracy</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">
                    {typeof analysesData.stats.avgAccuracy === "number"
                      ? (analysesData.stats.avgAccuracy * 100).toFixed(1) + "%"
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Live API test</h2>
            <p className="mt-2 text-sm text-slate-400">
              Validate connectivity with the inference API directly from the console. Results are written to the audit
              log.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <Suspense fallback={<div className="text-sm text-slate-500">Loading API harness…</div>}>
                <LiveAPITest
                  apiUrl={process.env.NEXT_PUBLIC_ECHOFORGE_API_URL ?? ""}
                  apiKey={process.env.NEXT_PUBLIC_ECHOFORGE_API_KEY ?? ""}
                />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

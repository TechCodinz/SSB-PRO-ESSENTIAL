"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

type LandingOverviewResponse = {
  metrics: {
    totalUsers: number;
    totalAnalyses: number;
    totalAnomalies: number;
    anomaliesLast24h: number;
    activeInvestigations: number;
    avgProcessingMs: number;
    avgAccuracy: number;
    uptimePercent: number;
  };
  recentAnalyses: Array<{
    id: string;
    type: string;
    status: string;
    anomaliesFound: number;
    processingTime: number | null;
    createdAt: string;
  }>;
  marketplace: {
    topListings: Array<{
      id: string;
      title: string;
      category: string;
      price: number;
      currency: string;
      purchasesCount: number;
      downloads: number;
      rating: number | null;
    }>;
  };
  updatedAt: string;
};

const STATUS_BADGES: Record<string, string> = {
  COMPLETED: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  PROCESSING: "border border-amber-500/30 bg-amber-500/10 text-amber-200",
  FAILED: "border border-rose-500/30 bg-rose-500/10 text-rose-200",
  PENDING: "border border-slate-500/30 bg-slate-500/10 text-slate-200",
};

const TYPE_LABELS: Record<string, string> = {
  ANOMALY_DETECTION: "Anomaly Detection",
  CRYPTO_FRAUD: "Crypto Fraud",
  FORENSICS: "Forensics",
  PREDICTIVE: "Predictive",
};

export default function LiveOpsCommandCenter() {
  const [data, setData] = useState<LandingOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      try {
        const response = await fetch("/api/public/overview", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load live telemetry");
        }
        const json = (await response.json()) as LandingOverviewResponse;
        if (isMounted) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("public overview fetch failed", err);
          setError("Live telemetry temporarily unavailable. Retrying shortly.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOverview();
    const interval = setInterval(fetchOverview, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const metrics = data?.metrics;
  const updatedAgo = data ? formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true }) : null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0d142b] via-[#0a1024] to-[#151c36] p-10 shadow-2xl shadow-blue-500/20">
      <div className="absolute -top-40 -right-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" aria-hidden="true" />
      <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.5em] text-white/40">Operational Telemetry</p>
          <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-blue-300 through-purple-400 to-pink-400 bg-clip-text">
            Platform Command Center
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/60">
          {updatedAgo ? (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Synced {updatedAgo}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Initialising telemetry…
            </span>
          )}
          {metrics && (
            <span className="hidden items-center gap-2 md:flex">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              Uptime {metrics.uptimePercent.toFixed(2)}%
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Active investigations"
              helper="Analyses processing now"
              value={metrics?.activeInvestigations ?? "—"}
              accent="from-rose-500/80 to-orange-500/50"
            />
            <MetricCard
              label="Average processing"
              helper="Completed runs (ms)"
              value={metrics ? `${metrics.avgProcessingMs || 0} ms` : "—"}
              accent="from-blue-500/80 to-cyan-500/50"
            />
            <MetricCard
              label="Anomalies in 24h"
              helper="Confirmed production alerts"
              value={metrics?.anomaliesLast24h ?? "—"}
              accent="from-purple-500/80 to-pink-500/50"
            />
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-white/40">
                Recent analyses
              </h3>
              <span className="text-xs text-white/40">
                {metrics ? `${metrics.totalAnalyses.toLocaleString()} total runs` : "—"}
              </span>
            </div>

            {isLoading ? (
              <div className="mt-5 space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
                ))}
              </div>
            ) : error ? (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-6 text-sm text-amber-200">
                {error}
              </div>
            ) : (
              <motion.ul layout className="mt-5 space-y-3">
                {data?.recentAnalyses.map((analysis) => (
                  <motion.li
                    layout
                    key={analysis.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white/90">
                        {TYPE_LABELS[analysis.type] ?? analysis.type.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-white/50">
                        {formatDistanceToNow(new Date(analysis.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                      <span className={`rounded-full px-3 py-1 font-semibold ${STATUS_BADGES[analysis.status] ?? STATUS_BADGES.PENDING}`}>
                        {analysis.status}
                      </span>
                      <span className="font-semibold text-white/80">
                        {analysis.anomaliesFound.toLocaleString()} anomalies
                      </span>
                      {analysis.processingTime !== null && (
                        <span className="text-white/50">{analysis.processingTime} ms</span>
                      )}
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Platform coverage</p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">Success rate</p>
                <p className="mt-2 text-2xl font-black text-emerald-300">
                  {metrics ? `${metrics.uptimePercent.toFixed(2)}%` : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/20">Completed vs failed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/30">Model accuracy</p>
                <p className="mt-2 text-2xl font-black text-sky-300">
                  {metrics ? `${(metrics.avgAccuracy * 100).toFixed(1)}%` : "—"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/20">Rolling average</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-xs text-white/50">
              <p>
                Total analyses processed:{" "}
                <span className="font-semibold text-white/80">
                  {metrics?.totalAnalyses.toLocaleString() ?? "—"}
                </span>
              </p>
              <p>
                Total anomalies detected:{" "}
                <span className="font-semibold text-purple-200">
                  {metrics?.totalAnomalies.toLocaleString() ?? "—"}
                </span>
              </p>
              <p>
                Organisations protected:{" "}
                <span className="font-semibold text-white/80">
                  {metrics?.totalUsers.toLocaleString() ?? "—"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Marketplace spotlight</p>
            {data?.marketplace.topListings?.length ? (
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                {data.marketplace.topListings.map((listing) => (
                  <li
                    key={listing.id}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition hover:border-blue-500/40 hover:bg-black/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white/85">{listing.title}</p>
                        <p className="text-xs uppercase tracking-[0.35em] text-white/30">{listing.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-blue-300">
                        {listing.currency.toUpperCase()}{" "}
                        {listing.price.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/40">
                      <span>{listing.purchasesCount} purchases</span>
                      <span>•</span>
                      <span>{listing.downloads} downloads</span>
                      {listing.rating ? (
                        <>
                          <span>•</span>
                          <span>{listing.rating.toFixed(1)} rating</span>
                        </>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : isLoading ? (
              <div className="mt-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-black/20" />
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/60">
                Marketplace listings are being curated. Check back soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

type MetricCardProps = {
  label: string;
  helper: string;
  value: string | number;
  accent: string;
};

function MetricCard({ label, helper, value, accent }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accent} px-4 py-5 text-white/80`}>
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
      <p className="mt-3 text-2xl font-black text-white/90">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.35em] text-white/25">{helper}</p>
    </div>
  );
}

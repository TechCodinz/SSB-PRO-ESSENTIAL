"use client";

import useSWR from "swr";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

export default function AdminSystemPage() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/admin/system/status", fetcher, { refreshInterval: 30000 });

  const stats = data?.systemStats ?? {
    cpuUsage: 0,
    memoryUsage: 0,
    uptimeHours: 0,
    lastRestart: new Date().toISOString(),
    activeConnections: 0,
    totalRequests: 0,
  };

  const services = data?.services ?? [];
  const logs = data?.logs ?? [];
  const alerts = data?.alerts ?? [];

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 space-y-8">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">⚙️ System Management</h1>
              <p className="text-white/60">Monitor system health, uptime, and service performance across EchoForge.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/admin" className="btn btn-ghost">
                ← Back to Admin
              </Link>
              <button onClick={() => mutate()} className="btn btn-primary">
                🔄 Refresh Status
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-xl p-4">
              Failed to load system status: {error.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "CPU Usage", value: `${stats.cpuUsage}%`, icon: "🖥️" },
              { label: "Memory Usage", value: `${stats.memoryUsage}%`, icon: "💾" },
              { label: "Active Connections", value: stats.activeConnections.toLocaleString(), icon: "🔌" },
              { label: "Total Requests", value: stats.totalRequests.toLocaleString(), icon: "📨" },
            ].map((metric) => (
              <div key={metric.label} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{metric.icon}</span>
                </div>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <div className="text-sm text-white/60">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
              <ul className="space-y-4">
                {services.map((service: any) => (
                  <li key={service.name} className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{service.name}</div>
                      <div className="text-xs text-white/50">
                        Response: {service.responseTime != null ? `${service.responseTime} ms` : "—"}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.status === "online"
                          ? "bg-green-500/20 text-green-300"
                          : service.status === "warning"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {service.status.toUpperCase()}
                    </span>
                  </li>
                ))}
                {!services.length && (
                  <li className="text-white/50 text-sm">No service telemetry available.</li>
                )}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Alerts</h3>
              <ul className="space-y-3">
                {(alerts.length ? alerts : [{ severity: "low", message: "All systems operational." }]).map(
                  (alert: any, idx: number) => (
                    <li
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        alert.severity === "high"
                          ? "bg-red-500/10 border-red-500/30 text-red-200"
                          : alert.severity === "medium"
                          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-200"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-200"
                      }`}
                    >
                      <div className="font-semibold mb-1 capitalize">{alert.severity ?? "info"}</div>
                      <div className="text-sm">{alert.message}</div>
                      {alert.href && (
                        <Link href={alert.href} className="text-xs text-white underline mt-2 inline-block">
                          View details →
                        </Link>
                      )}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Latest Logs</h3>
              <span className="text-xs text-white/50">
                Last restart: {formatDistanceToNow(new Date(stats.lastRestart ?? Date.now()), { addSuffix: true })}
              </span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {logs.map((log: any) => (
                <div key={log.id} className="p-4 rounded-lg bg-black/30 border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">
                      {new Date(log.time).toLocaleString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        log.level === "ERROR"
                          ? "bg-red-500/20 text-red-300"
                          : log.level === "WARN"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-blue-500/20 text-blue-200"
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <div className="text-sm text-white">
                    {log.message}
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    {log.actor ? `Actor: ${log.actor}` : "System"} • {log.resource}
                  </div>
                </div>
              ))}
              {!logs.length && <div className="text-white/50 text-sm">No recent logs.</div>}
            </div>
          </div>

          {isLoading && (
            <div className="text-center text-white/40 text-sm">Fetching real-time system data…</div>
          )}
        </div>
      </div>
    </div>
  );
}

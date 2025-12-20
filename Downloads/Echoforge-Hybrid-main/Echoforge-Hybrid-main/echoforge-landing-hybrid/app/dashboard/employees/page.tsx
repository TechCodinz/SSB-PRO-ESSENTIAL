"use client";

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import UltraPremiumEmployeeManagement from "@/components/UltraPremiumEmployeeManagement";
import RoleBasedTaskDashboard from "@/components/RoleBasedTaskDashboard";

export default function EmployeeManagement() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<"management" | "tasks">("management");
  const userRole = (session?.user as any)?.role || 'USER';
  const userId = (session?.user as any)?.id || 'demo';
  const userName = session?.user?.name || 'User';

  const toggles: Array<{ key: "management" | "tasks"; label: string; emoji: string; description: string }> = [
    { key: "management", label: "Employee Command", emoji: "👥", description: "Role orchestration & access controls" },
    { key: "tasks", label: "My Task Deck", emoji: "📋", description: "Personalised incident & workflow queue" },
  ];

  return (
    <DashboardLayout>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#050915]" />
        <div className="absolute -z-10 top-[-200px] right-[-160px] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-600/30 via-purple-600/25 to-pink-500/20 blur-3xl opacity-70" />
        <div className="absolute -z-10 bottom-[-220px] left-[-120px] h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-transparent blur-3xl opacity-60" />

        <div className="relative p-6 space-y-10">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_24px_60px_-40px_rgba(59,130,246,0.7)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.25),transparent_55%)]" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                    Workforce Control Center
                  </span>
                  <h1 className="text-3xl font-black text-white lg:text-4xl">
                    Empower your teams with precision access & guided tasks.
                  </h1>
                  <p className="text-sm text-white/70 lg:text-base">
                    Craft role-safe automations, approve instant escalations, and keep every analyst, responder, and exec aligned with the mission in one elegant workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur">
                <div className="grid gap-2 sm:grid-cols-2">
                  {toggles.map((toggle) => {
                    const active = viewMode === toggle.key;
                    return (
                      <button
                        key={toggle.key}
                        onClick={() => setViewMode(toggle.key)}
                        className={`group flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                          active
                            ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-[0_18px_40px_-24px_rgba(147,51,234,0.8)]"
                            : "bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold flex items-center gap-2">
                            <span>{toggle.emoji}</span> {toggle.label}
                          </span>
                          <span className="text-[11px] uppercase tracking-[0.25em] text-white/40 mt-1">
                            {toggle.description}
                          </span>
                        </div>
                        <span className="text-lg text-white/60 group-hover:text-white transition-colors">→</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {viewMode === "management" && <UltraPremiumEmployeeManagement />}
            {viewMode === "tasks" && (
              <RoleBasedTaskDashboard role={userRole} userId={userId} userName={userName} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

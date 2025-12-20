"use client";

import DashboardLayout from "@/components/DashboardLayout";
import UltraAdvancedDashboard from "@/components/UltraAdvancedDashboard";
import UltraAdvancedAnomalyDetection from "@/components/UltraAdvancedAnomalyDetection";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdvancedAnalyticsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "detection">("overview");
  const userRole = (session?.user as any)?.role || 'USER';
  const userId = (session?.user as any)?.id || 'demo';

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg transition-all font-semibold ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-white"
            }`}
          >
            📊 Advanced Overview
          </button>
          <button
            onClick={() => setActiveTab("detection")}
            className={`px-6 py-3 rounded-lg transition-all font-semibold ${
              activeTab === "detection"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 text-white"
            }`}
          >
            🔬 Ultra Detection
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <UltraAdvancedDashboard userId={userId} role={userRole} />
        )}
        {activeTab === "detection" && (
          <UltraAdvancedAnomalyDetection />
        )}
      </div>
    </DashboardLayout>
  );
}

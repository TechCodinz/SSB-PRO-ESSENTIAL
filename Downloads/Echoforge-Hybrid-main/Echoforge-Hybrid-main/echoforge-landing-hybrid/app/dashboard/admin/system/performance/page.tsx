"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function PerformancePage() {
  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⚡ System Performance
            </h1>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "CPU Usage", value: "23%", status: "good" },
                { label: "Memory", value: "45%", status: "good" },
                { label: "Response Time", value: "45ms", status: "excellent" }
              ].map((metric, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="text-sm text-white/60 mb-2">{metric.label}</div>
                  <div className="text-3xl font-bold mb-2">{metric.value}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    metric.status === 'excellent' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {metric.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
    </div>
  );
}

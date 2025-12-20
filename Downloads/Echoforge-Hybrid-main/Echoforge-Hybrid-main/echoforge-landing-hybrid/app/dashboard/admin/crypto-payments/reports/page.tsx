"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function CryptoReportsPage() {
  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📈 Crypto Payment Reports
            </h1>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Total Received", value: "$234,567", icon: "💰" },
                { label: "Pending", value: "$12,345", icon: "⏳" },
                { label: "Confirmed", value: "156", icon: "✅" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Generate Report</h2>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all">
                📥 Download Report
              </button>
            </div>
          </motion.div>
        </div>
    </div>
  );
}

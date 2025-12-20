"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function MarketplaceAnalyticsPage() {
  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📊 Marketplace Analytics
            </h1>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", value: "$156,234", icon: "💰" },
                { label: "Total Sales", value: "1,234", icon: "🛒" },
                { label: "Active Vendors", value: "45", icon: "🏪" },
                { label: "Avg Order", value: "$127", icon: "💳" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
    </div>
  );
}

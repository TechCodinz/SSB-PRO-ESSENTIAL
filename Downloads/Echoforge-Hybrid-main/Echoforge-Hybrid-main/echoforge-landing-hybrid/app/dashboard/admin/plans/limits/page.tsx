"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function UsageLimitsPage() {
  const plans = [
    { name: "FREE", analyses: 10, apiCalls: 100, storage: "100 MB" },
    { name: "STARTER", analyses: 100, apiCalls: 1000, storage: "1 GB" },
    { name: "PRO", analyses: 1000, apiCalls: 10000, storage: "10 GB" },
    { name: "ENTERPRISE", analyses: "Unlimited", apiCalls: "Unlimited", storage: "Unlimited" }
  ];

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⚖️ Usage Limits Configuration
            </h1>
            
            <div className="space-y-6">
              {plans.map((plan, idx) => (
                <div key={idx} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Analyses/Day</label>
                      <input
                        type="text"
                        value={plan.analyses}
                        readOnly
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">API Calls/Month</label>
                      <input
                        type="text"
                        value={plan.apiCalls}
                        readOnly
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Storage</label>
                      <input
                        type="text"
                        value={plan.storage}
                        readOnly
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
    </div>
  );
}

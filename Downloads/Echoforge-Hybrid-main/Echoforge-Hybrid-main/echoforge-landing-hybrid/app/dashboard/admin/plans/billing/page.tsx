"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function BillingRulesPage() {
  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              💳 Billing Rules
            </h1>
            
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Payment Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <div>
                    <h3 className="font-bold">Auto-renewal</h3>
                    <p className="text-sm text-white/60">Automatically renew subscriptions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6" />
                </div>
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
                  <div>
                    <h3 className="font-bold">Grace Period</h3>
                    <p className="text-sm text-white/60">Days after payment failure</p>
                  </div>
                  <input type="number" defaultValue="7" className="w-24 px-4 py-2 bg-black/30 border border-white/10 rounded-lg" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
    </div>
  );
}

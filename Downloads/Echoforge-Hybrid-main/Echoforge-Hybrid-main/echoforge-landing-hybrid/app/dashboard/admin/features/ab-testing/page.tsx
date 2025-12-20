"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";

export default function ABTestingPage() {
  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🧪 A/B Testing
            </h1>
            
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🧪</div>
              <h2 className="text-2xl font-bold mb-4">A/B Testing Dashboard</h2>
              <p className="text-white/60 mb-6">
                Create and manage A/B tests for features, UI changes, and algorithms
              </p>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all">
                Create New Test
              </button>
            </div>
          </motion.div>
        </div>
    </div>
  );
}

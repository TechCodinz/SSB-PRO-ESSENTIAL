"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function BetaFeaturesPage() {
  const [features, setFeatures] = useState([
    { id: 1, name: "Advanced Deepfake Detection", enabled: true, users: 45 },
    { id: 2, name: "Quantum-Enhanced Analysis", enabled: false, users: 0 },
    { id: 3, name: "Multi-Modal AI", enabled: true, users: 23 },
    { id: 4, name: "Real-time Collaboration", enabled: false, users: 0 }
  ]);

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🧪 Beta Features
            </h1>
            
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.id} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{feature.name}</h3>
                      <p className="text-white/60">{feature.users} users testing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feature.enabled}
                        onChange={() => {
                          setFeatures(features.map(f => 
                            f.id === feature.id ? { ...f, enabled: !f.enabled } : f
                          ));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
    </div>
  );
}

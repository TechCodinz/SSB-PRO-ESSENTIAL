"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BulkActionsPage() {
  const [selectedAction, setSelectedAction] = useState("");

  const handleBulkAction = () => {
    if (!selectedAction) {
      toast.error("Please select an action");
      return;
    }
    toast.success(`Bulk action ${selectedAction} initiated!`);
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⚡ Bulk User Actions
            </h1>
            
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Bulk Operations</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Action</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="">Choose an action...</option>
                    <option value="upgrade-plan">Upgrade Plan</option>
                    <option value="downgrade-plan">Downgrade Plan</option>
                    <option value="reset-password">Reset Passwords</option>
                    <option value="send-email">Send Email</option>
                    <option value="export-data">Export User Data</option>
                    <option value="delete-users">Delete Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">User Selection</label>
                  <textarea
                    placeholder="Enter user IDs or emails (one per line)"
                    rows={6}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleBulkAction}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
              >
                Execute Bulk Action
              </button>
            </div>
          </motion.div>
        </div>
    </div>
  );
}

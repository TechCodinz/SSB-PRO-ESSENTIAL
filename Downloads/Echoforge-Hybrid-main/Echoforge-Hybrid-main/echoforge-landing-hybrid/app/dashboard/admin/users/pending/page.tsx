"use client";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PendingUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const response = await axios.get("/api/admin/users/pending");
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      await axios.post(`/api/admin/users/${userId}/approve`);
      toast.success("User approved!");
      loadPendingUsers();
    } catch (error) {
      toast.error("Failed to approve user");
    }
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
              ⏳ Pending User Registrations
            </h1>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white/60">Loading...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
                <p className="text-white/60">No pending user registrations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{user.name || user.email}</h3>
                        <p className="text-white/60">{user.email}</p>
                        <p className="text-sm text-white/50">Plan: {user.plan}</p>
                      </div>
                      <button
                        onClick={() => approveUser(user.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

interface Payment {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
}

export default function AdminPaymentConfirmation() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/payments/confirm');
      setPayments(data.payments || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (userId: string, plan: string, isAuto: boolean = false) => {
    try {
      await axios.post('/api/admin/payments/confirm', {
        userId,
        plan,
        confirmationType: isAuto ? 'auto' : 'manual'
      });
      
      toast.success(`Payment ${isAuto ? 'auto-' : ''}confirmed for ${plan} plan!`);
      fetchPayments();
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'ENTERPRISE': return 'from-purple-500 to-pink-500';
      case 'PRO': return 'from-blue-500 to-cyan-500';
      case 'STARTER': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            💳 Payment Confirmation Center
          </h2>
          <p className="text-white/60 mt-2">Review and confirm user payment upgrades</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-sm text-white/70">Auto-Confirm</span>
            <button
              onClick={() => setAutoConfirm(!autoConfirm)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoConfirm ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                autoConfirm ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors font-semibold"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Pending Confirmations", value: payments.filter(p => !p.emailVerified).length, icon: "⏳", color: "orange" },
          { label: "Total Payments", value: payments.length, icon: "💰", color: "green" },
          { label: "Enterprise", value: payments.filter(p => p.plan === 'ENTERPRISE').length, icon: "🏢", color: "purple" },
          { label: "Pro Plans", value: payments.filter(p => p.plan === 'PRO').length, icon: "⭐", color: "blue" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Queue */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Payment Queue ({payments.length})
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-white/60">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white/60">No pending payments</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getPlanColor(payment.plan)} flex items-center justify-center text-2xl font-bold`}>
                      {payment.name?.[0] || '👤'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-lg text-white">{payment.name || 'User'}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          payment.emailVerified
                            ? 'bg-green-500/20 text-green-300 border-green-500/40'
                            : 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        }`}>
                          {payment.emailVerified ? '✅ CONFIRMED' : '⏳ PENDING'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getPlanColor(payment.plan)} text-white`}>
                          {payment.plan}
                        </span>
                      </div>
                      
                      <div className="text-sm text-white/60 mb-3">
                        📧 {payment.email} • 🕐 {new Date(payment.updatedAt).toLocaleString()}
                      </div>

                      {!payment.emailVerified && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmPayment(payment.id, payment.plan, autoConfirm)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors font-semibold"
                          >
                            ✅ Confirm Payment
                          </button>
                          <button
                            onClick={() => toast.success('Viewing payment details...')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                          >
                            👁️ View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Recent Registrations */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          Recent Registrations
        </h3>
        <p className="text-sm text-white/60 mb-4">
          New users are automatically shown here. Auto-confirm is currently <strong>{autoConfirm ? 'ENABLED' : 'DISABLED'}</strong>.
        </p>
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-200">
            💡 <strong>Tip:</strong> Enable auto-confirm to automatically verify payments from trusted payment gateways. Manual confirmation is recommended for high-value transactions.
          </p>
        </div>
      </div>
    </div>
  );
}

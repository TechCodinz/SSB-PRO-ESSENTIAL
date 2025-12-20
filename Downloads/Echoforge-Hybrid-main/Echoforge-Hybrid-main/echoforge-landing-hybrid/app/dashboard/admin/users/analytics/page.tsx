"use client";
import { useEffect, useState } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function UserAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Premium Header */}
            <div className="mb-8">
              <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                📊 User Analytics & Insights
              </h1>
              <p className="text-slate-400 text-lg">System-wide user metrics and growth trends</p>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 h-32 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">👥</span>
                      <span className="text-emerald-400 text-sm font-bold">
                        {analytics?.growth?.newUsersGrowth > 0 ? `+${analytics.growth.newUsersGrowth.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="text-4xl font-black text-slate-100 mb-1">
                      {analytics?.totalUsers?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-400">Total Users</div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">✅</span>
                      <span className="text-blue-400 text-sm font-bold">
                        {analytics?.activeUsers > 0 ? `${((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className="text-4xl font-black text-slate-100 mb-1">
                      {analytics?.activeUsers?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-400">Active Today</div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">🆕</span>
                      <span className="text-purple-400 text-sm font-bold">This Week</span>
                    </div>
                    <div className="text-4xl font-black text-slate-100 mb-1">
                      {analytics?.newUsers?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-slate-400">New Users</div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">💰</span>
                      <span className="text-amber-400 text-sm font-bold">MRR</span>
                    </div>
                    <div className="text-4xl font-black text-slate-100 mb-1">
                      ${((analytics?.totalRevenue || 0) / 100).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-400">Monthly Revenue</div>
                  </div>
                </div>

                {/* Plan Distribution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100">Plan Distribution</h2>
                    <div className="space-y-4">
                      {(analytics?.planDistribution || []).map((plan: any) => (
                        <div key={plan.plan} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              plan.plan === 'ENTERPRISE' ? 'bg-amber-400' :
                              plan.plan === 'PRO' ? 'bg-purple-400' :
                              plan.plan === 'STARTER' ? 'bg-blue-400' : 'bg-slate-400'
                            }`}></div>
                            <span className="text-slate-300 font-medium">{plan.plan}</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-100">{plan.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-slate-100">Top Users by Activity</h2>
                    <div className="space-y-3">
                      {(analytics?.topUsers || []).slice(0, 5).map((user: any, idx: number) => (
                        <div key={user.userId} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-bold">#{idx + 1}</span>
                            <div>
                              <div className="text-slate-200 font-medium">{user.email}</div>
                              <div className="text-xs text-slate-500">{user.plan}</div>
                            </div>
                          </div>
                          <span className="text-slate-300 font-bold">{user.activityCount} analyses</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Signups */}
                <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 text-slate-100">Daily Signups (Last 7 Days)</h2>
                  <div className="space-y-3">
                    {(analytics?.dailySignups || []).map((day: any) => (
                      <div key={day.date} className="flex items-center gap-4">
                        <span className="text-slate-400 w-24 text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex-1 bg-slate-800/30 rounded-full h-8 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full flex items-center justify-end px-3 text-white text-sm font-bold"
                            style={{ width: `${Math.max(10, (day.count / (analytics?.dailySignups[0]?.count || 1)) * 100)}%` }}
                          >
                            {day.count}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

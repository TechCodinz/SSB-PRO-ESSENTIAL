"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function AIControlPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [automationQueue, setAutomationQueue] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      loadIntelligence();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadIntelligence, 30000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status]);

  const loadIntelligence = async () => {
    try {
      const res = await axios.get("/api/ai/control");
      setIntelligence(res.data.intelligence);
      setAutomationQueue(res.data.automationQueue || []);
      setLastUpdated(res.data.timestamp || new Date().toISOString());
    } catch (error) {
      console.error("Failed to load intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (action: string, actionName: string) => {
    try {
      setActionLoading(action);
      toast.loading(`Executing ${actionName}...`, { id: action });

      await axios.post("/api/ai/control", { action });

      toast.success(`${actionName} completed!`, { id: action });

      // Refresh intelligence after action
      await loadIntelligence();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to execute ${actionName}`, {
        id: action,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Server-side layout already handles auth - no client-side checks needed
  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen bg-[#0b1020]">
        <UltraPremiumAdminNavigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-spin">🤖</div>
            <p className="text-xl font-bold">Initializing AI Control System...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            🤖 AI Control System
          </h1>
          <p className="text-white/70 text-lg">
            Ultra-Sentient System Management & Learning
          </p>
        </div>

        {/* System Health Score */}
        <div className="card bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">System Health Score</h2>
            <div className="text-5xl font-black text-green-400">
              {intelligence?.healthScore?.toFixed(0) || 0}%
            </div>
          </div>
          <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                (intelligence?.healthScore || 0) >= 80
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : (intelligence?.healthScore || 0) >= 60
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-gradient-to-r from-red-400 to-pink-500"
              }`}
              style={{ width: `${intelligence?.healthScore || 0}%` }}
            />
          </div>
        </div>

        {/* Insights */}
        {intelligence?.insights && intelligence.insights.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">🧠 AI Insights</h2>
            <div className="space-y-3">
              {intelligence.insights.map((insight: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    insight.type === "critical"
                      ? "bg-red-500/10 border-red-500/30"
                      : insight.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-green-500/10 border-green-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {insight.type === "critical"
                            ? "🚨"
                            : insight.type === "warning"
                            ? "⚠️"
                            : "✅"}
                        </span>
                        <span className="font-bold text-lg">{insight.category.toUpperCase()}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            insight.priority === "critical"
                              ? "bg-red-500/30 text-red-300"
                              : insight.priority === "high"
                              ? "bg-orange-500/30 text-orange-300"
                              : "bg-blue-500/30 text-blue-300"
                          }`}
                        >
                          {insight.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white/80 mb-2">{insight.message}</p>
                      <p className="text-sm text-white/60">
                        💡 Recommendation: {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* User Metrics */}
          <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5">
            <div className="text-4xl mb-3">👥</div>
            <div className="text-3xl font-bold mb-1">
              {intelligence?.userMetrics?.totalUsers || 0}
            </div>
            <div className="text-sm text-white/60 mb-2">Total Users</div>
            <div className="text-xs text-green-400">
              +{intelligence?.userMetrics?.newUsersToday || 0} today
            </div>
            <div className="text-xs text-white/50 mt-2">
              {intelligence?.userMetrics?.activeUsers || 0} active (7d)
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-3xl font-bold mb-1">
              {intelligence?.analysisMetrics?.totalAnalyses || 0}
            </div>
            <div className="text-sm text-white/60 mb-2">Total Analyses</div>
            <div className="text-xs text-green-400">
              +{intelligence?.analysisMetrics?.analysesToday || 0} today
            </div>
            <div className="text-xs text-white/50 mt-2">
              {((intelligence?.analysisMetrics?.avgAccuracy || 0) * 100).toFixed(1)}% avg accuracy
            </div>
          </div>

          {/* Performance */}
          <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-3xl font-bold mb-1">
              {((intelligence?.performanceMetrics?.avgProcessingTime || 0) / 1000).toFixed(2)}s
            </div>
            <div className="text-sm text-white/60 mb-2">Avg Processing</div>
            <div className="text-xs text-green-400">
              {intelligence?.performanceMetrics?.performanceScore?.toFixed(1) || 0}% performance score
            </div>
          </div>

          {/* Errors */}
          <div className="card bg-gradient-to-br from-red-500/10 to-red-600/5">
            <div className="text-4xl mb-3">🚨</div>
            <div className="text-3xl font-bold mb-1">
              {intelligence?.errorMetrics?.errorRate?.toFixed(1) || 0}%
            </div>
            <div className="text-sm text-white/60 mb-2">Error Rate</div>
            <div
              className={`text-xs font-bold ${
                (intelligence?.errorMetrics?.errorRate || 0) < 5
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {intelligence?.errorMetrics?.status?.toUpperCase() || "UNKNOWN"}
            </div>
          </div>
        </div>

        {/* Awareness & Automations */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="text-xl font-bold">Feedback Awareness</h3>
                <p className="text-sm text-white/60">Live sentiment intelligence from users</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <div className="text-2xl font-bold">
                  {intelligence?.feedbackMetrics?.pendingReview || 0}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Pending follow-ups</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {(intelligence?.feedbackMetrics?.avgRating || 0).toFixed(1)}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Avg rating</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((intelligence?.feedbackMetrics?.sentimentScore || 0) * 100)}%
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Sentiment</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {intelligence?.feedbackMetrics?.totalFeedback || 0}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">All feedback</div>
              </div>
            </div>
            {intelligence?.feedbackMetrics?.topRequests?.length ? (
              <div className="mt-4">
                <div className="text-xs text-white/40 uppercase tracking-wide mb-2">Top requests</div>
                <div className="space-y-2">
                  {intelligence.feedbackMetrics.topRequests.map((request: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-blue-300">•</span>
                      <span className="flex-1">{request.message}</span>
                      <span className="text-white/40 text-xs">×{request.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="card bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🛰️</span>
              <div>
                <h3 className="text-xl font-bold">Automation Sentinel</h3>
                <p className="text-sm text-white/60">Real-time control directives</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
              <div>
                <div className="text-2xl font-bold">{automationQueue.length}</div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Active directives</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {automationQueue.filter((item) => item.priority === "high").length}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">High priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {automationQueue.filter((item) => item.type === "role_assignment").length}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Role promotions ready</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {automationQueue.filter((item) => item.type === "anomaly_response").length}
                </div>
                <div className="text-xs text-white/60 uppercase tracking-wide">Threat responses</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-white/50">
              Last refreshed:{" "}
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "—"}
            </div>
          </div>
        </div>

        {/* AI Actions */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">🎯 AI Control Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => executeAction("analyze_performance", "Performance Analysis")}
              disabled={actionLoading === "analyze_performance"}
              className="p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">📊</div>
              <div className="font-bold text-lg mb-2">Analyze Performance</div>
              <div className="text-sm text-white/60">
                Deep analysis of system performance metrics
              </div>
            </button>

            <button
              onClick={() => executeAction("optimize_ml_models", "ML Optimization")}
              disabled={actionLoading === "optimize_ml_models"}
              className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">🧠</div>
              <div className="font-bold text-lg mb-2">Optimize ML Models</div>
              <div className="text-sm text-white/60">
                Retrain and optimize machine learning models
              </div>
            </button>

            <button
              onClick={() => executeAction("learn_from_feedback", "Learn from Feedback")}
              disabled={actionLoading === "learn_from_feedback"}
              className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">💡</div>
              <div className="font-bold text-lg mb-2">Learn from Feedback</div>
              <div className="text-sm text-white/60">
                Analyze user feedback and adapt system
              </div>
            </button>

            <button
              onClick={() => executeAction("predict_issues", "Predict Issues")}
              disabled={actionLoading === "predict_issues"}
              className="p-6 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">🔮</div>
              <div className="font-bold text-lg mb-2">Predict Issues</div>
              <div className="text-sm text-white/60">
                AI-powered predictive maintenance
              </div>
            </button>

            <button
              onClick={() => executeAction("auto_scale", "Auto-Scale Recommendations")}
              disabled={actionLoading === "auto_scale"}
              className="p-6 bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">📈</div>
              <div className="font-bold text-lg mb-2">Auto-Scale</div>
              <div className="text-sm text-white/60">
                Generate scaling recommendations
              </div>
            </button>

            <Link
              href="/dashboard/admin"
              className="p-6 bg-gradient-to-br from-gray-500/20 to-gray-600/10 border border-gray-500/30 rounded-xl hover:scale-105 transition-all text-center flex flex-col items-center justify-center"
            >
              <div className="text-4xl mb-3">🏠</div>
              <div className="font-bold text-lg mb-2">Admin Dashboard</div>
              <div className="text-sm text-white/60">
                Return to main admin panel
              </div>
            </Link>
          </div>
        </div>

        {/* Auto-Refresh Indicator */}
        <div className="text-center text-sm text-white/40">
          🔄 Auto-refreshing every 30 seconds • Last updated:{" "}
          {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "—"}
        </div>
        </div>
      </div>
    </div>
  );
}

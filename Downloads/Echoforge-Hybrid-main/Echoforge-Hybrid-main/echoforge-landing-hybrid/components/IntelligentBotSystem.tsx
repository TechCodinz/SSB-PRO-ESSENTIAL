"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

interface BotAction {
  id: string;
  type:
    | "role_assignment"
    | "permission_update"
    | "anomaly_response"
    | "user_onboarding"
    | "system_optimization"
    | "feedback_followup";
  description: string;
  confidence: number;
  timestamp: Date;
  status: "pending" | "approved" | "executing" | "completed" | "failed";
  user_affected?: string;
  details: any;
}

interface IntelligentBotSystemProps {
  autoApprove?: boolean;
  threshold?: number;
}

export default function IntelligentBotSystem({ 
  autoApprove = false, 
  threshold = 90 
}: IntelligentBotSystemProps) {
  const router = useRouter();
  const [botActive, setBotActive] = useState(true);
  const [actions, setActions] = useState<BotAction[]>([]);
  const [botStats, setBotStats] = useState({
    total_actions: 0,
    auto_approved: 0,
    pending_review: 0,
    success_rate: 0,
    time_saved_hours: 0,
    users_managed: 0,
  });
  const [learning, setLearning] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const autoProcessedRef = useRef<Set<string>>(new Set());

  const approveAction = async (action: BotAction, isAuto = false) => {
    setActions((prev) =>
      prev.map((item) =>
        item.id === action.id ? { ...item, status: "executing" as const } : item
      )
    );

    const toastId = !isAuto
      ? toast.loading(`Executing "${action.description}"...`, {
          id: action.id,
        })
      : undefined;

    try {
      await axios.post("/api/ai/control", {
        action: "execute_automation",
        parameters: {
          automationId: action.id,
          type: action.type,
          payload: action.details,
        },
      });
      if (!isAuto) {
        toast.success("Action completed successfully!", { id: action.id });
      }
      setActions((prev) =>
        prev.map((item) =>
          item.id === action.id ? { ...item, status: "completed" as const } : item
        )
      );
      autoProcessedRef.current.add(action.id);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to execute action", {
        id: action.id,
      });
      setActions((prev) =>
        prev.map((item) =>
          item.id === action.id ? { ...item, status: "failed" as const } : item
        )
      );
    } finally {
      setBotStats((prev) => ({
        ...prev,
        total_actions: prev.total_actions + 1,
        auto_approved: prev.auto_approved + (isAuto ? 1 : 0),
        pending_review: Math.max(prev.pending_review - 1, 0),
      }));
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  };

  const rejectAction = async (action: BotAction) => {
    try {
      await axios.post("/api/ai/control", {
        action: "dismiss_automation",
        parameters: {
          automationId: action.id,
          type: action.type,
        },
      });
      toast.success("Action dismissed");
      setActions((prev) => prev.filter((item) => item.id !== action.id));
      setBotStats((prev) => ({
        ...prev,
        pending_review: Math.max(prev.pending_review - 1, 0),
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to dismiss action");
    }
  };

  const fetchAutomation = useCallback(async () => {
    if (!botActive) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("/api/ai/control");
      const data = response.data;

      const queue: BotAction[] = (data.automationQueue ?? []).map((item: any) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        confidence: item.confidence,
        timestamp: new Date(item.createdAt ?? Date.now()),
        status: "pending",
        user_affected: item.payload?.email ?? item.payload?.userEmail ?? undefined,
        details: item.payload ?? {},
      }));

      setActions(queue);
      const currentIds = new Set(queue.map((item) => item.id));
      autoProcessedRef.current = new Set(
        Array.from(autoProcessedRef.current).filter((id) => currentIds.has(id))
      );

      const formattedInsights = (data.intelligence?.insights ?? []).map(
        (insight: any) =>
          `${insight.category?.toUpperCase() ?? "INSIGHT"} • ${insight.message}`
      );
      setInsights(formattedInsights);

      const errorRate = data.intelligence?.errorMetrics?.errorRate ?? 0;
      const totalUsers = data.intelligence?.userMetrics?.totalUsers ?? 0;
      const analysisTotal =
        data.intelligence?.analysisMetrics?.totalAnalyses ?? queue.length;
      const performanceTotal =
        data.intelligence?.performanceMetrics?.totalAnalyses ?? analysisTotal;

      const autoEligible = queue.filter(
        (item) => item.confidence >= threshold
      ).length;
      const pendingReview = queue.filter(
        (item) => item.confidence < threshold
      ).length;

      setBotStats({
        total_actions: analysisTotal,
        auto_approved: autoEligible,
        pending_review: pendingReview,
        success_rate: Math.max(0, Number((100 - errorRate).toFixed(1))),
        time_saved_hours: Math.max(0, Math.round(performanceTotal * 0.2)),
        users_managed: totalUsers,
      });
    } catch (error) {
      console.error("Failed to load automation queue:", error);
      toast.error("Failed to load AI automation queue");
    } finally {
      setLoading(false);
    }
  }, [botActive, threshold]);

  useEffect(() => {
    fetchAutomation();
    const interval = setInterval(fetchAutomation, 30000);
    return () => clearInterval(interval);
  }, [fetchAutomation]);

  useEffect(() => {
    if (!autoApprove) return;

    const eligible = actions.filter(
      (action) =>
        action.status === "pending" &&
        action.confidence >= threshold &&
        !autoProcessedRef.current.has(action.id)
    );

    eligible.forEach((action) => {
      autoProcessedRef.current.add(action.id);
      approveAction(action, true);
    });
  }, [actions, autoApprove, threshold]);

  const getStatusColor = (status: BotAction["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "approved": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "executing": return "bg-purple-500/20 text-purple-300 border-purple-500/30 animate-pulse";
      case "completed": return "bg-green-500/20 text-green-300 border-green-500/30";
      case "failed": return "bg-red-500/20 text-red-300 border-red-500/30";
    }
  };

  const getTypeIcon = (type: BotAction["type"]) => {
    switch (type) {
      case "role_assignment": return "👤";
      case "permission_update": return "🔐";
      case "anomaly_response": return "🛡️";
      case "user_onboarding": return "🎯";
      case "system_optimization": return "⚡";
      case "feedback_followup": return "💬";
      default:
        return "🤖";
    }
  };

  return (
    <div className="space-y-6">
      {/* Bot Control Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: botActive ? 360 : 0,
                scale: botActive ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="text-5xl"
            >
              🤖
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligent Bot System
              </h2>
              <p className="text-white/70 text-lg">AI-powered automation for role management, security, and operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBotActive(!botActive)}
              className={`relative w-16 h-9 rounded-full transition-colors ${
                botActive ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <motion.div
                animate={{ x: botActive ? 28 : 2 }}
                className="absolute top-1 w-7 h-7 bg-white rounded-full shadow-lg"
              />
            </button>
            <div className="text-right">
              <div className={`text-sm font-bold ${botActive ? "text-green-400" : "text-gray-400"}`}>
                {botActive ? "🟢 ACTIVE" : "⚪ PAUSED"}
              </div>
              <div className="text-xs text-white/60">
                {learning ? "Learning Mode" : "Standard Mode"}
              </div>
            </div>
          </div>
        </div>

        {/* Bot Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total Actions", value: botStats.total_actions, icon: "⚡", color: "blue" },
            { label: "Auto-Approved", value: botStats.auto_approved, icon: "✅", color: "green" },
            { label: "Pending Review", value: botStats.pending_review, icon: "⏳", color: "yellow" },
            { label: "Success Rate", value: `${botStats.success_rate}%`, icon: "🎯", color: "purple" },
            { label: "Time Saved", value: `${botStats.time_saved_hours}h`, icon: "⏱️", color: "cyan" },
            { label: "Users Managed", value: botStats.users_managed, icon: "👥", color: "pink" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Auto-Approval Settings */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => {}}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                autoApprove ? "bg-green-500" : "bg-gray-600"
              }`}
            >
              <motion.div
                animate={{ x: autoApprove ? 24 : 2 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">Auto-Approval</div>
              <div className="text-xs text-white/60">
                {autoApprove ? `Enabled for actions ≥${threshold}% confidence` : "Disabled - Manual review required"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setLearning(!learning)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                learning ? "bg-purple-500" : "bg-gray-600"
              }`}
            >
              <motion.div
                animate={{ x: learning ? 24 : 2 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
            <div className="flex-1">
              <div className="font-bold text-white text-sm">Continuous Learning</div>
              <div className="text-xs text-white/60">
                {learning ? "Bot is learning from actions" : "Learning paused"}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-xl font-bold text-white">AI Learning Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="text-lg">💡</span>
              <p className="text-sm text-white/80">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Queue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">📋</span>
            Action Queue ({actions.length})
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                const pending = actions.filter((a) => a.status === "pending");
                if (!pending.length) return;
                await Promise.all(pending.map((action) => approveAction(action)));
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              Approve All ({actions.filter(a => a.status === "pending").length})
            </button>
            <button 
              onClick={() => {
                setActions(prev => prev.filter(a => a.status !== "completed"));
                toast.success("Cleared completed actions");
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              Clear Completed
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && actions.length === 0 ? (
            <div className="text-center text-white/60 py-6">
              Loading AI automation queue…
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center text-white/60 py-6">
              No pending automations. The system is stable.
            </div>
          ) : (
            <AnimatePresence>
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{getTypeIcon(action.type)}</div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-white text-lg">
                          {action.description}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(action.status)}`}
                        >
                          {action.status.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                          {action.confidence.toFixed(1)}% confidence
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mb-3">
                        {Object.entries(action.details).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-white/60">
                              {key.replace(/_/g, " ")}:{" "}
                            </span>
                            <span className="text-white/90">
                              {Array.isArray(value)
                                ? value.join(", ")
                                : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-white/60">
                          {action.timestamp.toLocaleString()}
                          {action.user_affected &&
                            ` • User: ${action.user_affected}`}
                        </div>

                        {action.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveAction(action)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => rejectAction(action)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                            >
                              ❌ Reject
                            </button>
                            <button
                              onClick={() =>
                                toast(`Action details: ${action.description}`, {
                                  icon: "ℹ️",
                                })
                              }
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        )}

                        {action.status === "executing" && (
                          <div className="flex items-center gap-2 text-purple-400 text-sm">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              ⚙️
                            </motion.div>
                            Executing...
                          </div>
                        )}

                        {action.status === "completed" && (
                          <div className="text-green-400 text-sm font-bold">
                            ✅ Completed Successfully
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { title: "Train Bot", description: "Improve AI accuracy", icon: "🎓", color: "purple", action: () => toast.success("Bot training initiated!") },
          { title: "Review Logs", description: "View bot activity", icon: "📊", color: "blue", action: () => router.push('/dashboard/admin/system') },
          { title: "Configure Rules", description: "Set automation rules", icon: "⚙️", color: "cyan", action: () => router.push('/dashboard/admin/features') },
          { title: "Analytics", description: "Bot performance metrics", icon: "📈", color: "green", action: () => router.push('/dashboard/analytics') }
        ].map((action, index) => (
          <motion.button
            key={action.title}
            onClick={action.action}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl text-left transition-all duration-300 ${
              action.color === 'blue' ? 'bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60' :
              action.color === 'green' ? 'bg-green-500/10 border border-green-500/30 hover:border-green-500/60' :
              action.color === 'purple' ? 'bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60' :
              'bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60'
            }`}
          >
            <span className="text-3xl mb-2 block">{action.icon}</span>
            <h4 className="text-sm font-bold text-white mb-1">{action.title}</h4>
            <p className="text-xs text-white/70">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

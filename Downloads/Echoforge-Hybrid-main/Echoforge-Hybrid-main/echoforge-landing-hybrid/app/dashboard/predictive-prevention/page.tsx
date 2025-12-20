"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface Prediction {
  id: string;
  predictedAnomalyType: string;
  predictedSeverity: string;
  confidenceScore: number;
  predictedTimestamp: string;
  preventionActions?: any[];
  causalChain?: any[];
  status: string;
  prevented?: boolean;
  preventionEffectiveness?: number;
}

export default function PredictivePreventionPage() {
  const { data: session } = useSession();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    prevented: 0,
    confirmed: 0,
    falsePositives: 0,
    avgEffectiveness: 0,
  });

  useEffect(() => {
    loadPredictions();
    loadStats();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/predictive-prevention/predictions?status=PENDING&limit=20");
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      console.error("Failed to load predictions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/predictive-prevention/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const generatePredictions = async () => {
    try {
      setGenerating(true);
      const res = await fetch("/api/predictive-prevention/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookAheadHours: 24 }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Generated ${data.count} predictions`);
        loadPredictions();
        loadStats();
      } else {
        throw new Error("Failed to generate predictions");
      }
    } catch (error) {
      toast.error("Failed to generate predictions");
    } finally {
      setGenerating(false);
    }
  };

  const executePrevention = async (predictionId: string, actions: any[]) => {
    try {
      const res = await fetch("/api/predictive-prevention/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictionId, actions }),
      });

      if (res.ok) {
        toast.success("Prevention actions executed");
        loadPredictions();
        loadStats();
      } else {
        throw new Error("Failed to execute prevention");
      }
    } catch (error) {
      toast.error("Failed to execute prevention");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "from-red-600 to-rose-600";
      case "HIGH":
        return "from-orange-600 to-amber-600";
      case "MEDIUM":
        return "from-yellow-600 to-yellow-500";
      case "LOW":
        return "from-blue-600 to-cyan-600";
      default:
        return "from-slate-600 to-slate-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#050915] text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Predictive Anomaly Prevention
                </h1>
                <p className="text-white/70 text-lg">
                  World's first system that predicts and prevents anomalies before they occur
                </p>
              </div>
              <button
                onClick={generatePredictions}
                disabled={generating}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 hover:scale-105 disabled:opacity-50 transition-all"
              >
                <SparklesIcon className={`h-5 w-5 ${generating ? "animate-spin" : ""}`} />
                {generating ? "Generating..." : "Generate Predictions"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-slate-400">Total Predictions</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="rounded-2xl border border-emerald-800/50 bg-emerald-900/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                <span className="text-sm text-slate-400">Prevented</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{stats.prevented}</div>
            </div>
            <div className="rounded-2xl border border-orange-800/50 bg-orange-900/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-400" />
                <span className="text-sm text-slate-400">Confirmed</span>
              </div>
              <div className="text-3xl font-bold text-orange-400">{stats.confirmed}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="h-6 w-6 text-slate-400" />
                <span className="text-sm text-slate-400">False Positives</span>
              </div>
              <div className="text-3xl font-bold text-slate-400">{stats.falsePositives}</div>
            </div>
            <div className="rounded-2xl border border-purple-800/50 bg-purple-900/20 p-6">
              <div className="flex items-center gap-3 mb-2">
                <BoltIcon className="h-6 w-6 text-purple-400" />
                <span className="text-sm text-slate-400">Avg Effectiveness</span>
              </div>
              <div className="text-3xl font-bold text-purple-400">
                {(stats.avgEffectiveness * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Predictions List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Active Predictions</h2>
            {loading ? (
              <div className="text-center py-12">
                <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-blue-400 mb-4" />
                <p className="text-slate-400">Loading predictions...</p>
              </div>
            ) : predictions.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
                <SparklesIcon className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400 mb-4">No predictions yet</p>
                <button
                  onClick={generatePredictions}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white"
                >
                  Generate First Predictions
                </button>
              </div>
            ) : (
              predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${getSeverityColor(
                    pred.predictedSeverity
                  )}/10 p-6 backdrop-blur`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${getSeverityColor(
                          pred.predictedSeverity
                        )} text-white shadow-lg`}
                      >
                        {getSeverityIcon(pred.predictedSeverity)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {pred.predictedAnomalyType}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Predicted: {format(new Date(pred.predictedTimestamp), "PPpp")}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-800/50 text-slate-300">
                            {pred.predictedSeverity}
                          </span>
                          <span className="text-xs text-slate-400">
                            Confidence: {(pred.confidenceScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    {!pred.prevented && (
                      <button
                        onClick={() =>
                          executePrevention(
                            pred.id,
                            pred.preventionActions || [{ type: "ALERT", config: {}, priority: 1, estimatedEffectiveness: 0.7 }]
                          )
                        }
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition-all"
                      >
                        Prevent Now
                      </button>
                    )}
                  </div>

                  {pred.causalChain && pred.causalChain.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-xs font-semibold text-slate-400 mb-2">Causal Chain:</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {pred.causalChain.map((link: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded bg-slate-800/50 text-slate-300"
                          >
                            {link.from} → {link.to}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {pred.prevented && pred.preventionEffectiveness && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                        <span className="text-sm text-emerald-400">
                          Prevented • Effectiveness: {(pred.preventionEffectiveness * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

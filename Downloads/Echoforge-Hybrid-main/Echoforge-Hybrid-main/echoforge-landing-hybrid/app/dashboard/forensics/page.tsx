"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import AnomalySolutions from "@/components/AnomalySolutions";
import UltraPremiumForensics from "@/components/UltraPremiumForensics";
import Link from "next/link";
import toast from "react-hot-toast";

function ForensicsContent() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("id");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "details" | "timeline" | "solutions">("overview");

  useEffect(() => {
    if (analysisId) {
      loadAnalysis(analysisId);
    } else {
      // Don't load any analyses - we want to show the forensics lab
      setLoading(false);
    }
  }, [analysisId]);

  const loadAnalysis = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analyses/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        toast.error("Analysis not found");
      }
    } catch (error) {
      console.error("Failed to load analysis:", error);
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <div className="text-2xl font-bold">Loading Analysis...</div>
        </div>
      </div>
    );
  }

  // If no analysis ID provided, show the Digital Forensics Lab
  if (!analysisId) {
    return <UltraPremiumForensics />;
  }

  if (!analysis) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-3xl font-bold mb-4">No Analysis Found</h2>
        <p className="text-white/60 mb-8">
          Analysis ID not found in database
        </p>
        <Link
          href="/dashboard/forensics"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all inline-block"
        >
          Back to Digital Forensics Lab
        </Link>
      </div>
    );
  }

  const results = analysis.results || {};
  const config = results.config || {};
  const anomaliesFound = analysis.anomaliesFound || 0;
  const accuracy = analysis.accuracy || 0;
  const processingTime = analysis.processingTime || 0;
  const scores = results.scores || [];
  const anomalyIndices = results.anomalyIndices || [];
  const modelResults = results.modelResults || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🔍 Forensics & Results
          </h1>
          <Link
            href="/dashboard/upload"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
          >
            New Analysis
          </Link>
        </div>
        <p className="text-white/70 text-lg">Analysis ID: {analysis.id}</p>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "solutions", label: "Solutions", icon: "💡" },
          { id: "details", label: "Details", icon: "🔍" },
          { id: "timeline", label: "Timeline", icon: "⏱️" }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as any)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              viewMode === mode.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <span>{mode.icon}</span>
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Mode */}
      {viewMode === "overview" && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-3xl font-black text-blue-400 mb-1">{anomaliesFound}</div>
              <div className="text-sm text-white/60">Anomalies Found</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-3xl font-black text-green-400 mb-1">
                {(accuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-white/60">Accuracy</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">⚡</div>
              <div className="text-3xl font-black text-purple-400 mb-1">
                {(processingTime / 1000).toFixed(2)}s
              </div>
              <div className="text-sm text-white/60">Processing Time</div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-xl p-6">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-3xl font-black text-pink-400 mb-1">{analysis.dataPoints}</div>
              <div className="text-sm text-white/60">Data Points</div>
            </div>
          </div>

          {/* Analysis Info */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Analysis Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-white/60 mb-1">File Name</div>
                <div className="font-semibold">{analysis.fileName}</div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Status</div>
                <div className="font-semibold text-green-400">{analysis.status}</div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Type</div>
                <div className="font-semibold">{analysis.type}</div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-1">Created</div>
                <div className="font-semibold">
                  {new Date(analysis.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Model Results */}
          {Object.keys(modelResults).length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Model Performance</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(modelResults).map(([key, model]: [string, any]) => (
                  <div key={key} className="bg-black/20 rounded-lg p-4">
                    <div className="font-semibold mb-2">{model.name}</div>
                    <div className="text-sm text-white/60 mb-2">
                      Accuracy: {(model.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-white/60">
                      Found: {model.anomalyCount} anomalies
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomaly List */}
          {anomalyIndices.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Detected Anomalies</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {anomalyIndices.slice(0, 20).map((idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                  >
                    <div>
                      <div className="font-semibold">Row {idx + 1}</div>
                      <div className="text-sm text-white/60">
                        Score: {scores[idx]?.toFixed(3)}
                      </div>
                    </div>
                    <div className="text-2xl">⚠️</div>
                  </div>
                ))}
                {anomalyIndices.length > 20 && (
                  <div className="text-center text-white/60 py-4">
                    And {anomalyIndices.length - 20} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solutions Mode */}
      {viewMode === "solutions" && (
        <AnomalySolutions
          anomalyCount={anomaliesFound}
          accuracy={accuracy}
          dataType={analysis.fileName}
        />
      )}

      {/* Details Mode */}
      {viewMode === "details" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Configuration Details</h3>
          <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify({ config, results, anomaliesFound, accuracy, processingTime }, null, 2)}
          </pre>
        </div>
      )}

      {/* Timeline Mode */}
      {viewMode === "timeline" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Analysis Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-semibold">File Uploaded</div>
                <div className="text-sm text-white/60">
                  {new Date(analysis.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-semibold">Analysis Started</div>
                <div className="text-sm text-white/60">
                  Processing {analysis.dataPoints} data points
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-semibold">Models Executed</div>
                <div className="text-sm text-white/60">
                  {config.models?.length || 1} models in {(processingTime / 1000).toFixed(2)}s
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <div className="font-semibold">Analysis Complete</div>
                <div className="text-sm text-white/60">
                  Found {anomaliesFound} anomalies with {(accuracy * 100).toFixed(1)}% accuracy
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => toast.success("Export feature coming soon!")}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          📥 Export Report
        </button>
        <button
          onClick={() => toast.success("Share feature coming soon!")}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          🔗 Share Results
        </button>
        <Link
          href="/dashboard/crypto"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-all"
        >
          🔐 Crypto Fraud Analysis
        </Link>
      </div>
    </div>
  );
}

export default function ForensicsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-4xl animate-spin">⚙️</div></div>}>
        <ForensicsContent />
      </Suspense>
    </DashboardLayout>
  );
}

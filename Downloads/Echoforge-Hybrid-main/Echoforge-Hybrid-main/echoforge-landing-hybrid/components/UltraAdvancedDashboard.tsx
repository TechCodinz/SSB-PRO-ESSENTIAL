// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis 
} from "recharts";

interface UltraAdvancedDashboardProps {
  userId?: string;
  role?: string;
}

export default function UltraAdvancedDashboard({ userId, role = "USER" }: UltraAdvancedDashboardProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemHealth, setSystemHealth] = useState(99.9);
  const [detectionRate, setDetectionRate] = useState(1247);
  const [threatLevel, setThreatLevel] = useState("LOW");
  const [autoRemediation, setAutoRemediation] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [viewMode, setViewMode] = useState<"standard" | "advanced" | "expert">("advanced");

  // Real-time AI insights with predictive capabilities
  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      type: "predictive",
      title: "Anomaly Surge Predicted",
      description: "AI forecasts 23% increase in anomalies in next 2 hours based on pattern analysis",
      confidence: 94.2,
      timestamp: new Date(),
      icon: "🔮",
      severity: "warning",
      action: "Increase monitoring sensitivity",
      predicted_time: "14:30 UTC"
    },
    {
      id: 2,
      type: "performance",
      title: "Ensemble Model Optimized",
      description: "Auto-tuned 5 models achieving 99.3% consensus accuracy",
      confidence: 99.3,
      timestamp: new Date(),
      icon: "🧠",
      severity: "success",
      action: "Review new parameters"
    },
    {
      id: 3,
      type: "security",
      title: "Advanced Threat Detected",
      description: "Zero-day pattern identified in transaction data - auto-quarantined",
      confidence: 87.5,
      timestamp: new Date(),
      icon: "🛡️",
      severity: "critical",
      action: "Investigate immediately",
      affected_records: 143
    },
    {
      id: 4,
      type: "optimization",
      title: "Performance Boost Applied",
      description: "Dynamic threshold adjustment improved detection by 15%",
      confidence: 91.8,
      timestamp: new Date(),
      icon: "⚡",
      severity: "info",
      action: "Monitor performance"
    }
  ]);

  // Advanced real-time metrics
  const [metrics, setMetrics] = useState({
    detections_per_second: 1247,
    accuracy: 99.3,
    latency_ms: 0.6,
    system_health: 99.9,
    active_models: 11,
    auto_remediated: 156,
    threat_score: 23,
    data_processed_gb: 45.7,
    predictions_made: 2340,
    false_positives: 3,
    true_positives: 892,
    anomaly_types_detected: 17
  });

  // Real-time data stream simulation
  const [realTimeData, setRealTimeData] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update metrics realistically
      setMetrics(prev => ({
        ...prev,
        detections_per_second: Math.floor(1200 + Math.random() * 100),
        accuracy: Math.min(99.9, prev.accuracy + (Math.random() - 0.5) * 0.1),
        latency_ms: Math.max(0.4, 0.6 + (Math.random() - 0.5) * 0.2),
        system_health: Math.max(99.0, prev.system_health + (Math.random() - 0.5) * 0.1),
        auto_remediated: prev.auto_remediated + Math.floor(Math.random() * 3),
        predictions_made: prev.predictions_made + Math.floor(Math.random() * 50),
        data_processed_gb: prev.data_processed_gb + Math.random() * 0.5
      }));

      // Add real-time data point
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        detections: Math.floor(1200 + Math.random() * 100),
        accuracy: 98 + Math.random() * 2,
        anomalies: Math.floor(Math.random() * 20),
        latency: 0.4 + Math.random() * 0.4,
        threats: Math.floor(Math.random() * 5)
      };

      setRealTimeData(prev => [...prev.slice(-19), newPoint]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Performance data for 24h trend
  const performanceData = [
    { time: "00:00", accuracy: 98.2, latency: 0.8, throughput: 1200, anomalies: 45 },
    { time: "04:00", accuracy: 98.5, latency: 0.7, throughput: 1150, anomalies: 38 },
    { time: "08:00", accuracy: 99.1, latency: 0.6, throughput: 1300, anomalies: 52 },
    { time: "12:00", accuracy: 98.8, latency: 0.9, throughput: 1400, anomalies: 67 },
    { time: "16:00", accuracy: 99.3, latency: 0.5, throughput: 1500, anomalies: 71 },
    { time: "20:00", accuracy: 98.9, latency: 0.7, throughput: 1350, anomalies: 59 },
    { time: "24:00", accuracy: 99.1, latency: 0.6, throughput: 1250, anomalies: 48 }
  ];

  // Model comparison with advanced metrics
  const modelPerformance = [
    { 
      model: "Isolation Forest", 
      accuracy: 98.7, 
      speed: 0.8, 
      usage: 35, 
      precision: 97.2,
      recall: 98.1,
      f1_score: 97.6
    },
    { 
      model: "LOF", 
      accuracy: 96.4, 
      speed: 1.2, 
      usage: 25,
      precision: 95.8,
      recall: 96.9,
      f1_score: 96.3
    },
    { 
      model: "One-Class SVM", 
      accuracy: 94.2, 
      speed: 2.1, 
      usage: 20,
      precision: 93.5,
      recall: 94.8,
      f1_score: 94.1
    },
    { 
      model: "Z-Score", 
      accuracy: 92.1, 
      speed: 0.3, 
      usage: 12,
      precision: 91.3,
      recall: 92.8,
      f1_score: 92.0
    },
    { 
      model: "LSTM Autoencoder", 
      accuracy: 97.2, 
      speed: 3.5, 
      usage: 8,
      precision: 96.7,
      recall: 97.6,
      f1_score: 97.1
    }
  ];

  // Anomaly type distribution
  const anomalyTypes = [
    { name: "Statistical Outliers", value: 340, color: "#3B82F6" },
    { name: "Behavioral Anomalies", value: 267, color: "#8B5CF6" },
    { name: "Pattern Deviations", value: 198, color: "#10B981" },
    { name: "Temporal Anomalies", value: 156, color: "#F59E0B" },
    { name: "Contextual Outliers", value: 123, color: "#EF4444" },
    { name: "Zero-day Threats", value: 8, color: "#EC4899" }
  ];

  // Threat intelligence feed
  const threatIntel = [
    { 
      type: "APT", 
      name: "Advanced Persistent Threat", 
      confidence: 94, 
      severity: "critical",
      indicators: 156,
      first_seen: "2h ago"
    },
    { 
      type: "Malware", 
      name: "Polymorphic Variant Detected", 
      confidence: 87, 
      severity: "high",
      indicators: 89,
      first_seen: "5h ago"
    },
    { 
      type: "Botnet", 
      name: "C2 Communication Pattern", 
      confidence: 76, 
      severity: "medium",
      indicators: 234,
      first_seen: "12h ago"
    }
  ];

  // Predictive analytics data
  const predictiveData = [
    { hour: "Now", predicted: 45, actual: 48, confidence: 95 },
    { hour: "+1h", predicted: 52, actual: null, confidence: 92 },
    { hour: "+2h", predicted: 67, actual: null, confidence: 88 },
    { hour: "+3h", predicted: 58, actual: null, confidence: 84 },
    { hour: "+4h", predicted: 43, actual: null, confidence: 79 }
  ];

  return (
    <div className="space-y-6">
      {/* Ultra-Premium Live Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"
            />
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                ULTRA-ADVANCED ANOMALY DETECTION SYSTEM
              </h2>
              <p className="text-white/70 text-lg">Real-time AI-powered threat intelligence & predictive analytics</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white mb-1">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-white/60">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="mt-2 flex gap-2 justify-end">
              <div className="px-3 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-xs font-bold text-green-300">
                ⚡ LIVE
              </div>
              <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full text-xs font-bold text-blue-300">
                🤖 AI ACTIVE
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-4">
          {[
            { value: "standard", label: "Standard View", icon: "📊" },
            { value: "advanced", label: "Advanced Analytics", icon: "🧠" },
            { value: "expert", label: "Expert Mode", icon: "👨‍💻" }
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === mode.value
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>

        {/* Auto-remediation toggle */}
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
          <button
            onClick={() => setAutoRemediation(!autoRemediation)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              autoRemediation ? "bg-green-500" : "bg-gray-600"
            }`}
          >
            <motion.div
              animate={{ x: autoRemediation ? 24 : 2 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
            />
          </button>
          <div className="flex-1">
            <div className="font-bold text-white">Automated Threat Remediation</div>
            <div className="text-xs text-white/60">
              {autoRemediation ? "✅ Enabled - Threats auto-neutralized" : "⚠️ Disabled - Manual intervention required"}
            </div>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {metrics.auto_remediated}
            <div className="text-xs text-white/60 font-normal">remediated</div>
          </div>
        </div>
      </motion.div>

      {/* Ultra-Advanced Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { 
            label: "Detections/sec", 
            value: metrics.detections_per_second.toLocaleString(), 
            change: "+12%", 
            icon: "⚡", 
            color: "blue",
            trend: "up",
            subtitle: "Real-time processing"
          },
          { 
            label: "ML Accuracy", 
            value: `${metrics.accuracy.toFixed(2)}%`, 
            change: "+0.3%", 
            icon: "🎯", 
            color: "green",
            trend: "up",
            subtitle: "Ensemble consensus"
          },
          { 
            label: "Avg Latency", 
            value: `${metrics.latency_ms.toFixed(2)}ms`, 
            change: "-15%", 
            icon: "🚀", 
            color: "purple",
            trend: "down",
            subtitle: "Ultra-low latency"
          },
          { 
            label: "System Health", 
            value: `${metrics.system_health.toFixed(1)}%`, 
            change: "Excellent", 
            icon: "💎", 
            color: "green",
            trend: "stable",
            subtitle: "All systems optimal"
          },
          { 
            label: "Active Models", 
            value: metrics.active_models, 
            change: "11/11", 
            icon: "🧠", 
            color: "indigo",
            trend: "stable",
            subtitle: "Full ensemble"
          },
          { 
            label: "Threat Score", 
            value: metrics.threat_score, 
            change: "LOW", 
            icon: "🛡️", 
            color: "green",
            trend: "stable",
            subtitle: "Environment secure"
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{metric.icon}</span>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                metric.color === 'green' ? 'bg-green-500/20 text-green-400' :
                metric.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                metric.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                metric.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-xs text-white/60 mb-2">{metric.label}</div>
            <div className="text-[10px] text-white/40">{metric.subtitle}</div>
          </motion.div>
        ))}
      </div>

      {/* AI-Powered Predictive Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🔮</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Predictive Intelligence & Real-time Insights
          </h3>
          <div className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full animate-pulse">
            LIVE FEED
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {aiInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                  insight.severity === 'critical' ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' :
                  insight.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50' :
                  insight.severity === 'success' ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' :
                  'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50'
                }`}
              >
                <span className="text-3xl">{insight.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-white">{insight.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                      insight.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                      insight.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                      insight.severity === 'success' ? 'bg-green-500/20 text-green-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">
                      {insight.timestamp.toLocaleTimeString()}
                      {insight.predicted_time && ` • Predicted: ${insight.predicted_time}`}
                      {insight.affected_records && ` • ${insight.affected_records} records`}
                    </div>
                    <button 
                      onClick={() => {
                        if (insight.severity === 'critical') router.push('/dashboard/forensics');
                        else if (insight.type === 'predictive') router.push('/dashboard/analytics-advanced');
                        else router.push('/dashboard/analytics');
                      }}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors"
                    >
                      {insight.action}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Advanced Real-time Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Real-time Detection Stream */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Real-time Detection Stream
            <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              Live {realTimeData.length}/20
            </span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimeData}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="detections" 
                  stroke="#3B82F6" 
                  fillOpacity={1}
                  fill="url(#colorDetections)"
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="anomalies" 
                  stroke="#EF4444" 
                  fillOpacity={1}
                  fill="url(#colorAnomalies)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Predictive Analytics */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            Predictive Anomaly Forecast
            <span className="ml-auto text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              AI-Powered
            </span>
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictiveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-white/80">Predicted (AI)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white/80">Actual</span>
            </div>
          </div>
        </motion.div>

        {/* Model Performance Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            ML Model Performance Matrix
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="model" stroke="rgba(255,255,255,0.6)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="precision" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recall" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Anomaly Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Anomaly Classification
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={anomalyTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {anomalyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Threat Intelligence Feed */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛡️</span>
          <h3 className="text-2xl font-bold text-white">Real-time Threat Intelligence</h3>
          <div className="ml-auto px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded-full font-bold">
            {threatIntel.length} Active Threats
          </div>
        </div>
        
        <div className="space-y-4">
          {threatIntel.map((threat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${
                threat.severity === "critical" ? "bg-red-500/10 border-red-500/30" :
                threat.severity === "high" ? "bg-orange-500/10 border-orange-500/30" :
                "bg-yellow-500/10 border-yellow-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    threat.severity === "critical" ? "bg-red-500/20" :
                    threat.severity === "high" ? "bg-orange-500/20" :
                    "bg-yellow-500/20"
                  }`}>
                    <span className="text-2xl">
                      {threat.type === "APT" ? "☠️" : threat.type === "Malware" ? "🦠" : "🤖"}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white mb-1">{threat.name}</div>
                    <div className="text-sm text-white/60">
                      {threat.type} • {threat.indicators} indicators • First seen: {threat.first_seen}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold mb-1 ${
                    threat.severity === "critical" ? "text-red-400" :
                    threat.severity === "high" ? "text-orange-400" :
                    "text-yellow-400"
                  }`}>
                    {threat.severity.toUpperCase()}
                  </div>
                  <div className="text-2xl font-bold text-white">{threat.confidence}%</div>
                  <div className="text-xs text-white/60">confidence</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions - Ultra-Advanced */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-4 gap-4"
      >
        {[
          { title: "Run Deep Analysis", description: "AI-powered anomaly scan", icon: "🔬", color: "blue", action: "/dashboard/analytics-advanced" },
          { title: "Export Reports", description: "Generate comprehensive reports", icon: "📊", color: "green", action: "/dashboard/analytics" },
          { title: "Configure AI Models", description: "Tune detection parameters", icon: "⚙️", color: "purple", action: "/dashboard/analytics-advanced" },
          { title: "View Forensics", description: "Deep-dive investigation", icon: "🔍", color: "orange", action: "/dashboard/forensics" }
        ].map((action, index) => (
          <motion.button
            key={action.title}
            onClick={() => router.push(action.action)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className={`p-6 rounded-xl text-left transition-all duration-300 ${
              action.color === 'blue' ? 'bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/20' :
              action.color === 'green' ? 'bg-green-500/10 border-2 border-green-500/30 hover:border-green-500/60 hover:bg-green-500/20' :
              action.color === 'purple' ? 'bg-purple-500/10 border-2 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20' :
              'bg-orange-500/10 border-2 border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-500/20'
            }`}
          >
            <span className="text-4xl mb-3 block">{action.icon}</span>
            <h4 className="text-lg font-bold text-white mb-2">{action.title}</h4>
            <p className="text-white/70 text-sm">{action.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* System Status Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4"
      >
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-400">{metrics.data_processed_gb.toFixed(1)} GB</div>
            <div className="text-xs text-white/60">Data Processed</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">{metrics.predictions_made.toLocaleString()}</div>
            <div className="text-xs text-white/60">Predictions Made</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-400">{metrics.true_positives}</div>
            <div className="text-xs text-white/60">True Positives</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-400">{metrics.false_positives}</div>
            <div className="text-xs text-white/60">False Positives</div>
          </div>
          <div>
            <div className="text-lg font-bold text-pink-400">{metrics.anomaly_types_detected}</div>
            <div className="text-xs text-white/60">Anomaly Types</div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan-400">99.7%</div>
            <div className="text-xs text-white/60">Uptime</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

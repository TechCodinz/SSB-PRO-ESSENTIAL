// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

interface UltraPremiumDashboardProps {
  realTimeData?: any[];
  isLive?: boolean;
}

export default function UltraPremiumDashboard({ realTimeData = [], isLive = true }: UltraPremiumDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiInsights, setAiInsights] = useState([
    {
      id: 1,
      type: "performance",
      title: "Model Accuracy Improved",
      description: "LSTM model shows 2.3% improvement after retraining",
      confidence: 94.2,
      timestamp: new Date(),
      icon: "📈"
    },
    {
      id: 2,
      type: "anomaly",
      title: "Unusual Pattern Detected",
      description: "Spike in financial transactions at 14:32 UTC",
      confidence: 87.5,
      timestamp: new Date(),
      icon: "⚠️"
    },
    {
      id: 3,
      type: "optimization",
      title: "Threshold Auto-Adjusted",
      description: "Sensitivity optimized for current data patterns",
      confidence: 91.8,
      timestamp: new Date(),
      icon: "⚙️"
    }
  ]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const performanceData = [
    { time: "00:00", accuracy: 98.2, latency: 0.8, throughput: 1200 },
    { time: "04:00", accuracy: 98.5, latency: 0.7, throughput: 1150 },
    { time: "08:00", accuracy: 99.1, latency: 0.6, throughput: 1300 },
    { time: "12:00", accuracy: 98.8, latency: 0.9, throughput: 1400 },
    { time: "16:00", accuracy: 99.3, latency: 0.5, throughput: 1500 },
    { time: "20:00", accuracy: 98.9, latency: 0.7, throughput: 1350 },
    { time: "24:00", accuracy: 99.1, latency: 0.6, throughput: 1250 }
  ];

  const modelPerformance = [
    { model: "Isolation Forest", accuracy: 98.7, speed: 0.8, usage: 35 },
    { model: "LOF", accuracy: 96.4, speed: 1.2, usage: 25 },
    { model: "One-Class SVM", accuracy: 94.2, speed: 2.1, usage: 20 },
    { model: "Z-Score", accuracy: 92.1, speed: 0.3, usage: 12 },
    { model: "LSTM", accuracy: 97.2, speed: 3.5, usage: 8 }
  ];

  return (
    <div className="space-y-8">
      {/* Live Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-green-400 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">Live Monitoring Dashboard</h2>
              <p className="text-white/70">Real-time anomaly detection system status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-sm text-white/60">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Detections/sec", value: "1,247", change: "+12%", icon: "⚡", color: "blue" },
          { label: "Accuracy", value: "99.1%", change: "+0.3%", icon: "🎯", color: "green" },
          { label: "Avg Latency", value: "0.8ms", change: "-15%", icon: "🚀", color: "purple" },
          { label: "System Health", value: "100%", change: "Stable", icon: "💎", color: "green" }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                metric.color === 'green' ? 'bg-green-500/20 text-green-400' :
                metric.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                metric.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
            <div className="text-sm text-white/60">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Real-time Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Performance Trends (24h)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#3B82F6" 
                  fill="rgba(59, 130, 246, 0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Model Performance */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            Model Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="model" stroke="rgba(255,255,255,0.6)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="accuracy" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Feed */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤖</span>
          <h3 className="text-2xl font-bold text-white">AI-Powered Insights</h3>
          <div className="ml-auto px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
            LIVE
          </div>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {aiInsights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <span className="text-2xl">{insight.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-white">{insight.title}</h4>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-white/80 text-sm mb-2">{insight.description}</p>
                  <div className="text-xs text-white/60">
                    {insight.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {[
          { title: "Run Analysis", description: "Start new anomaly detection", icon: "🔬", color: "blue" },
          { title: "View Reports", description: "Download detailed analytics", icon: "📊", color: "green" },
          { title: "Configure Models", description: "Adjust detection parameters", icon: "⚙️", color: "purple" }
        ].map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-6 rounded-xl text-left transition-all duration-300 ${
              action.color === 'blue' ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50' :
              action.color === 'green' ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' :
              'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
            } border`}
          >
            <span className="text-3xl mb-3 block">{action.icon}</span>
            <h4 className="text-lg font-bold text-white mb-2">{action.title}</h4>
            <p className="text-white/70 text-sm">{action.description}</p>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
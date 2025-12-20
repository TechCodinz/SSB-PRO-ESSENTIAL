// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

export default function UltraPremiumAnalytics() {
  const [realTimeData, setRealTimeData] = useState([]);
  const [isLive, setIsLive] = useState(true);

  // Generate realistic real-time data
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint = {
        time: now.toLocaleTimeString(),
        timestamp: now.getTime(),
        anomalies: Math.floor(Math.random() * 50) + 10,
        accuracy: 95 + Math.random() * 4,
        throughput: Math.floor(Math.random() * 1000) + 500,
        latency: Math.random() * 10 + 1,
        confidence: 90 + Math.random() * 9
      };

      setRealTimeData(prev => {
        const updated = [...prev, newDataPoint].slice(-20); // Keep last 20 points
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const detectionMethods = [
    { name: "Isolation Forest", value: 35, color: "#3B82F6" },
    { name: "LOF", value: 25, color: "#8B5CF6" },
    { name: "One-Class SVM", value: 20, color: "#10B981" },
    { name: "Z-Score", value: 12, color: "#F59E0B" },
    { name: "LSTM", value: 8, color: "#EF4444" }
  ];

  const performanceMetrics = [
    { metric: "Detection Speed", value: "0.8ms", trend: "+12%", color: "green" },
    { metric: "Accuracy Rate", value: "99.1%", trend: "+0.3%", color: "green" },
    { metric: "False Positives", value: "0.2%", trend: "-15%", color: "green" },
    { metric: "Throughput", value: "1.2M/sec", trend: "+25%", color: "green" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Real-Time Analytics Dashboard
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Live monitoring of your anomaly detection system with ultra-precise metrics and AI-powered insights
        </p>
      </motion.div>

      {/* Live Status Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
          <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl max-w-md mx-auto">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 bg-green-400 rounded-full"
          />
          <span className="text-green-400 font-bold">LIVE MONITORING ACTIVE</span>
            <button
              onClick={() => setIsLive(!isLive)}
              className="px-3 py-1 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
            >
              {isLive ? "Pause" : "Resume"}
            </button>
        </div>
      </motion.div>

      {/* Performance Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.metric}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="text-sm text-white/60 mb-2">{metric.metric}</div>
            <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
            <div className={`text-sm ${metric.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
              {metric.trend} from last hour
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Real-time Charts */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Anomaly Detection Trend */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Real-Time Anomaly Detection
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="time" 
                  stroke="rgba(255,255,255,0.6)"
                  fontSize={12}
                />
                <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="anomalies" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Detection Methods Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Detection Method Usage
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={detectionMethods}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {detectionMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {detectionMethods.map((method, index) => (
              <div key={method.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: method.color }}
                />
                <span className="text-white/80">{method.name}</span>
                <span className="text-white/60 ml-auto">{method.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
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
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-green-400 font-bold mb-2">✅ Pattern Detected</div>
              <div className="text-white/80 text-sm">
                Unusual spike in financial transactions detected at 14:32. 
                Confidence: 94.2% | Recommended action: Review transaction logs
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-blue-400 font-bold mb-2">📊 Performance Alert</div>
              <div className="text-white/80 text-sm">
                Detection accuracy improved by 2.3% after model retraining. 
                New baseline established for Q4 metrics.
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-yellow-400 font-bold mb-2">⚠️ Threshold Adjustment</div>
              <div className="text-white/80 text-sm">
                Sensitivity automatically adjusted based on data patterns. 
                False positive rate reduced by 15% while maintaining detection accuracy.
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-purple-400 font-bold mb-2">🔮 Predictive Alert</div>
              <div className="text-white/80 text-sm">
                Model predicts 23% increase in anomalies during next 2 hours. 
                Consider scaling resources for optimal performance.
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
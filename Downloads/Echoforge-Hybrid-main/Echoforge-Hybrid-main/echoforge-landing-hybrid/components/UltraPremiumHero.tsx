// @ts-nocheck
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function UltraPremiumHero() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = useMemo(() => [
    { icon: "🧠", title: "Neural Networks", desc: "Deep Learning Models" },
    { icon: "⚡", title: "Real-time", desc: "Sub-second Detection" },
    { icon: "🔬", title: "Quantum Ready", desc: "Future-Proof Tech" },
    { icon: "🌐", title: "Federated", desc: "Privacy-Preserving" },
    { icon: "🎯", title: "99.1% Accuracy", desc: "Industry Leading" },
    { icon: "🚀", title: "Ultra-Fast", desc: "Millisecond Response" }
  ], []);

  const featureCount = features.length;

  useEffect(() => {
    if (featureCount === 0) {
      return;
    }
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featureCount);
    }, 2000);
    return () => clearInterval(interval);
  }, [featureCount]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1020] via-[#1a1f3a] to-[#0b1020]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center"
        >
          {/* Ultra-Premium Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl"
              >
                🌌
              </motion.div>
              <div className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                EchoeForge
              </div>
            </div>
            <div className="text-2xl font-bold text-white/90 mb-4">
              Next-Generation AI Anomaly Detection
            </div>
            <div className="text-lg text-white/70 max-w-3xl mx-auto">
              Powered by quantum-enhanced neural networks, federated learning, and real-time consensus algorithms
            </div>
          </motion.div>

          {/* Rotating Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-4">{features[currentFeature].icon}</div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {features[currentFeature].title}
                  </div>
                  <div className="text-white/70">
                    {features[currentFeature].desc}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Ultra-Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/get-access" className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-white text-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                🚀 Start Free Trial
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
              </span>
            </Link>

            <Link href="/demo" className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl font-bold text-white text-lg hover:bg-white/20 transition-all duration-300">
              🎥 Watch Demo
            </Link>
          </motion.div>

          {/* Real-time Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { label: "Detections/sec", value: "1.2M+", icon: "⚡" },
              { label: "Accuracy", value: "99.1%", icon: "🎯" },
              { label: "Response Time", value: "<1ms", icon: "🚀" },
              { label: "Uptime", value: "99.99%", icon: "💎" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                className="text-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Action Elements */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 2 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl"
        >
          💬
        </motion.button>
      </motion.div>
    </div>
  );
}

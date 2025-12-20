"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import UltraPremiumPricing from "@/components/UltraPremiumPricing";
import TrustMarquee from "@/components/TrustMarquee";
import ExperiencePillars from "@/components/ExperiencePillars";
import LiveOpsCommandCenter from "@/components/LiveOpsCommandCenter";
import { trackCta, trackEvent, trackNavigation } from "@/lib/analytics";

const USE_CASES = {
  financial: {
    icon: "💰",
    title: "Financial Fraud Detection",
    description: "Detect credit card fraud, money laundering, and suspicious transactions in real-time",
    features: ["Credit card fraud patterns", "Unusual transaction spikes", "Money laundering detection", "Real-time payment anomalies"],
    savings: "Save $10,000+ monthly in fraud losses",
    accuracy: "99.3%",
  },
  cybersecurity: {
    icon: "🛡️",
    title: "Cybersecurity Threats",
    description: "Identify network intrusions, DDoS attacks, and insider threats before they cause damage",
    features: ["Network intrusion attempts", "DDoS attack patterns", "Malware behavior detection", "Insider threat monitoring"],
    savings: "Prevent data breaches worth millions",
    accuracy: "98.7%",
  },
  deepfake: {
    icon: "🎭",
    title: "Deepfake Detection",
    description: "Verify digital content authenticity with AI-powered deepfake detection",
    features: ["AI-generated video detection", "Synthetic audio identification", "Image manipulation detection", "Real-time verification"],
    savings: "Essential for content verification",
    accuracy: "97.2%",
  },
  iot: {
    icon: "🏭",
    title: "IoT & Industrial",
    description: "Monitor sensors and predict equipment failures before they happen",
    features: ["Sensor data anomalies", "Equipment failure prediction", "Production line monitoring", "Environmental alerts"],
    savings: "Prevent costly equipment downtime",
    accuracy: "96.4%",
  },
} as const;

type UseCaseKey = keyof typeof USE_CASES;

type LandingOverviewResponse = {
  metrics: {
    totalUsers: number;
    totalAnalyses: number;
    totalAnomalies: number;
    anomaliesLast24h: number;
    activeInvestigations: number;
    avgProcessingMs: number;
    avgAccuracy: number;
    uptimePercent: number;
  };
  recentAnalyses: Array<{
    id: string;
    type: string;
    status: string;
    anomaliesFound: number;
    processingTime: number | null;
    createdAt: string;
  }>;
  marketplace: {
    topListings: Array<{
      id: string;
      title: string;
      category: string;
      price: number;
      currency: string;
      purchasesCount: number;
      downloads: number;
      rating: number | null;
    }>;
  };
  updatedAt: string;
};

export default function Home() {
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const [appStatus, setAppStatus] = useState<"checking" | "online" | "offline">("checking");
  const [heroStats, setHeroStats] = useState({
    users: 0,
    analyses: 0,
    uptime: "--",
    anomalies24h: 0,
    avgProcessingMs: 0,
  });
  const [overview, setOverview] = useState<LandingOverviewResponse | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UseCaseKey>("financial");
  const previousStatusRef = useRef({ api: "checking", app: "checking" });
  const useCaseKeys = useMemo(() => Object.keys(USE_CASES) as UseCaseKey[], []);
  const activeCase = USE_CASES[activeTab];

  const heroStatStyles: Record<"green" | "blue" | "purple" | "cyan", string> = {
    green: "bg-green-500/10 border-green-500/30",
    blue: "bg-blue-500/10 border-blue-500/30",
    purple: "bg-purple-500/10 border-purple-500/30",
    cyan: "bg-cyan-500/10 border-cyan-500/30",
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("health check failed");
        }
        const json = await res.json();
        setApiStatus(json?.services?.backend_api === "healthy" ? "online" : "offline");
        setAppStatus(json?.services?.nextjs === "healthy" ? "online" : "offline");
      } catch (error) {
        setApiStatus("offline");
        setAppStatus("offline");
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadOverview = async () => {
      try {
        const res = await fetch("/api/public/overview", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("overview request failed");
        }
        const json = (await res.json()) as LandingOverviewResponse;
        if (!isMounted) return;
        setOverview(json);
        setHeroStats({
          users: json.metrics.totalUsers ?? 0,
          analyses: json.metrics.totalAnalyses ?? 0,
          uptime: `${json.metrics.uptimePercent.toFixed(2)}%`,
          anomalies24h: json.metrics.anomaliesLast24h ?? 0,
          avgProcessingMs: json.metrics.avgProcessingMs ?? 0,
        });
        setOverviewError(null);
      } catch (error) {
        if (!isMounted) return;
        console.error("public overview error", error);
        setOverviewError("Unable to load live platform metrics right now.");
      }
    };

    loadOverview();
    const interval = setInterval(loadOverview, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (apiStatus === "checking" || appStatus === "checking") return;
    const previous = previousStatusRef.current;
    if (previous.api === apiStatus && previous.app === appStatus) return;
    trackEvent("landing_status_update", { apiStatus, appStatus });
    previousStatusRef.current = { api: apiStatus, app: appStatus };
  }, [apiStatus, appStatus]);

  return (
    <main className="overflow-x-hidden -mt-16">
      {/* Ultra-Modern Status Banner - Inline with page content */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border-b border-green-500/20"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-2 h-2 rounded-full ${apiStatus === "online" ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-red-400"}`}
              />
              <span className="font-semibold">API: {apiStatus === "online" ? "🟢 Online" : "🔴 Offline"}</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className={`w-2 h-2 rounded-full ${appStatus === "online" ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-red-400"}`}
              />
              <span className="font-semibold">System: {appStatus === "online" ? "🟢 Operational" : "🔴 Down"}</span>
            </div>
          </div>
          <div className="hidden sm:flex text-white/80 font-medium items-center gap-4">
            <span>⚡ {heroStats.uptime !== "--" ? heroStats.uptime : "—"} Uptime</span>
            <span>
              👥{" "}
              {heroStats.users
                ? `${heroStats.users.toLocaleString()}+ Secured Accounts`
                : "Global enterprises secured"}
            </span>
            <span>
              📊{" "}
              {heroStats.analyses
                ? `${heroStats.analyses.toLocaleString()} Analyses`
                : "Continuous intelligence"}
            </span>
          </div>
        </div>
      </motion.div>
      {overviewError && (
        <div className="bg-amber-500/10 border-t border-b border-amber-500/30 text-center text-xs sm:text-sm text-amber-200 py-2">
          {overviewError}
        </div>
      )}

      {/* Hero Section - Ultra-Modern */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0 bg-grid-white/5"></div>
        
        {/* Floating particles */}
        {typeof window !== 'undefined' && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-8"
            >
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-semibold">AI-Powered Anomaly Detection Platform</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Detect Anomalies
              </span>
              <br />
              <span className="text-white">Before They Cost You</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Powered by <span className="text-blue-400 font-bold">11 Advanced ML Models</span> achieving{" "}
              <span className="text-green-400 font-bold">99.3% accuracy</span>. Detect fraud, threats, and anomalies in{" "}
              <span className="text-purple-400 font-bold">real-time</span>.
            </motion.p>

            {/* Stats Pills */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {[
                {
                  icon: "👥",
                  label: heroStats.users
                    ? `${heroStats.users.toLocaleString()}+ Secured Accounts`
                    : "Securing mission-critical teams",
                  color: "green",
                },
                {
                  icon: "📊",
                  label: heroStats.analyses
                    ? `${heroStats.analyses.toLocaleString()} Analyses Completed`
                    : "Enterprise-scale anomaly detection",
                  color: "blue",
                },
                {
                  icon: "⚡",
                  label: heroStats.avgProcessingMs
                    ? `${heroStats.avgProcessingMs}ms Avg Processing`
                    : "Millisecond-level inference",
                  color: "purple",
                },
                {
                  icon: "🛡️",
                  label: heroStats.anomalies24h
                    ? `${heroStats.anomalies24h.toLocaleString()} Threats Neutralised (24h)`
                    : "Autonomous remediation across regions",
                  color: "cyan",
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`px-6 py-3 border ${heroStatStyles[stat.color as keyof typeof heroStatStyles] ?? heroStatStyles.green} rounded-full flex items-center gap-2`}
                >
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="font-bold">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <motion.button
                onClick={() => {
                  trackCta("hero_primary_cta", { destination: "/get-access" });
                  router.push('/get-access');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/50 transition-all"
              >
                🚀 Start Free Trial
              </motion.button>
              <motion.button
                onClick={() => {
                  trackCta("hero_demo_cta", { destination: "/demo" });
                  router.push('/demo');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 text-white font-bold text-lg rounded-xl transition-all"
              >
                🎮 Try Live Demo
              </motion.button>
              <motion.button
                onClick={() => {
                  trackNavigation("/documentation", { source: "hero_docs" });
                  router.push('/documentation');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-xl transition-all"
              >
                📚 View Docs
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-sm text-white/60 mt-8"
            >
              No credit card required • 14-day free trial • Cancel anytime
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-white/60 text-sm">Scroll to explore</div>
          <div className="text-3xl">↓</div>
        </motion.div>
      </section>

      {overview && (
        <section className="relative z-10 max-w-6xl mx-auto -mt-16 sm:-mt-24 px-4">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                title: "Total analyses",
                value: overview.metrics.totalAnalyses.toLocaleString(),
                helper: "Real workloads processed",
                gradient: "from-blue-500/60 via-sky-500/40 to-cyan-500/30",
              },
              {
                title: "Threats neutralised",
                value: overview.metrics.totalAnomalies.toLocaleString(),
                helper: "Across every tenant",
                gradient: "from-emerald-500/60 via-green-500/40 to-lime-500/30",
              },
              {
                title: "Active investigations",
                value: overview.metrics.activeInvestigations.toLocaleString(),
                helper: "Live anomaly runs",
                gradient: "from-purple-500/60 via-fuchsia-500/40 to-pink-500/30",
              },
              {
                title: "Platform success rate",
                value: `${overview.metrics.uptimePercent.toFixed(2)}%`,
                helper: "Completed without incident",
                gradient: "from-amber-500/60 via-orange-500/40 to-red-500/30",
              },
            ].map((metric) => (
              <div
                key={metric.title}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${metric.gradient} px-6 py-6 text-white/85 shadow-lg shadow-black/20 backdrop-blur-sm`}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/70">{metric.title}</p>
                <p className="mt-4 text-3xl font-black">{metric.value}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/60">{metric.helper}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.5em] text-white/40">Trusted Across Mission-Critical Sectors</p>
          <h2 className="mt-2 text-3xl font-black text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text">
            1,200+ teams calibrate their defenses with EchoForge
          </h2>
        </div>
        <TrustMarquee />
      </section>

      {/* Use Cases - Interactive Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                What Can EchoForge Detect?
              </span>
            </h2>
            <p className="text-xl text-white/70">
              Industry-leading anomaly detection across multiple domains
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {useCaseKeys.map((key) => {
              const useCase = USE_CASES[key];
              return (
              <motion.button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  trackEvent("landing_use_case_tab", { tab: key });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === key
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white/5 hover:bg-white/10 text-white/80"
                }`}
              >
                <span className="text-2xl mr-2">{useCase.icon}</span>
                {useCase.title.split(' ')[0]}
              </motion.button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="text-6xl mb-6">{activeCase.icon}</div>
                  <h3 className="text-3xl font-bold mb-4">{activeCase.title}</h3>
                  <p className="text-lg text-white/80 mb-6">{activeCase.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {activeCase.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-green-400 text-xl">✓</span>
                        <span className="text-white/90">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 mb-6">
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="text-sm text-white/70">Accuracy</div>
                      <div className="text-2xl font-bold text-green-400">{activeCase.accuracy}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-green-400 font-bold">{activeCase.savings}</div>
                    </div>
                  </div>

                <button
                  onClick={() => {
                    trackCta("use_case_try_detection", { tab: activeTab });
                    router.push('/get-access');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                >
                  Try This Detection →
                </button>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-6">
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 40 + 60}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg flex items-center px-4"
                        >
                          <span className="text-sm text-white/80">Detection #{i + 1}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <ExperiencePillars />
      </div>

      {/* Technology Section */}
      <section className="bg-gradient-to-b from-blue-500/5 to-purple-500/5 py-32">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  11 Advanced ML Models
                </span>
              </h2>
              <p className="text-xl text-white/70">
                Ensemble intelligence for unmatched accuracy
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Isolation Forest", accuracy: 98.7, icon: "🌲" },
                { name: "LSTM Autoencoder", accuracy: 97.2, icon: "🧠" },
                { name: "LOF", accuracy: 96.4, icon: "🎯" },
                { name: "One-Class SVM", accuracy: 94.2, icon: "🔷" },
                { name: "Z-Score", accuracy: 92.1, icon: "📈" },
                { name: "Modified Z-Score", accuracy: 93.5, icon: "📊" },
                { name: "IQR Method", accuracy: 91.8, icon: "📉" },
                { name: "Moving Average", accuracy: 89.5, icon: "〰️" },
                { name: "Grubbs Test", accuracy: 90.3, icon: "🔍" },
                { name: "GESD Test", accuracy: 91.2, icon: "🔬" },
                { name: "Ensemble", accuracy: 99.3, icon: "🏆" }
              ].map((model, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 text-center hover:border-purple-500/50 transition-all"
                >
                  <div className="text-4xl mb-3">{model.icon}</div>
                  <div className="font-bold mb-2">{model.name}</div>
                  <div className="text-2xl font-black text-green-400">{model.accuracy}%</div>
                  <div className="text-xs text-white/60">accuracy</div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center"
            >
              <button
                onClick={() => {
                  trackNavigation('/features', { source: 'models_section' });
                  router.push('/features');
                }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all"
              >
                Explore All Features →
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-32">
        <div className="max-w-6xl mx-auto px-4">
          <LiveOpsCommandCenter />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32">
        <UltraPremiumPricing />
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Stop Anomalies</span>?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join 1,247+ companies using EchoForge to detect threats before they cause damage
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => {
                  trackCta("final_primary_cta", { destination: "/get-access" });
                  router.push('/get-access');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/50 transition-all"
              >
                🚀 Start Free Trial
              </motion.button>
              <motion.button
                onClick={() => {
                  trackCta("final_contact_sales", { destination: "/contact" });
                  router.push('/contact');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border-2 border-white/20 text-white font-bold text-lg rounded-xl transition-all"
              >
                💬 Talk to Sales
              </motion.button>
            </div>
            <p className="text-sm text-white/60 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

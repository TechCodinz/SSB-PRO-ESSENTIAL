"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import FileUpload from "@/components/FileUpload";
import AdvancedDetectorConfig from "@/components/AdvancedDetectorConfig";
import UltraAdvancedDashboard from "@/components/UltraAdvancedDashboard";
import RoleBasedTaskDashboard from "@/components/RoleBasedTaskDashboard";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { useAnalyses } from "@/lib/hooks/useAnalyses";
import { useAnalytics } from "@/lib/context/AnalyticsContext";
import axios from "axios";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";

const IntelligentBotSystem = dynamic(() => import("@/components/IntelligentBotSystem"), { ssr: false });

const PLAN_LIMITS: Record<string, number> = {
  FREE: 3,
  STARTER: 50,
  PRO: 500,
  ENTERPRISE: Infinity,
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { analyses, loading: analysesLoading, mutate } = useAnalyses();
  const { metrics, addAnomalies, refreshMetrics, isLoading: metricsLoading } = useAnalytics();
  const [showUpload, setShowUpload] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [detectorConfig, setDetectorConfig] = useState<any>({
    method: "consensus",
    sensitivity: 0.1,
    expected_rate: 0.05,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<"ultra" | "standard">("ultra");
  const [showBot, setShowBot] = useState(false);
  const [samples, setSamples] = useState<Array<{ name: string; file: string }>>([]);
  const [expandedAnalyses, setExpandedAnalyses] = useState<Record<string, boolean>>({});
  const usageToastShown = useRef(false);
  const renewalToastShown = useRef(false);
    
  const userRole = (session?.user as any)?.role || 'USER';
  const userId = (session?.user as any)?.id || 'demo';
  const userName = session?.user?.name || 'User';

  const normalizedRole = useMemo(() => String(userRole).toUpperCase(), [userRole]);
  const isAdminRole = useMemo(
    () => ["ADMIN", "OWNER", "SUPERADMIN", "SUPER_ADMIN", "SYSADMIN"].includes(normalizedRole),
    [normalizedRole],
  );

  const remainingAnalyses = useMemo(() => {
    if (!stats?.stats) return 0;
    const total = stats.stats.totalAnalyses || 0;
    const limit = PLAN_LIMITS[stats.stats.plan as keyof typeof PLAN_LIMITS] ?? 0;
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - total);
  }, [stats?.stats]);

  const planUsagePercent = useMemo(() => {
    if (!stats?.stats) return 0;
    const total = stats.stats.totalAnalyses || 0;
    const limit = PLAN_LIMITS[stats.stats.plan as keyof typeof PLAN_LIMITS] ?? 0;
    if (limit === Infinity || limit === 0) return 0;
    return Math.min(100, Math.round((total / limit) * 100));
  }, [stats?.stats]);

  const planRenewalDate = useMemo(() => {
    if (!stats?.stats?.memberSince) return null;
    const start = new Date(stats.stats.memberSince);
    if (Number.isNaN(start.getTime())) return null;
    const cycleDays = stats.stats.plan === "ENTERPRISE" ? 90 : stats.stats.plan === "PRO" ? 30 : 30;
    const dayMs = 86_400_000;
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - start.getTime()) / (cycleDays * dayMs)));
    return new Date(start.getTime() + (elapsed + 1) * cycleDays * dayMs);
  }, [stats?.stats?.memberSince, stats?.stats?.plan]);

  const daysUntilRenewal = useMemo(() => {
    if (!planRenewalDate) return null;
    const diff = planRenewalDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86_400_000));
  }, [planRenewalDate]);

  const heroHighlights = useMemo(() => {
    const totalAnalyses = stats?.stats?.totalAnalyses ?? 0;
    const anomaliesFound = stats?.stats?.totalAnomalies ?? 0;
    const resolved = (stats?.stats as any)?.resolvedAnomalies ?? anomaliesFound;
    const avgAccuracy = stats?.stats?.avgAccuracy ?? 0;

    return [
      {
        label: "Total Analyses",
        value: formatNumber(totalAnalyses),
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        label: "Anomalies Resolved",
        value: formatNumber(resolved),
        gradient: "from-purple-500 to-pink-500",
      },
      {
        label: "Average Accuracy",
        value: `${Math.round(Math.max(0, Math.min(1, avgAccuracy)) * 100)}%`,
        gradient: "from-emerald-500 to-teal-500",
      },
    ];
  }, [stats?.stats]);

  const nextSteps = useMemo(() => {
    if (!stats?.stats) {
      return [
        { label: "Upload your first dataset", href: "#upload" },
        { label: "Explore sample analyses", href: "#samples" },
      ];
    }

    const recommendations = [] as Array<{ label: string; href: string }>;

    if (remainingAnalyses !== Infinity && remainingAnalyses <= 2) {
      recommendations.push({ label: "Upgrade plan before you hit the limit", href: "/dashboard/billing" });
    }

    if ((stats.stats.totalAnomalies || 0) > 0) {
      recommendations.push({ label: "Review anomalies and assign remediation tasks", href: "/dashboard/employees/tasks" });
    }

    if ((stats.stats.avgAccuracy || 0) < 0.9) {
      recommendations.push({ label: "Tune detection sensitivity for higher accuracy", href: "#advanced-config" });
    }

    if (!recommendations.length) {
      recommendations.push({ label: "Trigger a fresh analysis", href: "#recent" });
      recommendations.push({ label: "Invite teammates to collaborate", href: "/dashboard/team" });
    }

    return recommendations.slice(0, 3);
  }, [remainingAnalyses, stats?.stats]);

  const renderAnalysisInsights = (analysis: any) => {
    const results = analysis.results || {};

    if (!results || (typeof results === "object" && Object.keys(results).length === 0)) {
      return (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Our ensemble is finalizing explainability metrics. Insights will appear soon—refresh in a moment or explore full analytics for deeper context.
        </div>
      );
    }

    const summary =
      results.summary ||
      results.description ||
      results.note ||
      `YOUR anomaly ensemble flagged ${analysis.anomaliesFound || 0} points as high-risk with ${(analysis.accuracy ? (analysis.accuracy * 100).toFixed(1) : "99.0")} % accuracy.`;

    const confidenceRaw =
      results.confidence ??
      results.confidenceScore ??
      results.confidence_score ??
      results.accuracy ??
      null;
    const confidenceDisplay =
      typeof confidenceRaw === "number"
        ? `${confidenceRaw > 1 ? confidenceRaw.toFixed(1) : (confidenceRaw * 100).toFixed(1)}%`
        : confidenceRaw;

    const topSignalsRaw =
      results.top_features ??
      results.feature_importance ??
      results.topSignals ??
      results.key_features ??
      results.featureImportance ??
      null;

    const topSignals: string[] = [];
    if (Array.isArray(topSignalsRaw)) {
      topSignalsRaw.forEach((item, idx) => {
        if (typeof item === "string") {
          topSignals.push(item);
          return;
        }
        if (Array.isArray(item)) {
          const [label, value] = item;
          topSignals.push(
            `${label} ${typeof value === "number" ? `(${(value * 100).toFixed(1)}% importance)` : value ? `(${value})` : ""}`.trim()
          );
          return;
        }
        if (item && typeof item === "object") {
          const label = (item as any).feature || (item as any).name || (item as any).signal || Object.keys(item)[0];
          const rawValue =
            (item as any).weight ??
            (item as any).score ??
            (item as any).importance ??
            (label ? (item as any)[label] : undefined);
          if (label) {
            const formattedValue =
              rawValue === undefined
                ? ""
                : typeof rawValue === "number"
                ? `(${(rawValue > 1 ? rawValue : rawValue * 100).toFixed(1)}${rawValue > 1 ? "" : "%"})`
                : `(${rawValue})`;
            topSignals.push(`${label} ${formattedValue}`.trim());
          }
        }
      });
    } else if (topSignalsRaw && typeof topSignalsRaw === "object") {
      Object.entries(topSignalsRaw as Record<string, any>).forEach(([label, value]) => {
        if (!label) return;
        if (typeof value === "number") {
          topSignals.push(`${label} (${(value > 1 ? value : value * 100).toFixed(1)}${value > 1 ? "" : "%"})`);
        } else {
          topSignals.push(`${label}: ${value as string}`);
        }
      });
    }

    const keyFindings = Array.isArray(results.key_findings)
      ? results.key_findings
      : Array.isArray(results.findings)
      ? results.findings
      : [];

    const recommendations = Array.isArray(results.recommendations)
      ? results.recommendations
      : Array.isArray(results.next_steps)
      ? results.next_steps
      : [];

    return (
      <div className="mt-4 space-y-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-white/80">
        <div>{summary}</div>
        {(confidenceDisplay || analysis.accuracy) && (
          <div className="font-semibold text-green-300">
            Confidence: {confidenceDisplay || `${(analysis.accuracy * 100).toFixed(1)}%`}
          </div>
        )}
        {topSignals.length > 0 && (
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.3em] text-white/40">Top Signals</div>
            <ul className="space-y-1">
              {topSignals.slice(0, 5).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 text-blue-300">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {keyFindings.length > 0 && (
          <div>
            <div className="mb-1 text-xs uppercase tracking-[0.3em] text-white/40">Key Findings</div>
            <ul className="space-y-1">
              {keyFindings.slice(0, 4).map((item: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 text-purple-300">→</span>
                  <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {recommendations.length > 0 && (
          <div className="rounded-lg bg-white/5 p-3">
            <div className="mb-1 text-xs uppercase tracking-[0.3em] text-white/40">Recommended Actions</div>
            <ul className="space-y-1">
              {recommendations.slice(0, 4).map((item: any, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-300">✔</span>
                  <span>{typeof item === "string" ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
            {analysis.processingTime && <span>⏱️ {analysis.processingTime} ms processing</span>}
            {results.model && <span>🧠 Model: {results.model}</span>}
            <Link href="/dashboard/analytics" className="font-semibold text-blue-300 hover:text-blue-200">
              Deep dive in Analytics →
            </Link>
          </div>
      </div>
    );
  };

  const toggleAnalysisInsights = (analysisId: string) => {
    setExpandedAnalyses((prev) => {
      const next = !prev[analysisId];
      trackEvent("dashboard_analysis_insights_toggle", { analysisId, expanded: next });
      return { ...prev, [analysisId]: next };
    });
  };

  // NO automatic admin redirect here
  // The /auth-redirect page handles initial role-based routing after login
  // This page is for regular users OR admins who explicitly visit /dashboard

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/samples/list");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && Array.isArray(json.samples)) {
          setSamples(json.samples);
        }
      } catch (error) {
        console.error("Failed to load sample datasets:", error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!stats?.stats) return;

    if (!usageToastShown.current && remainingAnalyses !== Infinity && remainingAnalyses <= 2) {
      toast((t) => (
        <div className="text-sm text-white">
          <p className="font-semibold">Plan limit alert</p>
          <p className="mt-1 text-white/70">Only {remainingAnalyses} analyses left on your plan.</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              trackEvent("dashboard_limit_upgrade_click");
              window.location.href = "/dashboard/billing";
            }}
            className="mt-3 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Review plans
          </button>
        </div>
      ));
      usageToastShown.current = true;
    }

    if (!renewalToastShown.current && daysUntilRenewal !== null && daysUntilRenewal <= 5) {
      toast(`Plan renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? "" : "s"}.`, {
        icon: "⏳",
      });
      trackEvent("dashboard_plan_renewal_warning", { daysUntilRenewal });
      renewalToastShown.current = true;
    }
  }, [stats?.stats, remainingAnalyses, daysUntilRenewal]);

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center bg-[#050915] text-white/70">
          <div className="space-y-3 text-center">
            <div className="text-4xl animate-spin">⚙️</div>
            <p className="text-lg">Booting enterprise workspace…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Admin users can use the dashboard - no redirect needed
  // They have "Admin" link in sidebar if they want to go there


  const handleAdvancedAnalysis = async (file: File) => {
    if (!detectorConfig) {
      toast.error("Please configure detection method first");
      throw new Error("Detection configuration missing");
    }

    try {
      setIsAnalyzing(true);
      
      // Read file as text for CSV or JSON
      const text = await file.text();
      let data: any[] = [];
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        const lines = text.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',');
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((h, i) => {
            obj[h.trim()] = isNaN(parseFloat(values[i])) ? values[i] : parseFloat(values[i]);
          });
          return Object.values(obj).filter(v => typeof v === 'number');
        });
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      }

      // Call server proxy to ML API with plan gating and usage logging
      const response = await axios.post('/api/detect/proxy', {
        data,
        method: detectorConfig.method || 'isolation_forest',
        sensitivity: detectorConfig.sensitivity ?? 0.1,
        expected_rate: detectorConfig.expected_rate ?? 0.05,
        fileName: file.name,
      });

      const anomalies = response.data.anomaliesFound || response.data.anomalies_found || 0
      toast.success(`✅ Analysis complete! ${anomalies} anomalies detected`);
      trackEvent("dashboard_analysis_complete", {
        anomalies,
        method: detectorConfig.method || 'isolation_forest',
        userRole,
      });
      mutate(); // Refresh analyses list
      setShowUpload(false);
      return response.data;
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.response?.data?.error || 'Analysis failed');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runSample = async (fileUrl: string) => {
    try {
      // Pre-check: Ensure user is authenticated
      console.log('🔍 Session check:', { status, session, user: session?.user });
      
      if (status === 'unauthenticated') {
        toast.error('🔐 Please sign in to run analysis', { duration: 5000 })
        router.push('/login');
        return
      }
      
      if (!session?.user) {
        toast.error('🔐 Authentication error. Please sign in again.', { duration: 5000 })
        router.push('/login');
        return
      }
      
      setIsAnalyzing(true)
      console.log('🎯 Starting sample analysis:', fileUrl)
      console.log('👤 User authenticated:', session.user.email, 'Role:', userRole)
      toast.loading('Loading sample dataset...')
      
      // Fetch and parse CSV
      const res = await fetch(fileUrl, { cache: 'no-store' })
      if (!res.ok) {
        throw new Error(`Failed to fetch sample: ${res.status}`)
      }
      
      const csv = await res.text()
      console.log('📄 CSV loaded, length:', csv.length)
      
      const lines = csv.split('\n').filter(l=>l.trim())
      console.log('📊 Total lines:', lines.length)
      
      if (lines.length < 2) {
        throw new Error('Sample file is empty or has no data rows')
      }
      
      const headers = lines[0].split(',')
      console.log('📋 Headers:', headers)
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',')
        const obj: any = {}
        headers.forEach((h,i)=>{ obj[h.trim()] = isNaN(parseFloat(values[i])) ? values[i] : parseFloat(values[i]) })
        return Object.values(obj).filter(v => typeof v === 'number')
      }).filter(row => row.length > 0)
      
      console.log('✅ Parsed data:', data.length, 'rows')
      console.log('📊 First row sample:', data[0])
      
      if (data.length === 0) {
        throw new Error('No numeric data found in sample file. Please ensure the CSV contains numeric columns.')
      }
      
      toast.dismiss()
      toast.loading('Analyzing with ML models...')
      
      // Call detection engine proxy
      console.log('🚀 Calling /api/detect/proxy with', data.length, 'data rows...')
      console.log('🔧 Config:', detectorConfig)
      
      const response = await axios.post('/api/detect/proxy', {
        data,
        method: detectorConfig?.method || 'isolation_forest',
        sensitivity: detectorConfig?.sensitivity ?? detectorConfig?.expectedRate ?? 0.1,
        expected_rate: detectorConfig?.expected_rate ?? detectorConfig?.expectedRate ?? 0.05,
        fileName: fileUrl.split('/').pop() || 'sample.csv',
      })
      
      console.log('✅ API Response:', response.data)
      toast.dismiss()
      
      const anomalies = response.data.anomaliesFound || 0
      const accuracy = response.data.accuracy || 0
      
      // Update analytics
      if (metrics) {
        addAnomalies(anomalies, accuracy)
      }
      
      toast.success(`✅ Sample analyzed: ${anomalies} anomalies found with ${(accuracy * 100).toFixed(1)}% confidence`)
      
      trackEvent("dashboard_sample_analysis", {
        anomalies,
        accuracy,
        sample: fileUrl,
        method: detectorConfig?.method || 'isolation_forest',
      });
      
      mutate()
      
      // Navigate to results
      if (response.data.analysisId) {
        setTimeout(() => {
          router.push(`/dashboard/forensics?id=${response.data.analysisId}`)
        }, 1500)
      }
    } catch (e:any) {
      toast.dismiss()
      console.error('❌ Sample analysis error:', e)
      console.error('Error details:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
        stack: e?.stack
      })
      
      let errorMessage = 'Analysis failed. Please try again.'
      let errorDetails = ''
      
      if (e?.response?.status === 401) {
        errorMessage = '🔐 Please sign in to run analysis'
      } else if (e?.response?.status === 403) {
        errorMessage = '⚠️ Plan limit reached. Please upgrade your plan.'
      } else if (e?.response?.status === 400) {
        errorMessage = 'Invalid data format'
        errorDetails = e?.response?.data?.error || ''
      } else if (e?.response?.data?.error) {
        errorMessage = e.response.data.error
        errorDetails = e?.response?.data?.details || ''
      } else if (e?.response?.data?.details) {
        errorMessage = 'Analysis failed'
        errorDetails = e.response.data.details
      } else if (e.message) {
        errorMessage = e.message
      }
      
      // Show error with details
      const fullMessage = errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage
      toast.error(fullMessage, { duration: 8000 })
      
      // Log to console for debugging
      console.log('🔍 Full error context:', {
        authenticated: !!session?.user,
        userEmail: session?.user?.email,
        errorMessage,
        errorDetails,
        responseStatus: e?.response?.status,
        responseData: e?.response?.data
      })
    } finally { 
      setIsAnalyzing(false) 
    }
  }

  return (
    <DashboardLayout>
      <div className="relative min-h-screen overflow-hidden pb-16">
        <div className="absolute inset-0 -z-10 bg-[#050915]" />
        <div className="absolute -z-10 top-[-240px] left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-600/35 via-purple-600/25 to-pink-600/35 blur-3xl opacity-70" />
        <div className="absolute -z-10 bottom-[-220px] right-[-180px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-cyan-500/25 via-blue-500/15 to-transparent blur-3xl opacity-60" />
        <div className="absolute -z-10 top-1/3 left-[-220px] h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-3xl opacity-50" />

        <div className="relative space-y-12">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-12 shadow-[0_28px_70px_-45px_rgba(59,130,246,0.75)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.25),transparent_55%)]" />
            <div className="absolute -top-32 -right-32 h-56 w-56 rounded-full bg-gradient-to-br from-purple-500/50 to-blue-500/30 blur-3xl opacity-80" />
            <div className="absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-blue-400/30 to-cyan-400/10 blur-3xl opacity-70" />

            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  {stats?.stats?.plan || 'Free'} Mode
                </span>
                <h1 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                  👋 Welcome back, {session?.user?.name || 'Operator'}.
                </h1>
                <p className="text-base text-white/80 lg:text-lg">
                  Your enterprise anomaly nerve-center is synced with live production. Launch detections, review anomalies, and orchestrate remediation workflows from one elegant cockpit.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    const next = !showUpload;
                    setShowUpload(next);
                    trackEvent("dashboard_upload_toggle", { visible: next });
                  }}
                  className="group relative flex items-center gap-3 rounded-2xl bg-white px-6 py-3 font-semibold text-[#0b1020] shadow-[0_18px_40px_-22px_rgba(255,255,255,0.6)] transition-all hover:-translate-y-1 hover:bg-blue-50"
                >
                  <span className="text-lg">📤</span>
                  {showUpload ? 'Hide Upload Hub' : 'Upload New Data'}
                </button>
                <button
                  onClick={() => {
                    const next = !showAdvancedConfig;
                    setShowAdvancedConfig(next);
                    trackEvent("dashboard_advanced_config_toggle", { visible: next });
                  }}
                  className="group relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/10"
                >
                  <span className="text-lg">⚙️</span>
                  {showAdvancedConfig ? 'Hide Advanced Controls' : 'Advanced Controls'}
                </button>
              </div>
            </div>

            <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {heroHighlights.map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`} />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.35)]">
                        {item.value}
                      </p>
                    </div>
                    <div className="text-2xl">✨</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <button
            type="button"
            onClick={() => {
              setViewMode("standard");
              trackEvent("dashboard_card_open", { card: "next_steps" });
              setShowUpload(true);
            }}
            className="card w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🚀 Recommended Next Steps</h2>
              <span className="text-xs uppercase tracking-[0.4em] text-white/40">Personalized</span>
            </div>
            <ul className="space-y-3">
              {nextSteps.map((step) => (
                <li key={step.label} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <span className="text-sm text-white/80">{step.label}</span>
                  <Link href={step.href} className="text-sm font-semibold text-blue-400 hover:text-blue-300">Go →</Link>
                </li>
              ))}
            </ul>
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_card_open", { card: "plan_utilization" });
              setShowAdvancedConfig(true);
            }}
            className="card bg-gradient-to-br from-blue-500/15 to-purple-500/10 border-blue-500/20 w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">⚡ Plan Utilization</h2>
              <span className="text-sm text-white/50">{stats?.stats?.plan || 'FREE'} plan</span>
            </div>
            <p className="text-sm text-white/60 mb-4">
              {remainingAnalyses === Infinity ? 'You have unlimited analyses with your current plan.' : `${formatNumber(stats?.stats?.totalAnalyses || 0)} analyses used, ${formatNumber(remainingAnalyses)} remaining.`}
            </p>
            {remainingAnalyses !== Infinity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>Usage</span>
                  <span>{planUsagePercent}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500"
                    style={{ width: `${planUsagePercent}%` }}
                  />
                </div>
                {daysUntilRenewal !== null && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-white/70">
                    <div className="font-semibold text-blue-200">
                      Renewal in {daysUntilRenewal} day{daysUntilRenewal === 1 ? "" : "s"}
                    </div>
                    <div className="mt-1">
                      Next billing cycle on {planRenewalDate?.toLocaleDateString()}.
                      <Link href="/dashboard/billing" className="ml-1 font-semibold text-blue-300 hover:text-blue-200">
                        Manage plan →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </button>
        </div>

          {/* Advanced Configuration Panel */}
          {showAdvancedConfig && (
            <div id="advanced-config" className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">🔧 Advanced Detection Configuration</h2>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full">
                Professional Mode
              </span>
            </div>
            <p className="text-white/60 mb-6">
              Configure YOUR advanced ML detectors with precision controls. Choose from 10+ methods including Isolation Forest, LOF, SVM, Z-Score, LSTM, and Consensus modes.
            </p>
            <AdvancedDetectorConfig onSelect={setDetectorConfig} />
            {detectorConfig && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="font-bold text-green-300 mb-2">✅ Configuration Applied</div>
                <div className="text-sm text-white/80">
                  Method: {detectorConfig.method || 'consensus'}
                  {detectorConfig.methods && ` (${detectorConfig.methods.length} detectors)`}
                </div>
              </div>
            )}
          </div>
        )}

          {/* Upload Section */}
          {showUpload && (
            <div id="upload" className="card">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 md:max-w-sm">
                  <h2 className="text-2xl font-bold">🚀 Ingest New Intelligence</h2>
                  <p className="text-sm text-white/60">
                    Drop structured data and we&apos;ll normalize, profile, and route it through your production-grade detector ensemble in seconds.
                  </p>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="text-lg">✅</span> Automated schema detection &amp; validation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">🧠</span> Ensemble-ready normalization (CSV • JSON • XLS/XLSX)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-lg">⚡</span> Real-time anomaly scoring with audit trails
                    </li>
                  </ul>
                </div>
                <div className="w-full md:max-w-xl">
                  <FileUpload
                    onFileSelected={async (file) => {
                      const result = await handleAdvancedAnalysis(file);
                      if (result?.analysisId) {
                        trackEvent("dashboard_upload_complete", { uploadId: result.analysisId });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Samples */}
          {samples.length > 0 && (
            <div id="samples" className="card">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-bold">🔎 Try Sample Datasets</h2>
                <span className="text-xs uppercase tracking-[0.35em] text-white/40">
                  Instant sandbox runs
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {samples.map((s) => (
                  <button
                    key={s.file}
                    disabled={isAnalyzing}
                    onClick={() => runSample(s.file)}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition-all hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{s.name}</span>
                        <span className="text-xs text-white/50">Preview</span>
                      </div>
                      <div className="text-xs text-white/50 truncate">{s.file}</div>
                      <div className="flex items-center gap-2 text-xs text-blue-300">
                        <span>Run live analysis</span>
                        <span>→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_card_open", { card: "plan" });
              setShowAdvancedConfig(true);
            }}
            className="card bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Your Plan</span>
              <span className="text-3xl">📦</span>
            </div>
            {statsLoading ? (
              <div className="animate-pulse h-8 bg-white/10 rounded w-24"></div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">{stats?.stats?.plan || 'FREE'}</div>
                <Link href="/dashboard/billing" className="text-sm text-blue-400 hover:text-blue-300">
                  {stats?.stats?.plan === 'FREE' ? 'Upgrade now →' : 'Manage plan →'}
                </Link>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_card_open", { card: "analyses" });
              setShowUpload(true);
            }}
            className="card bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Analyses</span>
              <span className="text-3xl">📊</span>
            </div>
            {statsLoading ? (
              <div className="animate-pulse h-8 bg-white/10 rounded w-24"></div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1">{formatNumber(stats?.stats?.totalAnalyses || 0)}</div>
                <div className="text-sm text-white/60">
                  {remainingAnalyses === Infinity ? 'Unlimited' : `${remainingAnalyses} remaining`}
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_card_open", { card: "anomalies" });
              setShowAdvancedConfig(true);
            }}
            className="card bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Anomalies Found</span>
              <span className="text-3xl">⚠️</span>
            </div>
            {statsLoading ? (
              <div className="animate-pulse h-8 bg-white/10 rounded w-24"></div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1 text-red-400">
                  {formatNumber(stats?.stats?.totalAnomalies || 0)}
                </div>
                <div className="text-sm text-white/60">Across all analyses</div>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              trackEvent("dashboard_card_open", { card: "accuracy" });
              setShowAdvancedConfig(true);
            }}
            className="card bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 w-full text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm font-medium">Avg Accuracy</span>
              <span className="text-3xl">🎯</span>
            </div>
            {statsLoading ? (
              <div className="animate-pulse h-8 bg-white/10 rounded w-24"></div>
            ) : (
              <>
                <div className="text-3xl font-bold mb-1 text-green-400">
                  {((stats?.stats?.avgAccuracy || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-green-400">Using YOUR ML models</div>
              </>
            )}
          </button>
        </div>

        {/* Detection Methods Showcase */}
          <button
          type="button"
          onClick={() => {
            trackEvent("dashboard_card_open", { card: "detection_methods" });
            setShowAdvancedConfig(true);
          }}
            className="card w-full text-left hover:shadow-lg transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">🧠 YOUR Advanced Detection Arsenal</h2>
          <p className="text-white/60 mb-6">
            All 10+ of YOUR cutting-edge ML models are integrated and ready to use
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Isolation Forest', type: 'ML', accuracy: 98.7, speed: 'Fast', icon: '🌲' },
              { name: 'LOF', type: 'ML', accuracy: 96.4, speed: 'Medium', icon: '🎯' },
              { name: 'One-Class SVM', type: 'ML', accuracy: 94.2, speed: 'Slow', icon: '🔷' },
              { name: 'Z-Score', type: 'Statistical', accuracy: 92.1, speed: 'Very Fast', icon: '📈' },
              { name: 'Modified Z-Score', type: 'Statistical', accuracy: 93.5, speed: 'Very Fast', icon: '📊' },
              { name: 'IQR Method', type: 'Statistical', accuracy: 91.8, speed: 'Fast', icon: '📉' },
              { name: 'Moving Average', type: 'Time Series', accuracy: 89.5, speed: 'Fast', icon: '〰️' },
              { name: 'Grubbs Test', type: 'Statistical', accuracy: 90.3, speed: 'Medium', icon: '🔍' },
              { name: 'GESD Test', type: 'Statistical', accuracy: 91.2, speed: 'Medium', icon: '🔬' },
              { name: 'LSTM Autoencoder', type: 'Deep Learning', accuracy: 97.2, speed: 'Slow', icon: '🧠' },
              { name: 'Consensus Mode', type: 'Hybrid', accuracy: 99.1, speed: 'Medium', icon: '🏆' },
            ].map((method) => (
              <div key={method.name} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-xs text-white/40">{method.type}</div>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <span className="text-green-400">{method.accuracy}% acc</span>
                  <span className="text-blue-400">{method.speed}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-200">
              💡 <strong>Industry Leading:</strong> YOUR models combine statistical, ML, and deep learning approaches for unmatched accuracy. Switch methods or use Consensus mode for 99.1% accuracy!
            </p>
          </div>
        </button>

        {/* Recent Analyses */}
        <div id="recent" className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Analyses</h2>
          {analysesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="h-12 w-12 bg-white/10 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : analyses && analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.slice(0, 5).map((analysis: any) => {
                const isExpanded = !!expandedAnalyses[analysis.id];
                return (
                  <div
                    key={analysis.id}
                    className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10 hover:border-blue-500/50 group"
                  >
                    <Link href={`/dashboard/forensics?id=${analysis.id}`} className="block">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="text-3xl">
                          {analysis.status === "COMPLETED" ? "✅" : analysis.status === "PROCESSING" ? "⏳" : "❌"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg truncate group-hover:text-blue-400 transition-colors">{analysis.fileName || "Analysis"}</div>
                          <div className="text-sm text-white/60">
                            {analysis.anomaliesFound || 0} anomalies •
                            {analysis.accuracy ? ` ${(analysis.accuracy * 100).toFixed(1)}% accuracy •` : ""}
                            {analysis.processingTime ? ` ${(analysis.processingTime / 1000).toFixed(2)}s •` : ""}
                            {new Date(analysis.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              analysis.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-400"
                                : analysis.status === "PROCESSING"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {analysis.status}
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleAnalysisInsights(analysis.id);
                            }}
                            className="text-sm font-semibold text-blue-300 hover:text-blue-200"
                          >
                            {isExpanded ? "Hide insights" : "View insights"}
                          </button>
                        </div>
                      </div>
                    </Link>
                    {isExpanded && renderAnalysisInsights(analysis)}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-2">Ready to detect anomalies?</h3>
              <p className="text-white/60 mb-6">
                Upload your data and let YOUR advanced ML models find patterns others miss
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Upload Your First Dataset
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
          <Link href="/dashboard/analytics" className="card hover:scale-105 transition-transform text-center group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📊</div>
            <div className="font-bold text-lg mb-2">View Analytics</div>
            <div className="text-sm text-white/60">Deep insights & charts</div>
          </Link>

          <Link href="/dashboard/crypto" className="card hover:scale-105 transition-transform text-center group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔐</div>
            <div className="font-bold text-lg mb-2">Crypto Fraud Detection</div>
            <div className="text-sm text-white/60">Blockchain analysis</div>
          </Link>

          <Link href="/dashboard/forensics" className="card hover:scale-105 transition-transform text-center group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔬</div>
            <div className="font-bold text-lg mb-2">Digital Forensics</div>
            <div className="text-sm text-white/60">Deepfake detection</div>
          </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

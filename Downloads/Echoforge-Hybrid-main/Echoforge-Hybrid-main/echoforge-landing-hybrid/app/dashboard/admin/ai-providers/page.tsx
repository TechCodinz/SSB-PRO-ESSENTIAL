"use client";

import { useState, useEffect } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import {
  SparklesIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

type AIProvider = "openai" | "anthropic" | "grok" | "custom";

interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  enabled: boolean;
  priority: number;
  maxTokens: number;
  temperature: number;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const res = await fetch("/api/admin/ai-providers");
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error("Failed to load providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async (provider: AIProvider) => {
    setTesting(provider);
    try {
      const res = await fetch("/api/admin/ai-providers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`${provider.toUpperCase()} is working! Response: ${data.response.substring(0, 50)}...`);
      } else {
        toast.error(data.error || "Provider test failed");
      }
    } catch (error) {
      toast.error("Failed to test provider");
    } finally {
      setTesting(null);
    }
  };

  const updateProvider = async (provider: ProviderConfig) => {
    try {
      const res = await fetch("/api/admin/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(provider),
      });

      if (res.ok) {
        toast.success(`${provider.provider.toUpperCase()} updated successfully`);
        loadProviders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update provider");
    }
  };

  const providerInfo = {
    openai: {
      name: "OpenAI (GPT-4)",
      description: "Most capable model, excellent for complex reasoning",
      icon: "🤖",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/30",
    },
    anthropic: {
      name: "Anthropic (Claude)",
      description: "Excellent for long-form content and analysis",
      icon: "🧠",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
    },
    grok: {
      name: "Grok (xAI)",
      description: "Real-time knowledge and current information",
      icon: "⚡",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
    },
    custom: {
      name: "Custom AI Provider",
      description: "Your own AI endpoint (OpenAI-compatible)",
      icon: "🔧",
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
    },
  };

  return (
    <div className="relative flex min-h-screen bg-slate-950 text-slate-100">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <header className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-8 shadow-lg backdrop-blur">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-blue-500/30">
                <CpuChipIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-slate-100 sm:text-4xl">
                  AI Provider Configuration
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Configure GPT, Grok, Claude, and custom AI providers for support and sentient system
                </p>
              </div>
            </div>
          </header>

          <div className="space-y-6">
            {Object.entries(providerInfo).map(([key, info]) => {
              const provider = providers.find((p) => p.provider === key) || {
                provider: key as AIProvider,
                apiKey: "",
                model: key === "openai" ? "gpt-4-turbo-preview" : key === "anthropic" ? "claude-3-opus-20240229" : key === "grok" ? "grok-beta" : "custom",
                enabled: false,
                priority: key === "openai" ? 1 : key === "anthropic" ? 2 : key === "grok" ? 3 : 4,
                maxTokens: 4000,
                temperature: 0.7,
              };

              return (
                <div
                  key={key}
                  className={`rounded-3xl border ${info.borderColor} bg-gradient-to-br ${info.color} p-6 shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{info.icon}</div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-100">{info.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{info.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => testProvider(provider.provider)}
                        disabled={testing === provider.provider || !provider.apiKey}
                        className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowPathIcon className={`h-4 w-4 ${testing === provider.provider ? "animate-spin" : ""}`} />
                        Test Connection
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={(e) => {
                            updateProvider({ ...provider, enabled: e.target.checked });
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) => {
                            const updated = { ...provider, apiKey: e.target.value };
                            setProviders((prev) =>
                              prev.filter((p) => p.provider !== key).concat(updated)
                            );
                          }}
                          onBlur={() => updateProvider({ ...provider, apiKey: provider.apiKey })}
                          placeholder={`Enter ${info.name} API key`}
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Model Name
                      </label>
                      <input
                        type="text"
                        value={provider.model}
                        onChange={(e) => {
                          const updated = { ...provider, model: e.target.value };
                          setProviders((prev) =>
                            prev.filter((p) => p.provider !== key).concat(updated)
                          );
                        }}
                        onBlur={() => updateProvider({ ...provider, model: provider.model })}
                        placeholder="Model name"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    {provider.provider === "custom" && (
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                          Base URL
                        </label>
                        <input
                          type="url"
                          value={provider.baseUrl || ""}
                          onChange={(e) => {
                            const updated = { ...provider, baseUrl: e.target.value };
                            setProviders((prev) =>
                              prev.filter((p) => p.provider !== key).concat(updated)
                            );
                          }}
                          onBlur={() => updateProvider({ ...provider, baseUrl: provider.baseUrl })}
                          placeholder="https://api.example.com/v1"
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Priority (Lower = Higher Priority)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={provider.priority}
                        onChange={(e) => {
                          const updated = { ...provider, priority: parseInt(e.target.value) || 1 };
                          setProviders((prev) =>
                            prev.filter((p) => p.provider !== key).concat(updated)
                          );
                        }}
                        onBlur={() => updateProvider({ ...provider, priority: provider.priority })}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="32000"
                        value={provider.maxTokens}
                        onChange={(e) => {
                          const updated = { ...provider, maxTokens: parseInt(e.target.value) || 4000 };
                          setProviders((prev) =>
                            prev.filter((p) => p.provider !== key).concat(updated)
                          );
                        }}
                        onBlur={() => updateProvider({ ...provider, maxTokens: provider.maxTokens })}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-200 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {provider.apiKey ? (
                        <>
                          <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm text-slate-300">API Key configured</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="h-5 w-5 text-slate-500" />
                          <span className="text-sm text-slate-500">API Key required</span>
                        </>
                      )}
                    </div>
                    {provider.enabled && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-400" />
              How AI Providers Work
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong>Support Chat:</strong> Uses AI providers to answer user questions in real-time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong>Sentient System:</strong> Uses AI to analyze performance and suggest detection improvements
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong>Self-Improvement:</strong> AI analyzes results and recommends method optimizations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>
                  <strong>Fallback System:</strong> If one provider fails, automatically tries the next in priority order
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

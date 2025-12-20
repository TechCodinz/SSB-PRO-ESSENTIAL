"use client";
import { useEffect, useState } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<Array<any>>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/features', { cache: 'no-store' })
        if (!res.ok) {
          console.error('Failed to fetch features:', res.status, res.statusText)
          toast.error('Failed to load features')
          setFeatures([])
          return
        }
        const json = await res.json()
        const list = Object.entries(json.features || {}).map(([id, v]: any) => ({ id, ...v, usage: 0 }))
        setFeatures(list)
      } catch (err) {
        console.error('Error fetching features:', err)
        // fallback demo state
        setFeatures([])
      }
    })()
  }, [])

  const categories = {
    detection: { name: "Detection", icon: "🔍", color: "text-blue-400" },
    tools: { name: "Tools", icon: "🔧", color: "text-purple-400" },
    monitoring: { name: "Monitoring", icon: "👁️", color: "text-green-400" },
    api: { name: "API", icon: "📡", color: "text-cyan-400" },
    ml: { name: "ML/AI", icon: "🤖", color: "text-pink-400" },
    auth: { name: "Auth", icon: "🔐", color: "text-yellow-400" },
    integration: { name: "Integration", icon: "🔌", color: "text-orange-400" },
    security: { name: "Security", icon: "🛡️", color: "text-red-400" },
    infrastructure: { name: "Infrastructure", icon: "⚙️", color: "text-gray-400" }
  };

  const toggleFeature = async (featureId: string) => {
    const feature = features.find(f => f.id === featureId)
    if (!feature) return
    try {
      const res = await fetch('/api/admin/features', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: featureId, enabled: !feature.enabled }) })
      if (!res.ok) {
        console.error('Failed to toggle feature:', res.status, res.statusText)
        toast.error('Failed to toggle feature')
        return
      }
      const json = await res.json()
      if (json.ok) {
        setFeatures(features.map(f => f.id === featureId ? { ...f, enabled: !f.enabled } : f))
        toast.success(`${feature.name} ${!feature.enabled ? 'enabled' : 'disabled'}`)
      } else {
        toast.error('Failed')
      }
    } catch (err) {
      console.error('Error toggling feature:', err)
      toast.error('Failed')
    }
  };

  const enabledCount = features.filter(f => f.enabled).length;
  const betaCount = features.filter(f => f.beta).length;
  const totalUsage = features.reduce((sum, f) => sum + f.usage, 0);

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="bg-[#0f1630] border-b border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">🔧 Feature Management</h1>
                <p className="text-white/60">Enable/disable features, manage beta releases, and control access</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/admin" className="btn btn-ghost">
                  ← Back to Admin
                </Link>
                <button className="btn btn-primary">
                  + Add Feature Flag
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Features</div>
                <div className="text-2xl font-bold">{features.length}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Enabled</div>
                <div className="text-2xl font-bold text-green-400">{enabledCount}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Beta Features</div>
                <div className="text-2xl font-bold text-yellow-400">{betaCount}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Usage</div>
                <div className="text-2xl font-bold text-blue-400">{totalUsage.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Feature Categories */}
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {Object.entries(categories).map(([key, cat]) => {
                const count = features.filter(f => f.category === key).length;
                return (
                  <div key={key} className="card text-center">
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className={`font-bold ${cat.color}`}>{cat.name}</div>
                    <div className="text-2xl font-bold mt-2">{count}</div>
                  </div>
                );
              })}
            </div>

            {/* Features List */}
            <div className="card">
              <h3 className="text-2xl font-bold mb-6">All Features</h3>
              <div className="space-y-4">
                {features.map((feature) => {
                  const cat = categories[feature.category as keyof typeof categories];
                  return (
                    <div key={feature.id} className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Category Icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {cat.icon}
                        </div>

                        {/* Feature Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-bold text-lg">{feature.name}</div>
                            {feature.beta && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                BETA
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              feature.enabled 
                                ? "bg-green-500/20 text-green-400" 
                                : "bg-gray-500/20 text-gray-400"
                            }`}>
                              {feature.enabled ? "● ENABLED" : "○ DISABLED"}
                            </span>
                          </div>

                          <p className="text-sm text-white/60 mb-3">{feature.description}</p>

                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-white/60 mb-1">Available for:</div>
                              <form className="flex gap-2" onSubmit={async (e:any)=>{e.preventDefault();
                                const form = e.currentTarget as HTMLFormElement
                                const input = form.querySelector('input[name="plans"]') as HTMLInputElement
                                const plans = input.value.split(',').map(p=>p.trim().toLowerCase()).filter(Boolean)
                                try {
                                  const res = await fetch('/api/admin/features', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: feature.id, plans }) })
                                  if (!res.ok) {
                                    console.error('Failed to update plans:', res.status, res.statusText)
                                    toast.error('Failed to update plans')
                                    return
                                  }
                                  const ok = (await res.json()).ok
                                  if (ok) {
                                    setFeatures(features.map(f => f.id === feature.id ? { ...f, plans } : f))
                                  }
                                } catch (err) {
                                  console.error('Error updating plans:', err)
                                  toast.error('Failed')
                                }
                              }}>
                                <input name="plans" defaultValue={feature.plans.join(',')} className="px-2 py-1 bg-black/30 border border-white/10 rounded text-xs" />
                                <button className="btn btn-ghost btn-sm">Save</button>
                              </form>
                            </div>
                            <div>
                              <div className="text-xs text-white/60 mb-1">Category:</div>
                              <div className={`font-bold ${cat.color}`}>{cat.name}</div>
                            </div>
                            <div>
                              <div className="text-xs text-white/60 mb-1">Usage Count:</div>
                              <div className="font-bold">{feature.usage.toLocaleString()}</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={feature.enabled}
                                onChange={() => toggleFeature(feature.id)}
                                className="sr-only peer" 
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              <span className="ml-3 text-sm font-medium">
                                {feature.enabled ? "Enabled" : "Disabled"}
                              </span>
                            </label>
                            
                            <button className="btn btn-ghost text-sm">
                              ⚙️ Configure
                            </button>
                            <button className="btn btn-ghost text-sm">
                              📊 View Stats
                            </button>
                            <button className="btn btn-ghost text-sm">
                              📋 Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <button className="card hover:scale-105 transition-transform text-center">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-bold mb-2">Enable All</div>
                <div className="text-sm text-white/60">Turn on all features</div>
              </button>

              <button className="card hover:scale-105 transition-transform text-center">
                <div className="text-4xl mb-3">⏸️</div>
                <div className="font-bold mb-2">Disable Beta</div>
                <div className="text-sm text-white/60">Turn off beta features</div>
              </button>

              <button className="card hover:scale-105 transition-transform text-center">
                <div className="text-4xl mb-3">📊</div>
                <div className="font-bold mb-2">Usage Report</div>
                <div className="text-sm text-white/60">Generate report</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
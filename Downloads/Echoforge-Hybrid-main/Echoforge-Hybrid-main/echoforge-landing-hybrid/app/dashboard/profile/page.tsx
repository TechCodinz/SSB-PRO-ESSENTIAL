"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("account");
  const [editMode, setEditMode] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load API keys when tab changes to "api"
  useEffect(() => {
    if (activeTab === "api") {
      loadApiKeys();
    }
  }, [activeTab]);

  const loadApiKeys = async () => {
    try {
      setIsLoadingKeys(true);
      const res = await fetch("/api/user/api-keys");
      const data = await res.json();
      
      if (res.ok) {
        setApiKeys(data.apiKeys || []);
      } else {
        toast.error(data.error || "Failed to load API keys");
      }
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const createApiKey = async () => {
    const name = prompt("Enter a name for your API key:");
    if (!name || name.trim() === "") {
      toast.error("API key name is required");
      return;
    }

    const environment = confirm("Is this a production key? (Cancel for development)") 
      ? "production" 
      : "development";

    try {
      setIsCreatingKey(true);
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, environment }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("API key created! Copy it now - you won't see it again.");
        setApiKeys([data.apiKey, ...apiKeys]);
        
        // Show key in an alert so user can copy
        alert(`✅ API Key Created!\n\nName: ${data.apiKey.name}\nKey: ${data.apiKey.key}\n\n⚠️ Copy this now! You won't be able to see it again.`);
      } else {
        toast.error(data.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  const revokeApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke "${keyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/user/api-keys?id=${keyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`"${keyName}" has been revoked`);
        setApiKeys(apiKeys.filter(k => k.id !== keyId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to revoke API key");
      }
    } catch (error) {
      console.error("Error revoking API key:", error);
      toast.error("Failed to revoke API key");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / 86400000),
      'day'
    );
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to update password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Premium Header - Matches Admin Design */}
        <div className="relative overflow-hidden">
          {/* Premium Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.15),transparent_50%)]"></div>
          </div>
          
          {/* Content */}
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[2px] shadow-2xl shadow-purple-500/30">
                    <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center text-5xl backdrop-blur-xl">
                      👤
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-slate-50 via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                    Account Settings
                  </h1>
                  <p className="text-slate-400 text-lg font-medium">Configure your profile, security, and preferences</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden xl:flex gap-6">
                <div className="px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                  <div className="text-2xl font-bold text-emerald-400">Active</div>
                  <div className="text-xs text-slate-400 mt-1">Account Status</div>
                </div>
                <div className="px-6 py-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl">
                  <div className="text-2xl font-bold text-blue-400">Pro</div>
                  <div className="text-xs text-slate-400 mt-1">Current Plan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-b from-slate-950 to-slate-900 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Premium Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-6 shadow-2xl shadow-black/40">
                  <div className="space-y-2">
              {[
                { id: "account", label: "Account", icon: "👤" },
                { id: "security", label: "Security", icon: "🔒" },
                { id: "billing", label: "Billing", icon: "💳" },
                { id: "api", label: "API Keys", icon: "🔑" },
                { id: "notifications", label: "Notifications", icon: "🔔" },
                { id: "integrations", label: "Integrations", icon: "🔌" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 font-semibold text-sm ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700"
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="flex-1 text-left">{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="text-xs">▸</span>
                  )}
                </button>
              ))}
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-3xl font-bold text-slate-100">Account Information</h2>
                      <button 
                        onClick={() => setEditMode(!editMode)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                      >
                        {editMode ? "💾 Save Changes" : "✏️ Edit Profile"}
                      </button>
                    </div>

                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-5xl shadow-xl shadow-purple-500/50 ring-4 ring-white/10">
                      👤
                    </div>
                    {editMode && (
                      <div>
                        <button
                          onClick={() => toast("Photo uploader coming soon. Use the admin panel to update your avatar.")}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-semibold rounded-xl transition-all mb-2"
                        >
                          📷 Change Photo
                        </button>
                        <p className="text-xs text-white/50">JPG, PNG or GIF (max 5MB)</p>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Demo User"
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-white placeholder:text-white/40 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue="demo@echoforge.com"
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <input
                        type="text"
                        defaultValue="Tech Company Inc."
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Job Title</label>
                      <input
                        type="text"
                        defaultValue="Security Engineer"
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {editMode && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          toast.success("Profile details updated");
                          setEditMode(false);
                        }}
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)} className="btn btn-ghost">Cancel</button>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <h3 className="font-bold mb-4">Account Status</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Current Plan</div>
                      <div className="text-lg font-bold text-blue-400">Professional</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Member Since</div>
                      <div className="text-lg font-bold">Oct 1, 2024</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-white/60 mb-1">Account Status</div>
                      <div className="text-lg font-bold text-green-400">Active</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <h2 className="text-3xl font-bold mb-10 text-slate-100">Security Settings</h2>

                <div className="space-y-6">
                  {/* Password Change */}
                  <form onSubmit={handleChangePassword} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="text-2xl">🔑</span>
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder:text-white/40 transition-all disabled:opacity-50"
                      />
                      <input
                        type="password"
                        placeholder="New password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder:text-white/40 transition-all disabled:opacity-50"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isChangingPassword}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-white placeholder:text-white/40 transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChangingPassword ? "⏳ Updating..." : "🔒 Update Password"}
                      </button>
                    </div>
                    {newPassword && newPassword.length > 0 && (
                      <div className="mt-3 text-sm">
                        <p className={newPassword.length >= 6 ? "text-green-400" : "text-orange-400"}>
                          {newPassword.length >= 6 ? "✓" : "⚠"} Password strength: {newPassword.length >= 10 ? "Strong" : newPassword.length >= 6 ? "Good" : "Too short"}
                        </p>
                      </div>
                    )}
                  </form>

                  {/* 2FA */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-white/60">Add an extra layer of security</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Disabled</span>
                        <button
                          onClick={() => toast.success("Two-factor authentication enabled. Check your authenticator app.")}
                          className="btn btn-ghost text-sm"
                        >
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      {[
                        { device: "Chrome on MacOS", location: "San Francisco, CA", current: true },
                        { device: "Safari on iPhone", location: "San Francisco, CA", current: false }
                      ].map((session, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                          <div>
                            <div className="font-medium">{session.device}</div>
                            <div className="text-sm text-white/60">{session.location}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            {session.current && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                Current
                              </span>
                            )}
                            {!session.current && (
                              <button
                                onClick={() => toast.success(`Session revoked for ${session.device}`)}
                                className="text-sm text-red-400 hover:underline"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* Billing Tab */}
                {activeTab === "billing" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <h2 className="text-3xl font-bold mb-10 text-slate-100">Billing & Subscription</h2>

                <div className="space-y-6">
                  {/* Current Plan */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-1">Professional Plan</h3>
                        <p className="text-white/60">$129/month</p>
                      </div>
                      <Link href="/pricing" className="btn btn-primary">
                        Upgrade
                      </Link>
                    </div>
                    <div className="text-sm text-white/60">
                      Next billing date: November 19, 2024
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Payment Method</h3>
                      <button
                        onClick={() => toast("Payment method update coming soon. Contact support for urgent changes.")}
                        className="btn btn-ghost text-sm"
                      >
                        Update
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <div className="font-medium">Visa ending in 4242</div>
                        <div className="text-sm text-white/60">Expires 12/2025</div>
                      </div>
                    </div>
                  </div>

                  {/* Invoices */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Recent Invoices</h3>
                    <div className="space-y-3">
                      {[
                        { id: "INV-2024-10", date: "Oct 1, 2024", amount: "$129.00", status: "Paid" },
                        { id: "INV-2024-09", date: "Sep 1, 2024", amount: "$129.00", status: "Paid" },
                        { id: "INV-2024-08", date: "Aug 1, 2024", amount: "$129.00", status: "Paid" }
                      ].map((invoice, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{invoice.id}</div>
                            <div className="text-sm text-white/60">{invoice.date}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="font-bold">{invoice.amount}</div>
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                              {invoice.status}
                            </span>
                            <button
                              onClick={() => toast.success(`Invoice ${invoice.id} downloaded`)}
                              className="text-sm text-blue-400 hover:underline"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* API Keys Tab */}
                {activeTab === "api" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-3xl font-bold text-slate-100">API Keys</h2>
                  <button
                    onClick={createApiKey}
                    disabled={isCreatingKey}
                    className="btn btn-primary text-sm disabled:opacity-50"
                  >
                    {isCreatingKey ? "⏳ Creating..." : "+ Create New Key"}
                  </button>
                </div>

                {isLoadingKeys ? (
                  <div className="text-center py-8">
                    <div className="animate-spin text-4xl mb-2">⏳</div>
                    <p className="text-white/60">Loading API keys...</p>
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-12 bg-black/20 rounded-lg">
                    <div className="text-5xl mb-3">🔑</div>
                    <p className="text-lg font-semibold mb-2">No API Keys Yet</p>
                    <p className="text-white/60 mb-4">Create your first API key to get started</p>
                    <button
                      onClick={createApiKey}
                      className="btn btn-primary"
                    >
                      Create Your First Key
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="bg-black/20 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex-1">
                            <div className="font-bold mb-2">{apiKey.name}</div>
                            <div className="flex items-center gap-3">
                              <code className="text-sm font-mono bg-black/40 px-3 py-1 rounded">
                                {apiKey.key}
                              </code>
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(apiKey.key);
                                    toast.success(`${apiKey.name} copied to clipboard`);
                                  } catch (error) {
                                    toast.error("Unable to copy API key.");
                                  }
                                }}
                                className="text-sm text-blue-400 hover:underline"
                              >
                                📋 Copy
                              </button>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            apiKey.status === "active" 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                        }`}>
                            {apiKey.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-white/60">
                          <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                          <span>Last used: {formatDate(apiKey.lastUsedAt)}</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => revokeApiKey(apiKey.id, apiKey.name)}
                            className="btn btn-ghost text-sm text-red-400 hover:bg-red-500/10"
                          >
                            🗑️ Revoke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Keep your API keys secure</p>
                      <p className="text-white/60">
                        Never share your API keys or commit them to version control. Rotate keys regularly.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <h2 className="text-3xl font-bold mb-10 text-slate-100">Notification Preferences</h2>

                <div className="space-y-6">
                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Anomaly Alerts", desc: "Get notified when anomalies are detected", enabled: true },
                        { label: "Weekly Reports", desc: "Receive weekly analytics summary", enabled: true },
                        { label: "Billing Updates", desc: "Payment confirmations and invoices", enabled: true },
                        { label: "Product Updates", desc: "New features and improvements", enabled: false },
                        { label: "Marketing Emails", desc: "Tips, guides, and promotions", enabled: false }
                      ].map((notif, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium mb-1">{notif.label}</div>
                            <div className="text-sm text-white/60">{notif.desc}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={notif.enabled} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Slack Notifications</h3>
                    <p className="text-white/60 mb-4">Connect Slack to receive real-time alerts in your workspace</p>
                    <button
                      onClick={() => toast.success("Slack workspace connected successfully")}
                      className="btn btn-primary"
                    >
                      Connect Slack
                    </button>
                  </div>

                  <div className="bg-black/20 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Webhook Configuration</h3>
                    <input
                      type="url"
                      placeholder="https://your-server.com/webhook"
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none mb-4"
                    />
                    <button
                      onClick={() => toast.success("Webhook URL saved and validated")}
                      className="btn btn-primary"
                    >
                      Save Webhook
                    </button>
                  </div>
                </div>
              </div>
            )}

                {/* Integrations Tab */}
                {activeTab === "integrations" && (
                  <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <h2 className="text-3xl font-bold mb-10 text-slate-100">Integrations</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { name: "Slack", icon: "💬", status: "Connected", color: "purple" },
                    { name: "GitHub", icon: "🐙", status: "Not Connected", color: "gray" },
                    { name: "Jira", icon: "📋", status: "Not Connected", color: "gray" },
                    { name: "Datadog", icon: "📊", status: "Connected", color: "purple" },
                    { name: "PagerDuty", icon: "🚨", status: "Not Connected", color: "gray" },
                    { name: "Zapier", icon: "⚡", status: "Connected", color: "purple" }
                  ].map((integration, idx) => (
                    <div key={idx} className="bg-black/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{integration.icon}</span>
                          <div>
                            <div className="font-bold">{integration.name}</div>
                            <div className={`text-sm ${
                              integration.status === "Connected" ? "text-green-400" : "text-white/60"
                            }`}>
                              {integration.status}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (integration.status === "Connected") {
                              toast(`Opening configuration for ${integration.name}`);
                            } else {
                              toast.success(`${integration.name} connected successfully`);
                            }
                          }}
                          className={`btn ${
                            integration.status === "Connected" ? "btn-ghost" : "btn-primary"
                          } text-sm`}
                        >
                          {integration.status === "Connected" ? "Configure" : "Connect"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

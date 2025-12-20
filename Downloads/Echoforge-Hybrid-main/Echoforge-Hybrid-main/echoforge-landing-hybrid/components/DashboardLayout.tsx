"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  ShoppingBagIcon,
  UsersIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  CreditCardIcon,
  Cog8ToothIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import AISupportChat from "./AISupportChat";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const rawRole = (session?.user as any)?.role || 'USER'
  const role = String(rawRole).toUpperCase();
  const managerRoles = useMemo(() => new Set(['MANAGER', 'ADMIN', 'OWNER']), []);
  const adminNavRoles = useMemo(() => new Set(['READ_ONLY', 'MODERATOR', 'ADMIN', 'OWNER']), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  // Open sidebar by default on large screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setSidebarOpen(true)
    }
  }, [])
  const pathname = usePathname();
  type NavRequirement = "manager" | "admin-nav";
  type NavItem = {
    href: string;
    label: string;
    description?: string;
    require?: NavRequirement;
  };

  const navSections = useMemo(() => {
    const baseSections: Array<{ title: string; items: NavItem[] }> = [
      {
        title: "Workspace",
        items: [
          { href: "/dashboard", label: "Overview", description: "Live status & key metrics" },
          { href: "/dashboard/predictive-prevention", label: "Predictive Prevention", description: "Predict & prevent anomalies before they occur" },
          { href: "/dashboard/upload", label: "Upload Center", description: "Ingest CSV, JSON, XLS data" },
          { href: "/dashboard/analytics", label: "Analytics", description: "Visual insights & trends" },
          { href: "/dashboard/analytics-advanced", label: "Advanced Analytics", description: "Ensemble intelligence" },
          { href: "/dashboard/crypto", label: "Crypto Fraud", description: "Blockchain anomaly scans" },
          { href: "/dashboard/forensics", label: "Digital Forensics", description: "Deepfake & media lab" },
          { href: "/dashboard/marketplace", label: "Marketplace", description: "Model & detector catalog" },
        ],
      },
      {
        title: "Operations",
        items: [
          { href: "/dashboard/employees", label: "Employee Ops", description: "Roles & incident playbooks", require: "manager" },
          { href: "/dashboard/team", label: "Team Collaboration", description: "Assignments & status rooms", require: "manager" },
          { href: "/dashboard/admin", label: "Admin Console", description: "Platform governance", require: "admin-nav" },
        ],
      },
      {
        title: "Billing & Settings",
        items: [
          { href: "/dashboard/billing", label: "Billing", description: "Plan usage & invoices" },
          { href: "/dashboard/invoices", label: "Invoices", description: "Download receipts & summaries" },
          { href: "/dashboard/profile", label: "Profile & API Keys", description: "Credentials & security" },
        ],
      },
      {
        title: "Resources",
        items: [
          { href: "/documentation", label: "Documentation", description: "API guides & implementation" },
          { href: "/contact", label: "Live Support", description: "24/7 enterprise assistance" },
        ],
      },
    ];

    const allowItem = (item: NavItem) => {
      if (!item.require) return true;
      if (item.require === "manager") {
        return managerRoles.has(role);
      }
      if (item.require === "admin-nav") {
        return adminNavRoles.has(role);
      }
      return true;
    };

    return baseSections
      .map((section) => ({
        ...section,
        items: section.items.filter(allowItem),
      }))
      .filter((section) => section.items.length > 0);
  }, [role, managerRoles, adminNavRoles]);

  const IconFor = (href: string) => {
    if (href.endsWith('/admin')) return Cog6ToothIcon
    if (href.includes('/employees')) return UsersIcon
    if (href.includes('/marketplace')) return ShoppingBagIcon
    if (href.includes('/upload')) return ArrowUpTrayIcon
    if (href.includes('/forensics')) return ShieldCheckIcon
    if (href.includes('/crypto')) return LockClosedIcon
    if (href.includes('/analytics')) return ChartBarIcon
    if (href.includes('/predictive-prevention')) return SparklesIcon
    if (href.includes('/team')) return UserGroupIcon
    if (href.includes('/invoices')) return DocumentTextIcon
    if (href.includes('/billing')) return CreditCardIcon
    if (href.includes('/profile')) return Cog8ToothIcon
    if (href.includes('/documentation')) return BookOpenIcon
    if (href.includes('/contact')) return ChatBubbleLeftRightIcon
    return HomeIcon
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1020]">
      {/* Ultra-Premium Professional Top Bar - Matching Admin Design */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 border-b border-slate-800/90 backdrop-blur-xl z-50 shadow-2xl shadow-blue-500/10">
        <div className="h-full max-w-[2000px] mx-auto px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle sidebar"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarOpen(!sidebarOpen);
              }}
              className="p-2.5 hover:bg-slate-800/80 rounded-lg transition-all hover:scale-105 border border-slate-700/50 hover:border-blue-500/50 active:scale-95 z-50 relative"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform ring-2 ring-blue-500/20">
                <span className="text-xl font-black text-white">E</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-base font-black tracking-tight bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  EchoForge
                </div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">
                  Intelligence Platform
                </div>
              </div>
            </Link>
          </div>

          {/* Center Section - Quick Search - Premium Design */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search analyses, users, settings, or commands..."
                className="w-full px-5 py-3 pl-12 pr-24 bg-slate-900/90 border border-slate-700/90 rounded-2xl focus:bg-slate-800/95 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm font-medium text-slate-100 placeholder:text-slate-500 shadow-lg shadow-black/20"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                <kbd className="px-2 py-1 bg-slate-900/90 rounded text-[11px] font-semibold border border-slate-700/50">⌘</kbd>
                <span className="text-slate-500">+</span>
                <kbd className="px-2 py-1 bg-slate-900/90 rounded text-[11px] font-semibold border border-slate-700/50">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications - Premium Design - WIRED */}
            <Link 
              href="/dashboard/analytics"
              className="relative p-3 hover:bg-slate-800/90 rounded-xl transition-all border border-transparent hover:border-slate-700/60 group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-blue-500/10"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse ring-2 ring-slate-950 ring-offset-1 ring-offset-slate-950"></span>
            </Link>

            {/* Messages - Premium Design - WIRED */}
            <Link 
              href="/contact"
              className="relative p-3 hover:bg-slate-800/90 rounded-xl transition-all border border-transparent hover:border-slate-700/60 group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-blue-500/10"
              aria-label="Messages"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full ring-2 ring-slate-950 ring-offset-1 ring-offset-slate-950"></span>
            </Link>

            {/* Settings - Premium Design */}
            <Link 
              href="/dashboard/profile" 
              className="p-3 hover:bg-slate-800/90 rounded-xl transition-all border border-transparent hover:border-slate-700/60 group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-blue-500/10"
              aria-label="Settings"
            >
              <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* User Profile with Premium Dropdown */}
            <div className="relative"
              onMouseEnter={() => setProfileDropdownOpen(true)}
              onMouseLeave={() => setProfileDropdownOpen(false)}
            >
              <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800/90 rounded-xl transition-all border border-slate-700/50 hover:border-blue-500/50 group shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform ring-2 ring-blue-500/20">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-bold text-slate-100">{session?.user?.name || 'User'}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{(session?.user as any)?.plan || 'FREE'} Plan</div>
                </div>
                <svg className="w-4 h-4 text-slate-400 hidden lg:block group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Ultra Premium Profile Dropdown Menu - Matching Admin Design */}
              {profileDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-slate-950/98 backdrop-blur-xl border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden z-[60] ring-2 ring-blue-500/10">
                  <div className="p-6 border-b border-slate-800/90 bg-gradient-to-r from-slate-900/60 via-slate-950/60 to-slate-900/60">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-blue-500/40 ring-2 ring-blue-500/30">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-100 truncate text-base">{session?.user?.name || 'User'}</div>
                        <div className="text-sm text-slate-400 truncate mt-0.5">{session?.user?.email}</div>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50"></div>
                          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">{(session?.user as any)?.plan || 'FREE'} Plan</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-slate-800/90 transition-all group border border-transparent hover:border-slate-700/60">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-200">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/profile" onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-slate-800/90 transition-all group border border-transparent hover:border-slate-700/60">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-200">Settings</span>
                    </Link>
                    <Link href="/dashboard/billing" onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-slate-800/90 transition-all group border border-transparent hover:border-slate-700/60">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-200">Billing & Plans</span>
                    </Link>
                    <div className="my-2 border-t border-slate-800/90"></div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-all text-left group border border-transparent hover:border-red-500/30"
                    >
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-red-400">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 pt-16">
        {/* Ultra-Premium Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} lg:w-64 transition-all duration-300 bg-gradient-to-b from-slate-950/98 via-slate-900/98 to-slate-950/98 border-r-2 border-slate-800/90 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 shadow-2xl shadow-blue-500/10 backdrop-blur-xl`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/20 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="flex items-center justify-center">
              {(sidebarOpen || typeof window === 'undefined') && (
                <div className="text-center">
                  <div className="text-xs uppercase tracking-widest text-white/60 font-black mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    NAVIGATION
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-xs font-bold text-white shadow-lg">
                    Role: {role}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Ultra-Premium Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {(sidebarOpen || typeof window === 'undefined') && (
                <div className="px-1 text-xs font-black uppercase tracking-[0.35em] text-white/40">
                  {section.title}
                </div>
              )}
              <div className="space-y-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = IconFor(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-blue-500/30 scale-105 font-bold'
                          : 'hover:bg-white/10 hover:scale-105 border border-transparent hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/20'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
                      {(sidebarOpen || typeof window === 'undefined') && (
                        <div className="flex-1">
                          <div className={isActive ? 'font-black' : 'font-semibold'}>
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-white/50">
                              {item.description}
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 transition-all border border-blue-500/30 hover:border-blue-500/60 mt-4 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">🚀</span>
              {(sidebarOpen || typeof window === 'undefined') && <span className="font-semibold">Launch Full App</span>}
            </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <Link 
            href="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-sm">
              👤
            </div>
            {(sidebarOpen || typeof window === 'undefined') && (
              <div className="flex-1">
                <div className="text-sm font-medium">Demo User</div>
                <div className="text-xs text-white/60">Pro Plan</div>
              </div>
            )}
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} lg:ml-64 transition-all duration-300`}>
          {children}
        </main>
      </div>
      {/* AI Support Chat */}
      <AISupportChat />
    </div>
  );
}

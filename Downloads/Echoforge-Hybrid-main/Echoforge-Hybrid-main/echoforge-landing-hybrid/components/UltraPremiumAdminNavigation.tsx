// @ts-nocheck
"use client";

import {
  BanknotesIcon,
  BoltIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CommandLineIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  HomeIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  TicketIcon,
  UserGroupIcon,
  ChevronRightIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { trackNavigation } from "@/lib/analytics";
import { useSession } from "next-auth/react";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
  badge?: string;
  children?: Array<{ title: string; href: string; badge?: string }>;
};

export default function UltraPremiumAdminNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = useMemo<NavItem[]>(
    () => [
      {
        title: "Overview",
        href: "/dashboard/admin",
        icon: HomeIcon,
        description: "Executive summary & health metrics",
      },
      {
        title: "User Directory",
        href: "/dashboard/admin/users",
        icon: UserGroupIcon,
        description: "Manage accounts, roles, and access",
        children: [
          { title: "All users", href: "/dashboard/admin/users" },
          { title: "Analytics", href: "/dashboard/admin/users/analytics" },
          { title: "Bulk actions", href: "/dashboard/admin/users/bulk" },
          { title: "Pending approvals", href: "/dashboard/admin/users/pending" },
        ],
      },
      {
        title: "Plans & Billing",
        href: "/dashboard/admin/plans",
        icon: TicketIcon,
        description: "Plan catalog and billing automation",
        children: [
          { title: "Plans", href: "/dashboard/admin/plans" },
          { title: "Usage limits", href: "/dashboard/admin/plans/limits" },
          { title: "Billing rules", href: "/dashboard/admin/plans/billing" },
        ],
      },
      {
        title: "Payments",
        href: "/dashboard/admin/payments",
        icon: CurrencyDollarIcon,
        description: "Review confirmations & revenue flows",
        badge: "Live",
      },
      {
        title: "Feature Flags",
        href: "/dashboard/admin/features",
        icon: Squares2X2Icon,
        description: "Control rollouts, beta access, experimentation",
        children: [
          { title: "Feature flags", href: "/dashboard/admin/features" },
          { title: "Beta programs", href: "/dashboard/admin/features/beta" },
          { title: "A/B testing", href: "/dashboard/admin/features/ab-testing" },
        ],
      },
      {
        title: "AI Operations",
        href: "/dashboard/admin/ai-control",
        icon: CpuChipIcon,
        description: "AI guardrails, performance, and governance",
      },
      {
        title: "AI Providers",
        href: "/dashboard/admin/ai-providers",
        icon: CpuChipIcon,
        description: "Configure GPT, Grok, Claude for support & sentient system",
      },
      {
        title: "System Health",
        href: "/dashboard/admin/system",
        icon: ShieldCheckIcon,
        description: "Monitoring, maintenance, and logs",
        children: [
          { title: "Overview", href: "/dashboard/admin/system" },
          { title: "Performance", href: "/dashboard/admin/system/performance" },
          { title: "Maintenance", href: "/dashboard/admin/system/maintenance" },
          { title: "Logs", href: "/dashboard/admin/system/logs" },
        ],
      },
      {
        title: "Marketplace",
        href: "/dashboard/admin/marketplace",
        icon: RectangleStackIcon,
        description: "Listings, vendors, and orders",
        children: [
          { title: "Overview", href: "/dashboard/admin/marketplace" },
          { title: "Orders", href: "/dashboard/admin/marketplace/orders" },
          { title: "Vendors", href: "/dashboard/admin/marketplace/vendors" },
          { title: "Analytics", href: "/dashboard/admin/marketplace/analytics" },
        ],
      },
      {
        title: "Crypto Desk",
        href: "/dashboard/admin/crypto-payments",
        icon: BanknotesIcon,
        description: "On-chain payments and custody",
        children: [
          { title: "Transactions", href: "/dashboard/admin/crypto-payments" },
          { title: "Confirmations", href: "/dashboard/admin/crypto-payments/confirmations" },
          { title: "Wallets", href: "/dashboard/admin/crypto-payments/wallets" },
          { title: "Reports", href: "/dashboard/admin/crypto-payments/reports" },
        ],
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: ChartBarSquareIcon,
        description: "Deep reporting & KPI monitoring",
        children: [
          { title: "Overview", href: "/dashboard/analytics" },
          { title: "Users", href: "/dashboard/analytics/users" },
          { title: "Revenue", href: "/dashboard/analytics/revenue" },
          { title: "System", href: "/dashboard/analytics/system" },
        ],
      },
      {
        title: "Operational Tools",
        href: "/dashboard/admin/ai-control?action=optimize",
        icon: BoltIcon,
        description: "Shortcuts to investigation utilities",
        children: [
          { title: "Live API test", href: "/dashboard/admin/ai-control?action=test" },
          { title: "Forensics", href: "/dashboard/forensics" },
          { title: "Upload centre", href: "/dashboard/upload" },
        ],
      },
      {
        title: "Documentation",
        href: "/documentation",
        icon: DocumentChartBarIcon,
        description: "Playbooks, policies, and release notes",
      },
    ],
    [],
  );

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleGroup = (href: string) => {
    setOpenGroups((current) => ({ ...current, [href]: !current[href] }));
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* Ultra Premium Header - Matching User Top Bar Design */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/90 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 px-6 py-5 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
        <Link href="/dashboard/admin" className="flex items-center gap-3 text-slate-100 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform ring-2 ring-blue-500/20">
            <CommandLineIcon className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-base font-black tracking-tight bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Admin Control</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold">EchoForge Platform</p>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((state) => !state)}
          className="p-2.5 hover:bg-slate-800/80 rounded-lg transition-all hover:scale-105 border border-slate-700/50 hover:border-blue-500/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-blue-500/10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Cog6ToothIcon className={clsx("h-5 w-5 text-slate-300 transition-transform duration-300", collapsed ? "-rotate-90" : "rotate-0")} />
        </button>
      </div>

      {/* User Session Display - Premium Design */}
      {!collapsed && session?.user && (
        <div className="px-6 py-4 border-b border-slate-800/90 bg-gradient-to-r from-slate-900/60 via-slate-950/60 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-500/20">
              {session.user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-slate-100 truncate">{session.user.name || 'Admin'}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider truncate">{(session.user as any)?.role || 'ADMIN'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Ultra Premium Safe Haven Aesthetics */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent overscroll-contain" style={{WebkitOverflowScrolling: 'touch'}}>
        <ul className="space-y-2">
          {navSections.map((section) => {
            const active = isActive(section.href);
            const Icon = section.icon;
            const isOpen = collapsed ? false : openGroups[section.href] ?? active;
            const hasChildren = Boolean(section.children?.length);

            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  onClick={() => trackNavigation(section.href, { source: "admin_nav" })}
                  className={clsx(
                    "group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 border",
                    active
                      ? "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 text-blue-200 border-blue-500/50 shadow-lg shadow-blue-500/20 ring-2 ring-inset ring-blue-500/30"
                      : "text-slate-300 border-transparent hover:bg-slate-800/80 hover:text-white hover:border-slate-700/60 hover:translate-x-1 shadow-sm hover:shadow-lg",
                  )}
                >
                  <Icon className={clsx("h-5 w-5 flex-shrink-0 transition-colors", active ? "text-blue-300" : "text-slate-400 group-hover:text-blue-300")} />
                  {!collapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold">{section.title}</span>
                        {section.badge && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider border border-emerald-500/30 shadow-sm">
                            {section.badge}
                          </span>
                        )}
                      </div>
                      {section.description && (
                        <p className="truncate text-xs font-normal text-slate-400 mt-1">{section.description}</p>
                      )}
                    </div>
                  )}
                  {hasChildren && !collapsed && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleGroup(section.href);
                      }}
                      className="ml-auto p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                      aria-expanded={isOpen}
                      aria-controls={`${section.href}-submenu`}
                    >
                      <ChevronRightIcon className={clsx("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
                    </button>
                  )}
                </Link>

                {hasChildren && !collapsed && isOpen && (
                  <ul
                    id={`${section.href}-submenu`}
                    className="mt-2 ml-4 space-y-1.5 border-l-2 border-slate-800/80 pl-4"
                  >
                    {section.children?.map((child) => {
                      const childActive = pathname.startsWith(child.href) || pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => trackNavigation(child.href, { source: "admin_nav_child" })}
                            className={clsx(
                              "flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 border",
                              childActive
                                ? "bg-blue-600/15 text-blue-200 border-blue-500/30 shadow-sm"
                                : "text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-white hover:translate-x-1",
                            )}
                          >
                            <span className="truncate font-medium">{child.title}</span>
                            {child.badge && (
                              <span className="ml-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase border border-amber-500/30">
                                {child.badge}
                              </span>
                            )}
                            {childActive && <ChartPieIcon className="h-3.5 w-3.5 text-blue-300 ml-2" />}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Ultra Premium Footer Status - Safe Haven Aesthetics */}
      <div className="border-t border-slate-800/90 px-6 py-4 bg-gradient-to-t from-slate-900/90 via-slate-950/90 to-transparent backdrop-blur-sm">
        {!collapsed ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-emerald-500/10 p-4 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">System Status</p>
                <p className="text-sm font-black text-slate-100 mt-1.5">All systems operational</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20">
                <ShieldCheckIcon className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span>Live replicas • Billing pipeline • Scheduled jobs</span>
            </div>
            {session?.user && (
              <div className="mt-3 pt-3 border-t border-emerald-500/20">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Logged in as</p>
                <p className="text-sm font-bold text-slate-200 truncate mt-1">{session.user.email}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20">
              <ShieldCheckIcon className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
        aria-label="Open menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "hidden lg:flex h-screen flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 backdrop-blur-sm transition-[width] duration-300 shadow-2xl shadow-blue-500/5",
          collapsed ? "w-20" : "w-80",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={clsx(
          "lg:hidden fixed left-0 top-0 h-full flex-col border-r border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl z-50 shadow-2xl transition-transform duration-300 overflow-y-auto overscroll-contain",
          mobileOpen ? "translate-x-0 w-80" : "-translate-x-full",
        )}
        style={{WebkitOverflowScrolling: 'touch'}}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <p className="text-sm font-bold text-slate-100">Admin Navigation</p>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}

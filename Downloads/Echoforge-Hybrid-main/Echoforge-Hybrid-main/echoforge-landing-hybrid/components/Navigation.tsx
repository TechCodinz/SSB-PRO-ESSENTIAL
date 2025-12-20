"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { trackCta, trackNavigation } from "@/lib/analytics";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if user is admin
  const userRole = String(session?.user?.role ?? "").toUpperCase();
  const isAdmin = ["ADMIN", "OWNER", "MODERATOR", "READ_ONLY", "SUPERADMIN", "SUPER_ADMIN"].includes(userRole);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle scroll
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const closeMenu = () => setMobileMenuOpen(false)

  const ctaWithTracking = (href: string, name: string, shouldClose = false) => {
    trackCta(name, { destination: href, source: shouldClose ? "mobile_nav" : "desktop_nav" });
    if (shouldClose) closeMenu();
    router.push(href);
  };

  const navLinks = useMemo(() => {
    const links = [
      { href: "/", label: "Home", icon: "🏠" },
      { href: "/features", label: "Features", icon: "⚡" },
      { href: "/demo", label: "Live Demo", icon: "🧪" },
      { href: "/pricing", label: "Pricing", icon: "💰" },
      { href: "/documentation", label: "Docs", icon: "📚" },
      { href: "/security", label: "Security", icon: "🛡️" },
      { href: "/blog", label: "Blog", icon: "📝" },
      { href: "/about", label: "About", icon: "✨" },
      { href: "/contact", label: "Support", icon: "📞" },
    ];

    if (session) {
      // Insert dashboard shortcut near the top for authenticated users
      links.splice(1, 0, { href: "/dashboard", label: "Dashboard", icon: "📊" });
    }

    return links;
  }, [session]);

  return (
    <>
      {/* Ultra-Premium Main Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[50] transition-all duration-500 ${
          scrolled 
            ? "bg-gradient-to-r from-[#0a0f1e]/98 via-[#1a1f3a]/98 to-[#0a0f1e]/98 backdrop-blur-2xl border-b-2 border-blue-500/40 shadow-2xl shadow-blue-500/30" 
            : "bg-gradient-to-r from-[#0a0f1e]/95 via-[#1a1f3a]/95 to-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/20 shadow-xl shadow-purple-500/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo - ULTRA PREMIUM ENHANCED */}
            <Link
              href="/"
              className="flex items-center gap-2 lg:gap-4 group relative"
              onClick={() => {
                trackNavigation("/", { source: "logo" });
                closeMenu();
              }}
            >
              {/* Multi-Layer Animated Glow Effect */}
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-700"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-xl opacity-10 group-hover:opacity-20 blur-xl transition-all duration-500 animate-pulse"></div>
              
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.25 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                className="relative text-3xl lg:text-5xl filter drop-shadow-[0_0_20px_rgba(59,130,246,0.7)] group-hover:drop-shadow-[0_0_30px_rgba(147,51,234,0.9)]"
              >
                🌌
              </motion.div>
              
              <div className="leading-tight relative">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="text-xl lg:text-3xl font-black tracking-wider bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_10px_rgba(59,130,246,0.5)]">
                    ECHOEFORGE
                  </div>
                  {/* Enhanced Enterprise Badge with Glow */}
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 15px rgba(59, 130, 246, 0.4)",
                        "0 0 25px rgba(147, 51, 234, 0.6)",
                        "0 0 15px rgba(59, 130, 246, 0.4)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="hidden lg:block px-3 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full text-xs font-black text-white shadow-2xl border border-white/20"
                  >
                    ENTERPRISE AI
                  </motion.div>
                </div>
                <div className="hidden lg:block text-xs uppercase tracking-[0.3em] text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text font-bold drop-shadow-[0_1px_5px_rgba(59,130,246,0.3)]">
                  AI-Powered Anomaly Detection
                </div>
              </div>
            </Link>

            {/* Desktop Navigation - Premium Dropdown Menu + CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Pages Dropdown */}
              <div className="relative"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-bold text-white/90 hover:text-white bg-gradient-to-br from-white/10 via-white/5 to-transparent hover:bg-gradient-to-r hover:from-blue-500/20 hover:via-purple-500/20 hover:to-pink-500/20 border-2 border-white/10 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/30 backdrop-blur-xl transition-all flex items-center gap-2"
                >
                  <span className="text-xl">📱</span>
                  <span className="text-base">Pages</span>
                  <motion.span
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm"
                  >
                    ▼
                  </motion.span>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-[#0a0f1e] backdrop-blur-3xl border-2 border-blue-400/50 rounded-2xl shadow-2xl shadow-blue-500/40 overflow-hidden z-[60] ring-1 ring-white/10"
                    >
                      <div className="p-2">
                        {navLinks.map((link, index) => (
                          <motion.div
                            key={link.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => {
                                trackNavigation(link.href, { source: "dropdown_nav" });
                                setDropdownOpen(false);
                              }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                                pathname === link.href || pathname.startsWith(`${link.href}/`)
                                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl"
                                  : "text-white hover:text-white hover:bg-white/20 hover:shadow-lg hover:shadow-blue-500/30 border border-transparent hover:border-blue-500/30"
                              }`}
                            >
                              <motion.span
                                whileHover={{ scale: 1.2, rotate: 5 }}
                                className="text-2xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                              >
                                {link.icon}
                              </motion.span>
                              <div className="flex-1">
                                <div className="font-bold text-base">{link.label}</div>
                              </div>
                              <motion.span
                                className="text-white/40 group-hover:text-white/80 transition-colors"
                                whileHover={{ x: 3 }}
                              >
                                →
                              </motion.span>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA Buttons - Session-Aware Authentication Controls */}
              {status === "loading" ? (
                <div className="w-32 h-12 bg-white/5 rounded-2xl animate-pulse"></div>
              ) : session ? (
                // Logged In: Show Profile Dropdown
                <div className="relative"
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border-2 border-blue-400/50 rounded-2xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <span className="font-bold">{session.user?.name || 'User'}</span>
                    <motion.span
                      animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </motion.button>
                  
                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-64 bg-[#0a0f1e] backdrop-blur-3xl border-2 border-blue-400/50 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                      >
                        <div className="p-4 border-b border-white/10">
                          <div className="font-bold">{session.user?.name}</div>
                          <div className="text-sm text-white/60">{session.user?.email}</div>
                          <div className="text-xs text-blue-400 mt-1">{(session.user as any)?.plan || 'Pro'} Plan</div>
                        </div>
                        <div className="p-2">
                          <Link href="/dashboard" onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-xl">📊</span>
                            <span>Dashboard</span>
                          </Link>
                          <Link href="/dashboard/profile" onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-xl">⚙️</span>
                            <span>Settings</span>
                          </Link>
                          <Link href="/dashboard/billing" onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all">
                            <span className="text-xl">💳</span>
                            <span>Billing</span>
                          </Link>
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all text-left"
                          >
                            <span className="text-xl">🚪</span>
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                ) : (
                  // Not Logged In: Show Sign In Button
                  <motion.button
                    onClick={() => ctaWithTracking('/login', 'nav_sign_in')}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex flex-col items-center justify-center px-8 py-3 rounded-2xl overflow-hidden group border border-blue-400/50 bg-gradient-to-br from-white/10 via-white/5 to-transparent text-white shadow-[0_12px_40px_-18px_rgba(56,132,255,0.6)] backdrop-blur-xl transition-all duration-300"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-500/40 via-purple-500/30 to-cyan-500/30" />
                    <div className="absolute inset-[-2px] rounded-[inherit] opacity-0 group-hover:opacity-80 transition-opacity duration-300 border border-white/20" />
                    <span className="relative z-10 flex items-center gap-3 text-base font-black tracking-wide">
                      <motion.span 
                        whileHover={{ scale: 1.15, rotate: 6 }}
                        className="text-xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      >
                        🔐
                      </motion.span>
                      <span>SIGN IN</span>
                      <motion.span
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                        className="text-lg text-white/70"
                      >
                        →
                      </motion.span>
                    </span>
                    <span className="relative z-10 mt-1 text-[11px] uppercase tracking-[0.35em] text-white/60">
                      Secure Console
                    </span>
                  </motion.button>
                )}
            </div>

            {/* Mobile Menu Button - Three Dots / Hamburger */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Mobile Profile Dropdown for Authenticated Users */}
              {session ? (
                <div className="relative profile-dropdown-container">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileMenuOpen(false); // Close hamburger when opening profile
                      setProfileDropdownOpen(!profileDropdownOpen);
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-lg relative z-[110]"
                    aria-label="Profile menu"
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </motion.button>
                  
                  {/* Mobile Profile Dropdown */}
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[115]"
                          onClick={() => setProfileDropdownOpen(false)}
                          aria-hidden="true"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-64 bg-[#0a0f1e] backdrop-blur-3xl border-2 border-blue-400/50 rounded-2xl shadow-2xl overflow-hidden z-[120]"
                          onClick={(e) => e.stopPropagation()}
                          role="menu"
                          aria-label="Profile menu"
                        >
                        <div className="p-4 border-b border-white/10">
                          <div className="font-bold text-white">{session.user?.name}</div>
                          <div className="text-sm text-white/60">{session.user?.email}</div>
                          <div className="text-xs text-blue-400 mt-1">{(session.user as any)?.plan || 'Pro'} Plan</div>
                        </div>
                        <div className="p-2">
                          <Link href="/dashboard" onClick={() => { setProfileDropdownOpen(false); closeMenu(); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white">
                            <span className="text-xl">📊</span>
                            <span>Dashboard</span>
                          </Link>
                          {isAdmin && (
                            <Link href="/dashboard/admin" onClick={() => { setProfileDropdownOpen(false); closeMenu(); }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 transition-all text-white border border-blue-500/30 hover:border-blue-500/60">
                              <span className="text-xl">👑</span>
                              <span className="font-bold text-blue-300">Admin Console</span>
                            </Link>
                          )}
                          <Link href="/dashboard/profile" onClick={() => { setProfileDropdownOpen(false); closeMenu(); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white">
                            <span className="text-xl">⚙️</span>
                            <span>Settings</span>
                          </Link>
                          <Link href="/dashboard/billing" onClick={() => { setProfileDropdownOpen(false); closeMenu(); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-white">
                            <span className="text-xl">💳</span>
                            <span>Billing</span>
                          </Link>
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              closeMenu();
                              signOut({ callbackUrl: '/' });
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all text-left text-white"
                          >
                            <span className="text-xl">🚪</span>
                            <span>Sign Out</span>
                          </button>
                        </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  onClick={() => ctaWithTracking('/login', 'nav_sign_in_mobile')}
                  whileTap={{ scale: 0.9 }}
                  className="px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all shadow-lg text-sm font-bold"
                  aria-label="Sign in"
                >
                  Sign In
                </motion.button>
              )}
              
              {/* Simple Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all relative z-[110]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* NEW Mobile Menu - Rebuilt from scratch */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/95 backdrop-blur-md lg:hidden z-[200]" 
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Menu Panel - Slide from right */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-slate-950 lg:hidden z-[201] shadow-2xl overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="p-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                        pathname === link.href || pathname.startsWith(`${link.href}/`)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                  {session ? (
                    <>
                      <Link 
                        href="/dashboard/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-center"
                      >
                        ⚙️ Settings
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
                      >
                        🚪 Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/login');
                      }}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                    >
                      🔐 Sign In
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer for fixed navigation */}
      <div className="h-20 lg:h-24"></div>
    </>
  );
}

// @ts-nocheck
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orbitron, Sora } from "next/font/google";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["600","700"] });
const sora = Sora({ subsets: ["latin"], weight: ["400","500","600"] });

export default function UltraPremiumNavigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const normalizedRole = String(session?.user?.role ?? "").toUpperCase();
  const isAdmin =
    isAuthenticated &&
    ["ADMIN", "OWNER", "MODERATOR", "READ_ONLY"].includes(normalizedRole);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  // Close menus when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMobileMenuOpen(false)

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/about", label: "About", icon: "ℹ️" },
    { href: "/features", label: "Features", icon: "⚡" },
    { href: "/demo", label: "Demo", icon: "🎮" },
    { href: "/documentation", label: "Docs", icon: "📚" },
    { href: "/pricing", label: "Pricing", icon: "💰" },
    { href: "/blog", label: "Blog", icon: "📝" },
    { href: "/contact", label: "Contact", icon: "📞" }
  ];

  const userName =
    session?.user?.name ||
    (session?.user?.email
      ? session.user.email.split("@")[0]
      : "Echo User");
  const userInitials = userName
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const primaryCtaLabel = isAuthenticated ? "Open Console" : "Start Free Trial";
  const primaryCtaHref = isAuthenticated ? "/dashboard" : "/get-access";

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0b1020]/95 backdrop-blur-xl border-b border-blue-500/30 shadow-2xl shadow-blue-500/10' 
          : 'bg-[#0b1020]/80 backdrop-blur-md border-b border-blue-500/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-12 items-center h-16 ${sora.className}`}>
          {/* Enhanced Logo */}
          <Link href="/" className="col-span-6 sm:col-span-4 lg:col-span-3 flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 p-0.5">
                <div className="w-full h-full rounded-lg bg-[#0b1020] flex items-center justify-center">
                  <span className="text-2xl">🌌</span>
                </div>
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0b1020]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="relative">
              <motion.span 
                className={`${orbitron.className} text-[22px] sm:text-[24px] lg:text-[26px] tracking-[0.08em] bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-purple-300 group-hover:to-cyan-300 transition-all duration-300`}
                whileHover={{ scale: 1.05 }}
              >
                ECHOEFORGE
              </motion.span>
              
              <motion.div
                className="absolute -right-12 -top-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500/15 to-blue-500/15 border border-green-500/25 text-green-300 font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                Enterprise
              </motion.div>
              
              <motion.div
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex col-span-6 lg:col-span-6 items-center justify-center gap-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={item.href} 
                  className="relative group px-3 py-2 rounded-lg text-white/80 hover:text-white transition-all duration-300 hover:bg-white/5"
                  onMouseEnter={() => setActiveSection(item.href)}
                  onMouseLeave={() => setActiveSection("")}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="opacity-80">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </span>
                  
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeSection === item.href ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="hidden lg:flex col-span-6 lg:col-span-3 items-center justify-end">
            <motion.div
              className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-lg shadow-blue-500/15"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              {isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium text-white/90 hover:text-white transition-all duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80 border border-transparent hover:border-white/20"
                    whileTap={{ scale: 0.97 }}
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-sm font-semibold text-white shadow-md shadow-blue-500/30">
                      {userInitials || "U"}
                    </span>
                    <span className="flex flex-col leading-tight text-left">
                      <span className="font-semibold text-white/90">
                        {userName}
                      </span>
                      <span className="text-[11px] text-white/60 uppercase tracking-wide">
                        {normalizedRole || "USER"}
                      </span>
                    </span>
                    <motion.span
                      animate={{ rotate: profileMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white/70"
                    >
                      ▼
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0b1020]/95 backdrop-blur-2xl shadow-2xl shadow-blue-500/20 p-3 space-y-2 z-50"
                        role="menu"
                      >
                        <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                          <p className="text-xs text-white/50 uppercase tracking-[0.2em]">
                            Account
                          </p>
                          <p className="text-sm text-white/90 font-semibold">
                            {session?.user?.email}
                          </p>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white text-sm"
                          role="menuitem"
                        >
                          📊
                          <span>Open Dashboard</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/dashboard/admin"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white text-sm"
                            role="menuitem"
                          >
                            🛡️
                            <span>Admin Console</span>
                          </Link>
                        )}

                        <button
                          onClick={() =>
                            signOut({ callbackUrl: "/" }).finally(() =>
                              setProfileMenuOpen(false)
                            )
                          }
                          className="flex w-full items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-red-300 hover:text-red-200 text-sm"
                          role="menuitem"
                        >
                          ⏻
                          <span>Sign out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              <Link
                href={primaryCtaHref}
                className="relative flex items-center gap-1.5 px-4 py-1.75 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 transition-all duration-300 shadow-xl shadow-blue-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/80"
              >
                <span>🚀</span>
                <span>{primaryCtaLabel}</span>
                <motion.span
                  className="text-xs"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="col-span-6 sm:col-span-8 lg:hidden flex justify-end">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-3 text-white/80 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
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
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-blue-500/20 relative z-10"
            >
              {/* Click-away overlay */}
              <div 
                className="fixed inset-0 top-20 bg-black/50 lg:hidden" 
                onClick={closeMenu} 
              />
              
              <div className="relative bg-[#0b1020]/95 backdrop-blur-xl py-6 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href} 
                      onClick={closeMenu} 
                      className={`flex items-center gap-3 px-6 py-3 hover:bg-white/5 rounded-lg transition-all duration-300 group ${sora.className}`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-white/80 group-hover:text-white">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
                
                <div className="px-6 pt-6 space-y-3 border-t border-white/10">
                  {isAuthenticated ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-white/90">
                          {session?.user?.email}
                        </p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 }}
                      >
                        <Link
                          href="/dashboard"
                          onClick={closeMenu}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 text-white/85 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20"
                        >
                          <span>📊</span>
                          <span className="font-medium">Open Dashboard</span>
                        </Link>
                      </motion.div>

                      {isAdmin && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <Link
                            href="/dashboard/admin"
                            onClick={closeMenu}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 text-white/85 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20"
                          >
                            <span>🛡️</span>
                            <span className="font-medium">Admin Console</span>
                          </Link>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                      >
                        <button
                          onClick={() => {
                            closeMenu();
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 text-red-300 hover:text-red-200 transition-all duration-300 rounded-lg hover:bg-red-500/10 border border-red-500/20"
                        >
                          <span>⏻</span>
                          <span className="font-medium">Sign out</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Link
                          href="/login"
                          onClick={closeMenu}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 text-white/80 hover:text-white transition-all duration-300 rounded-lg hover:bg-white/5 border border-white/10 hover:border-white/20"
                        >
                          <span>🔐</span>
                          <span className="font-medium">Sign In</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Link
                          href={primaryCtaHref}
                          onClick={closeMenu}
                          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <span>🚀</span>
                          <span>{primaryCtaLabel}</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
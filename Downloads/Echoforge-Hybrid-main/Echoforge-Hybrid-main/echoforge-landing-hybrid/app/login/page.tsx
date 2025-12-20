"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)

      console.log('🔐 Login attempt for:', formData.email)

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        console.error('❌ Login error:', result.error)
        toast.error(result.error)
        setLoading(false)
        return
      }

      if (!result?.ok) {
        console.error('❌ Login failed')
        toast.error("Login failed. Please try again.")
        setLoading(false)
        return
      }

      console.log('✅ Login successful! Determining redirect...')
      toast.success("Welcome back!")

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fetch session to determine role-based redirect
      try {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()

        console.log('📋 Session loaded:', {
          user: session?.user?.email,
          role: session?.user?.role,
          plan: session?.user?.plan
        })

        if (!session?.user) {
          console.warn('⚠️ No session user found, defaulting to /dashboard')
          router.push('/dashboard')
          router.refresh()
          return
        }

        // Check if user has admin role
        const role = String(session.user.role || '').toUpperCase()
        const adminRoles = new Set(['ADMIN', 'OWNER', 'MODERATOR', 'READ_ONLY', 'SUPERADMIN', 'SUPER_ADMIN'])
        const isAdmin = adminRoles.has(role)

        // Redirect based on role
        const targetRoute = isAdmin ? '/dashboard/admin' : '/dashboard'

        console.log('🎯 Redirecting to:', targetRoute, '(Role:', role, ', IsAdmin:', isAdmin, ')')

        router.push(targetRoute)
        router.refresh()
      } catch (sessionError) {
        console.error('❌ Session fetch error:', sessionError)
        // Fallback to dashboard if session fetch fails
        router.push('/dashboard')
        router.refresh()
      }

    } catch (error) {
      console.error('❌ Login exception:', error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1f3a] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-4xl">🌌</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent ml-2">
              EchoForge
            </span>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Welcome Back 👋</h1>
          <p className="text-white/60">Sign in to access your dashboard</p>
        </div>

        <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-8 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 bg-black/30 border border-white/10 rounded-lg focus:border-blue-500 focus:outline-none text-white"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/60 hover:text-white"
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-semibold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Development Mode Indicator - Never shows in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                ⚠️ Development Mode Active
              </p>
              <p className="text-xs text-white/50 mt-1">
                Auth fallbacks enabled. Configure env vars for production.
              </p>
            </div>
          )}

          {/* Alternative Login Methods */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0f1630] text-white/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast("🔜 Google OAuth coming soon!", { icon: "🔔" })}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => toast("🔜 GitHub OAuth coming soon!", { icon: "🔔" })}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Protected by enterprise-grade security • Founded by Peters Princewill
        </p>
      </div>
    </main>
  )
}

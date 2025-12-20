"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function GetAccessPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    plan: "starter",
    useCase: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const availablePlans = useMemo(() => new Set(["free", "starter", "pro", "enterprise"]), []);
  const planLabels = useMemo(
    () => ({
      free: "Free",
      starter: "Starter",
      pro: "Professional",
      enterprise: "Enterprise",
    }),
    []
  );
  const planParam = searchParams?.get("plan")?.toLowerCase() ?? null;

  useEffect(() => {
    if (planParam && availablePlans.has(planParam) && planParam !== formData.plan) {
      setFormData((prev) => ({ ...prev, plan: planParam }));
    }
  }, [planParam, availablePlans, formData.plan]);

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="card bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold mb-4">Welcome to EchoForge!</h1>
            <p className="text-xl text-white/70 mb-6">
              Your account has been created successfully!
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-left bg-black/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-2">📧 Email sent to:</p>
                <p className="font-semibold">{formData.email}</p>
              </div>
              <div className="text-left bg-black/20 rounded-lg p-4">
                <p className="text-sm text-white/60 mb-2">📦 Plan selected:</p>
                <p className="font-semibold">{formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</p>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <a 
                href={process.env.NEXT_PUBLIC_ECHOFORGE_APP_URL || "/signup"} 
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Dashboard
              </a>
              <Link href="/documentation" className="btn btn-ghost">
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Get Access to EchoForge
        </h1>
        <p className="text-xl text-white/70">
          Start your free trial today - no credit card required
        </p>
      </section>

      <div className="section max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Signup Form */}
          <div className="card">
            <h2 className="text-3xl font-bold mb-6">Create Your Account</h2>
            <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
              <strong className="text-blue-200">Plan Selected:</strong> {planLabels[formData.plan as keyof typeof planLabels] || "Starter"} plan
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Your Company Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Choose Your Plan *</label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="free">Free - $0/month (Start exploring)</option>
                  <option value="starter">Starter - $39/month (Recommended)</option>
                  <option value="pro">Pro - $129/month (Most popular)</option>
                  <option value="enterprise">Enterprise - $1,499/month (Full power)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What will you use EchoForge for? *</label>
                <textarea
                  name="useCase"
                  value={formData.useCase}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Fraud detection, security monitoring, etc."
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-4 text-lg"
                >
                  {loading ? "Creating Account..." : "🚀 Start Free Trial"}
                </button>
              </div>

              <p className="text-xs text-white/50 text-center">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-blue-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-400 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <h3 className="text-2xl font-bold mb-4">What You Get</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">14-Day Free Trial</div>
                    <div className="text-sm text-white/60">Full access to all features, no credit card needed</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Instant Setup</div>
                    <div className="text-sm text-white/60">Start analyzing data in under 5 minutes</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Full API Access</div>
                    <div className="text-sm text-white/60">RESTful API with comprehensive documentation</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Priority Support</div>
                    <div className="text-sm text-white/60">Get help when you need it via email and chat</div>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Cancel Anytime</div>
                    <div className="text-sm text-white/60">No long-term contracts or commitments</div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">🔒 Enterprise Security</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>SOC 2 Type II</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>GDPR Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>ISO 27001</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>256-bit SSL</span>
                </div>
              </div>
            </div>

            <div className="card bg-black/40">
              <div className="text-center">
                <p className="text-sm text-white/60 mb-2">Trusted by companies worldwide</p>
                <div className="text-3xl font-bold text-blue-400">1,247+</div>
                <p className="text-sm text-white/60">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <section className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Join Industry Leaders</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-4xl mb-3">💰</div>
            <div className="text-2xl font-bold text-green-400 mb-2">$2M+</div>
            <p className="text-sm text-white/60">Fraud Prevented</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">⚡</div>
            <div className="text-2xl font-bold text-blue-400 mb-2">45ms</div>
            <p className="text-sm text-white/60">Avg Response Time</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-2xl font-bold text-purple-400 mb-2">99.9%</div>
            <p className="text-sm text-white/60">Detection Accuracy</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <h2 className="text-3xl font-bold text-center mb-12">Common Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="card">
            <h3 className="font-bold mb-2">Do I need a credit card to start?</h3>
            <p className="text-white/70 text-sm">
              No! Your 14-day free trial doesn't require any payment information. Add it later when you're ready to continue.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Can I change plans later?</h3>
            <p className="text-white/70 text-sm">
              Yes! You can upgrade, downgrade, or cancel anytime. Changes take effect immediately.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">What happens after the trial?</h3>
            <p className="text-white/70 text-sm">
              After 14 days, you can choose a paid plan or continue with our free tier. No automatic charges.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

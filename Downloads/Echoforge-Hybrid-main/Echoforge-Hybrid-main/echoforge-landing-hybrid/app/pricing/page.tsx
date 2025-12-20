"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function PricingPage() {
  const router = useRouter();
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for trying out our cutting-edge AI detection",
      features: [
        "3 analyses per day",
        "Basic anomaly detection",
        "5MB file size limit",
        "7-day data retention",
        "Community support",
        "Email notifications"
      ],
      cta: "Get Started Free",
      href: "/signup",
      popular: false
    },
    {
      name: "Starter",
      price: "$39",
      period: "/month",
      description: "Ideal for professionals and small teams",
      features: [
        "50 analyses per day (1,500/month)",
        "All 10+ detection methods",
        "API Access (10K calls/month)",
        "25MB file size limit",
        "30-day data retention",
        "Email support",
        "Batch processing",
        "Export to CSV/JSON",
        "Up to 3 team members",
        "Webhook notifications"
      ],
      cta: "Start Free Trial",
      href: "/signup",
      popular: true
    },
    {
      name: "Pro",
      price: "$129",
      period: "/month",
      description: "For power users and growing companies",
      features: [
        "⚡ Unlimited analyses",
        "⚡ All 10+ ML/AI detection methods",
        "⚡ API Access (100K calls/month)",
        "100MB file size limit",
        "1-year data retention",
        "Priority support (24/7)",
        "Advanced analytics dashboard",
        "Crypto fraud detection",
        "Deepfake detection (TensorFlow, MediaPipe)",
        "Consensus detection (multi-method)",
        "Explainable AI results",
        "Custom ML models",
        "Up to 10 team members",
        "Advanced webhook notifications",
        "White-label reports"
      ],
      cta: "Start Pro Trial",
      href: "/signup",
      popular: false
    },
    {
      name: "Enterprise",
      price: "$1,499",
      period: "/month",
      description: "Ultimate solution for enterprises dominating the market",
      features: [
        "🏆 Everything in Pro PLUS:",
        "🏆 Unlimited analyses & API calls",
        "🏆 1GB file size limit",
        "🏆 Unlimited data retention",
        "🏆 Dedicated account manager",
        "🏆 99.9% SLA guarantee",
        "🏆 Unlimited team members",
        "🏆 Advanced role management (7 roles)",
        "🏆 Audit logs & compliance",
        "🏆 Custom integrations",
        "🏆 White-label platform",
        "🏆 Custom deployment",
        "🏆 Training & onboarding",
        "🏆 Multi-region support",
        "🏆 Dedicated infrastructure",
        "🏆 24/7 dedicated support",
        "🏆 Custom SLA agreements",
        "🏆 Advanced security features"
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      gradient: true
    }
  ]

  const payAsYouGo = {
    name: "Pay As You Go",
    description: "Perfect flexibility - only pay for what you use",
    pricing: [
      { label: "Analyses", price: "$0.50", unit: "per analysis" },
      { label: "API Calls", price: "$0.01", unit: "per call" },
      { label: "Storage", price: "$0.10", unit: "per GB/month" }
    ],
    features: [
      "No monthly commitment",
      "Scale automatically",
      "All basic + advanced detection methods",
      "API access included",
      "50MB file uploads",
      "90-day data retention",
      "Up to 5 team members",
      "Email support",
      "Batch processing",
      "Webhook notifications"
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1f3a]">
      <main className="pt-16 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your needs. All plans include our cutting-edge ML/AI detection technology.
            <br />
            <span className="text-white/80 font-semibold">Start free, upgrade anytime.</span>
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm">
            <span className="text-blue-400">🎉</span>
            <span>14-day free trial on all paid plans • No credit card required</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 ${
                  plan.gradient
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50'
                    : plan.popular
                    ? 'bg-[#0f1630] border-2 border-blue-500'
                    : 'bg-[#0f1630] border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-xs font-semibold">
                    ⭐ Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-white/60">{plan.period}</span>
                  </div>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span className={feature.startsWith('⚡') || feature.startsWith('🏆') ? 'font-semibold' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => router.push(plan.href)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.gradient
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.cta}
                </motion.button>
              </div>
            ))}
          </div>
        </div>

        {/* Pay As You Go Section */}
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                💳 {payAsYouGo.name}
              </h2>
              <p className="text-white/80">
                {payAsYouGo.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {payAsYouGo.pricing.map((item, i) => (
                <div key={i} className="bg-black/30 border border-white/10 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {item.price}
                  </div>
                  <div className="text-sm text-white/60 mb-1">{item.unit}</div>
                  <div className="text-lg font-semibold">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {payAsYouGo.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <motion.button
              onClick={() => router.push('/get-access')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="block w-full max-w-sm mx-auto text-center py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start Using Pay As You Go
            </motion.button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="max-w-7xl mx-auto px-4 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">🎯 Feature Comparison</h2>
          
          <div className="bg-[#0f1630] border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4">Feature</th>
                    <th className="text-center p-4">Free</th>
                    <th className="text-center p-4">Starter</th>
                    <th className="text-center p-4 bg-blue-500/10">Pro</th>
                    <th className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Daily Analyses</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4">50</td>
                    <td className="text-center p-4 bg-blue-500/5">Unlimited</td>
                    <td className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">API Access</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">✓ 10K/mo</td>
                    <td className="text-center p-4 bg-blue-500/5">✓ 100K/mo</td>
                    <td className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">✓ Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Team Members</td>
                    <td className="text-center p-4">1</td>
                    <td className="text-center p-4">3</td>
                    <td className="text-center p-4 bg-blue-500/5">10</td>
                    <td className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Role Management</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">Basic</td>
                    <td className="text-center p-4 bg-blue-500/5">Advanced</td>
                    <td className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">✓ 7 Roles</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="p-4">Support</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4">Email</td>
                    <td className="text-center p-4 bg-blue-500/5">Priority 24/7</td>
                    <td className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">❓ Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade anytime?",
                a: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your billing cycle."
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund you in full - no questions asked."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, Amex) via Stripe, and cryptocurrency (USDT) on TRC20, ERC20, and BEP20 networks."
              },
              {
                q: "Is there a free trial?",
                a: "Yes! All paid plans include a 14-day free trial. No credit card required to start."
              },
              {
                q: "What happens if I exceed my plan limits?",
                a: "We'll notify you before you hit your limits. You can upgrade to a higher plan or wait until your limits reset."
              },
              {
                q: "Can I use the API on the Starter plan?",
                a: "Yes! Starter, Pro, Enterprise, and Pay As You Go plans all include API access with different usage limits."
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-[#0f1630] border border-white/10 rounded-lg p-6"
              >
                <summary className="font-semibold cursor-pointer">
                  {faq.q}
                </summary>
                <p className="mt-4 text-white/70">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold mb-4">
              Ready to detect anomalies with cutting-edge AI?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of professionals using EchoeForge to catch what others miss
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => router.push('/get-access')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                onClick={() => router.push('/contact')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

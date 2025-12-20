"use client"

import { useState } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import CryptoPayment from "@/components/CryptoPayment"
import axios from "axios"
import toast from "react-hot-toast"

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card')
  const [showPayment, setShowPayment] = useState(false)

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      monthly: 0,
      annual: 0,
      features: [
        '3 analyses per day',
        'Basic anomaly detection',
        'Email support',
        '7-day data retention'
      ]
    },
    {
      id: 'STARTER',
      name: 'Starter',
      monthly: 39,
      annual: 390,
      popular: true,
      features: [
        '50 analyses per day',
        'Advanced detection',
        'Priority support',
        '30-day data retention',
        'API access',
        'Export reports'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      monthly: 129,
      annual: 1290,
      features: [
        'Unlimited analyses',
        'All detection methods',
        '24/7 support',
        '1-year data retention',
        'API access',
        'Crypto fraud detection',
        'Digital forensics',
        'Custom ML models'
      ]
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      monthly: 1499,
      annual: 14990,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Dedicated account manager',
        'SLA guarantee',
        'Unlimited data retention',
        'White-label option',
        'Custom integrations',
        'On-premise deployment'
      ]
    }
  ]

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId)
    setShowPayment(true)
  }

  const handleStripeCheckout = async (planId: string) => {
    try {
      const { data } = await axios.post('/api/stripe/create-checkout', {
        plan: planId
      })
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast.error("Failed to create checkout session")
    }
  }

  const handleFlutterwaveCheckout = async (planId: string) => {
    try {
      const { data } = await axios.post('/api/flutterwave/create-checkout', { plan: planId })
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        window.location.href = '/login'
        return
      }
      toast.error('Failed to create Flutterwave checkout')
    }
  }

  if (showPayment && selectedPlan) {
    const plan = plans.find(p => p.id === selectedPlan)!
    const amount = billingCycle === 'monthly' ? plan.monthly : plan.annual
    
    return (
      <DashboardLayout>
        <div className="p-6">
          <button
            onClick={() => setShowPayment(false)}
            className="mb-6 text-blue-400 hover:text-blue-300"
          >
            ← Back to Plans
          </button>

          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <label className="block text-sm font-medium mb-4">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'crypto'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-4xl mb-2">₿</div>
                  <div className="font-bold mb-1 text-base md:text-lg">Crypto</div>
                  <div className="text-sm text-white/60">Pay with USDT</div>
                  <div className="mt-2 text-xs text-green-400">✓ Instant • Lower fees</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="text-4xl mb-2">💳</div>
                  <div className="font-bold mb-1">Credit Card</div>
                  <div className="text-sm text-white/60">Visa, Mastercard</div>
                  <div className="mt-2 text-xs text-white/60">via Stripe</div>
                </button>
              </div>
            </div>

            <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-8">
              {paymentMethod === 'crypto' ? (
                <CryptoPayment
                  plan={selectedPlan as any}
                  amount={amount}
                  onSuccess={() => {
                    toast.success("Payment submitted! Checking for confirmation...")
                    setShowPayment(false)
                  }}
                  onCancel={() => setShowPayment(false)}
                />
              ) : (
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">Pay with Credit Card</h3>
                  <p className="text-white/60 mb-6">
                    You'll be redirected to secure checkout
                  </p>
                  <button
                    onClick={() => handleFlutterwaveCheckout(selectedPlan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
                  >
                    Continue to Checkout →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">💳 Billing & Subscription</h1>
          <p className="text-white/60">Manage your plan and payment methods</p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Annual <span className="text-green-400 text-sm ml-1">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/50'
                  : 'bg-[#0f1630] border border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="inline-block bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                {plan.monthly === 0 ? (
                  <div className="text-3xl font-bold">Free</div>
                ) : (
                  <>
                    <div className="text-4xl font-bold">
                      ${billingCycle === 'monthly' ? plan.monthly : Math.floor(plan.annual / 12)}
                    </div>
                    <div className="text-white/60 text-sm">
                      per month{billingCycle === 'annual' && ', billed annually'}
                    </div>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.id !== 'FREE' && (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment Methods Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">💎 Payment Methods</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                ₿ Crypto (USDT)
              </h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>✓ Instant activation after verification</li>
                <li>✓ Lower fees (~$1 on TRC20)</li>
                <li>✓ Anonymous payments</li>
                <li>✓ Global accessibility</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                💳 Credit Card (via Stripe)
              </h4>
              <ul className="text-sm text-white/80 space-y-1">
                <li>✓ Instant activation</li>
                <li>✓ Automatic renewal</li>
                <li>✓ Secure payment processing</li>
                <li>✓ Invoice generation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// @ts-nocheck
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckIcon, StarIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { trackCta } from "@/lib/analytics";

export default function UltraPremiumPricing() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const router = useRouter();

  const handlePlanSelect = (planId: string) => {
    const destination = planId === "free" ? `/signup?plan=${planId}` : `/get-access?plan=${planId}`;
    trackCta("pricing_plan_select", { plan: planId, billingCycle, destination });
    router.push(destination);
  };

  const plans = [
    {
      id: "free",
      name: "Starter",
      price: { monthly: 0, annual: 0 },
      description: "Perfect for individuals and small projects",
      icon: "🚀",
      color: "from-gray-500 to-gray-600",
      features: [
        "10 detections per day",
        "Basic ML models",
        "Community support",
        "CSV/JSON upload",
        "Basic analytics",
        "Email notifications"
      ],
      limitations: [
        "Limited to 1GB data",
        "No API access",
        "Basic visualizations only"
      ]
    },
    {
      id: "starter",
      name: "Professional",
      price: { monthly: 39, annual: 390 },
      description: "For growing businesses and teams",
      icon: "💼",
      color: "from-blue-500 to-blue-600",
      features: [
        "250 detections per day",
        "All 10+ ML models",
        "Priority email support",
        "API access included",
        "Advanced analytics",
        "Real-time monitoring",
        "PDF/CSV exports",
        "Slack integrations",
        "Custom thresholds",
        "Webhook notifications"
      ],
      popular: true
    },
    {
      id: "pro",
      name: "Enterprise",
      price: { monthly: 129, annual: 1290 },
      description: "For large organizations and enterprises",
      icon: "🏢",
      color: "from-purple-500 to-purple-600",
      features: [
        "Unlimited detections",
        "All ML models + Consensus",
        "24/7 priority support",
        "Full API access",
        "Real-time streaming",
        "Custom model training",
        "Advanced visualizations",
        "Team collaboration",
        "SSO integration",
        "Custom deployments",
        "Dedicated support",
        "SLA guarantees"
      ]
    },
    {
      id: "enterprise",
      name: "Ultra Premium",
      price: { monthly: 1499, annual: 14990 },
      description: "Cutting-edge features for industry leaders",
      icon: "💎",
      color: "from-pink-500 via-purple-500 to-indigo-500",
      features: [
        "Everything in Enterprise",
        "Quantum-enhanced detection",
        "Federated learning",
        "NeRF radiance fields",
        "Swarm intelligence",
        "Custom AI models",
        "White-label solution",
        "Dedicated infrastructure",
        "Custom integrations",
        "Training & onboarding",
        "Multi-region deployment",
        "Dedicated account manager"
      ],
      premium: true
    }
  ];

  const addOns = [
    {
      name: "Extra Team Members",
      price: 10,
      description: "Add unlimited team members",
      icon: "👥"
    },
    {
      name: "Custom Model Training",
      price: 500,
      description: "Train models on your specific data",
      icon: "🧠"
    },
    {
      name: "Priority Onboarding",
      price: 1000,
      description: "Dedicated setup and training",
      icon: "🎓"
    },
    {
      name: "White Label Solution",
      price: 2000,
      description: "Rebrand the entire platform",
      icon: "🎨"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Ultra-Premium Pricing
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
          Choose the perfect plan for your anomaly detection needs. All plans include our cutting-edge AI technology.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-blue-600 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              billingCycle === "annual"
                ? "bg-blue-600 text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Annual
            <span className="ml-2 px-2 py-1 bg-green-500 text-xs rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
            className={`relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border rounded-2xl p-8 transition-all duration-300 ${
              plan.popular
                ? "border-blue-500/50 scale-105"
                : plan.premium
                ? "border-purple-500/50"
                : "border-white/20 hover:border-blue-500/30"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <StarIcon className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            )}

            {/* Premium Badge */}
            {plan.premium && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Ultra Premium
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/60 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">
                  ${plan.price[billingCycle as keyof typeof plan.price]}
                </span>
                <span className="text-white/60">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                {billingCycle === "annual" && plan.price.annual > 0 && (
                  <div className="text-green-400 text-sm mt-1">
                    Save ${(plan.price.monthly * 12) - plan.price.annual}/year
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Limitations for Free Plan */}
            {plan.id === "free" && (
              <div className="mb-6">
                <div className="text-red-400 text-sm font-semibold mb-2">Limitations:</div>
                <div className="space-y-1">
                  {plan.limitations?.map((limitation, index) => (
                    <div key={index} className="text-red-300/70 text-xs">
                      • {limitation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <motion.button
              onClick={() => handlePlanSelect(plan.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all ${
                plan.id === "free"
                  ? "bg-white/10 border border-white/20 hover:bg-white/20"
                  : `bg-gradient-to-r ${plan.color} hover:shadow-lg`
              }`}
            >
              {plan.id === "free" ? "Start Free" : "Get Started"}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Add-ons Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h3 className="text-2xl font-bold text-center text-white mb-8">Add-ons & Extensions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {addOns.map((addon, index) => (
            <motion.div
              key={addon.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="text-3xl mb-3">{addon.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{addon.name}</h4>
              <p className="text-white/60 text-sm mb-4">{addon.description}</p>
              <div className="text-2xl font-bold text-blue-400">${addon.price}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12"
      >
        <h3 className="text-3xl font-bold text-white mb-4">
          Need a Custom Solution?
        </h3>
        <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
          We offer bespoke implementations for enterprise clients with unique requirements. 
          Get a custom quote tailored to your specific needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={() => {
              trackCta("pricing_contact_sales");
              router.push("/contact?intent=sales");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white text-lg"
          >
            Contact Sales
          </motion.button>
          <motion.button
            onClick={() => {
              trackCta("pricing_schedule_demo");
              router.push("/demo");
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xl font-bold text-white text-lg hover:bg-white/20 transition-all"
          >
            Schedule Demo
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
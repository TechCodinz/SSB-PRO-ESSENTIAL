"use client";
import axios from "axios";
import toast from "react-hot-toast";
import { FormEvent, useState } from "react";
import { env } from "@/lib/env";
import { trackCta, trackEvent } from "@/lib/analytics";

export default function Pricing(){
  const [paymentProvider, setPaymentProvider] = useState("flutterwave");
  
  const KEY = env.apiKey || "demo_key_12345";
  
  const checkoutFlutterwave = async (plan: 'STARTER'|'PRO'|'ENTERPRISE') => {
    try {
      trackCta("flutterwave_checkout_initiated", { plan });
      const { data } = await axios.post('/api/flutterwave/create-checkout', { plan })
      if (data?.url) {
        trackCta("flutterwave_checkout_redirect", { plan });
        window.location.href = data.url
      } else {
        toast.error('Unable to start Flutterwave checkout')
        trackEvent("flutterwave_checkout_error", { plan, reason: "no_redirect" });
      }
    } catch (e:any) {
      trackEvent("flutterwave_checkout_error", {
        plan,
        status: e?.response?.status,
        message: e?.message,
      });
      if (e?.response?.status === 401) {
        window.location.href = '/login'
        return
      }
      toast.error('Flutterwave error')
    }
  }
  
  const handleEarlyAccessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    trackEvent("pricing_waitlist_submit", {
      provider: paymentProvider,
      useCase: formData.get("use_case") || "unspecified",
      companyProvided: Boolean(formData.get("company")),
    });
    toast.success("Early adopter request received! Our team will reach out shortly.");
    event.currentTarget.reset();
  };
  const LOW_BALANCE_BANNER = process.env.NEXT_PUBLIC_LOW_BALANCE_BANNER === "true";
  const LOW_BALANCE_TEXT = process.env.NEXT_PUBLIC_LOW_BALANCE_TEXT || "Low credits? Add USDT for instant access.";
  
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 py-20">
      {LOW_BALANCE_BANNER && (
        <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm text-center">
          {LOW_BALANCE_TEXT}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">Choose Your Plan</h2>
      <p className="text-center text-white/70 mb-4">Enterprise stubs are pre-wired and locked until you upgrade.</p>
      
      {/* Professional Pricing Notice */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6 mb-10 max-w-4xl mx-auto">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-blue-400 mb-2">🏢 Enterprise-Grade Platform</h3>
          <p className="text-white/80 mb-3">
            <strong>Professional Pricing:</strong> Comprehensive anomaly detection with advanced AI and enterprise features
          </p>
          <div className="text-sm text-white/70">
            <p>• Real ML algorithms (IsolationForest, PyOD, LSTM)</p>
            <p>• 12 advanced features including crypto fraud detection</p>
            <p>• Professional support and SLA guarantees</p>
            <p className="text-green-400 mt-2">✅ Crypto payments available for instant access</p>
          </div>
        </div>
      </div>
      
      {/* Payment Provider Selection */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/5 rounded-xl p-1 flex">
              <button
                onClick={() => {
                  setPaymentProvider("flutterwave");
                  trackEvent("pricing_provider_select", { provider: "flutterwave" });
                }}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  paymentProvider === "flutterwave"
                    ? "bg-indigo-600 text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                🌍 Flutterwave
              </button>
          <button
            onClick={() => {
              setPaymentProvider("crypto");
              trackEvent("pricing_provider_select", { provider: "crypto" });
            }}
            className={`px-4 py-2 rounded-lg transition-all text-sm ${
              paymentProvider === "crypto" 
                ? "bg-indigo-600 text-white" 
                : "text-white/70 hover:text-white"
            }`}
          >
            ₿ Crypto
          </button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Free</h3>
          <div className="text-3xl font-bold mb-2">$0/mo</div>
          <div className="text-sm text-green-400 mb-4">Always Free</div>
          <ul className="text-white/80 mb-6">
            <li>• 10 alerts/day</li>
            <li>• 5K rows per analysis</li>
            <li>• Basic detection</li>
            <li>• Community support</li>
            <li>• Public dashboards</li>
          </ul>
          {paymentProvider === "crypto" ? (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-2">Free plan</div>
              <div className="text-xs text-white/50">No payment required</div>
            </div>
          ) : (
            <a
              className="btn btn-primary w-full"
              href={process.env.NEXT_PUBLIC_ECHOFORGE_APP_URL || "/signup"}
              onClick={() => trackCta("pricing_start_free", { provider: paymentProvider })}
            >
              Start Free
            </a>
          )}
          {/* Removed raw cURL snippet to avoid confusing users */}
          <div className="text-xs text-white/50 mt-2">
            {paymentProvider === "flutterwave" ? "🌍 Flutterwave" : "₿ Crypto"}
          </div>
        </div>
        
        <div className="card outline outline-2 outline-indigo-500">
          <h3 className="text-xl font-semibold mb-2">Starter Pro</h3>
          <div className="flex items-baseline justify-center mb-2">
            <div className="text-3xl font-bold">$39/mo</div>
            <div className="text-sm text-green-400 ml-2">Most Popular</div>
          </div>
          <div className="text-sm text-white/60 mb-4">Perfect for growing businesses</div>
          <ul className="text-white/80 mb-6">
            <li>• 250 alerts/day</li>
            <li>• 50K rows per analysis</li>
            <li>• Priority email support</li>
            <li>• PDF & CSV exports</li>
            <li>• API access</li>
            <li>• Slack alerts</li>
          </ul>
          {paymentProvider === "crypto" ? (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-2">Crypto payment available</div>
              <div className="text-xs text-white/50">USDT, BTC, ETH, BNB</div>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                trackCta("pricing_subscribe", { plan: "starter", provider: paymentProvider });
                checkoutFlutterwave('STARTER');
              }}
            >
              Subscribe
            </button>
          )}
          
          <div className="text-xs text-white/50 mt-2">
            {paymentProvider === "flutterwave" ? "🌍 Flutterwave" : "₿ Crypto"}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Professional</h3>
          <div className="flex items-baseline justify-center mb-2">
            <div className="text-3xl font-bold">$129/mo</div>
          </div>
          <div className="text-sm text-white/60 mb-4">For serious power users</div>
          <ul className="text-white/80 mb-6">
            <li>• 1K alerts/day</li>
            <li>• Unlimited rows</li>
            <li>• 24/7 priority support</li>
            <li>• Webhooks & API</li>
            <li>• Real-time monitoring</li>
            <li>• Team collaboration</li>
          </ul>
          {paymentProvider === "crypto" ? (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-2">Crypto payment available</div>
              <div className="text-xs text-white/50">USDT, BTC, ETH, BNB</div>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                trackCta("pricing_subscribe", { plan: "professional", provider: paymentProvider });
                checkoutFlutterwave('PRO');
              }}
            >
              Subscribe
            </button>
          )}
          
          <div className="text-xs text-white/50 mt-2">
            {paymentProvider === "flutterwave" ? "🌍 Flutterwave" : "₿ Crypto"}
          </div>
        </div>

        
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
          <div className="flex items-baseline justify-center mb-2">
            <div className="text-3xl font-bold">$1,499/mo</div>
            <div className="text-sm text-green-400 ml-2">Early Adopter</div>
          </div>
          <div className="text-sm text-red-400 mb-4">Standard: $1,999/mo (Dec 2025)</div>
          <ul className="text-white/80 mb-6">
            <li>• 100k+ alerts/day</li>
            <li>• SSO, SLA</li>
            <li>• Federated • Quantum • NeRF • Swarm</li>
            <li>• Grandfathered pricing</li>
          </ul>
          {paymentProvider === "crypto" ? (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-2">Crypto payment available</div>
              <div className="text-xs text-white/50">USDT, BTC, ETH, BNB</div>
            </div>
          ) : (
            <a
              className="btn btn-primary w-full"
              href="mailto:sales@echoforge.ai"
              onClick={() => trackCta("pricing_contact_sales", { provider: paymentProvider })}
            >
              Talk to Sales
            </a>
          )}
          
          <div className="text-xs text-white/50 mt-2">
            {paymentProvider === "flutterwave" ? "🌍 Flutterwave" : "₿ Crypto"}
          </div>
        </div>
      </div>
      
      {/* User Registration Section */}
      <div className="mt-16 max-w-2xl mx-auto">
        <div className="card">
          <h3 className="text-2xl font-semibold text-center mb-6">🚀 Lock in Early Adopter Pricing</h3>
          <p className="text-center text-white/70 mb-6">
            Register now to secure grandfathered pricing and avoid future price increases
          </p>
          
          <form className="space-y-4" onSubmit={handleEarlyAccessSubmit}>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                placeholder="your@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Company (Optional)</label>
              <input 
                type="text" 
                name="company"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-indigo-500"
                placeholder="Your Company Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Use Case (Optional)</label>
              <select
                name="use_case"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select your primary use case</option>
                <option value="financial">Financial Fraud Detection</option>
                <option value="cybersecurity">Cybersecurity</option>
                <option value="deepfake">Deepfake Detection</option>
                <option value="iot">IoT Monitoring</option>
                <option value="healthcare">Healthcare</option>
                <option value="ecommerce">E-commerce</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="w-full btn btn-primary py-3 text-lg"
            >
              🔒 Lock in Early Adopter Pricing
            </button>
            
            <p className="text-xs text-white/60 text-center">
              By registering, you agree to our terms and confirm you understand the pricing structure.
              <br />
              <strong>No spam, no BS.</strong> We'll only contact you about your account and important updates.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");
  const plan = searchParams.get("plan");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1f3a] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Success Animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="relative flex items-center justify-center w-32 h-32 bg-green-500 rounded-full">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Payment Successful!
        </h1>
        <p className="text-xl text-white/70 mb-8">
          Thank you for choosing EchoForge. Your account has been upgraded to {plan || "Pro"}.
        </p>

        {amount && (
          <div className="inline-block px-6 py-3 bg-white/5 border border-white/10 rounded-lg mb-8">
            <p className="text-sm text-white/40 mb-1">Amount Paid</p>
            <p className="text-2xl font-bold text-white">${amount}</p>
          </div>
        )}

        {/* Features Unlocked */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">🎉 Features Unlocked</h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">Advanced ML Detection</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">Crypto Fraud Analysis</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">Deepfake Detection</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">Priority Support</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">API Access</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white/80">Custom Reports</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/documentation"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-colors"
          >
            View Documentation
          </Link>
        </div>

        {/* Note */}
        <p className="mt-8 text-sm text-white/40">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#0b1020] to-[#1a1f3a] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Enable analytics if needed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0f1630]/95 backdrop-blur-lg border-t border-blue-500/20 shadow-2xl animate-in slide-in-from-bottom duration-500"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p id="cookie-consent-description" className="text-sm text-white/80">
            🍪 We use cookies to enhance your experience, analyze traffic, and personalize content. 
            By clicking "Accept All", you consent to our use of cookies.{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Decline cookies"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium"
            aria-label="Accept cookies"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

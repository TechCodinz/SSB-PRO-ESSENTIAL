'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1020] px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Oops! Something went wrong
          </h1>
          <p className="text-white/70 text-lg mb-8">
            We encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={reset}
            className="btn btn-primary"
            aria-label="Try again"
          >
            🔄 Try Again
          </button>
          <Link href="/" className="btn btn-ghost">
            🏠 Go Home
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            📧 Contact Support
          </Link>
        </div>

        <p className="mt-8 text-sm text-white/50">
          Error ID: {error.digest || 'N/A'}
        </p>
      </div>
    </div>
  );
}

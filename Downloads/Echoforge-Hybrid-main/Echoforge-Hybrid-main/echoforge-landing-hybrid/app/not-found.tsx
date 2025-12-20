import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1020] px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-white/70 text-lg mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link href="/" className="card hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold mb-1">Home</h3>
            <p className="text-sm text-white/60">Go back to homepage</p>
          </Link>
          <Link href="/features" className="card hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold mb-1">Features</h3>
            <p className="text-sm text-white/60">Explore our features</p>
          </Link>
          <Link href="/contact" className="card hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">📧</div>
            <h3 className="font-semibold mb-1">Contact</h3>
            <p className="text-sm text-white/60">Get in touch</p>
          </Link>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/" className="btn btn-primary" aria-label="Return to homepage">
            Return Home
          </Link>
          <Link href="/pricing" className="btn btn-ghost" aria-label="View pricing">
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}

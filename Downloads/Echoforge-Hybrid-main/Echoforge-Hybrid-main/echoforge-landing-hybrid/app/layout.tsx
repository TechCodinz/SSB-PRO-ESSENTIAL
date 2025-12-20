import "./globals.css";
import type { Metadata } from "next";
import ConditionalNav, { ConditionalFooter } from "@/components/ConditionalNav";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = { 
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://echoforge.com'),
  title: {
    default: "EchoeForge - AI-Powered Anomaly Detection Platform",
    template: "%s | EchoeForge"
  },
  description: "Enterprise-grade AI-powered anomaly detection, crypto fraud analysis, and digital forensics. Real-time threat detection from $39/month.",
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: 'website',
    siteName: 'EchoeForge',
    title: 'EchoeForge - AI-Powered Anomaly Detection Platform',
    description: 'Enterprise-grade AI-powered anomaly detection, crypto fraud analysis, and digital forensics.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://echoeforge.com'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EchoeForge - AI-Powered Anomaly Detection Platform',
    description: 'Enterprise-grade AI-powered anomaly detection and security.'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#0b1020] text-[#e6ecff] antialiased">
        <Providers>
          <ConditionalNav />
          {children}
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}

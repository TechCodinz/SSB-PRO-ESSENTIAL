import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - EchoForge",
  description: "EchoForge Terms of Service and user agreement"
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Terms of Service</h1>
        <p className="text-xl text-white/70">Last updated: October 19, 2024</p>
      </section>

      <div className="section max-w-4xl mx-auto">
        <div className="card space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-white/70 mb-3">
              By accessing and using EchoForge ("Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-white/70 mb-3">
              EchoForge provides AI-powered anomaly detection and cybersecurity services through our API 
              and web platform. Our services include but are not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Real-time anomaly detection</li>
              <li>Deepfake detection and analysis</li>
              <li>Cryptocurrency fraud detection</li>
              <li>Cybersecurity threat monitoring</li>
              <li>Data analysis and visualization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-white/70 mb-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Provide accurate and complete registration information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Acceptable Use Policy</h2>
            <p className="text-white/70 mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or malware</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use the Service for illegal activities</li>
              <li>Reverse engineer or decompile our software</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. API Usage and Rate Limits</h2>
            <p className="text-white/70 mb-3">
              API usage is subject to rate limits based on your subscription plan. Exceeding these limits 
              may result in temporary service suspension. Current limits are:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Free Plan: 100 requests per day</li>
              <li>Pro Plan: 10,000 requests per day</li>
              <li>Enterprise Plan: Custom limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Payment and Billing</h2>
            <p className="text-white/70 mb-3">
              Paid subscriptions are billed in advance on a monthly or annual basis. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Provide accurate billing information</li>
              <li>Pay all fees when due</li>
              <li>Be responsible for all applicable taxes</li>
              <li>Update payment information as needed</li>
            </ul>
            <p className="text-white/70 mt-3">
              Refunds are provided within 30 days of initial purchase only. No refunds for cancellations 
              after this period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Data and Privacy</h2>
            <p className="text-white/70 mb-3">
              We collect and process data as described in our Privacy Policy. You retain ownership of your data. 
              We use your data only to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
            <p className="text-white/70 mb-3">
              The Service and its original content, features, and functionality are owned by EchoForge and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual 
              property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Service Availability</h2>
            <p className="text-white/70 mb-3">
              We strive for 99.9% uptime but do not guarantee uninterrupted service. We reserve the right to 
              modify or discontinue the Service with reasonable notice. Planned maintenance will be announced 
              in advance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
            <p className="text-white/70 mb-3">
              To the maximum extent permitted by law, EchoForge shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use or inability 
              to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
            <p className="text-white/70 mb-3">
              We may terminate or suspend your account and access to the Service immediately, without prior 
              notice, for conduct that we believe violates these Terms or is harmful to other users, us, or 
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Changes to Terms</h2>
            <p className="text-white/70 mb-3">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes via email or platform notification. Continued use of the Service after changes 
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
            <p className="text-white/70 mb-3">
              These Terms shall be governed by and construed in accordance with the laws of the State of 
              California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
            <p className="text-white/70">
              For questions about these Terms, please contact us at:
              <br /><br />
              <strong>Email:</strong> legal@echoforge.com<br />
              <strong>Address:</strong> 123 AI Boulevard, San Francisco, CA 94105
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <a href="/contact" className="btn btn-primary">
            Contact Us About Terms
          </a>
        </div>
      </div>
    </main>
  );
}

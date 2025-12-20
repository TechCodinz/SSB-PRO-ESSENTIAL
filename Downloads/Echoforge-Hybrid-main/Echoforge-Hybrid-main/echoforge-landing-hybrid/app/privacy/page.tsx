import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - EchoForge",
  description: "EchoForge Privacy Policy and data protection information"
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-xl text-white/70">Last updated: October 19, 2024</p>
      </section>

      <div className="section max-w-4xl mx-auto">
        <div className="card space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-white/70 mb-3">
              EchoForge ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Personal Information</h3>
            <p className="text-white/70 mb-3">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Name and email address</li>
              <li>Company name and role</li>
              <li>Billing and payment information</li>
              <li>Account credentials</li>
              <li>Support communications</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Usage Data</h3>
            <p className="text-white/70 mb-3">
              We automatically collect certain information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>API usage statistics and logs</li>
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Session data and cookies</li>
              <li>Feature usage analytics</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Data You Analyze</h3>
            <p className="text-white/70 mb-3">
              When you use our anomaly detection services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>We process your data to provide detection results</li>
              <li>Data is encrypted in transit and at rest</li>
              <li>We do not use your data to train our models without consent</li>
              <li>Data is retained according to your plan's retention policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-white/70 mb-3">
              We use collected information for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Providing and maintaining our services</li>
              <li>Processing your transactions</li>
              <li>Sending important notifications</li>
              <li>Providing customer support</li>
              <li>Improving our services and developing new features</li>
              <li>Detecting and preventing fraud and abuse</li>
              <li>Complying with legal obligations</li>
              <li>Analyzing usage patterns (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-white/70 mb-3">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate (e.g., hosting, payment processing)</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-white/70 mb-3">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>End-to-end encryption for data in transit (TLS 1.3)</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Regular security audits and penetration testing</li>
              <li>Multi-factor authentication</li>
              <li>Access controls and logging</li>
              <li>SOC 2 Type II certified infrastructure</li>
              <li>GDPR and CCPA compliant data handling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
            <p className="text-white/70 mb-3">
              We retain your information for as long as necessary:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong>Account data:</strong> Until account deletion + 90 days</li>
              <li><strong>Analysis data:</strong> Based on your plan (7-365 days)</li>
              <li><strong>Billing records:</strong> 7 years for tax compliance</li>
              <li><strong>Support tickets:</strong> 3 years</li>
              <li><strong>Logs:</strong> 90 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
            <p className="text-white/70 mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
            </ul>
            <p className="text-white/70 mt-3">
              To exercise these rights, contact us at privacy@echoforge.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking</h2>
            <p className="text-white/70 mb-3">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li><strong>Essential cookies:</strong> Required for service functionality</li>
              <li><strong>Analytics cookies:</strong> Understanding usage patterns</li>
              <li><strong>Preference cookies:</strong> Remembering your settings</li>
            </ul>
            <p className="text-white/70 mt-3">
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
            <p className="text-white/70 mb-3">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure adequate protection through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-white/70 ml-4">
              <li>Standard contractual clauses</li>
              <li>Privacy Shield certification (where applicable)</li>
              <li>Data processing agreements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
            <p className="text-white/70 mb-3">
              Our services are not directed to children under 13. We do not knowingly collect information 
              from children. If we learn we have collected such information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Changes to Privacy Policy</h2>
            <p className="text-white/70 mb-3">
              We may update this Privacy Policy periodically. We will notify you of significant changes via 
              email or platform notification. The "Last updated" date at the top indicates when changes were made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-white/70">
              For privacy-related questions or to exercise your rights:
              <br /><br />
              <strong>Data Protection Officer:</strong> privacy@echoforge.com<br />
              <strong>Email:</strong> support@echoforge.com<br />
              <strong>Address:</strong> 123 AI Boulevard, San Francisco, CA 94105<br />
              <strong>Phone:</strong> +1 (800) ECHO-FORGE
            </p>
          </section>

          <section className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🔒 Security Certifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl mb-1">🛡️</div>
                <div className="text-sm font-semibold">SOC 2 Type II</div>
              </div>
              <div>
                <div className="text-3xl mb-1">🇪🇺</div>
                <div className="text-sm font-semibold">GDPR Compliant</div>
              </div>
              <div>
                <div className="text-3xl mb-1">🇺🇸</div>
                <div className="text-sm font-semibold">CCPA Compliant</div>
              </div>
              <div>
                <div className="text-3xl mb-1">🔐</div>
                <div className="text-sm font-semibold">ISO 27001</div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <a href="/contact" className="btn btn-primary">
            Contact Privacy Team
          </a>
          <a href="/security" className="btn btn-ghost">
            View Security Info
          </a>
        </div>
      </div>
    </main>
  );
}

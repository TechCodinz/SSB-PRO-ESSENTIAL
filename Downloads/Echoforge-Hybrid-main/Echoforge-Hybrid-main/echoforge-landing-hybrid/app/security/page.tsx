import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Security - EchoForge",
  description: "EchoForge security practices, certifications, and compliance information"
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Security & Compliance
        </h1>
        <p className="text-xl text-white/70">
          Enterprise-grade security built into every layer of our platform
        </p>
      </section>

      {/* Certifications */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-12 text-center">Industry Certifications</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="text-6xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">SOC 2 Type II</h3>
            <p className="text-sm text-white/60">Audited security controls</p>
            <Link href="/documentation#soc2" className="mt-4 inline-flex text-blue-400 hover:underline text-sm">
              View Report →
            </Link>
          </div>
          <div className="card text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">ISO 27001</h3>
            <p className="text-sm text-white/60">Information security management</p>
            <Link href="/documentation#iso27001" className="mt-4 inline-flex text-blue-400 hover:underline text-sm">
              View Certificate →
            </Link>
          </div>
          <div className="card text-center">
            <div className="text-6xl mb-4">🇪🇺</div>
            <h3 className="text-xl font-bold mb-2">GDPR Compliant</h3>
            <p className="text-sm text-white/60">EU data protection</p>
            <Link href="/documentation#gdpr" className="mt-4 inline-flex text-blue-400 hover:underline text-sm">
              Learn More →
            </Link>
          </div>
          <div className="card text-center">
            <div className="text-6xl mb-4">🇺🇸</div>
            <h3 className="text-xl font-bold mb-2">CCPA Compliant</h3>
            <p className="text-sm text-white/60">California privacy</p>
            <Link href="/documentation#ccpa" className="mt-4 inline-flex text-blue-400 hover:underline text-sm">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl">
        <h2 className="text-4xl font-bold mb-12 text-center">Security Measures</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Encryption</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>TLS 1.3 for data in transit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>AES-256 encryption at rest</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>End-to-end encrypted API calls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Encrypted database backups</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🔑</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Access Control</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Multi-factor authentication (MFA)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Role-based access control (RBAC)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>SSO integration (SAML, OAuth)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>API key rotation policies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Monitoring & Logging</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>24/7 security monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Comprehensive audit logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Real-time intrusion detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Automated threat response</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🛡️</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Infrastructure Security</h3>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Regular penetration testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>DDoS protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Vulnerability scanning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Secure cloud infrastructure</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-12 text-center">Data Protection</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Data Isolation</h3>
            <p className="text-white/70 text-sm mb-4">
              Your data is isolated in secure, dedicated environments. Multi-tenant 
              isolation ensures no cross-contamination between accounts.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Dedicated database schemas</li>
              <li>• Network segmentation</li>
              <li>• Logical data separation</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Backup & Recovery</h3>
            <p className="text-white/70 text-sm mb-4">
              Automated backups with point-in-time recovery. Your data is replicated 
              across multiple geographic regions.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Hourly automated backups</li>
              <li>• 99.999% durability</li>
              <li>• Multi-region replication</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Data Retention</h3>
            <p className="text-white/70 text-sm mb-4">
              You control your data retention policies. Automatic deletion based 
              on your preferences and compliance requirements.
            </p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• Configurable retention</li>
              <li>• Secure data deletion</li>
              <li>• Compliance-ready</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="section bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-3xl">
        <h2 className="text-4xl font-bold mb-8 text-center">Incident Response</h2>
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <p className="text-white/70 mb-6">
              We have a comprehensive incident response plan to quickly detect, respond to, 
              and recover from security incidents.
            </p>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">🔍</div>
                <h4 className="font-bold mb-1">Detection</h4>
                <p className="text-sm text-white/60">Real-time monitoring</p>
              </div>
              <div>
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="font-bold mb-1">Response</h4>
                <p className="text-sm text-white/60">&lt;15 min activation</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🔧</div>
                <h4 className="font-bold mb-1">Mitigation</h4>
                <p className="text-sm text-white/60">Immediate action</p>
              </div>
              <div>
                <div className="text-4xl mb-2">📋</div>
                <h4 className="font-bold mb-1">Reporting</h4>
                <p className="text-sm text-white/60">Full transparency</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <p className="text-sm text-white/70">
                <strong>Bug Bounty Program:</strong> We reward security researchers who 
                responsibly disclose vulnerabilities. Report issues to security@echoforge.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-12 text-center">Security Best Practices</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-3">🔑 API Key Management</h3>
            <ul className="space-y-2 text-white/70 text-sm ml-4">
              <li>• Store API keys securely (use environment variables)</li>
              <li>• Never commit keys to version control</li>
              <li>• Rotate keys regularly (at least every 90 days)</li>
              <li>• Use different keys for dev/staging/production</li>
              <li>• Implement key rotation automation</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-3">🔒 Authentication</h3>
            <ul className="space-y-2 text-white/70 text-sm ml-4">
              <li>• Enable multi-factor authentication (MFA)</li>
              <li>• Use strong, unique passwords</li>
              <li>• Implement SSO for team accounts</li>
              <li>• Review access logs regularly</li>
              <li>• Revoke access for inactive users</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-3">📊 Data Handling</h3>
            <ul className="space-y-2 text-white/70 text-sm ml-4">
              <li>• Encrypt sensitive data before transmission</li>
              <li>• Minimize data retention periods</li>
              <li>• Implement proper data classification</li>
              <li>• Use HTTPS for all API calls</li>
              <li>• Validate and sanitize all inputs</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Security */}
      <section className="section text-center">
        <div className="card max-w-3xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">Security Questions?</h2>
          <p className="text-lg text-white/70 mb-6">
            Our security team is here to help with any concerns or questions
          </p>
          <div className="space-y-3">
            <a href="mailto:security@echoforge.com" className="btn btn-primary inline-block">
              Contact Security Team
            </a>
            <div className="text-sm text-white/60">
              <p>Report vulnerabilities: security@echoforge.com</p>
              <p className="mt-2">For urgent security issues, call: +1 (800) ECHO-FORGE</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

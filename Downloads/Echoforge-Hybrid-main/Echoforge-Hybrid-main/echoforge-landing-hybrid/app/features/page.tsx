"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function FeaturesPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Enterprise Features
        </h1>
        <p className="text-xl text-white/70">
          Comprehensive AI-powered detection across all your critical systems
        </p>
      </section>

      {/* Core Features */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-12 text-center">Core Detection Capabilities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link href="/dashboard/crypto" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-2xl font-bold mb-4">Crypto Fraud Detection</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Blockchain transaction analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Wallet behavior anomalies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Smart contract vulnerability scanning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Real-time fraud alerts</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard/forensics" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold mb-4">Deepfake Detection</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Video manipulation detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Synthetic audio identification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Image forensics analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Real-time streaming verification</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard/analytics" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-4">Financial Fraud</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Credit card fraud patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Unusual transaction spikes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Money laundering detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Payment anomaly alerts</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard/analytics" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-2xl font-bold mb-4">Cybersecurity</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Network intrusion detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>DDoS attack prevention</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Malware behavior analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Insider threat monitoring</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard/analytics" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="text-2xl font-bold mb-4">IoT & Industrial</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Sensor data anomalies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Equipment failure prediction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Production line monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Environmental alerts</span>
              </li>
            </ul>
          </Link>

          <Link href="/dashboard/analytics" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-5xl mb-4">🏥</div>
            <h3 className="text-2xl font-bold mb-4">Healthcare</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Patient vital monitoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Medical device alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Drug interaction warnings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <span>Clinical data validation</span>
              </li>
            </ul>
          </Link>
        </div>
      </section>

      {/* AI Technology */}
      <section className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl">
        <h2 className="text-4xl font-bold mb-12 text-center">Advanced AI Technology</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Neural Network Architecture</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400">🧠</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Autoencoder Networks</h4>
                  <p className="text-sm text-white/60">Deep learning models that learn normal patterns and detect deviations with 99.9% accuracy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-400">⚡</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Real-time Processing</h4>
                  <p className="text-sm text-white/60">Sub-100ms anomaly detection on streaming data with horizontal scaling</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-cyan-400">📊</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Adaptive Thresholds</h4>
                  <p className="text-sm text-white/60">Self-adjusting sensitivity based on data patterns and historical performance</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold mb-6">Enterprise Capabilities</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400">🔒</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Federated Learning</h4>
                  <p className="text-sm text-white/60">Train models across organizations without sharing sensitive data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400">⚛️</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Quantum-Enhanced</h4>
                  <p className="text-sm text-white/60">Quantum computing integration for ultra-sensitive applications</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-400">🌐</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Multi-Modal Analysis</h4>
                  <p className="text-sm text-white/60">Process text, images, audio, video, and numerical data simultaneously</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-12 text-center">Seamless Integration</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/documentation" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-4xl mb-4">🔌</div>
            <h3 className="text-xl font-bold mb-3">RESTful API</h3>
            <p className="text-white/60 mb-4">
              Simple HTTP endpoints with comprehensive documentation and SDKs for all major languages
            </p>
            <div className="bg-black/30 rounded-lg p-3 text-xs font-mono">
              POST /api/v1/analyze<br/>
              Content-Type: application/json
            </div>
          </Link>

          <Link href="/documentation" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Webhooks</h3>
            <p className="text-white/60 mb-4">
              Real-time notifications for detected anomalies sent to your systems instantly
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Real-time</span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Reliable</span>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Secure</span>
            </div>
          </Link>

          <Link href="/documentation" className="card block hover:border-blue-500/40 transition-colors">
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-3">SDKs & Libraries</h3>
            <p className="text-white/60 mb-4">
              Native libraries for Python, JavaScript, Java, Go, and more
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Python</span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Node.js</span>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Java</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Performance */}
      <section className="section">
        <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <h2 className="text-3xl font-bold mb-8 text-center">Performance at Scale</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-3">⚡</div>
              <div className="text-3xl font-bold text-blue-400 mb-2">&lt;100ms</div>
              <div className="text-sm text-white/60">Detection Latency</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">📊</div>
              <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-sm text-white/60">Events/Second</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">🎯</div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
              <div className="text-sm text-white/60">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-3">🌍</div>
              <div className="text-3xl font-bold text-green-400 mb-2">99.99%</div>
              <div className="text-sm text-white/60">Uptime SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-white/70 mb-8">
          Try EchoeForge free for 14 days. No credit card required.
        </p>
        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={() => router.push('/get-access')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary text-lg px-8 py-4"
          >
            Start Free Trial
          </motion.button>
          <motion.button
            onClick={() => router.push('/documentation')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-ghost text-lg px-8 py-4"
          >
            View Documentation
          </motion.button>
        </div>
      </section>
    </main>
  );
}

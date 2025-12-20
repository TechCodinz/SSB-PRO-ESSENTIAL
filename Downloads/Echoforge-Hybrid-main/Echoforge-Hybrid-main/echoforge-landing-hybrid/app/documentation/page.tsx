"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CopyCurl from "@/components/CopyCurl";
import { motion } from "framer-motion";
import { env, getApiUrl } from "@/lib/env";

export default function DocumentationPage() {
  const router = useRouter();
  const API_URL = env.apiBaseUrl;
  const API_KEY = env.apiKey || "demo_key_12345";
  const sdkColorStyles: Record<"yellow" | "green" | "red" | "cyan", string> = {
    yellow: "bg-yellow-500/20",
    green: "bg-green-500/20",
    red: "bg-red-500/20",
    cyan: "bg-cyan-500/20",
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Documentation
        </h1>
        <p className="text-xl text-white/70">
          Everything you need to integrate EchoeForge into your applications
        </p>
      </section>

      {/* Quick Start */}
      <section className="section">
        <h2 className="text-4xl font-bold mb-8">Quick Start</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.a 
            href="#getting-started" 
            whileHover={{ scale: 1.05 }}
            className="card"
          >
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-xl font-bold mb-2">Getting Started</h3>
            <p className="text-white/60 text-sm">5-minute guide to your first API call</p>
          </motion.a>
          <motion.a 
            href="#api-reference" 
            whileHover={{ scale: 1.05 }}
            className="card"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-xl font-bold mb-2">API Reference</h3>
            <p className="text-white/60 text-sm">Complete endpoint documentation</p>
          </motion.a>
          <motion.a 
            href="#sdks" 
            whileHover={{ scale: 1.05 }}
            className="card"
          >
            <div className="text-4xl mb-3">🛠️</div>
            <h3 className="text-xl font-bold mb-2">SDKs & Libraries</h3>
            <p className="text-white/60 text-sm">Client libraries for your language</p>
          </motion.a>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8">🚀 Getting Started</h2>
        
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-2xl font-bold mb-4">1. Get Your API Key</h3>
            <p className="text-white/70 mb-4">
              Sign up for a free account and generate your API key from the dashboard.
            </p>
            <motion.button
              onClick={() => router.push('/signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
            >
              Get API Key
            </motion.button>
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold mb-4">2. Make Your First Request</h3>
            <p className="text-white/70 mb-4">
              Use this example to test the API with sample data:
            </p>
            <CopyCurl 
              label="Copy cURL Example"
              curl={`curl -X POST "${getApiUrl("/v1/detect")}" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '{"data": [[1,2,3],[4,5,6]]}'`}
            />
          </div>

          <div className="card">
            <h3 className="text-2xl font-bold mb-4">3. Interpret Results</h3>
            <p className="text-white/70 mb-4">
              The API returns JSON with detected anomalies:
            </p>
            <div className="bg-black/40 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 font-mono">
{`{
  "success": true,
  "anomaly_count": 2,
  "total_points": 100,
  "anomaly_rate": 0.02,
  "anomalies": [
    {
      "index": 42,
      "score": 0.95,
      "severity": "high",
      "timestamp": "2024-10-19T10:30:00Z"
    }
  ],
  "metadata": {
    "method": "isolation_forest",
    "processing_time_ms": 45
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api-reference" className="section">
        <h2 className="text-3xl font-bold mb-8">📚 API Reference</h2>
        
        <div className="space-y-6">
          {/* Analyze Endpoint */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">POST /api/v1/analyze</h3>
                <p className="text-white/60 text-sm mt-1">Basic anomaly detection</p>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Authentication Required</span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Request Body</h4>
              <div className="bg-black/40 rounded p-3 text-sm font-mono">
                <div><span className="text-blue-400">data</span>: <span className="text-purple-400">array</span> - Your data points</div>
                <div><span className="text-blue-400">method</span>: <span className="text-purple-400">string</span> - Detection method (optional)</div>
                <div><span className="text-blue-400">sensitivity</span>: <span className="text-purple-400">number</span> - 0.5 to 2.0 (optional)</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Response</h4>
              <div className="bg-black/40 rounded p-3 text-sm font-mono text-white/70">
                Returns anomaly detection results with scores and metadata
              </div>
            </div>
          </div>

          {/* Enhanced Endpoint */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">POST /api/v1/analyze/enhanced</h3>
                <p className="text-white/60 text-sm mt-1">Advanced detection with visualization</p>
              </div>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Pro Plan</span>
            </div>
            
            <p className="text-white/70 mb-3">
              Same as basic analyze but includes visualization data and advanced metrics
            </p>
          </div>

          {/* Deepfake Endpoint */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">POST /api/v1/deepfake/detect</h3>
                <p className="text-white/60 text-sm mt-1">Deepfake detection for media</p>
              </div>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Enterprise</span>
            </div>
            
            <p className="text-white/70">
              Upload images, videos, or audio files for deepfake analysis
            </p>
          </div>

          {/* Crypto Endpoint */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">POST /api/v1/crypto/analyze</h3>
                <p className="text-white/60 text-sm mt-1">Blockchain fraud detection</p>
              </div>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Enterprise</span>
            </div>
            
            <p className="text-white/70">
              Analyze blockchain transactions for fraud patterns
            </p>
          </div>
        </div>
      </section>

      <section id="compliance" className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8">🔐 Compliance & Certifications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div id="soc2" className="card">
            <h3 className="text-2xl font-bold mb-2">SOC 2 Type II</h3>
            <p className="text-white/70 mb-4">
              Independent auditors review our controls annually. Request the executive summary directly from the
              security team.
            </p>
            <a
              href="mailto:security@echoforge.com?subject=SOC%202%20Report%20Request"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              Request Report →
            </a>
          </div>

          <div id="iso27001" className="card">
            <h3 className="text-2xl font-bold mb-2">ISO 27001</h3>
            <p className="text-white/70 mb-4">
              EchoeForge maintains an ISO 27001 compliant ISMS that covers infrastructure, personnel, and processes.
            </p>
            <a
              href="mailto:security@echoforge.com?subject=ISO%2027001%20Certificate%20Request"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              Download Certificate →
            </a>
          </div>

          <div id="gdpr" className="card">
            <h3 className="text-2xl font-bold mb-2">GDPR Resource Center</h3>
            <p className="text-white/70 mb-4">
              Access our Data Processing Agreement, EU sub-processors, and data residency controls for European
              customers.
            </p>
            <a
              href="mailto:privacy@echoforge.com?subject=GDPR%20Documentation%20Request"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              Request GDPR Pack →
            </a>
          </div>

          <div id="ccpa" className="card">
            <h3 className="text-2xl font-bold mb-2">CCPA & US Privacy</h3>
            <p className="text-white/70 mb-4">
              Review our CCPA readiness checklist, consumer-rights workflow, and data deletion SLAs for US regions.
            </p>
            <a
              href="mailto:privacy@echoforge.com?subject=CCPA%20and%20US%20Privacy%20Resources"
              className="btn btn-primary inline-flex items-center gap-2"
            >
              Request Privacy Pack →
            </a>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section id="sdks" className="section bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8">🛠️ SDKs & Libraries</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: "🐍", name: "Python SDK", tag: "Most popular choice", install: "pip install echoforge-sdk", url: "https://github.com/echoforge/python-sdk", color: "yellow" },
            { icon: "📦", name: "Node.js SDK", tag: "JavaScript/TypeScript", install: "npm install @echoforge/sdk", url: "https://github.com/echoforge/node-sdk", color: "green" },
            { icon: "☕", name: "Java SDK", tag: "Maven & Gradle", install: "<dependency>echoforge-java</dependency>", url: "https://github.com/echoforge/java-sdk", color: "red" },
            { icon: "🔷", name: "Go SDK", tag: "High performance", install: "go get github.com/echoforge/go-sdk", url: "https://github.com/echoforge/go-sdk", color: "cyan" }
          ].map((sdk, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg ${sdkColorStyles[sdk.color as keyof typeof sdkColorStyles] ?? sdkColorStyles.green} flex items-center justify-center text-2xl`}>
                  {sdk.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{sdk.name}</h3>
                  <p className="text-sm text-white/60">{sdk.tag}</p>
                </div>
              </div>
              <div className="bg-black/40 rounded p-3 mb-3">
                <code className="text-sm text-green-400">{sdk.install}</code>
              </div>
              <a href={sdk.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                View on GitHub →
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="section text-center">
        <div className="card max-w-3xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">Need Help?</h2>
          <p className="text-lg text-white/70 mb-6">
            Our documentation is continuously updated. For additional support, reach out to our team.
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => router.push('/contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary"
            >
              Contact Support
            </motion.button>
            <motion.a
              href={`${API_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-ghost"
            >
              API Reference
            </motion.a>
          </div>
        </div>
      </section>
    </main>
  );
}

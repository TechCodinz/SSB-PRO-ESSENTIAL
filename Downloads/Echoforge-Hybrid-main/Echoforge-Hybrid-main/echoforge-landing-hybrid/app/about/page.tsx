import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - EchoeForge",
  description: "Learn about EchoeForge's mission to revolutionize AI-powered anomaly detection and cybersecurity"
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Building the Future of AI Security
        </h1>
        <p className="text-xl text-white/70">
          EchoeForge is pioneering enterprise-grade anomaly detection powered by cutting-edge AI and machine learning
        </p>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-white/70 mb-4">
              We're on a mission to make enterprise security accessible, intelligent, and proactive. 
              In a world where threats evolve daily, organizations need AI-powered defense systems 
              that can detect anomalies before they become critical incidents.
            </p>
            <p className="text-lg text-white/70">
              EchoeForge combines advanced neural networks, real-time processing, and enterprise-scale 
              infrastructure to deliver the most sophisticated anomaly detection platform available.
            </p>
          </div>
          <div className="card">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-3xl font-bold text-blue-400">99.9%</div>
                <div className="text-sm text-white/60">Accuracy Rate</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-3xl font-bold text-purple-400">&lt;100ms</div>
                <div className="text-sm text-white/60">Response Time</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-cyan-400">50+</div>
                <div className="text-sm text-white/60">Countries Served</div>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🏆</div>
                <div className="text-3xl font-bold text-green-400">10+</div>
                <div className="text-sm text-white/60">AI Models</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section bg-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Leadership Team</h2>
          <p className="text-lg text-white/70">
            Meet the visionaries building the future of AI-powered security
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Founder */}
          <div className="card mb-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-6xl font-bold">
                PP
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-block px-4 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-3">
                  Founder & CEO
                </div>
                <h3 className="text-3xl font-bold mb-2">Peters Princewill</h3>
                <p className="text-xl text-blue-400 mb-4">Founder & Chief Executive Officer</p>
                <p className="text-white/80 mb-6">
                  Visionary technologist and entrepreneur with expertise in AI, machine learning, and cybersecurity. 
                  Peters founded EchoeForge with the mission to democratize enterprise-grade anomaly detection and 
                  make cutting-edge AI security accessible to organizations of all sizes.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">AI/ML Expert</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">Deep Learning</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">Cybersecurity</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">Blockchain</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats About Leadership */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-4xl mb-3">🎓</div>
              <div className="text-2xl font-bold mb-2">10+ Years</div>
              <div className="text-sm text-white/60">AI/ML Experience</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">💡</div>
              <div className="text-2xl font-bold mb-2">15+ Models</div>
              <div className="text-sm text-white/60">Developed & Deployed</div>
            </div>
            <div className="card text-center">
              <div className="text-4xl mb-3">🚀</div>
              <div className="text-2xl font-bold mb-2">99.1%</div>
              <div className="text-sm text-white/60">Detection Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Innovation */}
      <section className="section">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Innovation</h2>
          <p className="text-lg text-white/70">
            Built by experts, trusted by enterprises
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-3">10+ AI Models</h3>
            <p className="text-white/70">
              Ensemble of statistical, ML, and deep learning models working in consensus for 99.1% accuracy
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">🔬</div>
            <h3 className="text-xl font-bold mb-3">Deepfake Detection</h3>
            <p className="text-white/70">
              TensorFlow-powered deepfake detection using VGG16, MediaPipe, and custom CNN models
            </p>
          </div>
          <div className="card text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-3">Crypto Fraud Analysis</h3>
            <p className="text-white/70">
              Blockchain analysis engine for detecting crypto fraud and suspicious transactions
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-white/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-lg text-white/70">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold mb-2">Excellence</h3>
            <p className="text-sm text-white/60">
              We build the most accurate, reliable anomaly detection systems in the industry
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold mb-2">Innovation</h3>
            <p className="text-sm text-white/60">
              Constantly pushing boundaries with cutting-edge AI and machine learning research
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-3">🤝</div>
            <h3 className="text-lg font-bold mb-2">Trust</h3>
            <p className="text-sm text-white/60">
              Your data security and privacy are our top priority. SOC 2 & ISO 27001 compliant
            </p>
          </div>
          <div className="card">
            <div className="text-4xl mb-3">🌟</div>
            <h3 className="text-lg font-bold mb-2">Impact</h3>
            <p className="text-sm text-white/60">
              Protecting businesses worldwide from cyber threats and financial fraud
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-white/70 mb-8">
            Be part of the team revolutionizing AI-powered security and anomaly detection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary text-lg px-8 py-4"
            >
              Get in Touch
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary text-lg px-8 py-4"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

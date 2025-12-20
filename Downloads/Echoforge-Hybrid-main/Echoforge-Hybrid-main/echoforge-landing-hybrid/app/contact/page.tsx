"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import AISupportChat from "@/components/AISupportChat";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, send to backend
    console.log("Form submitted:", formData);
    setSubmitted(true);
    toast.success("Thanks! Our team will respond shortly.");
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Get in Touch
        </h1>
        <p className="text-xl text-white/70">
          Have questions? We'd love to hear from you.
        </p>
      </section>

      <div className="section">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="sales">Sales Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="general">General Question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full py-4"
                disabled={submitted}
              >
                {submitted ? "✅ Message Sent!" : "Send Message"}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Email Us</h3>
                  <p className="text-white/60 text-sm mb-2">
                    General inquiries and support
                  </p>
                  <a href="mailto:support@echoforge.com" className="text-blue-400 hover:underline">
                    support@echoforge.com
                  </a>
                  <br />
                  <a href="mailto:sales@echoforge.com" className="text-blue-400 hover:underline">
                    sales@echoforge.com
                  </a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Live Chat</h3>
                  <p className="text-white/60 text-sm mb-2">
                    Available Monday-Friday, 9AM-6PM PST
                  </p>
                  <button
                    onClick={() => toast("Live chat handoff initiated – an agent will join you in-app.", { icon: "💬" })}
                    className="text-blue-400 hover:underline"
                  >
                    Start Chat →
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Phone Support</h3>
                  <p className="text-white/60 text-sm mb-2">
                    Enterprise customers only
                  </p>
                  <a href="tel:+1-800-ECHO-FORGE" className="text-blue-400 hover:underline">
                    +1 (800) ECHO-FORGE
                  </a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">Office</h3>
                  <p className="text-white/60 text-sm">
                    123 AI Boulevard<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <h3 className="text-lg font-bold mb-3">Enterprise Support</h3>
              <p className="text-white/70 text-sm mb-4">
                Need dedicated support? Our Enterprise plan includes:
              </p>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>24/7 phone support</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Dedicated Slack channel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Customer Success Manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Priority bug fixes</span>
                </li>
              </ul>
              <a href="/pricing" className="btn btn-primary w-full mt-4">
                View Enterprise Plans
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Preview */}
      <section className="section bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl mt-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Quick Answers</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-bold mb-2">How quickly will I get a response?</h3>
            <p className="text-white/60 text-sm">
              Free plan: 48hrs. Pro: 24hrs. Enterprise: 2hrs with 24/7 phone support.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Do you offer custom integrations?</h3>
            <p className="text-white/60 text-sm">
              Yes! Enterprise plans include custom integration support with our engineering team.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Can I schedule a demo?</h3>
            <p className="text-white/60 text-sm">
              Absolutely! Contact sales@echoforge.com to schedule a personalized demo.
            </p>
          </div>
          <div className="card">
            <h3 className="font-bold mb-2">Is there a community forum?</h3>
            <p className="text-white/60 text-sm">
              Yes! Join our Discord community to connect with other users and our team.
            </p>
          </div>
        </div>
      </section>
      {/* AI Support Chat */}
      <AISupportChat />
    </main>
  );
}

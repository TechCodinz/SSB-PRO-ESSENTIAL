"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 1,
    title: "Introducing EchoForge 2.0: Next-Gen Anomaly Detection",
    excerpt: "We're excited to announce the launch of EchoForge 2.0 with improved accuracy, faster processing, and new enterprise features.",
    date: "October 15, 2024",
    category: "Product Updates",
    author: "Dr. Alex Chen",
    readTime: "5 min read",
    image: "🚀"
  },
  {
    id: 2,
    title: "How AI is Revolutionizing Fraud Detection in Finance",
    excerpt: "Explore how machine learning algorithms are detecting financial fraud patterns faster and more accurately than ever before.",
    date: "October 10, 2024",
    category: "Industry Insights",
    author: "Sarah Johnson",
    readTime: "8 min read",
    image: "💰"
  },
  {
    id: 3,
    title: "Deepfake Detection: The Technology Behind the Curtain",
    excerpt: "A deep dive into the neural networks and techniques we use to identify synthetic media with 99.9% accuracy.",
    date: "October 5, 2024",
    category: "Technical",
    author: "Marcus Williams",
    readTime: "12 min read",
    image: "🎭"
  },
  {
    id: 4,
    title: "Case Study: How Company X Saved $2M with EchoForge",
    excerpt: "Learn how a Fortune 500 company reduced fraud losses by 85% using our real-time anomaly detection system.",
    date: "September 28, 2024",
    category: "Case Studies",
    author: "Sales Team",
    readTime: "6 min read",
    image: "📊"
  },
  {
    id: 5,
    title: "Best Practices for Implementing Anomaly Detection",
    excerpt: "A comprehensive guide to successfully integrating AI-powered anomaly detection into your existing infrastructure.",
    date: "September 20, 2024",
    category: "Tutorials",
    author: "Engineering Team",
    readTime: "10 min read",
    image: "🛠️"
  },
  {
    id: 6,
    title: "EchoForge Now SOC 2 Type II Certified",
    excerpt: "We're proud to announce our SOC 2 Type II certification, demonstrating our commitment to enterprise security.",
    date: "September 15, 2024",
    category: "Company News",
    author: "Compliance Team",
    readTime: "4 min read",
    image: "🔒"
  },
  {
    id: 7,
    title: "Understanding False Positives in Anomaly Detection",
    excerpt: "Learn about the tradeoffs between sensitivity and specificity, and how to tune your detection thresholds.",
    date: "September 8, 2024",
    category: "Technical",
    author: "Dr. Alex Chen",
    readTime: "7 min read",
    image: "⚖️"
  },
  {
    id: 8,
    title: "Q3 2024 Platform Updates and Roadmap",
    excerpt: "A summary of new features shipped this quarter and what's coming next in Q4 2024.",
    date: "September 1, 2024",
    category: "Product Updates",
    author: "Product Team",
    readTime: "5 min read",
    image: "🗺️"
  },
  {
    id: 9,
    title: "Cryptocurrency Fraud: Trends and Detection Strategies",
    excerpt: "An analysis of the latest crypto fraud patterns and how blockchain analytics can help prevent them.",
    date: "August 25, 2024",
    category: "Industry Insights",
    author: "Marcus Williams",
    readTime: "9 min read",
    image: "🔐"
  }
];

const categories = [
  "All Posts",
  "Product Updates",
  "Industry Insights",
  "Technical",
  "Case Studies",
  "Tutorials",
  "Company News"
];

export default function BlogPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [email, setEmail] = useState("");

  const filteredPosts = selectedCategory === "All Posts"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Subscribed with: ${email}`);
    setEmail("");
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="page-header">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Blog & News
        </h1>
        <p className="text-xl text-white/70">
          Latest updates, insights, and stories from the EchoForge team
        </p>
      </section>

      {/* Featured Post */}
      <section className="section">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="card bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/40"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
              ⭐ Featured
            </span>
            <span className="text-white/60 text-sm">{blogPosts[0].category}</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">{blogPosts[0].title}</h2>
              <p className="text-lg text-white/70 mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center gap-6 text-sm text-white/60 mb-6">
                <span>{blogPosts[0].author}</span>
                <span>•</span>
                <span>{blogPosts[0].date}</span>
                <span>•</span>
                <span>{blogPosts[0].readTime}</span>
              </div>
              <motion.button 
                onClick={() => router.push(`/blog/${blogPosts[0].id}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
              >
                Read Article →
              </motion.button>
            </div>
            <div className="text-9xl text-center opacity-20">
              {blogPosts[0].image}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category Filter */}
      <section className="section">
        <div className="flex gap-3 flex-wrap justify-center mb-12">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <motion.article 
              key={post.id} 
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push(`/blog/${post.id}`)}
              className="card cursor-pointer"
            >
              <div className="text-6xl mb-4 opacity-80">{post.image}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {post.category}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3 hover:text-blue-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-white/60 text-sm mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-white/50 pt-4 border-t border-white/10">
                <span>{post.author}</span>
                <span>{post.readTime}</span>
              </div>
              <div className="text-xs text-white/40 mt-2">{post.date}</div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="section">
        <div className="card max-w-3xl mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-lg text-white/70 mb-6">
            Get the latest updates, insights, and exclusive content delivered to your inbox
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary whitespace-nowrap"
            >
              Subscribe
            </motion.button>
          </form>
          <p className="text-xs text-white/50 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="section bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-3xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Topics</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🤖", title: "AI & Machine Learning", count: 24 },
            { icon: "🔒", title: "Security & Compliance", count: 18 },
            { icon: "💼", title: "Enterprise Solutions", count: 15 },
            { icon: "🚀", title: "Getting Started", count: 12 }
          ].map((topic, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push(`/blog/topic/${topic.title.toLowerCase().replace(/\s+/g, '-')}`)}
              className="card text-center cursor-pointer"
            >
              <div className="text-4xl mb-3">{topic.icon}</div>
              <h3 className="font-bold mb-2">{topic.title}</h3>
              <p className="text-sm text-white/60">{topic.count} articles</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}

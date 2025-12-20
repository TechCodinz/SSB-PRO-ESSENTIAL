"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface MLModel {
  id: string;
  name: string;
  description: string;
  category: string;
  accuracy: number;
  price: number;
  downloads: number;
  rating: number;
  vendor: string;
  features: string[];
  useCases: string[];
  icon: string;
}

export default function EnhancedMarketplace() {
  const router = useRouter();
  const [models, setModels] = useState<MLModel[]>([]);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const categories = [
    { id: "all", name: "All Models", icon: "🎯", count: 0 },
    { id: "anomaly", name: "Anomaly Detection", icon: "🔍", count: 0 },
    { id: "fraud", name: "Fraud Detection", icon: "🛡️", count: 0 },
    { id: "prediction", name: "Predictive Analytics", icon: "📊", count: 0 },
    { id: "classification", name: "Classification", icon: "📑", count: 0 },
    { id: "nlp", name: "NLP & Text", icon: "💬", count: 0 },
    { id: "vision", name: "Computer Vision", icon: "👁️", count: 0 },
    { id: "time-series", name: "Time Series", icon: "📈", count: 0 },
    { id: "custom", name: "Custom Models", icon: "⚙️", count: 0 }
  ];

  const loadModels = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/marketplace/models');
      setModels(data.models || generateSampleModels());
    } catch (error) {
      setModels(generateSampleModels());
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const generateSampleModels = (): MLModel[] => {
    return [
      {
        id: "1",
        name: "Ensemble Anomaly Detector Pro",
        description: "Advanced ensemble model combining Isolation Forest, LOF, and One-Class SVM for superior anomaly detection across any dataset.",
        category: "anomaly",
        accuracy: 98.7,
        price: 499,
        downloads: 1247,
        rating: 4.9,
        vendor: "EchoForge AI",
        features: ["Real-time Detection", "Auto-scaling", "Custom Thresholds", "API Integration"],
        useCases: ["Financial Fraud", "Network Security", "Quality Control", "Healthcare Monitoring"],
        icon: "🔬"
      },
      {
        id: "2",
        name: "LSTM Time Series Predictor",
        description: "Deep learning model for accurate time series forecasting with attention mechanisms and anomaly prediction.",
        category: "time-series",
        accuracy: 96.4,
        price: 399,
        downloads: 892,
        rating: 4.8,
        vendor: "DeepLearn Labs",
        features: ["Multi-step Forecasting", "Seasonal Patterns", "Trend Analysis", "Confidence Intervals"],
        useCases: ["Stock Market", "Energy Consumption", "Sales Forecasting", "Weather Prediction"],
        icon: "📈"
      },
      {
        id: "3",
        name: "Crypto Fraud Shield",
        description: "Specialized model for detecting cryptocurrency fraud, money laundering, and suspicious wallet activities in real-time.",
        category: "fraud",
        accuracy: 99.2,
        price: 799,
        downloads: 567,
        rating: 5.0,
        vendor: "BlockSec",
        features: ["Blockchain Analysis", "Wallet Tracking", "Transaction Monitoring", "Risk Scoring"],
        useCases: ["Crypto Exchanges", "DeFi Platforms", "Wallet Services", "Compliance"],
        icon: "🔐"
      },
      {
        id: "4",
        name: "Vision Deepfake Detector",
        description: "State-of-the-art computer vision model for detecting deepfakes, manipulated images, and synthetic media.",
        category: "vision",
        accuracy: 97.8,
        price: 599,
        downloads: 734,
        rating: 4.9,
        vendor: "VisionAI",
        features: ["Face Manipulation Detection", "Audio-Video Sync", "Metadata Analysis", "Real-time Processing"],
        useCases: ["Media Verification", "Security", "Content Moderation", "Forensics"],
        icon: "👁️"
      },
      {
        id: "5",
        name: "NLP Sentiment Analyzer Ultra",
        description: "Advanced natural language processing model for multi-language sentiment analysis and emotion detection.",
        category: "nlp",
        accuracy: 94.5,
        price: 299,
        downloads: 1523,
        rating: 4.7,
        vendor: "TextAI",
        features: ["Multi-language Support", "Emotion Detection", "Context Analysis", "Real-time Processing"],
        useCases: ["Social Media Monitoring", "Customer Service", "Brand Analysis", "Market Research"],
        icon: "💬"
      },
      {
        id: "6",
        name: "AutoML Model Generator",
        description: "Automated machine learning platform that generates custom models based on your specific data and requirements.",
        category: "custom",
        accuracy: 95.0,
        price: 999,
        downloads: 456,
        rating: 4.8,
        vendor: "AutoML Pro",
        features: ["Auto Feature Engineering", "Model Selection", "Hyperparameter Tuning", "Deployment Ready"],
        useCases: ["Custom Business Logic", "Industry-Specific", "Research", "Prototyping"],
        icon: "⚙️"
      }
    ];
  };

  const generateCustomModel = async () => {
    setGenerating(true);
    toast.loading("Generating custom model based on your needs...");
    
    // Simulate model generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.dismiss();
    toast.success("Custom model generated successfully!");
    
    const customModel: MLModel = {
      id: Date.now().toString(),
      name: "Custom Generated Model",
      description: "AI-generated model tailored to your specific requirements and use case.",
      category: "custom",
      accuracy: 92 + Math.random() * 6,
      price: 199,
      downloads: 0,
      rating: 4.5,
      vendor: "AI Generator",
      features: ["Custom Features", "Optimized", "Pre-trained", "Production Ready"],
      useCases: ["Your Use Case"],
      icon: "✨"
    };
    
    setModels([customModel, ...models]);
    setGenerating(false);
  };

  const filteredModels = models
    .filter(model => 
      selectedCategory === "all" || model.category === selectedCategory
    )
    .filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "popular": return b.downloads - a.downloads;
        case "rating": return b.rating - a.rating;
        case "accuracy": return b.accuracy - a.accuracy;
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        default: return 0;
      }
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          🚀 AI Model Marketplace
        </motion.h1>
        <p className="text-xl text-white/70 mb-6">
          Discover, purchase, and deploy enterprise-grade ML models instantly
        </p>
        
        {/* AI Model Generator CTA */}
        <motion.button
          onClick={generateCustomModel}
          disabled={generating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <span className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⚙️
              </motion.span>
              Generating Your Model...
            </span>
          ) : (
            <span className="flex items-center gap-3">
              ✨ Generate Custom Model with AI
            </span>
          )}
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search models, features, use cases..."
                className="w-full px-4 py-3 pl-12 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500/50 focus:outline-none text-white placeholder:text-white/40"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500/50 focus:outline-none text-white"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="accuracy">Best Accuracy</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedCategory === category.id
                ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <div className="text-xs font-semibold">{category.name.split(' ')[0]}</div>
          </motion.button>
        ))}
      </div>

      {/* Models Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/marketplace/models/${model.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{model.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">${model.price}</div>
                  <div className="text-xs text-white/60">one-time</div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-white">{model.name}</h3>
              <p className="text-sm text-white/70 mb-4 line-clamp-2">{model.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">{model.accuracy}%</div>
                  <div className="text-xs text-white/60">Accuracy</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-yellow-400">⭐{model.rating}</div>
                  <div className="text-xs text-white/60">Rating</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">{model.downloads}</div>
                  <div className="text-xs text-white/60">Sales</div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="text-xs text-white/60 mb-2">Key Features:</div>
                <div className="flex flex-wrap gap-1">
                  {model.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Added ${model.name} to cart!`);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
              >
                🛒 Add to Cart
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">No models found</h3>
          <p className="text-white/60">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

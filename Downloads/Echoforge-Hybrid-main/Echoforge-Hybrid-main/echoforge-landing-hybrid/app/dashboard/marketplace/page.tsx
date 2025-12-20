"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ModelPurchaseModal from "@/components/ModelPurchaseModal";
import SamplePreviewModal from "@/components/SamplePreviewModal";
import toast from "react-hot-toast";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

type MarketplaceListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceCents: number;
  currency: string;
  purchasesCount: number;
  downloads: number;
  rating?: number | null;
};

type PurchaseModelDraft = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  rating?: number | null;
  downloads?: number | null;
  vendorName?: string | null;
};

export default function MarketplacePage() {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedModel, setSelectedModel] = useState<PurchaseModelDraft | null>(
    null,
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasedModels, setPurchasedModels] = useState<Set<string>>(
    new Set(),
  );
  const [deployedModels, setDeployedModels] = useState<any[]>([]);
  const [showMyModels, setShowMyModels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSample, setPreviewSample] = useState<any>(null);
  const [downloadCounts, setDownloadCounts] = useState<{
    [key: string]: number;
  }>({
    sample1: 3456,
    sample2: 2134,
    sample3: 1876,
    sample4: 2945,
  });

  const filteredListings = useMemo(() => {
    const base =
      category === "all"
        ? listings
        : listings.filter((listing) => listing.category === category);
    if (sortBy === "price-low") {
      return [...base].sort((a, b) => a.priceCents - b.priceCents);
    }
    if (sortBy === "price-high") {
      return [...base].sort((a, b) => b.priceCents - a.priceCents);
    }
    if (sortBy === "downloads") {
      return [...base].sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
    }
    // Popular default
    return [...base].sort(
      (a, b) => (b.purchasesCount ?? 0) - (a.purchasesCount ?? 0),
    );
  }, [category, listings, sortBy]);

  const categoryIcons: Record<string, string> = useMemo(
    () => ({
      anomaly: "📊",
      deepfake: "🎭",
      fraud: "💰",
      crypto: "🔐",
      iot: "🏭",
      security: "🛡️",
      "ml-model": "🤖",
    }),
    [],
  );

  const formattedCategories = useMemo(() => {
    const counts = listings.reduce<Record<string, number>>((acc, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([key, count]) => {
      const label = key
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return {
        id: key,
        label,
        icon: categoryIcons[key] || "🧠",
        count,
      };
    });
  }, [categoryIcons, listings]);

  const freeSamples = useMemo(
    () => [
      {
        id: "sample1",
        name: "Financial Transaction Sample",
        description: "Sample credit card transaction data with anomalies",
        rows: 1000,
        size: "45 KB",
        format: "CSV",
      },
      {
        id: "sample2",
        name: "Network Traffic Sample",
        description: "Network log data for intrusion detection testing",
        rows: 5000,
        size: "250 KB",
        format: "CSV",
      },
      {
        id: "sample3",
        name: "IoT Sensor Data Sample",
        description: "Industrial IoT sensor readings with faults",
        rows: 2000,
        size: "120 KB",
        format: "CSV",
      },
      {
        id: "sample4",
        name: "User Behavior Sample",
        description: "User activity logs for fraud detection",
        rows: 3000,
        size: "180 KB",
        format: "CSV",
      },
    ],
    [],
  );

  const loadDownloadCounts = useCallback(async () => {
    try {
      const response = await axios.post("/api/samples/download");
      if (response.data.counts) {
        setDownloadCounts(response.data.counts);
      }
    } catch (error) {
      console.error("Failed to load download counts:", error);
    }
  }, []);

  const loadPurchasedModels = useCallback(async () => {
    try {
      const response = await axios.get("/api/marketplace/purchase");
      const purchases = response.data.purchases || [];

      const purchasedIds = new Set<string>(
        purchases
          .map((p: any) => p.listing?.id || p.listingId)
          .filter((id: any): id is string => typeof id === "string"),
      );

      setPurchasedModels(purchasedIds);
      setDeployedModels(purchases);
    } catch (error) {
      console.error("Failed to load purchases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load purchased models and download counts on mount
  const loadListings = useCallback(async () => {
    try {
      setLoadingListings(true);
      const response = await axios.get("/api/marketplace/listings");
      const data = response.data.listings || [];
      setListings(data);
    } catch (error) {
      console.error("Failed to load marketplace listings:", error);
      toast.error(
        "Unable to load marketplace listings. Please try again later.",
      );
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
    loadPurchasedModels();
    loadDownloadCounts();
  }, [loadListings, loadPurchasedModels, loadDownloadCounts]);

  const handleDeploy = (listing: MarketplaceListing) => {
    if (purchasedModels.has(listing.id)) {
      toast.success(
        `✓ ${listing.title} is already purchased and ready to use!`,
        {
          icon: "🎉",
          duration: 4000,
        },
      );
      // Automatically show the "My Models" section
      setShowMyModels(true);
      return;
    }

    // Model not purchased - show purchase modal
    setSelectedModel({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      priceCents: listing.priceCents,
      rating: listing.rating,
      downloads: listing.downloads,
      vendorName: "Marketplace Partner",
    });
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = useCallback(() => {
    loadPurchasedModels();
  }, [loadPurchasedModels]);

  const handleDownloadSample = async (sampleId: string) => {
    const downloadToast = toast.loading("Preparing download...", {
      icon: "📥",
    });

    try {
      // Trigger download
      window.open(`/api/samples/download?id=${sampleId}`, "_blank");

      // Update local counter immediately
      setDownloadCounts((prev) => ({
        ...prev,
        [sampleId]: (prev[sampleId] || 0) + 1,
      }));

      // Show success
      toast.success("Download started! Check your downloads folder.", {
        id: downloadToast,
        icon: "✅",
        duration: 4000,
      });

      // Refresh counts from server after a delay
      setTimeout(() => {
        loadDownloadCounts();
      }, 1000);
    } catch (error) {
      toast.error("Download failed. Please try again.", { id: downloadToast });
    }
  };

  const handlePreviewSample = (sample: any) => {
    setPreviewSample(sample);
    setShowPreviewModal(true);
  };

  const totalSpent = deployedModels.reduce(
    (sum, order) => sum + order.amountCents / 100,
    0,
  );

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 border-b border-slate-800/90 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                💎 ML Model Marketplace
              </h1>
              <p className="text-white/60">
                Premium AI models for specialized detection
              </p>
            </div>

            {/* Toggle My Models */}
            <div className="flex items-center gap-3">
              {deployedModels.length > 0 && (
                <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold">
                  ✓ {deployedModels.length} Model
                  {deployedModels.length === 1 ? "" : "s"} Owned
                </div>
              )}
              <button
                onClick={() => setShowMyModels(!showMyModels)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  showMyModels
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {showMyModels
                  ? "💎 My Purchased Models"
                  : "🛍️ Browse Marketplace"}
              </button>
            </div>
          </div>

          {/* Filters */}
          {!showMyModels && (
            <div className="flex flex-wrap gap-3">
              {[{ id: "all", label: "All Models" }, ...formattedCategories].map(
                (cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      category === cat.id
                        ? "bg-blue-500 text-white"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* My Purchased Models Section */}
          {showMyModels ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">💎 My Purchased Models</h2>
                <div className="text-white/60">
                  {deployedModels.length}{" "}
                  {deployedModels.length === 1 ? "model" : "models"} owned
                </div>
              </div>

              {deployedModels.length === 0 ? (
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">💎</div>
                  <h3 className="text-2xl font-bold mb-2">
                    No Models Purchased Yet
                  </h3>
                  <p className="text-white/60 mb-6">
                    Purchase premium AI models from the marketplace to unlock
                    advanced capabilities
                  </p>
                  <button
                    onClick={() => setShowMyModels(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                  >
                    🛍️ Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {deployedModels.map((order: any, idx: number) => {
                    const listing: MarketplaceListing | undefined =
                      order.listing;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                              🧠
                            </div>
                            <div>
                              <h3 className="font-bold">
                                {order.listing.title}
                              </h3>
                              <p className="text-xs text-white/60">
                                Deployed{" "}
                                {new Date(order.paidAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                            ✓ ACTIVE
                          </span>
                        </div>

                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">License Key</span>
                            <code className="text-blue-400 font-mono text-xs">
                              {order.license?.key || "N/A"}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Amount Paid</span>
                            <span className="font-semibold">
                              ${(order.amountCents / 100).toFixed(2)}
                            </span>
                          </div>
                          {listing && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/60">Category</span>
                                <span className="capitalize">
                                  {listing.category}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Rating</span>
                                <span>
                                  ⭐ {(listing.rating ?? 4.9).toFixed(1)}/5.0
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Downloads</span>
                                <span>
                                  {(listing.downloads ?? 0).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all text-sm">
                            Use Model
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                order.license?.key || "",
                              );
                              toast.success("License key copied!");
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
                          >
                            📋 Copy Key
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Total Models</span>
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {loadingListings ? "…" : listings.length}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">
                      Active Deployments
                    </span>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {deployedModels.length}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">My Models</span>
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {purchasedModels.size}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Total Spent</span>
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-2xl font-bold">
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Featured Models */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6">Featured Models</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing, idx) => {
                    const isPurchased = purchasedModels.has(listing.id);
                    const isFeatured =
                      idx < 3 || (listing.purchasesCount ?? 0) > 0;
                    return (
                      <motion.div
                        key={listing.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 transition-all relative"
                      >
                        {isFeatured && (
                          <div className="absolute top-4 right-4 z-10">
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                              ⭐ FEATURED
                            </span>
                          </div>
                        )}
                        {isPurchased && (
                          <div className="absolute top-4 left-4 z-10">
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                              ✓ OWNED
                            </span>
                          </div>
                        )}
                        <div className="mb-4">
                          <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-6xl">🧠</span>
                          </div>
                          <h3 className="text-lg font-bold mb-2">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-white/60 mb-4">
                            {listing.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span>{(listing.rating ?? 4.9).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>📥</span>
                              <span>
                                {(listing.downloads ?? 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-white/50 mb-4 capitalize">
                            Category: {listing.category}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-blue-400">
                              ${(listing.priceCents / 100).toFixed(2)}
                            </div>
                            <button
                              onClick={() => handleDeploy(listing)}
                              className={`px-4 py-2 font-bold rounded-lg transition-all text-sm ${
                                isPurchased
                                  ? "bg-green-600 hover:bg-green-700 text-white cursor-default"
                                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              }`}
                            >
                              {isPurchased ? "✓ Purchased" : "💳 Purchase"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {formattedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className="bg-black/20 rounded-lg p-4 text-center hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="text-4xl mb-2">{cat.icon}</div>
                      <div className="font-bold mb-1">{cat.label}</div>
                      <div className="text-xs text-white/60">
                        {cat.count} models
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Samples Section */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">🎁</span>
                  Free Sample Datasets
                </h3>
                <p className="text-white/60 mb-6">
                  Test our anomaly detection models with these free sample
                  datasets. Perfect for evaluating model performance before
                  purchasing.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {freeSamples.map((sample) => (
                    <div
                      key={sample.id}
                      className="bg-black/20 rounded-lg p-4 hover:bg-black/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">📄</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold mb-1">{sample.name}</h4>
                          <p className="text-sm text-white/60 mb-2">
                            {sample.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                            <span>{sample.rows.toLocaleString()} rows</span>
                            <span>{sample.size}</span>
                            <span>{sample.format}</span>
                            <motion.span
                              key={downloadCounts[sample.id]}
                              initial={{ scale: 1.2, color: "#3b82f6" }}
                              animate={{ scale: 1, color: "inherit" }}
                              transition={{ duration: 0.3 }}
                            >
                              📥{" "}
                              {(
                                downloadCounts[sample.id] || 0
                              ).toLocaleString()}{" "}
                              downloads
                            </motion.span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadSample(sample.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all font-semibold hover:scale-105 active:scale-95"
                            >
                              📥 Download
                            </button>
                            <button
                              onClick={() => handlePreviewSample(sample)}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all hover:scale-105 active:scale-95"
                            >
                              👁️ Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Sample Section */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="text-3xl">📤</span>
                  Upload Your Own Sample
                </h3>
                <p className="text-white/60 mb-6">
                  Test our models with your own data before purchasing. Upload a
                  CSV file (max 10MB) to get instant anomaly detection results.
                </p>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                  <div className="text-6xl mb-4">📁</div>
                  <div className="font-bold mb-2">Drop your CSV file here</div>
                  <div className="text-sm text-white/60 mb-4">
                    or click to browse
                  </div>
                  <button
                    onClick={() =>
                      toast("Upload feature coming soon!", { icon: "📤" })
                    }
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                  >
                    Choose File
                  </button>
                  <div className="text-xs text-white/40 mt-4">
                    Supported formats: CSV, Excel (XLSX)
                    <br />
                    Maximum file size: 10MB
                    <br />
                    Maximum rows: 5,000 (free tier)
                  </div>
                </div>
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">💡</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">
                      Build Your Own Model?
                    </h3>
                    <p className="text-white/70 mb-4">
                      List your custom ML models on our marketplace and earn
                      revenue from every deployment.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                    >
                      Become a Vendor
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedModel && (
        <ModelPurchaseModal
          model={selectedModel}
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedModel(null);
          }}
          onSuccess={handlePurchaseSuccess}
        />
      )}

      {/* Sample Preview Modal */}
      {previewSample && (
        <SamplePreviewModal
          sampleId={previewSample.id}
          sampleName={previewSample.name}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewSample(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

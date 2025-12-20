"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

interface PurchaseModel {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  rating?: number | null;
  downloads?: number | null;
  vendorName?: string | null;
}

interface ModelPurchaseModalProps {
  model: PurchaseModel;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModelPurchaseModal({ model, isOpen, onClose, onSuccess }: ModelPurchaseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePurchase = async () => {
    if (paymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv) {
        toast.error("Please fill in all payment details");
        return;
      }
    }

    setProcessing(true);
    const purchaseToast = toast.loading("Processing your purchase...");

    try {
      const response = await axios.post("/api/marketplace/purchase", {
        listingId: model.id,
        paymentMethod: paymentMethod === "card" ? "stripe" : "crypto"
      });

      if (response.data.success) {
        toast.success(
          `🎉 ${model.title} deployed successfully!\nLicense Key: ${response.data.license.key}`,
          { 
            duration: 8000,
            id: purchaseToast
          }
        );
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Purchase failed";
      toast.error(errorMessage, { id: purchaseToast });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gradient-to-br from-[#0f1630] to-[#1a1f3a] rounded-2xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Purchase Model</h2>
                  <p className="text-white/60">{model.title}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Model Details */}
              <div className="bg-black/20 rounded-xl p-4">
                <h3 className="font-bold mb-3">Model Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Name</span>
                    <span className="font-semibold">{model.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Vendor</span>
                    <span>{model.vendorName || "Verified Partner"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Rating</span>
                    <span>⭐ {model.rating ? model.rating.toFixed(1) : "4.9"}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Downloads</span>
                    <span>{(model.downloads ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div>
                <h3 className="font-bold mb-3">What's Included</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Instant deployment access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Lifetime license key
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    API integration support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Regular model updates
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    Technical documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    24/7 support access
                  </li>
                </ul>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-bold mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "card"
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/10 bg-black/20 hover:bg-black/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">💳</div>
                    <div className="font-semibold">Credit Card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("crypto")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === "crypto"
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-white/10 bg-black/20 hover:bg-black/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">🔐</div>
                    <div className="font-semibold">Crypto</div>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              {paymentMethod === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">ℹ️</div>
                    <div className="text-sm text-white/80">
                      For crypto payments, you'll receive payment instructions after confirming.
                      Supported: USDT (TRC20, ERC20, BEP20)
                    </div>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Model Price</span>
                    <span className="font-semibold">${(model.priceCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60">Platform Fee</span>
                  <span className="font-semibold">$0</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-blue-400">${(model.priceCents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? "Processing..." : `Pay $${(model.priceCents / 100).toFixed(2)}`}
                </button>
              </div>

              {/* Security Notice */}
              <div className="text-xs text-white/40 text-center">
                🔒 Your payment is secured with 256-bit SSL encryption
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

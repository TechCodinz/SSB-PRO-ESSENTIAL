"use client";
import { useMemo, useState } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminMarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState([
    {
      id: 1,
      title: "Advanced Anomaly Detection Model",
      vendor: "AI Solutions Inc",
      price: 299,
      category: "ML Models",
      status: "active",
      sales: 45,
      rating: 4.8,
      revenue: 13455
    },
    {
      id: 2,
      title: "Real-time Data Processing Pipeline",
      vendor: "DataFlow Systems",
      price: 199,
      category: "Infrastructure",
      status: "active",
      sales: 32,
      rating: 4.6,
      revenue: 6368
    },
    {
      id: 3,
      title: "Custom Visualization Dashboard",
      vendor: "VizTech",
      price: 149,
      category: "UI Components",
      status: "pending",
      sales: 0,
      rating: 0,
      revenue: 0
    },
    {
      id: 4,
      title: "Enterprise Security Suite",
      vendor: "SecureCorp",
      price: 599,
      category: "Security",
      status: "active",
      sales: 18,
      rating: 4.9,
      revenue: 10782
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      customer: "TechCorp Inc",
      listing: "Advanced Anomaly Detection Model",
      amount: 299,
      status: "completed",
      date: "2024-01-15",
      payment: "Credit Card"
    },
    {
      id: "ORD-002",
      customer: "DataSolutions",
      listing: "Real-time Data Processing Pipeline",
      amount: 199,
      status: "processing",
      date: "2024-01-14",
      payment: "Crypto"
    },
    {
      id: "ORD-003",
      customer: "Enterprise Corp",
      listing: "Enterprise Security Suite",
      amount: 599,
      status: "completed",
      date: "2024-01-13",
      payment: "Bank Transfer"
    }
  ]);

  const [vendors, setVendors] = useState([
    {
      id: 1,
      name: "AI Solutions Inc",
      email: "contact@aisolutions.com",
      listings: 3,
      totalSales: 45,
      revenue: 13455,
      status: "verified"
    },
    {
      id: 2,
      name: "DataFlow Systems",
      email: "info@dataflow.com",
      listings: 2,
      totalSales: 32,
      revenue: 6368,
      status: "verified"
    },
    {
      id: 3,
      name: "VizTech",
      email: "hello@viztech.com",
      listings: 1,
      totalSales: 0,
      revenue: 0,
      status: "pending"
    }
  ]);

  const { totalRevenue, totalSales, activeListings, verifiedVendors } = useMemo(() => ({
    totalRevenue: listings.reduce((sum, listing) => sum + listing.revenue, 0),
    totalSales: listings.reduce((sum, listing) => sum + listing.sales, 0),
    activeListings: listings.filter((l) => l.status === "active").length,
    verifiedVendors: vendors.filter((v) => v.status === "verified").length,
  }), [listings, vendors]);

  const toggleListingStatus = (listingId: number) => {
    setListings((prev) =>
      prev.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status: listing.status === "active" ? "paused" : "active",
            }
          : listing
      )
    );

    toast.success("Listing status updated");
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto">
        <div>
          {/* Header */}
          <div className="bg-[#0f1630] border-b border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">🛒 Marketplace Management</h1>
                <p className="text-white/60">Manage marketplace listings, orders, and vendors</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard/admin" className="btn btn-ghost">
                  ← Back to Admin
                </Link>
                <button
                  onClick={() => router.push("/dashboard/admin/marketplace/listings/new")}
                  className="btn btn-primary"
                >
                  + Add Listing
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Total Sales</div>
                <div className="text-2xl font-bold text-blue-400">{totalSales}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Active Listings</div>
                <div className="text-2xl font-bold text-purple-400">{activeListings}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Verified Vendors</div>
                <div className="text-2xl font-bold text-orange-400">{verifiedVendors}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Listings Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Marketplace Listings</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/dashboard/admin/marketplace/analytics")}
                    className="btn btn-ghost text-sm"
                  >
                    📊 Analytics
                  </button>
                  <button
                    onClick={() => toast.success("Marketplace export generated and emailed to finance")}
                    className="btn btn-ghost text-sm"
                  >
                    📥 Export
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold text-white">{listing.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            listing.status === 'active' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {listing.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-white/60">Vendor</div>
                            <div className="font-semibold text-white">{listing.vendor}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Category</div>
                            <div className="font-semibold text-white">{listing.category}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Price</div>
                            <div className="font-semibold text-green-400">${listing.price}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Rating</div>
                            <div className="font-semibold text-yellow-400">
                              {listing.rating > 0 ? `${listing.rating}/5` : 'No ratings'}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-white/60">Sales</div>
                            <div className="font-bold text-blue-400">{listing.sales}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Revenue</div>
                            <div className="font-bold text-green-400">${listing.revenue.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60">Avg. Price</div>
                            <div className="font-bold text-purple-400">${listing.price}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <button
                          onClick={() => router.push(`/dashboard/admin/marketplace/listings/${listing.id}?mode=edit`)}
                          className="btn btn-primary text-sm"
                        >
                          ⚙️ Edit
                        </button>
                        <button
                          onClick={() => router.push("/dashboard/admin/marketplace/analytics")}
                          className="btn btn-ghost text-sm"
                        >
                          📊 Analytics
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/admin/marketplace/listings/${listing.id}`)}
                          className="btn btn-ghost text-sm"
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => toggleListingStatus(listing.id)}
                          className={`btn text-sm ${
                            listing.status === 'active' ? 'btn-ghost text-red-400' : 'btn-ghost text-green-400'
                          }`}
                        >
                          {listing.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Recent Orders</h3>
              
              <div className="space-y-3">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-xl">🛒</span>
                      </div>
                      <div>
                        <div className="font-bold text-white">{order.id}</div>
                        <div className="text-sm text-white/60">{order.customer}</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-white">{order.listing}</div>
                      <div className="text-sm text-white/60">{order.date}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-bold text-green-400">${order.amount}</div>
                      <div className="text-sm text-white/60">{order.payment}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Vendor Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Vendor Management</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-black/20 rounded-lg p-6 hover:bg-black/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-white">{vendor.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vendor.status === 'verified' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="text-white/60">{vendor.email}</div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Listings:</span>
                        <span className="text-white">{vendor.listings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Sales:</span>
                        <span className="text-white">{vendor.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Revenue:</span>
                        <span className="text-green-400">${vendor.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/admin/marketplace/vendors?vendor=${vendor.id}`)}
                        className="btn btn-primary text-sm flex-1"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${vendor.email}?subject=Marketplace%20Listing%20Inquiry`, "_blank")}
                        className="btn btn-ghost text-sm"
                        aria-label={`Email ${vendor.name}`}
                      >
                        📧
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Vendor = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  totalListings: number;
  activeListings: number;
  totalRevenue: number;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalVendors: 0, totalListings: 0, totalRevenue: 0 });

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await fetch('/api/admin/marketplace/vendors');
        if (!res.ok) {
          toast.error('Failed to load vendors');
          return;
        }
        const data = await res.json();
        setVendors(data.vendors || []);
        setStats(data.stats || { totalVendors: 0, totalListings: 0, totalRevenue: 0 });
      } catch (error) {
        console.error('Failed to load vendors:', error);
        toast.error('Error loading vendors');
      } finally {
        setLoading(false);
      }
    };
    loadVendors();
  }, []);

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🏪 Marketplace Vendors
            </h1>
            <Link 
              href="/dashboard/admin/marketplace" 
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              ← Back to Marketplace
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
              <div className="text-blue-400 text-sm font-semibold mb-1">Total Vendors</div>
              <div className="text-3xl font-bold">{stats.totalVendors}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
              <div className="text-purple-400 text-sm font-semibold mb-1">Total Listings</div>
              <div className="text-3xl font-bold">{stats.totalListings}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4">
              <div className="text-green-400 text-sm font-semibold mb-1">Total Revenue</div>
              <div className="text-3xl font-bold">${(stats.totalRevenue / 100).toFixed(2)}</div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-white/60 py-8">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center text-white/60">
              No vendors found. Vendors will appear here when users create marketplace listings.
            </div>
          ) : (
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{vendor.name || vendor.email}</h3>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold">
                          {vendor.plan}
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-2">{vendor.email}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-white/60">
                          <span className="font-semibold text-white">{vendor.totalListings}</span> total listings
                        </span>
                        <span className="text-white/60">
                          <span className="font-semibold text-green-400">{vendor.activeListings}</span> active
                        </span>
                        <span className="text-white/60">
                          <span className="font-semibold text-white">${(vendor.totalRevenue / 100).toFixed(2)}</span> revenue
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/dashboard/admin/users`}
                      className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

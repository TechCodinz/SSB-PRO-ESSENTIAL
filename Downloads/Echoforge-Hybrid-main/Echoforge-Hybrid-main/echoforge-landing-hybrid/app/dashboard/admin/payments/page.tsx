"use client";

import AdminPaymentConfirmation from "@/components/AdminPaymentConfirmation";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";

export default function AdminPaymentsPage() {
  return (
    <div className="min-h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="p-8">
        <AdminPaymentConfirmation />
      </div>
    </div>
  );
}

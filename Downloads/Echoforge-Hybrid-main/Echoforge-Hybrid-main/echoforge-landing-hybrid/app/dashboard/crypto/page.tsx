import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import DashboardLayout from "@/components/DashboardLayout";
import UltraPremiumCryptoFraud from "@/components/UltraPremiumCryptoFraud";

export default async function CryptoFraudDetection() {
  const session = await getServerSession(authOptions)
  if (!session) {
    // Next.js app router redirect
    return null as any
  }

  return (
    <DashboardLayout>
      <UltraPremiumCryptoFraud />
    </DashboardLayout>
  );
}

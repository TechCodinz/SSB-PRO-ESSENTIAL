import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - ECHOEFORGE Intelligence Platform",
  description: "Advanced ML-powered anomaly detection and analytics",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

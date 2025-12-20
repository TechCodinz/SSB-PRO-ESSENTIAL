"use client";
import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Footer from "./Footer";

export default function ConditionalNav() {
  const pathname = usePathname();
  
  // Hide navigation and footer on dashboard pages (they have their own layout)
  const isDashboardPage = pathname.startsWith('/dashboard');
  
  if (isDashboardPage) {
    return null;
  }
  
  return (
    <>
      <Navigation />
      <div className="pt-16" />
    </>
  );
}

export function ConditionalFooter() {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');
  
  if (isDashboardPage) {
    return null;
  }
  
  return <Footer />;
}

"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "react-hot-toast"
import { AnalyticsProvider } from "@/lib/context/AnalyticsContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnalyticsProvider>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1f3a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </AnalyticsProvider>
    </SessionProvider>
  )
}

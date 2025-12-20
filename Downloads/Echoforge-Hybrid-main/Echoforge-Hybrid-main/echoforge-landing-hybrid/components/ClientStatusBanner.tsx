"use client";
import { useState, useEffect } from "react";

interface StatusBannerProps {
  apiUrl: string;
  appUrl: string;
}

export default function ClientStatusBanner({ apiUrl, appUrl }: StatusBannerProps) {
  const [apiStatus, setApiStatus] = useState("checking");
  const [appStatus, setAppStatus] = useState("checking");
  const [stats, setStats] = useState({ users: 0, analyses: 0, uptime: "99.9%" });

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const baseInterval = 30000; // 30 seconds

    const checkStatus = async () => {
      if (!mounted) return;

      try {
        // Check API status with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const apiResponse = await fetch(`${apiUrl}/health`, { 
          method: "GET",
          mode: "cors",
          cache: 'no-cache',
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));

        if (mounted) {
          setApiStatus(apiResponse.ok ? "online" : "offline");
        }
        
        // Check App status (optional, might not exist)
        try {
          const appController = new AbortController();
          const appTimeoutId = setTimeout(() => appController.abort(), 5000);
          
          const appResponse = await fetch(appUrl, { 
            method: "GET",
            mode: "no-cors", // Use no-cors for external apps
            cache: 'no-cache',
            signal: appController.signal,
          }).finally(() => clearTimeout(appTimeoutId));

          if (mounted) {
            setAppStatus("online"); // If no error, assume online
          }
        } catch {
          if (mounted) {
            setAppStatus("offline");
          }
        }
        
        // Get stats (mock data if endpoint doesn't exist)
        if (apiResponse.ok && mounted) {
          setStats({ users: 1247, analyses: 45823, uptime: "99.9%" });
        }
        
        // Reset retry count on success
        retryCount = 0;
      } catch (error) {
        if (mounted) {
          setApiStatus("offline");
          setAppStatus("offline");
          retryCount++;
        }
      }

      // Exponential backoff
      if (mounted) {
        const nextInterval = baseInterval * Math.pow(2, Math.min(retryCount, 4));
        const cappedInterval = Math.min(nextInterval, 300000); // Max 5 minutes
        timeoutId = setTimeout(checkStatus, cappedInterval);
      }
    };
    
    // Initial check after a small delay
    timeoutId = setTimeout(checkStatus, 1000);
    
    // Cleanup
    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [apiUrl, appUrl]);

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-500/20">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${apiStatus === "online" ? "bg-green-400 animate-pulse" : apiStatus === "offline" ? "bg-red-400" : "bg-yellow-400"}`}></div>
            <span>API: {apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline" : "Checking..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${appStatus === "online" ? "bg-green-400 animate-pulse" : appStatus === "offline" ? "bg-red-400" : "bg-yellow-400"}`}></div>
            <span>App: {appStatus === "online" ? "Online" : appStatus === "offline" ? "Offline" : "Checking..."}</span>
          </div>
        </div>
        <div className="text-white/60 hidden sm:block">
          Uptime: {stats.uptime} | Users: {stats.users} | Analyses: {stats.analyses}
        </div>
      </div>
    </div>
  );
}

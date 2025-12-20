"use client";
import { useEffect, useState } from "react";
import UltraPremiumAdminNavigation from "@/components/UltraPremiumAdminNavigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type AuditLog = {
  id: string;
  action: string;
  resource: string;
  status: string;
  description: string | null;
  timestamp: Date;
  actorId: string;
  actorEmail: string;
  metadata: any;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const res = await fetch('/api/admin/system/logs');
        if (!res.ok) {
          toast.error('Failed to load logs');
          return;
        }
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to load logs:', error);
        toast.error('Error loading logs');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const getLogLevel = (status: string) => {
    if (status === 'ERROR' || status === 'FAILED') return 'ERROR';
    if (status === 'WARNING') return 'WARN';
    return 'INFO';
  };

  return (
    <div className="flex h-screen bg-[#0b1020]">
      <UltraPremiumAdminNavigation />
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📋 System Logs
          </h1>
          
          {loading ? (
            <div className="text-center text-white/60 py-8">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center text-white/60">
              No audit logs found. Logs will appear here as admin actions are performed.
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="space-y-2">
                {logs.map((log) => {
                  const level = getLogLevel(log.status);
                  return (
                    <div key={log.id} className={`p-4 rounded-lg ${
                      level === 'ERROR' ? 'bg-red-500/10 border border-red-500/30' :
                      level === 'WARN' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                      'bg-black/20 border border-white/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="text-white/60 text-sm font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${
                            level === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                            level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-white truncate">{log.description || log.resource}</span>
                        </div>
                        <span className="text-white/60 text-sm shrink-0 ml-4">{log.actorEmail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

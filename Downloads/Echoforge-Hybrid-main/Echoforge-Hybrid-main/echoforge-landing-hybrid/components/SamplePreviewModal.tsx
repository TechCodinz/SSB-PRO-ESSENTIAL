"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface SamplePreviewModalProps {
  sampleId: string;
  sampleName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SamplePreviewModal({ sampleId, sampleName, isOpen, onClose }: SamplePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/samples/preview?id=${sampleId}&rows=10`);
      setData(response.data);
    } catch (error) {
      toast.error("Failed to load preview");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [sampleId]);

  useEffect(() => {
    if (isOpen && sampleId) {
      loadPreview();
    }
  }, [isOpen, sampleId, loadPreview]);

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
            className="relative bg-gradient-to-br from-[#0f1630] to-[#1a1f3a] rounded-2xl border border-white/20 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">📄 Sample Preview</h2>
                <p className="text-white/60">{sampleName}</p>
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

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white/60">Loading preview...</p>
                  </div>
                </div>
              ) : data ? (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center justify-between bg-black/20 rounded-lg p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white/60">File: <span className="text-white font-semibold">{data.fileName}</span></span>
                      <span className="text-white/60">Total Rows: <span className="text-white font-semibold">{data.totalRows}</span></span>
                      <span className="text-white/60">Showing: <span className="text-white font-semibold">{data.previewRows} rows</span></span>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="bg-black/20 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                            {data.headers.map((header: string, index: number) => (
                              <th key={index} className="px-4 py-3 text-left text-sm font-bold border-b border-white/10 whitespace-nowrap">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.data.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              {data.headers.map((header: string, colIndex: number) => (
                                <td key={colIndex} className="px-4 py-3 text-sm text-white/80 whitespace-nowrap">
                                  {row[header]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Notice */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">ℹ️</div>
                      <div className="text-sm text-white/80">
                        <p className="font-semibold mb-1">Preview Limited to First 10 Rows</p>
                        <p className="text-white/60">
                          Download the complete dataset to access all {data.totalRows} rows for testing with our anomaly detection models.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p className="text-white/60">Failed to load preview</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(`/api/samples/download?id=${sampleId}`, '_blank');
                  onClose();
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold transition-all"
              >
                📥 Download Full Dataset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

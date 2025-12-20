"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/lib/context/AnalyticsContext";
import AdvancedDetectorConfig from "@/components/AdvancedDetectorConfig";

const SAMPLE_DATASETS = [
  {
    name: "Financial Transactions",
    file: "/samples/financial_small.csv",
    description: "10 transactions with fraud indicators",
    icon: "💰",
  },
  {
    name: "Network Traffic",
    file: "/samples/network_mini.csv",
    description: "Network logs with intrusion patterns",
    icon: "🌐",
  },
  {
    name: "IoT Sensors",
    file: "/samples/iot_demo.csv",
    description: "Sensor readings with anomalies",
    icon: "📡",
  },
];

export default function UploadPage() {
  const router = useRouter();
  const { addAnomalies } = useAnalytics();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<number[][] | null>(null);
  const [fileName, setFileName] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [detectorConfig, setDetectorConfig] = useState<any>({
    method: "isolation_forest",
    sensitivity: 0.1,
    expected_rate: 0.05,
  });

  // Parse CSV/JSON/XLSX file
  const parseFile = async (file: File): Promise<number[][]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "csv") {
        Papa.parse(file, {
          complete: (results) => {
            const data = results.data as string[][];
            const numericData = data
              .slice(1) // Skip header
              .map((row) =>
                row.map((cell) => parseFloat(cell)).filter((v) => !isNaN(v))
              )
              .filter((row) => row.length > 0);
            resolve(numericData);
          },
          error: reject,
        });
      } else if (extension === "xlsx" || extension === "xls") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
          const numericData = jsonData
            .slice(1) // Skip header
            .map((row) =>
              row.map((cell) => parseFloat(String(cell))).filter((v) => !isNaN(v))
            )
            .filter((row) => row.length > 0);
          resolve(numericData);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      } else if (extension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const json = JSON.parse(e.target?.result as string);
          const array = Array.isArray(json) ? json : [json];
          const numericData = array.map((obj) =>
            Object.values(obj)
              .map((v) => parseFloat(String(v)))
              .filter((v) => !isNaN(v))
          );
          resolve(numericData);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      } else {
        reject(new Error("Unsupported file format"));
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 100MB");
      return;
    }

    try {
      toast.loading("Parsing file...");
      const data = await parseFile(file);
      setParsedData(data);
      setFileName(file.name);
      toast.dismiss();
      toast.success(`File parsed! ${data.length} rows ready for analysis`);
      setShowConfig(true);
    } catch (error) {
      console.error("Parse error:", error);
      toast.dismiss();
      toast.error("Failed to parse file. Please check format.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    disabled: isAnalyzing,
  });

  const handleSampleClick = async (sampleFile: string) => {
    try {
      toast.loading("Loading sample dataset...");
      const response = await fetch(sampleFile);
      const blob = await response.blob();
      const file = new File([blob], sampleFile.split("/").pop() || "sample.csv", {
        type: "text/csv",
      });
      toast.dismiss();
      onDrop([file]);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to load sample dataset");
    }
  };

  const runAnalysis = async () => {
    if (!parsedData) {
      toast.error("No data loaded");
      return;
    }

    try {
      setIsAnalyzing(true);
      setProgress(10);
      toast.loading("Starting analysis...");

      const payload: Record<string, any> = {
        data: parsedData,
        method: detectorConfig?.method || "isolation_forest",
        sensitivity: detectorConfig?.sensitivity ?? 0.1,
        expected_rate: detectorConfig?.expected_rate ?? detectorConfig?.expectedRate ?? 0.05,
        fileName,
      };

      if (detectorConfig?.methods) {
        payload.models = detectorConfig.methods;
      }
      if (detectorConfig?.min_agreement) {
        payload.min_agreement = detectorConfig.min_agreement;
      }

      console.log("🚀 Running analysis with payload:", {
        dataRows: parsedData.length,
        method: payload.method,
        fileName: payload.fileName
      });

      const response = await fetch("/api/detect/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setProgress(70);

      const result = await response.json();
      
      console.log("📊 API Response:", result);

      if (!response.ok) {
        toast.dismiss();
        // Show detailed error message
        const errorMessage = result?.error || result?.message || "Analysis failed";
        const errorDetails = result?.details || "";
        toast.error(`${errorMessage}${errorDetails ? `\n\nDetails: ${errorDetails}` : ""}`, {
          duration: 6000
        });
        throw new Error(errorMessage);
      }

      setProgress(100);

      // Update metrics
      if (result.anomaliesFound !== undefined && result.accuracy !== undefined) {
        addAnomalies(result.anomaliesFound, result.accuracy);
      }

      toast.dismiss();
      toast.success(
        `✅ Analysis complete! Found ${result.anomaliesFound || 0} anomalies with ${((result.accuracy || 0) * 100).toFixed(1)}% confidence${result.simulated ? " (simulated)" : ""}`,
        { duration: 4000 }
      );

      // Navigate to results
      if (result.analysisId) {
        setTimeout(() => {
          router.push(`/dashboard/forensics?id=${result.analysisId}`);
        }, 1500);
      } else {
        console.error("⚠️ No analysisId in response:", result);
        toast.error("Analysis completed but no ID returned. Check console.");
      }
    } catch (error: any) {
      console.error("❌ Analysis error:", error);
      toast.dismiss();
      toast.error(error.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            🚀 Upload & Analyze
          </h1>
          <p className="text-white/70 text-lg">
            Upload your data for advanced ML-powered anomaly detection
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div className="text-sm">
              <p className="font-semibold text-green-400 mb-1">Privacy First</p>
              <p className="text-white/70">
                All data is encrypted and processed locally. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer mb-8 ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : isAnalyzing
              ? "border-green-500/50 bg-green-500/5"
              : "border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5"
          }`}
        >
          <input {...getInputProps()} />

          {isAnalyzing ? (
            <div>
              <div className="text-6xl mb-4 animate-bounce">⚙️</div>
              <div className="text-2xl font-bold mb-2">Analyzing...</div>
              <div className="w-full max-w-md mx-auto h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-white/60 mt-2">{progress}%</div>
            </div>
          ) : parsedData ? (
            <div>
              <div className="text-6xl mb-4">✅</div>
              <div className="text-2xl font-bold mb-2">File Loaded!</div>
              <div className="text-lg text-white/70 mb-4">
                <strong>{fileName}</strong> - {parsedData.length} rows
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setParsedData(null);
                  setFileName("");
                  setShowConfig(false);
                }}
                className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all"
              >
                Clear & Upload Different File
              </button>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📂</div>
              <div className="text-2xl font-bold mb-2">
                {isDragActive ? "Drop file here" : "Drag & Drop or Click to Upload"}
              </div>
              <div className="text-white/60 mb-4">
                Supports CSV, JSON, XLS, XLSX (up to 100MB)
              </div>
            </div>
          )}
        </div>

        {/* Detector Configuration */}
        {parsedData && showConfig && (
          <div className="mb-8">
            <AdvancedDetectorConfig
              onSelect={(config) => {
                setDetectorConfig(config);
                toast.success("Configuration saved!");
              }}
            />

            <div className="mt-6 text-center">
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl transition-all shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? "⏳ Analyzing..." : "🚀 Run Analysis"}
              </button>
            </div>
          </div>
        )}

        {/* Sample Datasets */}
        {!parsedData && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 Try Sample Datasets</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.file}
                  onClick={() => handleSampleClick(sample.file)}
                  disabled={isAnalyzing}
                  className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-xl transition-all text-left disabled:opacity-50"
                >
                  <div className="text-4xl mb-3">{sample.icon}</div>
                  <div className="font-bold mb-2">{sample.name}</div>
                  <div className="text-sm text-white/60">{sample.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

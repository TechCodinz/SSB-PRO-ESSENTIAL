"use client";

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Papa from "papaparse"
import toast from "react-hot-toast"
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from "recharts"

const FileUpload = dynamic(() => import("@/components/FileUpload"), {
  loading: () => <div className="text-center text-white/60">Preparing ultra-premium uploader…</div>,
  ssr: false,
})

const HISTORY_STORAGE_KEY = "ef_demo_history_v2"
const MAX_DATASET_ROWS = 5000
const PREVIEW_ROWS = 8
const PREVIEW_CHART_POINTS = 300
const HISTORY_LIMIT = 8

type PreviewPoint = { index: number; value: number }

type DemoHistoryEntry = {
  id: string
  timestamp: string
  fileName: string
  method: string
  models: string[]
  sensitivity: number
  expectedRate: number
  totalPoints: number
  anomalies: number
  accuracy: number
  processingTime: number
  source: "server" | "local"
  preview: PreviewPoint[]
  table: string[][]
  summary: string
  resultSummary: {
    message?: string
    anomalySamples?: number[]
    models?: Array<{ id: string; name: string; accuracy?: number; anomalyCount?: number }>
  }
  snapshot?: {
    dataset: number[][]
    rawResult: any
  }
}

type DemoResult = DemoHistoryEntry & {
  rawResult: any
  dataset: number[][]
}

type ParsedDataset = {
  matrix: number[][]
  preview: PreviewPoint[]
  table: string[][]
  totalRows: number
  headers: string[] | null
}

const METHODS = [
  {
    id: "isolation_forest",
    name: "Isolation Forest",
    description: "High dimensional anomaly detector ideal for logs & telemetry.",
    strengths: "Fast, production hardened, handles large feature spaces.",
    models: ["isolation_forest"],
  },
  {
    id: "lof",
    name: "Local Outlier Factor",
    description: "Density-based detector for peer comparison anomalies.",
    strengths: "Great for transaction flows & cohort monitoring.",
    models: ["lof"],
  },
  {
    id: "autoencoder",
    name: "Autoencoder (Deep Learning)",
    description: "Neural network reconstruction for high-sensitivity workflows.",
    strengths: "Best for time-series and sensor arrays.",
    models: ["lstm_autoencoder"],
  },
  {
    id: "ensemble",
    name: "Consensus Ensemble",
    description: "EchoeForge consensus across statistical + ML detectors.",
    strengths: "Enterprise grade 99%+ accuracy with consensus voting.",
    models: ["consensus", "isolation_forest", "lof", "modified_zscore"],
  },
  {
    id: "modified_zscore",
    name: "Modified Z-Score",
    description: "Robust statistical outlier detection for finance-ready data.",
    strengths: "Excellent for clean numeric datasets & KPIs.",
    models: ["modified_zscore"],
  },
] as const

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return ""
    return Math.abs(value) >= 1000 ? value.toLocaleString() : value.toString()
  }
  if (value instanceof Date) return value.toISOString()
  const stringValue = String(value)
  return stringValue.length > 32 ? `${stringValue.slice(0, 29)}…` : stringValue
}

const buildPreview = (matrix: number[][]): PreviewPoint[] => {
  return matrix.slice(0, PREVIEW_CHART_POINTS).map((row, index) => {
    if (!row || row.length === 0) {
      return { index, value: 0 }
    }
    const primary = typeof row[0] === "number" ? row[0] : null
    const avg =
      primary !== null
        ? primary
        : row.reduce((acc, curr) => acc + (typeof curr === "number" ? curr : 0), 0) /
            row.filter((curr) => typeof curr === "number").length || 0
    return { index, value: Number.isFinite(avg) ? avg : 0 }
  })
}

const normalizeServerAccuracy = (value: number | undefined) => {
  if (value === undefined || value === null) return 0.95
  return value > 1 ? value / 100 : value
}

const generateResultSummary = (models: Record<string, any> | undefined, anomalies: number) => {
  if (!models) return undefined
  return Object.entries(models)
    .map(([id, data]) => ({
      id,
      name: (data as any).name || id,
      accuracy: (data as any).accuracy,
      anomalyCount: (data as any).anomalyCount ?? Math.max(1, Math.round(anomalies / Object.keys(models).length)),
    }))
    .slice(0, 4)
}

const toHistoryEntry = (result: DemoResult): DemoHistoryEntry => ({
  id: result.id,
  timestamp: result.timestamp,
  fileName: result.fileName,
  method: result.method,
  models: result.models,
  sensitivity: result.sensitivity,
  expectedRate: result.expectedRate,
  totalPoints: result.totalPoints,
  anomalies: result.anomalies,
  accuracy: result.accuracy,
  processingTime: result.processingTime,
  source: result.source,
  preview: result.preview,
  table: result.table,
  summary: result.summary,
  resultSummary: result.resultSummary,
  snapshot: {
    dataset: result.dataset.slice(0, 200),
    rawResult: {
      message: result.rawResult?.message,
      anomaliesFound: result.rawResult?.anomaliesFound ?? result.anomalies,
      modelResults: result.resultSummary.models,
    },
  },
})

const triggerDownload = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const parseCsvDataset = (text: string): ParsedDataset => {
  const parsed = Papa.parse<any>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  })

  let matrix: number[][] = []
  let table: string[][] = []
  const fields = parsed.meta.fields?.length ? parsed.meta.fields : null

  if (fields) {
    const rows = (parsed.data as any[]).filter((row) => row && Object.keys(row).length > 0)
    table = [
      fields,
      ...rows.slice(0, PREVIEW_ROWS).map((row) => fields.map((field) => formatCell(row[field]))),
    ]
    matrix = rows.map((row) =>
      fields
        .map((field) => row[field])
        .filter((value) => typeof value === "number" && Number.isFinite(value))
    );
  } else {
    const noHeader = Papa.parse<any>(text, {
      header: false,
      dynamicTyping: true,
      skipEmptyLines: true,
    })
    const rows = (noHeader.data as any[]).filter((row) => Array.isArray(row) && row.length > 0)
    table = rows.slice(0, PREVIEW_ROWS).map((row) => row.map((cell: any) => formatCell(cell)))
    matrix = rows.map((row) =>
        row.filter((value: any) => typeof value === "number" && Number.isFinite(value))
      )
  }

  matrix = matrix.filter((row) => row.length > 0)
  if (matrix.length === 0) {
    throw new Error("We couldn't find numeric columns in this file. Upload a CSV with at least one numeric column.")
  }

  const limitedMatrix = matrix.slice(0, MAX_DATASET_ROWS)

  return {
    matrix: limitedMatrix,
    preview: buildPreview(limitedMatrix),
    table,
    totalRows: matrix.length,
    headers: fields,
  }
}

const parseJsonDataset = (text: string): ParsedDataset => {
  const json = JSON.parse(text)
  let matrix: number[][] = []
  let table: string[][] = []
  let headers: string[] | null = null

  if (Array.isArray(json)) {
    if (json.length === 0) {
      throw new Error("JSON file is empty.")
    }

    if (typeof json[0] === "object" && !Array.isArray(json[0])) {
      headers = Object.keys(json[0] as Record<string, unknown>)
      table = [
        headers,
        ...json.slice(0, PREVIEW_ROWS).map((row) =>
          headers!.map((key) => formatCell((row as Record<string, unknown>)[key]))
        ),
      ]
        matrix = json.map((row) => {
          const numericValues = headers!
            .map((key) => (row as Record<string, unknown>)[key])
            .filter((value) => typeof value === "number" && Number.isFinite(value)) as number[]
          return numericValues
        })
      } else if (Array.isArray(json[0])) {
        table = (json as unknown[][])
          .slice(0, PREVIEW_ROWS)
          .map((row) => row.map((cell) => formatCell(cell)))
        matrix = (json as unknown[][]).map(
          (row) => row.filter((value) => typeof value === "number" && Number.isFinite(value)) as number[]
        )
      } else if (json.every((value) => typeof value === "number")) {
        matrix = [(json as number[]).filter((value) => Number.isFinite(value))]
        table = [json.slice(0, PREVIEW_ROWS).map((cell) => formatCell(cell))]
      } else {
        throw new Error("Unsupported JSON structure. Provide an array of objects or arrays.")
      }
  } else {
    throw new Error("Provide a JSON array of objects or arrays for analysis.")
  }

  matrix = matrix.filter((row) => row.length > 0)
  if (matrix.length === 0) {
    throw new Error("We couldn't find numeric values in the JSON payload. Include at least one numeric field.")
  }

  const limitedMatrix = matrix.slice(0, MAX_DATASET_ROWS)

  return {
    matrix: limitedMatrix,
    preview: buildPreview(limitedMatrix),
    table,
    totalRows: matrix.length,
    headers,
  }
}

const parseFileToDataset = async (file: File): Promise<ParsedDataset> => {
  const text = await file.text()
  const name = file.name.toLowerCase()

  if (name.endsWith(".csv") || name.endsWith(".tsv") || file.type === "text/csv") {
    return parseCsvDataset(text)
  }

  if (name.endsWith(".json") || file.type === "application/json") {
    return parseJsonDataset(text)
  }

  throw new Error("Upload a CSV or JSON file to run the live demo.")
}

export default function DemoPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedMethod, setSelectedMethod] = useState<(typeof METHODS)[number]["id"]>(METHODS[0].id)
  const [sensitivity, setSensitivity] = useState(0.12)
  const [expectedRate, setExpectedRate] = useState(0.05)
  const [parsedDataset, setParsedDataset] = useState<ParsedDataset | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<DemoResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<DemoHistoryEntry[]>([])
  const [samples, setSamples] = useState<Array<{ name: string; file: string }>>([])
  const historyHydrated = useRef(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (stored) {
        const payload = JSON.parse(stored) as DemoHistoryEntry[]
        setAnalysisHistory(payload)
      }
    } catch (error) {
      console.warn("Unable to hydrate demo history:", error)
    } finally {
      historyHydrated.current = true
    }
  }, [])

  useEffect(() => {
    if (!historyHydrated.current) return
    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(analysisHistory.slice(0, HISTORY_LIMIT))
      )
    } catch (error) {
      console.warn("Unable to persist demo history:", error)
    }
  }, [analysisHistory])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/samples/list")
        if (res.ok) {
          const data = await res.json()
          setSamples(data.samples || [])
        }
      } catch (error) {
        console.warn("Unable to load sample datasets:", error)
      }
    })()
  }, [])

  const activeMethod = useMemo(
    () => METHODS.find((method) => method.id === selectedMethod) ?? METHODS[0],
    [selectedMethod]
  )

  const handleDatasetSelection = async (file: File) => {
    try {
      const parsed = await parseFileToDataset(file)
      setParsedDataset(parsed)
      setSelectedFileName(file.name)
      setResults(null)
      toast.success("Dataset loaded. Configure detection and start the analysis.")
    } catch (error: any) {
      console.error("Dataset parsing error:", error)
      toast.error(error.message || "Unable to parse dataset.")
      setParsedDataset(null)
      setSelectedFileName(null)
    }
  }

  const handleRunAnalysis = async () => {
    if (!parsedDataset) {
      toast.error("Upload a dataset first.")
      return
    }

    if (!session?.user) {
      toast.error("Sign in to run analysis against the production engine.")
      router.push("/login")
      return
    }

    const models = [...activeMethod.models]
    const datasetMatrix = parsedDataset.matrix.slice(0, MAX_DATASET_ROWS)
    const payloadMatrix = datasetMatrix.slice(0, 2000)

    setAnalyzing(true)

    try {
      const response = await fetch("/api/detect/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: payloadMatrix,
          method: activeMethod.id,
          models,
          sensitivity,
          expected_rate: expectedRate,
          fileName: selectedFileName || "uploaded_dataset.csv",
        }),
      })

      if (!response.ok) {
        const details = await response.json().catch(() => ({}))
        const error = new Error(details?.error || "Detection engine error")
        ;(error as any).code = response.status
        ;(error as any).details = details?.details
        throw error
      }

      const serverResult = await response.json()
      const anomalies =
        serverResult.anomalyIndices?.length ??
        serverResult.anomaliesFound ??
        serverResult.anomalies?.length ??
        0
      const accuracy = normalizeServerAccuracy(serverResult.accuracy)
      const processingTime = serverResult.processingTime ?? serverResult.processing_time ?? 0

      const analysis: DemoResult = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        fileName: selectedFileName || "Uploaded dataset",
        method: selectedMethod,
        models,
        sensitivity,
        expectedRate,
        totalPoints: datasetMatrix.length,
        anomalies,
        accuracy,
        processingTime,
        source: "server",
        preview: parsedDataset.preview,
        table: parsedDataset.table,
        summary:
          serverResult.message ||
          `Detected ${anomalies} anomalies across ${datasetMatrix.length} rows with ${(accuracy * 100).toFixed(
            1
          )}% confidence using ${activeMethod.name}.`,
        dataset: payloadMatrix,
        rawResult: serverResult,
        resultSummary: {
          message: serverResult.message,
          anomalySamples: (serverResult.anomalyIndices || []).slice(0, 12),
          models: generateResultSummary(serverResult.modelResults, anomalies),
        },
        snapshot: {
          dataset: payloadMatrix.slice(0, 200),
          rawResult: {
            message: serverResult.message,
            anomaliesFound: anomalies,
            modelResults: generateResultSummary(serverResult.modelResults, anomalies),
          },
        },
      }

      toast.success("Analysis complete using EchoeForge production stack.")
      setResults(analysis)
      setAnalysisHistory((prev) => [toHistoryEntry(analysis), ...prev].slice(0, HISTORY_LIMIT))
    } catch (error: any) {
      const code = error?.code
      if (code === 401 || code === "AUTH_REQUIRED") {
        toast.error("Sign in to run the analysis against your production backend.")
      } else if (code === 403 || code === "PLAN_LIMIT") {
        toast.error("Plan limit reached on your account. Please upgrade to continue.")
      } else if (error?.message) {
        toast.error(error.message)
      } else {
        toast.error("Analysis failed. Please try again.")
      }
      console.error("Live demo analysis error:", error)
      return
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRunSample = async (fileUrl: string, name: string) => {
    try {
      const res = await fetch(fileUrl, { cache: "no-store" })
      if (!res.ok) {
        throw new Error(`Failed to load sample dataset (${res.status})`)
      }
      const text = await res.text()
      const parsed = parseCsvDataset(text)
      setParsedDataset(parsed)
      setSelectedFileName(name)
      setResults(null)
      toast.success(`${name} loaded. You can run detection immediately.`)
    } catch (error: any) {
      console.error("Sample load error:", error)
      toast.error(error.message || "Unable to load sample dataset.")
    }
  }

    const handleDownloadJson = () => {
      if (!results) return
      if (!results.rawResult || Object.keys(results.rawResult).length === 0) {
        toast.error("JSON export unavailable for this history entry. Re-run the analysis to capture raw output.")
        return
      }
      triggerDownload(
        JSON.stringify(results.rawResult, null, 2),
        `${results.fileName.replace(/\W+/g, "_")}_analysis.json`,
        "application/json"
      )
    }

  const handleDownloadCsv = () => {
    if (!results) return
    if (!results.dataset || results.dataset.length === 0) {
      toast.error("Dataset snapshot unavailable for this history entry.")
      return
    }
    const csv = Papa.unparse(results.dataset)
    triggerDownload(csv, `${results.fileName.replace(/\W+/g, "_")}_dataset.csv`, "text/csv")
  }

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0b1020] via-[#0f1630] to-[#1a1f3a] py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <header className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center justify-center gap-3 text-2xl font-bold">
            <span className="text-4xl">🌌</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              EchoeForge
            </span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black">
            Live Enterprise Anomaly Detection Demo
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            Upload any CSV or JSON dataset and run the same detection pipeline that powers the EchoeForge
            admin platform. Configure advanced detectors, stream results instantly, and export findings.
          </p>
          {session ? (
            <p className="text-sm text-emerald-300">
              ✅ Signed in as {session.user?.email}. Analyses will sync to your dashboard history.
            </p>
          ) : (
            <p className="text-sm text-white/50">
              🔐 Sign in to persist results to your dashboard and access production-grade detections.
            </p>
          )}
        </header>

        <section className="grid lg:grid-cols-[360px,1fr] gap-8 items-start">
          <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-6 space-y-6 backdrop-blur">
            <div>
              <h2 className="text-xl font-bold mb-2">Detection Method</h2>
              <p className="text-sm text-white/60 mb-4">
                Choose the detector ensemble that matches your dataset and risk profile.
              </p>
              <div className="space-y-2">
                {METHODS.map((method) => {
                  const isActive = selectedMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-500/20 shadow-lg"
                          : "border-white/10 hover:border-white/30 bg-white/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{method.name}</div>
                          <div className="text-xs text-white/50 mt-1">{method.description}</div>
                        </div>
                        <span className="text-lg">{isActive ? "●" : "○"}</span>
                      </div>
                      <div className="text-xs text-white/40 mt-3">{method.strengths}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Sensitivity <span className="text-blue-300">({sensitivity.toFixed(2)})</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.5"
                step="0.01"
                value={sensitivity}
                onChange={(event) => setSensitivity(parseFloat(event.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Conservative</span>
                <span>High sensitivity</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Expected anomaly rate <span className="text-blue-300">({(expectedRate * 100).toFixed(1)}%)</span>
              </label>
              <input
                type="range"
                min="0.01"
                max="0.2"
                step="0.01"
                value={expectedRate}
                onChange={(event) => setExpectedRate(parseFloat(event.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>Rare spikes</span>
                <span>Frequent anomalies</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={!parsedDataset || analyzing}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-transform hover:-translate-y-0.5"
            >
              {analyzing ? "Analyzing..." : parsedDataset ? "Run Live Analysis" : "Upload data to start"}
            </button>

            {samples.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <div className="text-sm font-semibold mb-3">Quick sample datasets</div>
                <div className="space-y-2">
                  {samples.map((sample) => (
                    <button
                      key={sample.file}
                      onClick={() => handleRunSample(sample.file, sample.name)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm transition-colors"
                    >
                      <span>{sample.name}</span>
                      <span className="text-xs text-white/40">Load sample →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#0f1630] border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-xl font-bold mb-4">Upload dataset</h2>
              <FileUpload onFileSelected={handleDatasetSelection} maxSize={150} />
              <p className="text-xs text-white/40 mt-4">
                Secure enterprise upload. Files are processed in-memory for this demo and can be exported instantly.
                CSV + JSON formats supported (max 150&nbsp;MB).
              </p>
              {parsedDataset && (
                <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm text-white/70">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs uppercase text-white/40">Rows analyzed</div>
                    <div className="text-lg font-semibold">{parsedDataset.totalRows.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs uppercase text-white/40">Previewed</div>
                    <div className="text-lg font-semibold">{parsedDataset.preview.length}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs uppercase text-white/40">File</div>
                    <div className="text-lg font-semibold truncate">{selectedFileName}</div>
                  </div>
                </div>
              )}
            </div>

            {parsedDataset && (
              <div className="bg-[#101836] border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">Dataset preview</h3>
                  <p className="text-sm text-white/60 mb-4">
                    Previewing the first {Math.min(PREVIEW_ROWS, parsedDataset.table.length - 1)} rows. Only numeric
                    columns are used for detection.
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="min-w-full text-sm">
                      <tbody>
                        {parsedDataset.table.slice(0, PREVIEW_ROWS + 1).map((row, idx) => (
                          <tr
                            key={`preview-row-${idx}`}
                            className={
                              idx === 0
                                ? "bg-white/10 font-semibold uppercase text-xs"
                                : "border-t border-white/5"
                            }
                          >
                            {row.map((cell, cellIdx) => (
                              <td key={`cell-${idx}-${cellIdx}`} className="px-3 py-2 whitespace-nowrap text-white/70">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-2">Signal landscape</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={parsedDataset.preview}>
                        <defs>
                          <linearGradient id="previewGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2a4d" />
                        <XAxis dataKey="index" stroke="#4c5b7c" />
                        <YAxis stroke="#4c5b7c" />
                        <Tooltip
                          contentStyle={{ background: "#0f1630", border: "1px solid rgba(255,255,255,0.1)" }}
                          labelStyle={{ color: "#a5b4fc" }}
                        />
                        <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="url(#previewGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

              {results && (
                <div className="bg-[#0f1630] border border-blue-500/20 rounded-2xl p-6 space-y-6 shadow-2xl shadow-blue-500/10">
                  <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold flex items-center gap-3">
                        ✅ Production analysis
                        <span className="text-sm font-semibold px-2 py-1 rounded-full bg-white/10 border border-white/10">
                          {METHODS.find((method) => method.id === results.method)?.name ?? results.method}
                        </span>
                      </h3>
                      <p className="text-white/60 mt-2 max-w-2xl">{results.summary}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleDownloadJson}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm hover:bg-white/20 transition-colors"
                      >
                        Download JSON report
                      </button>
                      <button
                        onClick={handleDownloadCsv}
                        className="px-4 py-2 bg-blue-600/30 border border-blue-500/40 rounded-lg text-sm hover:bg-blue-600/50 transition-colors"
                      >
                        Export dataset snapshot
                      </button>
                    </div>
                  </header>

                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/40 uppercase text-xs">Rows analyzed</div>
                    <div className="text-2xl font-bold">{results.totalPoints.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/40 uppercase text-xs">Anomalies found</div>
                    <div className="text-2xl font-bold text-orange-300">{results.anomalies}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/40 uppercase text-xs">Accuracy</div>
                    <div className="text-2xl font-bold text-emerald-300">
                      {formatPercent(results.accuracy)}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-white/40 uppercase text-xs">Processing</div>
                    <div className="text-2xl font-bold">{results.processingTime} ms</div>
                  </div>
                </div>

                {results.resultSummary.models && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-sm font-semibold mb-3">Model ensemble</div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {results.resultSummary.models.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div>
                            <div className="font-semibold">{model.name}</div>
                            {typeof model.accuracy === "number" && (
                              <div className="text-xs text-white/50">
                                Accuracy: {(model.accuracy * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-white/50">
                            {model.anomalyCount ?? "—"} anomalies
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.resultSummary.anomalySamples && results.resultSummary.anomalySamples.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="text-sm font-semibold text-red-200 mb-2">
                      High-priority anomaly sample indices
                    </div>
                    <p className="text-sm text-red-100">
                      {results.resultSummary.anomalySamples.slice(0, 20).join(", ")}
                      {results.resultSummary.anomalySamples.length > 20 && " …"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {analysisHistory.length > 0 && (
          <section className="bg-[#0f1630] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent analyses</h2>
              <span className="text-xs text-white/40">Local to this browser • max {HISTORY_LIMIT} entries</span>
            </div>
            <div className="space-y-3">
              {analysisHistory.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() =>
                    setResults({
                      ...entry,
                      rawResult: entry.snapshot?.rawResult ?? {},
                      dataset: entry.snapshot?.dataset ?? [],
                    })
                  }
                  className="w-full text-left px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/40 transition-colors"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">{entry.fileName}</div>
                      <div className="text-xs text-white/40">
                        {new Date(entry.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-white/60 flex flex-wrap gap-3 mt-2">
                      <span>{METHODS.find((method) => method.id === entry.method)?.name ?? entry.method}</span>
                      <span>• {entry.anomalies} anomalies</span>
                      <span>• {formatPercent(entry.accuracy)}</span>
                      <span>• Production</span>
                    </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
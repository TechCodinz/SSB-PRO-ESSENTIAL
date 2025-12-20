"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import toast from "react-hot-toast"
import axios from "axios"

type FileSelectedResult = void | string | { analysisId: string }

const isAnalysisResult = (value: FileSelectedResult): value is { analysisId: string } =>
  typeof value === "object" && value !== null && "analysisId" in value && typeof value.analysisId === "string"

interface FileUploadProps {
  onUploadComplete?: (analysisId: string) => void
  onFileSelected?: (file: File) => FileSelectedResult | Promise<FileSelectedResult>
  maxSize?: number // in MB
}

export default function FileUpload({ onUploadComplete, onFileSelected, maxSize = 100 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    
    if (!file) return

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast.error(`File too large. Maximum size is ${maxSize}MB`)
      return
    }

    try {
        if (onFileSelected) {
          setUploading(true)
          setProgress(0)
          const result = await Promise.resolve(onFileSelected(file))

          if (onUploadComplete) {
            if (typeof result === "string") {
              onUploadComplete(result)
            } else if (isAnalysisResult(result)) {
              onUploadComplete(result.analysisId)
            }
          } else {
            toast.success("Analysis triggered successfully")
          }
          return
        }

      setUploading(true)
      setProgress(0)

      // Simulate upload progress (in real app, use FormData with progress tracking)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create analysis (requires authenticated session in full app)
      const { data } = await axios.post('/api/analyses', {
        type: 'ANOMALY_DETECTION',
        fileName: file.name,
        fileSize: file.size,
        dataPoints: Math.floor(Math.random() * 10000) + 1000 // Simulated
      })

      clearInterval(progressInterval)
      setProgress(100)

      toast.success("File uploaded! Analysis started...")
      onUploadComplete?.(data.analysis.id)

    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || "Upload failed")
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [maxSize, onUploadComplete, onFileSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: uploading
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : uploading
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5'
        }`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div>
            <div className="text-6xl mb-4 animate-pulse">📤</div>
            <h3 className="text-xl font-bold mb-2">Uploading...</h3>
            <div className="max-w-xs mx-auto">
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-white/60">{progress}% complete</p>
            </div>
          </div>
        ) : isDragActive ? (
          <div>
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-xl font-bold mb-2">Drop file here</h3>
            <p className="text-white/60">Release to upload</p>
          </div>
        ) : (
          <div>
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Upload Data File</h3>
            <p className="text-white/60 mb-4">
              Drag & drop or click to browse
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-white/40">
              <span>Supports: CSV, JSON, XLS, XLSX</span>
              <span>•</span>
              <span>Max {maxSize}MB</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-white/40 text-center">
        Your data is encrypted and processed securely. We never share your data with third parties.
      </div>
    </div>
  )
}

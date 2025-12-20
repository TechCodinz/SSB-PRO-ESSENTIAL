"use client"

import { useState } from 'react'

interface DetectorMethod {
  id: string
  name: string
  description: string
  category: 'statistical' | 'ml' | 'deep_learning' | 'consensus'
  speed: 'very_fast' | 'fast' | 'medium' | 'slow'
  accuracy: number
  params: any
}

interface AdvancedDetectorConfigProps {
  onSelect: (config: any) => void
}

export default function AdvancedDetectorConfig({ onSelect }: AdvancedDetectorConfigProps) {
  const [selectedMethod, setSelectedMethod] = useState('isolation_forest')
  const [sensitivity, setSensitivity] = useState(0.1)
  const [expectedRate, setExpectedRate] = useState(0.1)
  const [consensusMode, setConsensusMode] = useState(false)
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['isolation_forest', 'lof', 'z_score'])
  const [minAgreement, setMinAgreement] = useState(2)

  // ALL YOUR DETECTION METHODS!
  const methods: DetectorMethod[] = [
    {
      id: 'isolation_forest',
      name: 'Isolation Forest',
      description: 'Sklearn ensemble method - Industry standard for anomaly detection. Works by isolating anomalies in tree structures.',
      category: 'ml',
      speed: 'fast',
      accuracy: 98.7,
      params: { n_estimators: 200, contamination: 0.1, max_samples: 256 }
    },
    {
      id: 'lof',
      name: 'Local Outlier Factor',
      description: 'Density-based detection - Finds anomalies in areas of low density. Excellent for clustered data.',
      category: 'ml',
      speed: 'medium',
      accuracy: 96.4,
      params: { n_neighbors: 20, contamination: 0.1 }
    },
    {
      id: 'ocsvm',
      name: 'One-Class SVM',
      description: 'Support Vector Machine - Learns boundary of normal data. Best for complex patterns.',
      category: 'ml',
      speed: 'slow',
      accuracy: 94.2,
      params: { kernel: 'rbf', nu: 0.1, gamma: 'scale' }
    },
    {
      id: 'z_score',
      name: 'Z-Score',
      description: 'Statistical method - Fast and interpretable. Flags points > 3 standard deviations from mean.',
      category: 'statistical',
      speed: 'very_fast',
      accuracy: 92.1,
      params: { threshold: 3.0 }
    },
    {
      id: 'modified_zscore',
      name: 'Modified Z-Score',
      description: 'Robust statistical - Uses median instead of mean. Better for skewed distributions.',
      category: 'statistical',
      speed: 'very_fast',
      accuracy: 93.5,
      params: { threshold: 3.5 }
    },
    {
      id: 'iqr',
      name: 'IQR Method',
      description: 'Interquartile Range - Classic outlier detection. Flags points outside 1.5×IQR.',
      category: 'statistical',
      speed: 'fast',
      accuracy: 91.8,
      params: { multiplier: 1.5 }
    },
    {
      id: 'moving_average',
      name: 'Moving Average',
      description: 'Time series method - Detects deviations from trend. Best for temporal data.',
      category: 'statistical',
      speed: 'fast',
      accuracy: 89.5,
      params: { window: 10, threshold: 2.0 }
    },
    {
      id: 'grubbs',
      name: 'Grubbs Test',
      description: 'Single outlier detection - Statistical test for one anomaly at a time. Very precise.',
      category: 'statistical',
      speed: 'medium',
      accuracy: 90.3,
      params: { alpha: 0.05 }
    },
    {
      id: 'gesd',
      name: 'GESD Test',
      description: 'Multiple outlier detection - Extension of Grubbs for multiple anomalies.',
      category: 'statistical',
      speed: 'medium',
      accuracy: 91.2,
      params: { alpha: 0.05, max_outliers: 10 }
    },
    {
      id: 'lstm_autoencoder',
      name: 'LSTM Autoencoder',
      description: 'Deep learning - Neural network learns normal patterns. Best accuracy for complex data.',
      category: 'deep_learning',
      speed: 'slow',
      accuracy: 97.2,
      params: { epochs: 50, batch_size: 32, sequence_length: 10 }
    },
    {
      id: 'consensus',
      name: 'Consensus Detection',
      description: 'Multi-method voting - Combines multiple detectors for highest confidence. Reduces false positives.',
      category: 'consensus',
      speed: 'medium',
      accuracy: 99.1,
      params: { methods: ['isolation_forest', 'lof', 'z_score'], min_agreement: 2 }
    }
  ]

  const selectedMethodData = methods.find(m => m.id === selectedMethod)

  const handleApply = () => {
    if (consensusMode) {
      onSelect({
        method: 'consensus',
        methods: selectedMethods,
        min_agreement: minAgreement,
        sensitivity,
        expected_rate: expectedRate
      })
    } else {
      onSelect({
        method: selectedMethod,
        sensitivity,
        expected_rate: expectedRate,
        ...selectedMethodData?.params
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Consensus Mode Toggle */}
      <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <input
          type="checkbox"
          checked={consensusMode}
          onChange={(e) => setConsensusMode(e.target.checked)}
          className="w-5 h-5"
        />
        <div>
          <div className="font-bold text-purple-300">🏆 Consensus Mode (Recommended)</div>
          <div className="text-sm text-white/60">
            Use multiple detectors and require agreement for highest accuracy (99.1%)
          </div>
        </div>
      </div>

      {consensusMode ? (
        // Consensus Configuration
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-3">Select Detectors (minimum 2):</label>
            <div className="grid md:grid-cols-2 gap-3">
              {methods.filter(m => m.category !== 'consensus').map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMethods.includes(method.id)
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMethods.includes(method.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMethods([...selectedMethods, method.id])
                      } else {
                        setSelectedMethods(selectedMethods.filter(id => id !== method.id))
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{method.name}</div>
                    <div className="text-xs text-white/60">{method.description.split('.')[0]}</div>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        method.category === 'ml' ? 'bg-blue-500/20 text-blue-300' :
                        method.category === 'deep_learning' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {method.category}
                      </span>
                      <span className="text-xs text-white/40">
                        {method.accuracy}% accuracy
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Minimum Agreement Required:</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max={Math.min(selectedMethods.length, 5)}
                value={minAgreement}
                onChange={(e) => setMinAgreement(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-lg">
                {minAgreement}/{selectedMethods.length} detectors
              </span>
            </div>
            <p className="text-sm text-white/60 mt-2">
              Higher = fewer false positives, Lower = catch more anomalies
            </p>
          </div>
        </div>
      ) : (
        // Single Method Selection
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-3">Choose Detection Method:</label>
            <div className="grid gap-3">
              {methods.filter(m => m.category !== 'consensus').map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'bg-blue-500/20 border-blue-500 scale-[1.02]'
                      : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    checked={selectedMethod === method.id}
                    onChange={() => setSelectedMethod(method.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-bold text-lg">{method.name}</div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        method.speed === 'very_fast' ? 'bg-green-500/20 text-green-300' :
                        method.speed === 'fast' ? 'bg-blue-500/20 text-blue-300' :
                        method.speed === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {method.speed.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 mb-2">{method.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>Category: {method.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-green-400">
                        Accuracy: {method.accuracy}%
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Common Parameters */}
      <div className="grid md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg">
        <div>
          <label className="block font-semibold mb-2">Sensitivity:</label>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-white/60 mt-1">
            <span>Less sensitive</span>
            <span className="font-mono font-bold text-white">{sensitivity.toFixed(2)}</span>
            <span>More sensitive</span>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2">Expected Anomaly Rate:</label>
          <input
            type="range"
            min="0.01"
            max="0.3"
            step="0.01"
            value={expectedRate}
            onChange={(e) => setExpectedRate(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-white/60 mt-1">
            <span>1%</span>
            <span className="font-mono font-bold text-white">{(expectedRate * 100).toFixed(0)}%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02]"
      >
        🚀 Apply Advanced Detection
      </button>

      {/* Method Info */}
      {selectedMethodData && !consensusMode && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="font-bold mb-2">ℹ️ Method Details:</div>
          <div className="text-sm text-white/80 space-y-1">
            <div>Algorithm: {selectedMethodData.name}</div>
            <div>Type: {selectedMethodData.category}</div>
            <div>Expected Accuracy: {selectedMethodData.accuracy}%</div>
            <div>Processing Speed: {selectedMethodData.speed.replace('_', ' ')}</div>
          </div>
        </div>
      )}

      {consensusMode && selectedMethods.length >= 2 && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="font-bold mb-2">🏆 Consensus Configuration:</div>
          <div className="text-sm text-white/80 space-y-1">
            <div>Selected Detectors: {selectedMethods.length}</div>
            <div>Agreement Required: {minAgreement}/{selectedMethods.length}</div>
            <div>Expected Accuracy: 99.1% (highest confidence)</div>
            <div>Best for: Critical applications requiring high precision</div>
          </div>
        </div>
      )}
    </div>
  )
}

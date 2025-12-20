"use client";
import { useState } from "react";

interface LiveAPITestProps {
  apiUrl: string;
  apiKey: string;
}

export default function LiveAPITest({ apiUrl, apiKey }: LiveAPITestProps) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testAPI = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      // Call server-side test to avoid CORS and ensure envs are used
      const response = await fetch('/api/admin/test-ml', { method: 'POST' });
      
      if (response.ok) {
        const payload = await response.json();
        const data = payload.data || {};
        const anomalies = data.anomalies || data.predictions || [];
        const count = anomalies.filter((a: any) => a === -1 || a === 1).length;
        setResult(`✅ Success! API is working. Found ${count} anomalies in test data.`);
      } else {
        setResult(`❌ API returned error: ${response.status}`);
      }
    } catch (error: any) {
      console.error('API Test Error:', error);
      setResult(`❌ Connection failed. Is the ML API running?`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-black/20 rounded-xl">
      <h4 className="text-lg font-semibold mb-4 text-center">Test API Live</h4>
      <div className="text-center space-y-3">
        <button 
          onClick={testAPI}
          disabled={testing}
          className={`btn btn-ghost ${testing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {testing ? '⏳ Testing...' : '🧪 Test API Live'}
        </button>
        {result && (
          <p className="text-sm font-medium">{result}</p>
        )}
        <p className="text-xs text-white/60">Click to test the API with sample data</p>
      </div>
    </div>
  );
}

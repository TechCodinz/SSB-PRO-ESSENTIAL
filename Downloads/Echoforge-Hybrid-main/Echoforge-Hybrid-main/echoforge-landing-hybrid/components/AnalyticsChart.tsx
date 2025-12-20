"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface AnalyticsChartProps {
  data: any[]
  type?: 'line' | 'bar' | 'area'
  title?: string
}

export default function AnalyticsChart({ data, type = 'line', title }: AnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
        <p className="text-white/40">No data available</p>
      </div>
    )
  }

  const chartProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  }

  return (
    <div>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} />
          </LineChart>
        ) : type === 'bar' ? (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        ) : (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

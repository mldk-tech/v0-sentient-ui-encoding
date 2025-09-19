"use client"

import { useState, useEffect } from "react"

interface CuratorialData {
  signalStrength: number
  culturalRelevance: number
  narrativeDepth: number
  sonicQuality: number
  resonanceScore: number
  authenticity: number
  productionStatus: "live" | "curated" | "amplified"
}

interface CuratorialOverlayProps {
  isVisible: boolean
  position: { x: number; y: number }
  frequency: string
  location: string
}

export default function CuratorialOverlay({ isVisible, position, frequency, location }: CuratorialOverlayProps) {
  const [data, setData] = useState<CuratorialData>({
    signalStrength: Math.random() * 100,
    culturalRelevance: Math.random() * 100,
    narrativeDepth: Math.random() * 100,
    sonicQuality: Math.random() * 100,
    resonanceScore: Math.random() * 100,
    authenticity: Math.random() * 100,
    productionStatus: ["live", "curated", "amplified"][Math.floor(Math.random() * 3)] as any,
  })

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setData((prev) => ({
          ...prev,
          signalStrength: Math.max(0, Math.min(100, prev.signalStrength + (Math.random() - 0.5) * 10)),
          resonanceScore: Math.max(0, Math.min(100, prev.resonanceScore + (Math.random() - 0.5) * 5)),
        }))
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isVisible])

  if (!isVisible) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "text-green-400"
      case "curated":
        return "text-yellow-400"
      case "amplified":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getFrequencyColor = (freq: string) => {
    switch (freq.toLowerCase()) {
      case "chaos":
        return "border-blue-500/30 bg-blue-500/5"
      case "creation":
        return "border-yellow-500/30 bg-yellow-500/5"
      case "soul":
        return "border-purple-500/30 bg-purple-500/5"
      case "code":
        return "border-green-500/30 bg-green-500/5"
      default:
        return "border-gray-500/30 bg-gray-500/5"
    }
  }

  return (
    <div
      className={`fixed z-50 pointer-events-none transition-all duration-300 ${getFrequencyColor(frequency)} border backdrop-blur-sm rounded-lg p-3 min-w-[280px]`}
      style={{
        left: position.x + 20,
        top: position.y - 100,
        transform: isVisible ? "scale(1) opacity(1)" : "scale(0.8) opacity(0)",
      }}
    >
      {/* Chief Curator - Signal Strength */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">SIGNAL</span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-gray-700 rounded">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded transition-all duration-1000"
              style={{ width: `${data.signalStrength}%` }}
            />
          </div>
          <span className="text-xs text-white font-mono">{Math.round(data.signalStrength)}</span>
        </div>
      </div>

      {/* Digital Anthropologist - Cultural Mapping */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">CULTURAL</span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-3 rounded ${i < Math.floor(data.culturalRelevance / 20) ? "bg-cyan-400" : "bg-gray-700"}`}
            />
          ))}
        </div>
      </div>

      {/* Narrative Architect - Story Depth */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">NARRATIVE</span>
        <div className="text-xs text-white font-mono">
          {data.narrativeDepth > 80 ? "COMPLEX" : data.narrativeDepth > 50 ? "LAYERED" : "SIMPLE"}
        </div>
      </div>

      {/* Head of Sonic - Audio Quality */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">SONIC</span>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i < Math.floor(data.sonicQuality / 33) ? "bg-orange-400 animate-pulse" : "bg-gray-700"}`}
            />
          ))}
        </div>
      </div>

      {/* Resonance Analyst - Live Data */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">RESONANCE</span>
        <span className="text-xs text-white font-mono animate-pulse">
          {Math.round(data.resonanceScore * 10) / 10}Hz
        </span>
      </div>

      {/* Executive Producer - Production Status */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-400 font-mono">STATUS</span>
        <span className={`text-xs font-mono uppercase ${getStatusColor(data.productionStatus)}`}>
          {data.productionStatus}
        </span>
      </div>

      {/* Red Team - Authenticity Score */}
      <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2">
        <span className="text-xs text-gray-400 font-mono">AUTH</span>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${data.authenticity > 75 ? "bg-green-400" : data.authenticity > 50 ? "bg-yellow-400" : "bg-red-400"}`}
          />
          <span className="text-xs text-white font-mono">{Math.round(data.authenticity)}%</span>
        </div>
      </div>

      {/* Location Context */}
      <div className="text-xs text-gray-500 font-mono mt-2 opacity-60">{location}</div>
    </div>
  )
}

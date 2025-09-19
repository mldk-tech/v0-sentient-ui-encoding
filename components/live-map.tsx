"use client"

import { useState, useEffect } from "react"

interface LiveMapProps {
  isVisible: boolean
  onLocationSelect?: (location: string) => void
}

interface MapLocation {
  id: string
  x: number
  y: number
  name: string
  importance: number
}

export function LiveMap({ isVisible, onLocationSelect }: LiveMapProps) {
  const [is3D, setIs3D] = useState(false)
  const [sonarPing, setSonarPing] = useState(false)
  const [locations] = useState<MapLocation[]>([
    { id: "tel-aviv", x: 45, y: 60, name: "Tel Aviv", importance: 0.9 },
    { id: "jerusalem", x: 48, y: 65, name: "Jerusalem", importance: 1.0 },
    { id: "haifa", x: 42, y: 45, name: "Haifa", importance: 0.7 },
    { id: "eilat", x: 46, y: 85, name: "Eilat", importance: 0.5 },
    { id: "beer-sheva", x: 47, y: 75, name: "Beer Sheva", importance: 0.6 },
  ])

  useEffect(() => {
    if (!isVisible) return

    // Sonar ping effect every 3 seconds
    const pingInterval = setInterval(() => {
      setSonarPing(true)
      setTimeout(() => setSonarPing(false), 1000)
    }, 3000)

    return () => clearInterval(pingInterval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 z-40">
      <div
        className={`bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 transition-all duration-700 ${
          is3D ? "w-80 h-60" : "w-64 h-48"
        }`}
        onClick={() => setIs3D(!is3D)}
      >
        <div className="text-xs font-mono text-card-foreground mb-2 opacity-60">LIVE MAP // ISRAEL</div>

        <div
          className={`relative w-full h-full bg-background/20 rounded transition-all duration-700 ${
            is3D ? "transform perspective-1000 rotateX-15" : ""
          }`}
          style={{
            backgroundImage: `
              linear-gradient(45deg, var(--border) 1px, transparent 1px),
              linear-gradient(-45deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "10px 10px",
          }}
        >
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path
                d="M20,20 L80,20 L80,80 L20,80 Z M30,30 L70,30 M30,40 L70,40 M30,50 L70,50"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className="text-border"
              />
            </svg>
          </div>

          {locations.map((location) => (
            <div key={location.id} className="absolute group cursor-pointer">
              {/* Location dot with sonar effect */}
              <div
                className={`relative transition-all duration-300 ${sonarPing ? "animate-ping" : ""}`}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onLocationSelect?.(location.id)
                }}
              >
                {/* Sonar rings */}
                {sonarPing && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 border border-accent rounded-full animate-ping opacity-75" />
                    <div
                      className="absolute inset-0 w-6 h-6 border border-accent rounded-full animate-ping opacity-50"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </>
                )}

                {/* Main dot */}
                <div className="w-2 h-2 bg-accent rounded-full shadow-lg" />

                {/* 3D beam effect */}
                {is3D && (
                  <div
                    className="absolute bottom-0 left-1/2 bg-gradient-to-t from-accent to-transparent opacity-60"
                    style={{
                      width: "2px",
                      height: `${location.importance * 40}px`,
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 10px var(--accent)",
                    }}
                  />
                )}
              </div>

              {/* Location label */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                  {location.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Click to toggle 3D</span>
          <span className={`transition-opacity duration-300 ${sonarPing ? "opacity-100" : "opacity-50"}`}>
            ● SCANNING
          </span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"

interface ResonanceThreadProps {
  startX: number
  startY: number
  endX: number
  endY: number
  isActive: boolean
  linkedContent?: {
    title: string
    preview: string
  }
}

export function ResonanceThread({ startX, startY, endX, endY, isActive, linkedContent }: ResonanceThreadProps) {
  const [particles, setParticles] = useState<Array<{ id: number; progress: number }>>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    // Generate flowing particles along the thread
    const generateParticles = () => {
      const newParticles = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        progress: i * 0.33,
      }))
      setParticles(newParticles)
    }

    generateParticles()

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          progress: (particle.progress + 0.02) % 1,
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [isActive])

  if (!isActive) return null

  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
  const angle = (Math.atan2(endY - startY, endX - startX) * 180) / Math.PI

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"
        style={{
          left: `${startX}%`,
          top: `${startY}%`,
          width: `${length}px`,
          height: "2px",
          transform: `rotate(${angle}deg)`,
          transformOrigin: "0 50%",
          boxShadow: "0 0 10px var(--accent), 0 0 20px var(--accent)",
        }}
      />

      {particles.map((particle) => {
        const particleX = startX + (endX - startX) * particle.progress
        const particleY = startY + (endY - startY) * particle.progress

        return (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-accent rounded-full opacity-80"
            style={{
              left: `${particleX}%`,
              top: `${particleY}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 6px var(--accent)",
            }}
          />
        )
      })}

      <div
        className="absolute w-4 h-4 bg-accent rounded-full opacity-80 group cursor-pointer"
        style={{
          left: `${endX}%`,
          top: `${endY}%`,
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 15px var(--accent)",
        }}
      >
        {linkedContent && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
            <div className="bg-popover border border-border rounded-lg p-3 min-w-48 shadow-lg">
              <div className="text-sm font-medium text-popover-foreground mb-1">{linkedContent.title}</div>
              <div className="text-xs text-muted-foreground">{linkedContent.preview}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

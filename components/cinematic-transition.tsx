"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

interface CinematicTransitionProps {
  isActive: boolean
  selectedTile: any
  onTransitionComplete: () => void
  children: React.ReactNode
}

export function CinematicTransition({
  isActive,
  selectedTile,
  onTransitionComplete,
  children,
}: CinematicTransitionProps) {
  const [phase, setPhase] = useState<"idle" | "dolly-out" | "zoom-in" | "immersive" | "organic-exit">("idle")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [edgeProximity, setEdgeProximity] = useState(0)
  const [exitProgress, setExitProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedTileRef = useRef<HTMLDivElement>(null)
  const exitTimeoutRef = useRef<NodeJS.Timeout>()

  const getFrequencyImage = (frequency: string) => {
    const imageMap = {
      CHAOS: "/images/chaos-pattern.jpg",
      CREATION: "/images/creation-pattern.jpg",
      CODE: "/images/code-pattern.jpg",
      SOUL: "/images/soul-pattern.jpg",
    }
    return imageMap[frequency as keyof typeof imageMap] || "/placeholder.svg"
  }

  useEffect(() => {
    if (!isActive || !selectedTile) {
      setPhase("idle")
      return
    }

    console.log("[v0] Starting cinematic transition for tile:", selectedTile.id)

    // Phase 1: Dolly zoom out (other tiles recede)
    setPhase("dolly-out")

    setTimeout(() => {
      // Phase 2: Selected tile zooms in
      setPhase("zoom-in")

      setTimeout(() => {
        // Phase 3: Immersive mode
        setPhase("immersive")
        onTransitionComplete()
      }, 900)
    }, 900)
  }, [isActive, selectedTile, onTransitionComplete])

  useEffect(() => {
    if (phase !== "immersive") return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      setMousePosition({ x: clientX, y: clientY })

      // Calculate distance to nearest edge (0-1, where 0 is at edge)
      const edgeThreshold = 100 // pixels from edge
      const distanceToEdge = Math.min(
        clientX, // left edge
        clientY, // top edge
        innerWidth - clientX, // right edge
        innerHeight - clientY, // bottom edge
      )

      const proximity = Math.max(0, 1 - distanceToEdge / edgeThreshold)
      setEdgeProximity(proximity)

      // Start exit sequence when near edge
      if (proximity > 0.3) {
        if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)

        exitTimeoutRef.current = setTimeout(() => {
          if (proximity > 0.5) {
            console.log("[v0] Initiating organic exit - mouse at edge")
            setPhase("organic-exit")

            // Gradual zoom-out animation
            setTimeout(() => {
              setPhase("idle")
              onTransitionComplete()
            }, 1200)
          }
        }, 800) // Delay to prevent accidental exits
      } else {
        if (exitTimeoutRef.current) {
          clearTimeout(exitTimeoutRef.current)
          exitTimeoutRef.current = undefined
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current)
    }
  }, [phase, onTransitionComplete])

  useEffect(() => {
    if (phase === "organic-exit") {
      let progress = 0
      const interval = setInterval(() => {
        progress += 0.05
        setExitProgress(progress)
        if (progress >= 1) {
          clearInterval(interval)
        }
      }, 50)

      return () => clearInterval(interval)
    } else {
      setExitProgress(0)
    }
  }, [phase])

  if (phase === "idle") {
    return <>{children}</>
  }

  return (
    <div
      ref={containerRef}
      className={`perspective-container ${phase === "immersive" || phase === "organic-exit" ? "fullscreen-overlay" : "relative w-full h-full"}`}
    >
      <div className={`absolute inset-0 ${phase === "dolly-out" ? "cinematic-dolly-zoom-out" : ""}`}>{children}</div>

      {selectedTile && phase !== "idle" && (
        <div
          ref={selectedTileRef}
          className={`absolute z-50 ${phase === "zoom-in" ? "cinematic-zoom-in-fullscreen" : ""} ${
            phase === "immersive" ? "immersive-plunge" : ""
          } ${phase === "organic-exit" ? "organic-zoom-out" : ""}`}
          style={
            {
              left: `${selectedTile.x}%`,
              top: `${selectedTile.y}%`,
              width: `${selectedTile.width}%`,
              height: `${selectedTile.height}%`,
              "--tile-x": `${selectedTile.x}%`,
              "--tile-y": `${selectedTile.y}%`,
              "--tile-w": `${selectedTile.width}%`,
              "--tile-h": `${selectedTile.height}%`,
              "--exit-progress": exitProgress,
            } as React.CSSProperties
          }
        >
          <div className="w-full h-full bg-card rounded-none overflow-hidden">
            <img
              src={getFrequencyImage(selectedTile.frequency) || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />

            {(phase === "immersive" || phase === "organic-exit") && (
              <div
                className={`absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40 ${
                  phase === "organic-exit" ? "opacity-fade-out" : ""
                }`}
              >
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="text-4xl font-bold text-foreground mb-4 reality-shift">
                    {selectedTile.frequency} DIMENSION
                  </div>

                  <div className="text-lg text-muted-foreground character-scan mb-6">
                    You have entered the {selectedTile.frequency.toLowerCase()} frequency domain. Neural pathways are
                    recalibrating...
                  </div>

                  <div className="bg-background/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-accent/20">
                    <div className="text-sm font-mono text-accent mb-2">972 STORIES // ACTIVE NARRATIVE</div>
                    <div className="text-base text-foreground/90 mb-2">
                      "The Digital Consulate: Mapping Cultural Frequencies Across Israel"
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Location: Tel Aviv → Jerusalem → Haifa • Resonance: {Math.floor(Math.random() * 100)}%
                    </div>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <button className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded text-sm font-mono transition-colors">
                      EXPLORE STORIES
                    </button>
                    <button className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded text-sm font-mono transition-colors">
                      VIEW RESONANCE
                    </button>
                    <button className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded text-sm font-mono transition-colors">
                      LIVE FEED
                    </button>
                  </div>

                  <div className="mt-6 text-sm font-mono text-accent">{selectedTile.metadata} // ACTIVE</div>
                </div>

                {phase === "immersive" && edgeProximity > 0.2 && (
                  <div
                    className="absolute top-8 right-8 text-accent/60 text-sm font-mono transition-opacity duration-300"
                    style={{ opacity: edgeProximity }}
                  >
                    EDGE PROXIMITY: {Math.floor(edgeProximity * 100)}%
                    {edgeProximity > 0.5 && <div className="text-xs mt-1">INITIATING EXIT...</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [phase, setPhase] = useState<"idle" | "dolly-out" | "zoom-in" | "immersive">("idle")
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedTileRef = useRef<HTMLDivElement>(null)

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

  if (phase === "idle") {
    return <>{children}</>
  }

  return (
    <div
      ref={containerRef}
      className={`perspective-container ${phase === "immersive" ? "fullscreen-overlay" : "relative w-full h-full"}`}
    >
      <div className={`absolute inset-0 ${phase === "dolly-out" ? "cinematic-dolly-zoom-out" : ""}`}>{children}</div>

      {selectedTile && phase !== "idle" && (
        <div
          ref={selectedTileRef}
          className={`absolute z-50 ${phase === "zoom-in" ? "cinematic-zoom-in-fullscreen" : ""} ${
            phase === "immersive" ? "immersive-plunge" : ""
          }`}
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
            } as React.CSSProperties
          }
        >
          <div className="w-full h-full bg-card rounded-none overflow-hidden">
            <img
              src={getFrequencyImage(selectedTile.frequency) || "/placeholder.svg"}
              alt=""
              className="w-full h-full object-cover"
            />

            {phase === "immersive" && (
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40">
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

                <button
                  onClick={() => {
                    setPhase("idle")
                    onTransitionComplete()
                  }}
                  className="absolute top-8 right-8 text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  <div className="text-2xl">×</div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

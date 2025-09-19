"use client"

import { useState, useEffect, useRef } from "react"
import { BreathingCanvas } from "@/components/breathing-canvas"
import { FrequencyBar } from "@/components/frequency-bar"
import NitzotzChatbot from "@/components/nitzotz-chatbot"

export default function Channel972() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<string | null>(null)
  const [currentTileContext, setCurrentTileContext] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate loading sequence
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleResonanceThread = (query: string) => {
    console.log("[v0] Nitzotz resonance thread:", query)
    // This could trigger canvas recalibration or filter tiles
    // For now, we'll just log it
  }

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <div
        ref={canvasRef}
        className={`absolute inset-0 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      >
        <BreathingCanvas
          selectedFrequency={selectedFrequency}
          onTileSelect={(tileId) => {
            console.log("[v0] Tile selected:", tileId)
          }}
          onTileHover={setCurrentTileContext}
        />
      </div>

      <FrequencyBar onFrequencySelect={setSelectedFrequency} selectedFrequency={selectedFrequency} />

      <NitzotzChatbot onResonanceThread={handleResonanceThread} currentTileContext={currentTileContext} />

      {!isLoaded && (
        <div className="absolute inset-0 bg-background flex items-center justify-center">
          <div className="text-foreground font-mono text-sm character-scan">INITIALIZING CHANNEL 972...</div>
        </div>
      )}
    </main>
  )
}

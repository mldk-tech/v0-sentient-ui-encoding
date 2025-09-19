"use client"

import { useState, useEffect, useRef } from "react"
import { VoronoiGrid } from "./voronoi-grid"
import { MetadataStamp } from "./metadata-stamp"
import { AudioManager } from "./audio-manager"
import { ResonanceThread } from "./resonance-thread"
import { ResonanceChamber } from "./resonance-chamber"
import { LiveMap } from "./live-map"
import { CinematicTransition } from "./cinematic-transition"
import { CommentResonanceSystem } from "./comment-resonance-system"
import { StoriesDisplay } from "./stories-display"

interface BreathingCanvasProps {
  selectedFrequency: string | null
  onTileSelect: (tileId: string) => void
  onTileHover?: (tileContext: string | null) => void
}

export function BreathingCanvas({ selectedFrequency, onTileSelect, onTileHover }: BreathingCanvasProps) {
  const [hoveredTile, setHoveredTile] = useState<string | null>(null)
  const [tiles, setTiles] = useState<any[]>([])
  const [showOverlays, setShowOverlays] = useState(false)
  const [selectedTile, setSelectedTile] = useState<any>(null)
  const [isInCinematicMode, setIsInCinematicMode] = useState(false)
  const [isRecalibrating, setIsRecalibrating] = useState(false)
  const [previousFrequency, setPreviousFrequency] = useState<string | null>(null)
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedFrequency !== previousFrequency) {
      if (selectedFrequency || previousFrequency) {
        console.log("[v0] Starting recalibration animation:", { from: previousFrequency, to: selectedFrequency })
        setIsRecalibrating(true)
        setHoveredTile(null) // Clear hover state during recalibration

        // End recalibration after animation completes
        const timer = setTimeout(() => {
          setIsRecalibrating(false)
          console.log("[v0] Recalibration complete")
        }, 1500) // Match the CSS transition duration

        setPreviousFrequency(selectedFrequency)
        return () => clearTimeout(timer)
      }
      setPreviousFrequency(selectedFrequency)
    }
  }, [selectedFrequency, previousFrequency])

  useEffect(() => {
    // Generate initial Voronoi tessellation
    const generateTiles = () => {
      const tileCount = 30
      const frequencies = ["CHAOS", "CREATION", "CODE", "SOUL"]
      const newTiles = Array.from({ length: tileCount }, (_, i) => {
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)]
        return {
          id: `tile-${i}`,
          x: Math.random() * 80 + 10, // 10-90% to avoid edges
          y: Math.random() * 80 + 10, // 10-90% to avoid edges
          width: Math.random() * 15 + 8, // 8-23% width
          height: Math.random() * 15 + 8, // 8-23% height
          videoSrc: "",
          metadata: `NODE_${String(i).padStart(3, "0")}`,
          frequency,
        }
      })
      console.log("[v0] Generated tiles:", newTiles.length)
      setTiles(newTiles)
    }

    generateTiles()
  }, [])

  useEffect(() => {
    // Show overlays after initial load
    const timer = setTimeout(() => {
      setShowOverlays(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleTileHover = (tileId: string | null) => {
    if (isInCinematicMode || isRecalibrating) return
    setHoveredTile(tileId)

    if (hoverTimer) {
      clearTimeout(hoverTimer)
      setHoverTimer(null)
    }

    if (tileId) {
      console.log("[v0] Tile hovered:", tileId)

      const tile = tiles.find((t) => t.id === tileId)
      const tileContext = tile ? `${tile.frequency} - ${tile.metadata}` : null
      onTileHover?.(tileContext)

      const timer = setTimeout(() => {
        console.log("[v0] Nitzotz proactive nudge triggered for:", tileId)
        // This will be handled by the Nitzotz component through the context
      }, 5000)
      setHoverTimer(timer)
    } else {
      onTileHover?.(null)
    }
  }

  const handleTileSelect = (tileId: string) => {
    if (isInCinematicMode || isRecalibrating) return

    const tile = tiles.find((t) => t.id === tileId)
    if (tile) {
      console.log("[v0] Starting cinematic transition for:", tileId)
      setSelectedTile(tile)
      setIsInCinematicMode(true)
      onTileSelect(tileId)
    }
  }

  const handleTransitionComplete = () => {
    console.log("[v0] Cinematic transition completed")
    // Keep in cinematic mode - user can exit manually
  }

  const exitCinematicMode = () => {
    setIsInCinematicMode(false)
    setSelectedTile(null)
    setHoveredTile(null)
  }

  // Generate resonance connections between related tiles
  const getResonanceConnections = () => {
    if (!hoveredTile || !showOverlays || isInCinematicMode || isRecalibrating) return []

    const hoveredTileData = tiles.find((t) => t.id === hoveredTile)
    if (!hoveredTileData) return []

    // Find tiles with same frequency
    const relatedTiles = tiles
      .filter((t) => t.id !== hoveredTile && t.frequency === hoveredTileData.frequency)
      .slice(0, 2) // Limit connections

    return relatedTiles.map((tile) => ({
      startX: hoveredTileData.x + hoveredTileData.width / 2,
      startY: hoveredTileData.y + hoveredTileData.height / 2,
      endX: tile.x + tile.width / 2,
      endY: tile.y + tile.height / 2,
      linkedContent: {
        title: `${tile.frequency} Node`,
        preview: `Connected to ${tile.metadata}`,
      },
    }))
  }

  const gridContent = (
    <>
      <AudioManager hoveredTile={hoveredTile} selectedFrequency={selectedFrequency} tiles={tiles} />

      <VoronoiGrid
        tiles={tiles}
        selectedFrequency={selectedFrequency}
        hoveredTile={hoveredTile}
        onTileHover={handleTileHover}
        onTileSelect={handleTileSelect}
        isInTransition={isInCinematicMode}
        isRecalibrating={isRecalibrating}
      />

      <StoriesDisplay
        isVisible={showOverlays && !isInCinematicMode}
        selectedFrequency={selectedFrequency}
        hoveredTile={hoveredTile}
        tiles={tiles}
      />

      {getResonanceConnections().map((connection, index) => (
        <ResonanceThread
          key={`thread-${hoveredTile}-${index}`}
          startX={connection.startX}
          startY={connection.startY}
          endX={connection.endX}
          endY={connection.endY}
          isActive={true}
          linkedContent={connection.linkedContent}
        />
      ))}

      {hoveredTile && showOverlays && !isInCinematicMode && !isRecalibrating && (
        <ResonanceChamber
          content={`Exploring ${tiles.find((t) => t.id === hoveredTile)?.frequency} frequency domain. Neural pathways activated. Resonance detected across ${getResonanceConnections().length} connected nodes.`}
          x={75}
          y={25}
          isVisible={true}
        />
      )}

      <CommentResonanceSystem
        hoveredTile={hoveredTile}
        selectedFrequency={selectedFrequency}
        tiles={tiles}
        isVisible={showOverlays && !isInCinematicMode}
      />

      {!isInCinematicMode && (
        <LiveMap
          isVisible={showOverlays && !isRecalibrating}
          onLocationSelect={(location) => {
            console.log("[v0] Location selected:", location)
          }}
        />
      )}

      {hoveredTile && !isInCinematicMode && !isRecalibrating && (
        <MetadataStamp tileId={hoveredTile} metadata={tiles.find((t) => t.id === hoveredTile)?.metadata || ""} />
      )}

      {isRecalibrating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-card/90 backdrop-blur-sm border border-accent/50 rounded-lg px-6 py-3 text-card-foreground font-mono text-sm neural-glow-soft">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span>RECALIBRATING FREQUENCY MATRIX...</span>
            </div>
          </div>
        </div>
      )}
    </>
  )

  useEffect(() => {
    return () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer)
      }
    }
  }, [hoverTimer])

  return (
    <div ref={canvasRef} className="relative w-full h-full breathing-canvas">
      <CinematicTransition
        isActive={isInCinematicMode}
        selectedTile={selectedTile}
        onTransitionComplete={handleTransitionComplete}
      >
        {gridContent}
      </CinematicTransition>

      {isInCinematicMode && (
        <button
          onClick={exitCinematicMode}
          className="fixed top-4 right-4 z-[10000] bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-card-foreground hover:bg-card transition-colors duration-200"
        >
          Exit Immersion
        </button>
      )}
    </div>
  )
}

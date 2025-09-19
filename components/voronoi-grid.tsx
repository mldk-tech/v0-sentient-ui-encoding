"use client"

import { useState, useEffect, useRef } from "react"
import CuratorialOverlay from "./curatorial-overlay"

interface Tile {
  id: string
  x: number
  y: number
  width: number
  height: number
  videoSrc: string
  metadata: string
  frequency: string
}

interface VoronoiGridProps {
  tiles: Tile[]
  selectedFrequency: string | null
  hoveredTile: string | null
  onTileHover: (tileId: string | null) => void
  onTileSelect: (tileId: string) => void
  isInTransition?: boolean
  isRecalibrating?: boolean
}

export function VoronoiGrid({
  tiles,
  selectedFrequency,
  hoveredTile,
  onTileHover,
  onTileSelect,
  isInTransition = false,
  isRecalibrating = false,
}: VoronoiGridProps) {
  const [revealedTiles, setRevealedTiles] = useState<Set<string>>(new Set())
  const [recalibratedPositions, setRecalibratedPositions] = useState<
    Map<string, { x: number; y: number; width: number; height: number }>
  >(new Map())
  const [curatorialOverlay, setCuratorialOverlay] = useState<{
    isVisible: boolean
    position: { x: number; y: number }
    frequency: string
    location: string
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    frequency: "",
    location: "",
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map())
  const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map())

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Load audio files for each frequency
        const audioFiles = {
          CHAOS: "/audio/chaos-ambient.mp3",
          CREATION: "/audio/creation-ambient.mp3",
          CODE: "/audio/code-ambient.mp3",
          SOUL: "/audio/soul-ambient.mp3",
        }

        for (const [frequency, url] of Object.entries(audioFiles)) {
          try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
            audioBuffersRef.current.set(frequency, audioBuffer)
          } catch (error) {
            console.log(`[v0] Could not load audio for ${frequency}:`, error)
          }
        }
      } catch (error) {
        console.log("[v0] Audio context initialization failed:", error)
      }
    }

    initAudio()

    return () => {
      // Cleanup audio sources
      activeSourcesRef.current.forEach((source) => {
        try {
          source.stop()
        } catch (e) {}
      })
      activeSourcesRef.current.clear()
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealedTiles(new Set(tiles.map((tile) => tile.id)))
    }, 100)
    return () => clearTimeout(timer)
  }, [tiles])

  const generateMetadataStamp = (tile: Tile) => {
    const locations = [
      "Tel Aviv",
      "Jerusalem",
      "Haifa",
      "Sderot",
      "Weizmann Institute",
      "Technion",
      "Ben Gurion Airport",
      "Eilat",
      "Nazareth",
      "Beersheba",
    ]

    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jerusalem",
    })

    const temp = Math.floor(Math.random() * 15) + 15 // 15-30°C
    const location = locations[Math.floor(Math.random() * locations.length)]

    const stamps = [
      `${location} // ${timeStr} IDT // ${temp}°C`,
      `${location} // ${timeStr} IDT // Lab Noise: ${Math.floor(Math.random() * 30) + 35}dB`,
      `${location} // ${timeStr} IDT // Wind: ${Math.floor(Math.random() * 20) + 5}km/h`,
      `${location} // ${timeStr} IDT // Humidity: ${Math.floor(Math.random() * 40) + 40}%`,
    ]

    return stamps[Math.floor(Math.random() * stamps.length)]
  }

  const handleTileHover = (tileId: string | null, tilePosition?: { x: number; y: number }) => {
    // Stop any currently playing audio
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop()
      } catch (e) {}
    })
    activeSourcesRef.current.clear()

    if (tileId && tilePosition && audioContextRef.current) {
      const tile = tiles.find((t) => t.id === tileId)
      if (tile) {
        // Show curatorial overlay with tile data
        const rect = document.documentElement.getBoundingClientRect()
        setCuratorialOverlay({
          isVisible: true,
          position: {
            x: (tilePosition.x / 100) * window.innerWidth,
            y: (tilePosition.y / 100) * window.innerHeight,
          },
          frequency: tile.frequency,
          location: generateMetadataStamp(tile),
        })

        const audioBuffer = audioBuffersRef.current.get(tile.frequency)
        if (audioBuffer) {
          try {
            const source = audioContextRef.current.createBufferSource()
            const panner = audioContextRef.current.createStereoPanner()
            const gainNode = audioContextRef.current.createGain()

            source.buffer = audioBuffer
            source.loop = true

            const panValue = (tilePosition.x - 50) / 50 // -1 to 1 based on screen position
            panner.pan.value = Math.max(-1, Math.min(1, panValue))

            gainNode.gain.value = 0.3 // Soft ambient volume

            source.connect(panner)
            panner.connect(gainNode)
            gainNode.connect(audioContextRef.current.destination)

            source.start()
            activeSourcesRef.current.set(tileId, source)
          } catch (error) {
            console.log("[v0] Audio playback error:", error)
          }
        }
      }
    } else {
      // Hide curatorial overlay when not hovering
      setCuratorialOverlay((prev) => ({ ...prev, isVisible: false }))
    }

    onTileHover(tileId)
  }

  const getFrequencyContent = (frequency: string) => {
    const contentMap = {
      CHAOS: {
        video: "/videos/chaos-loop.mp4",
        fallback: "/electric-blue-fractal-chaos-patterns-dancing.jpg",
      },
      CREATION: {
        video: "/videos/creation-loop.mp4",
        fallback: "/golden-mandala-blooming-organic-creation.jpg",
      },
      CODE: {
        video: "/videos/code-loop.mp4",
        fallback: "/green-matrix-code-streaming-digital-rain.jpg",
      },
      SOUL: {
        video: "/videos/soul-loop.mp4",
        fallback: "/ethereal-silver-flowing-soul-energy.jpg",
      },
    }
    return (
      contentMap[frequency as keyof typeof contentMap] || {
        video: "/abstract-digital-pattern.png",
        fallback: "/abstract-digital-pattern.png",
      }
    )
  }

  const getFilteredTiles = () => {
    if (!selectedFrequency) return tiles
    return tiles.filter((tile) => tile.frequency === selectedFrequency)
  }

  const filteredTiles = getFilteredTiles()
  const unfilteredTiles = selectedFrequency ? tiles.filter((tile) => tile.frequency !== selectedFrequency) : []

  useEffect(() => {
    console.log("[v0] VoronoiGrid rendering:", {
      totalTiles: tiles.length,
      filteredTiles: filteredTiles.length,
      unfilteredTiles: unfilteredTiles.length,
      revealedTiles: revealedTiles.size,
      isRecalibrating,
    })
  }, [tiles, filteredTiles, unfilteredTiles, revealedTiles, isRecalibrating])

  return (
    <div className="absolute inset-0">
      {/* Added curatorial overlay component */}
      <CuratorialOverlay
        isVisible={curatorialOverlay.isVisible}
        position={curatorialOverlay.position}
        frequency={curatorialOverlay.frequency}
        location={curatorialOverlay.location}
      />

      {unfilteredTiles.map((tile) => {
        const content = getFrequencyContent(tile.frequency)
        return (
          <div
            key={`unfocused-${tile.id}`}
            className={`absolute transition-all duration-1500 ease-out ${
              isInTransition
                ? "opacity-0 scale-50"
                : isRecalibrating
                  ? "opacity-10 scale-75 blur-md"
                  : "opacity-30 blur-sm"
            }`}
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: `${tile.width}%`,
              height: `${tile.height}%`,
              transform: isRecalibrating ? "translateZ(-100px) rotateX(5deg)" : "none",
              filter: isRecalibrating ? "brightness(0.4) contrast(0.8)" : "brightness(0.6)",
            }}
          >
            <div className="w-full h-full bg-muted/40 rounded-none overflow-hidden border border-border/40">
              <img
                src={content.fallback || "/placeholder.svg"}
                alt=""
                className="w-full h-full object-cover filter grayscale brightness-50"
                onError={(e) => {
                  console.log("[v0] Image failed to load, using placeholder")
                  e.currentTarget.style.display = "none"
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.style.background = `linear-gradient(45deg, 
                      ${
                        tile.frequency === "CHAOS"
                          ? "#1e40af, #3730a3"
                          : tile.frequency === "CREATION"
                            ? "#d97706, #ea580c"
                            : tile.frequency === "CODE"
                              ? "#059669, #047857"
                              : "#6366f1, #8b5cf6"
                      })`
                  }
                }}
              />
            </div>
          </div>
        )
      })}

      {filteredTiles.map((tile) => {
        const isRevealed = revealedTiles.has(tile.id)
        const isHovered = hoveredTile === tile.id
        const recalibratedPos = recalibratedPositions.get(tile.id)
        const content = getFrequencyContent(tile.frequency)

        const position = recalibratedPos || {
          x: tile.x,
          y: tile.y,
          width: tile.width,
          height: tile.height,
        }

        return (
          <div
            key={tile.id}
            className={`absolute transition-all duration-500 ease-out cursor-pointer ${
              isRevealed ? "stagger-reveal opacity-100" : "opacity-80 scale-95"
            } ${isHovered ? "scale-105 z-20" : "scale-100"} ${
              isInTransition ? "pointer-events-none" : ""
            } ${isRecalibrating ? "z-10" : ""}`}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: `${position.width}%`,
              height: `${position.height}%`,
              animationDelay: `${tiles.indexOf(tile) * 40}ms`,
              transform: isRecalibrating
                ? "translateZ(50px) scale(1.1)"
                : isHovered
                  ? "translateZ(10px)" // Gentle forward push on hover
                  : "none",
              filter: isRecalibrating ? "brightness(1.3) contrast(1.2) saturate(1.4)" : "none",
            }}
            onMouseEnter={() => {
              console.log(`[v0] Tile hovered: ${tile.id}`)
              !isInTransition && !isRecalibrating && handleTileHover(tile.id, position)
            }}
            onMouseLeave={() => !isInTransition && !isRecalibrating && handleTileHover(null)}
            onClick={() => !isInTransition && !isRecalibrating && onTileSelect(tile.id)}
          >
            <div
              className={`w-full h-full bg-card/95 rounded-none overflow-hidden border-2 ${
                isHovered
                  ? "border-accent neural-glow"
                  : isRecalibrating
                    ? "border-accent/70 neural-glow-soft"
                    : "border-border/80"
              }`}
            >
              <img
                src={content.fallback || "/placeholder.svg"}
                alt=""
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isHovered
                    ? "filter-none brightness-120"
                    : isRecalibrating
                      ? "filter-none brightness-110 saturate-120"
                      : "brightness-90"
                }`}
                onError={(e) => {
                  console.log("[v0] Image failed to load, using color fallback")
                  const colors = {
                    CHAOS: "linear-gradient(45deg, #1e40af, #3730a3)",
                    CREATION: "linear-gradient(45deg, #d97706, #ea580c)",
                    CODE: "linear-gradient(45deg, #059669, #047857)",
                    SOUL: "linear-gradient(45deg, #6366f1, #8b5cf6)",
                  }
                  e.currentTarget.style.display = "none"
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    parent.style.background = colors[tile.frequency as keyof typeof colors] || colors.CHAOS
                  }
                }}
              />

              <div
                className={`absolute inset-0 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-500 ${
                  isHovered ? "opacity-100" : isRecalibrating ? "opacity-80" : "opacity-70"
                }`}
              >
                <div className="absolute bottom-2 left-2 text-xs font-mono text-foreground font-semibold">
                  {tile.frequency}
                </div>

                {isHovered && (
                  <div className="absolute bottom-6 left-2 text-xs font-mono text-accent/80 animate-in fade-in duration-300">
                    {generateMetadataStamp(tile)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

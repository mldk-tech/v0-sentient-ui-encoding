"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface AudioManagerProps {
  hoveredTile: string | null
  selectedFrequency: string | null
  tiles: any[]
}

type SirenType = "shelter" | "memorial" | null

export function AudioManager({ hoveredTile, selectedFrequency, tiles }: AudioManagerProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [activeSiren, setActiveSiren] = useState<SirenType>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)
  const sirenOscillatorRef = useRef<OscillatorNode | null>(null)
  const sirenGainRef = useRef<GainNode | null>(null)

  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    if (!isInitialized && !audioContext) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
        setIsInitialized(true)
        console.log("[v0] Audio context initialized")
      } catch (error) {
        console.error("[v0] Failed to initialize audio:", error)
      }
    }
  }, [isInitialized, audioContext])

  const createSirenAudio = useCallback(
    (type: SirenType) => {
      if (!audioContext || !type) return

      // Stop existing siren
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop()
        sirenOscillatorRef.current = null
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      if (type === "shelter") {
        // Shelter-in-place alarm: Rising and falling siren
        oscillator.type = "sawtooth"
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)

        // Create rising/falling pattern
        const duration = 2 // 2 second cycles
        for (let i = 0; i < 10; i++) {
          // 20 seconds total
          const startTime = audioContext.currentTime + i * duration
          oscillator.frequency.linearRampToValueAtTime(800, startTime + duration / 2)
          oscillator.frequency.linearRampToValueAtTime(400, startTime + duration)
        }

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)

        console.log("[v0] Playing shelter-in-place siren")
      } else if (type === "memorial") {
        // Memorial siren: Steady, solemn tone
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A note

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1) // Slow fade in

        // Add subtle tremolo for emotional effect
        const tremolo = audioContext.createOscillator()
        const tremoloGain = audioContext.createGain()
        tremolo.frequency.setValueAtTime(2, audioContext.currentTime) // 2Hz tremolo
        tremolo.type = "sine"
        tremoloGain.gain.setValueAtTime(0.1, audioContext.currentTime)

        tremolo.connect(tremoloGain)
        tremoloGain.connect(gainNode.gain)
        tremolo.start()

        console.log("[v0] Playing memorial siren")
      }

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start()

      sirenOscillatorRef.current = oscillator
      sirenGainRef.current = gainNode

      // Auto-stop after duration
      const duration = type === "shelter" ? 20000 : 60000 // 20s for shelter, 60s for memorial
      setTimeout(() => {
        if (sirenGainRef.current) {
          sirenGainRef.current.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2)
        }
        setTimeout(() => {
          if (sirenOscillatorRef.current) {
            sirenOscillatorRef.current.stop()
            sirenOscillatorRef.current = null
          }
          setActiveSiren(null)
        }, 2000)
      }, duration)
    },
    [audioContext],
  )

  const triggerShelterSiren = useCallback(() => {
    if (activeSiren) return // Don't interrupt active siren
    setActiveSiren("shelter")
    createSirenAudio("shelter")
  }, [activeSiren, createSirenAudio])

  const triggerMemorialSiren = useCallback(() => {
    if (activeSiren) return // Don't interrupt active siren
    setActiveSiren("memorial")
    createSirenAudio("memorial")
  }, [activeSiren, createSirenAudio])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault()
        triggerShelterSiren()
      } else if (event.ctrlKey && event.key === "m") {
        event.preventDefault()
        triggerMemorialSiren()
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [triggerShelterSiren, triggerMemorialSiren])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).triggerShelterSiren = triggerShelterSiren
      ;(window as any).triggerMemorialSiren = triggerMemorialSiren
    }
  }, [triggerShelterSiren, triggerMemorialSiren])

  // Create ambient audio for tile hover
  const createAmbientAudio = useCallback(
    (tileId: string, tileData: any) => {
      if (!audioContext || !tileData || activeSiren) return // Don't play ambient during siren

      // Stop existing oscillator
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
        oscillatorRef.current = null
      }

      // Create new audio nodes
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      const panner = audioContext.createStereoPanner()

      // Configure oscillator based on frequency type
      const frequencyMap = {
        CHAOS: 220 + Math.random() * 100, // Random chaotic frequencies
        CREATION: 440, // Pure A note
        CODE: 880, // Higher digital frequency
        SOUL: 110, // Deep, soulful bass
      }

      oscillator.frequency.setValueAtTime(
        frequencyMap[tileData.frequency as keyof typeof frequencyMap] || 440,
        audioContext.currentTime,
      )

      // Set waveform based on frequency type
      const waveformMap = {
        CHAOS: "sawtooth",
        CREATION: "sine",
        CODE: "square",
        SOUL: "triangle",
      }

      oscillator.type = waveformMap[tileData.frequency as keyof typeof waveformMap] || "sine"

      // Calculate pan based on tile position (-1 left, 1 right)
      const panValue = (tileData.x - 50) / 50
      panner.pan.setValueAtTime(panValue, audioContext.currentTime)

      // Set volume
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(panner)
      panner.connect(audioContext.destination)

      // Start oscillator
      oscillator.start()

      // Store references
      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode
      pannerRef.current = panner

      console.log("[v0] Playing ambient audio for tile:", tileId, "frequency:", tileData.frequency)
    },
    [audioContext, activeSiren],
  )

  // Stop ambient audio
  const stopAmbientAudio = useCallback(() => {
    if (oscillatorRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContext!.currentTime + 0.1)
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop()
          oscillatorRef.current = null
        }
      }, 100)
    }
  }, [audioContext])

  // Handle tile hover changes
  useEffect(() => {
    if (!audioContext) return

    if (hoveredTile && !activeSiren) {
      // Don't play ambient during siren
      const tileData = tiles.find((t) => t.id === hoveredTile)
      if (tileData) {
        createAmbientAudio(hoveredTile, tileData)
      }
    } else {
      stopAmbientAudio()
    }

    return () => {
      stopAmbientAudio()
    }
  }, [hoveredTile, tiles, audioContext, createAmbientAudio, stopAmbientAudio, activeSiren])

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initializeAudio()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [initializeAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop()
      }
      if (sirenOscillatorRef.current) {
        sirenOscillatorRef.current.stop()
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [audioContext])

  if (activeSiren) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="font-bold">{activeSiren === "shelter" ? "SHELTER ALERT" : "MEMORIAL SIREN"}</span>
        </div>
      </div>
    )
  }

  return null // This component doesn't render anything when no siren is active
}

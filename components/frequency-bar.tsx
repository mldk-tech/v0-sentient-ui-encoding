"use client"

import { useState, useRef, useEffect } from "react"

interface FrequencyBarProps {
  onFrequencySelect: (frequency: string | null) => void
  selectedFrequency: string | null
}

const frequencies = [
  {
    id: "CHAOS",
    icon: "◊",
    description: "Electric fractals",
    baseFreq: 220,
    color: "text-sky-400",
    glowClass: "chaos-glow",
  },
  {
    id: "CREATION",
    icon: "❀",
    description: "Golden mandalas",
    baseFreq: 440,
    color: "text-amber-400",
    glowClass: "creation-glow",
  },
  {
    id: "CODE",
    icon: "◈",
    description: "Matrix streams",
    baseFreq: 880,
    color: "text-emerald-400",
    glowClass: "code-glow",
  },
  {
    id: "SOUL",
    icon: "●",
    description: "Ethereal flows",
    baseFreq: 110,
    color: "text-violet-400",
    glowClass: "soul-glow",
  },
]

export function FrequencyBar({ onFrequencySelect, selectedFrequency }: FrequencyBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)

  useEffect(() => {
    const initAudio = async () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
      } catch (error) {
        console.error("[v0] Failed to initialize frequency bar audio:", error)
      }
    }

    const handleFirstClick = () => {
      initAudio()
      document.removeEventListener("click", handleFirstClick)
    }

    document.addEventListener("click", handleFirstClick)
    return () => document.removeEventListener("click", handleFirstClick)
  }, [])

  const playFrequencyPreview = (frequency: (typeof frequencies)[0]) => {
    if (!audioContext) return

    // Stop existing oscillator
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current = null
    }

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.frequency.setValueAtTime(frequency.baseFreq, audioContext.currentTime)
    oscillator.type =
      frequency.id === "CHAOS"
        ? "sawtooth"
        : frequency.id === "CREATION"
          ? "sine"
          : frequency.id === "CODE"
            ? "square"
            : "triangle"

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.1)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start()
    oscillatorRef.current = oscillator

    // Auto-stop after 300ms for better preview
    setTimeout(() => {
      if (oscillatorRef.current === oscillator) {
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15)
        setTimeout(() => oscillator.stop(), 150)
        oscillatorRef.current = null
      }
    }, 300)
  }

  const stopFrequencyPreview = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop()
      oscillatorRef.current = null
    }
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false)
        stopFrequencyPreview()
      }}
    >
      <div
        className={`transition-all duration-700 ease-out ${
          isExpanded
            ? "h-16 bg-gradient-to-r from-transparent via-black/80 to-transparent backdrop-blur-md border border-white/10"
            : "h-1 bg-gradient-to-r from-sky-500/50 via-amber-500/50 via-emerald-500/50 to-violet-500/50"
        } w-96 relative overflow-hidden rounded-full`}
        style={{
          boxShadow: isExpanded
            ? "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            : "0 0 20px rgba(79, 70, 229, 0.3)",
        }}
      >
        {isExpanded && (
          <div className="absolute inset-0 flex items-center justify-around px-4">
            {frequencies.map((freq, index) => (
              <button
                key={freq.id}
                onClick={() => onFrequencySelect(selectedFrequency === freq.id ? null : freq.id)}
                onMouseEnter={() => playFrequencyPreview(freq)}
                onMouseLeave={stopFrequencyPreview}
                className={`group relative transition-all duration-500 ${
                  selectedFrequency === freq.id
                    ? `${freq.color} scale-125 ${freq.glowClass}`
                    : `text-white/60 hover:${freq.color} hover:scale-110`
                }`}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <div className={`text-3xl frequency-wave ${selectedFrequency === freq.id ? "neural-glow-soft" : ""}`}>
                  {freq.icon}
                </div>

                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className={`curatorial-overlay text-xs px-3 py-2 rounded-lg whitespace-nowrap ${freq.color}`}>
                    <div className="font-mono font-semibold tracking-wider">{freq.id}</div>
                    <div className="text-white/70 text-[10px] mt-1">{freq.description}</div>
                  </div>
                </div>

                {selectedFrequency === freq.id && (
                  <div className={`absolute -inset-2 rounded-full ${freq.glowClass} opacity-30 animate-pulse`} />
                )}
              </button>
            ))}
          </div>
        )}

        {!isExpanded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>
    </div>
  )
}

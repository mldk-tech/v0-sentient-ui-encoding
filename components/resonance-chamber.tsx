"use client"

import { useState, useEffect } from "react"

interface ResonanceChamberProps {
  content: string
  x: number
  y: number
  isVisible: boolean
}

export function ResonanceChamber({ content, x, y, isVisible }: ResonanceChamberProps) {
  const [displayContent, setDisplayContent] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setDisplayContent("")
      return
    }

    setIsAnimating(true)

    // Depth fade animation - text appears to float forward
    setTimeout(() => {
      let currentIndex = 0
      const revealInterval = setInterval(() => {
        if (currentIndex <= content.length) {
          setDisplayContent(content.substring(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(revealInterval)
          setIsAnimating(false)
        }
      }, 30)

      return () => clearInterval(revealInterval)
    }, 200)
  }, [content, isVisible])

  if (!isVisible) return null

  return (
    <div
      className={`absolute z-30 transition-all duration-500 ${
        isAnimating ? "transform translate-z-0 opacity-100" : "transform -translate-z-12 opacity-80"
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: isAnimating
          ? "translateZ(0px) translateX(-50%) translateY(-50%)"
          : "translateZ(-50px) translateX(-50%) translateY(-50%)",
      }}
    >
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-xs shadow-lg">
        <div
          className="text-sm text-card-foreground leading-relaxed"
          style={{
            textShadow: "0 0 5px rgba(0,0,0,0.5)",
          }}
        >
          {displayContent}
          {isAnimating && <span className="animate-pulse">|</span>}
        </div>
      </div>
    </div>
  )
}

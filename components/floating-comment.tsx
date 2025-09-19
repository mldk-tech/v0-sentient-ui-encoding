"use client"

import { useState, useEffect } from "react"

interface FloatingCommentProps {
  comment: {
    id: string
    text: string
    author: string
    timestamp: string
    aiScore: number
  }
  x: number
  y: number
  isVisible: boolean
  onDismiss?: () => void
}

export function FloatingComment({ comment, x, y, isVisible, onDismiss }: FloatingCommentProps) {
  const [displayText, setDisplayText] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("")
      setOpacity(0)
      return
    }

    setIsAnimating(true)
    setOpacity(0.7)

    // Director's note style reveal
    setTimeout(() => {
      let currentIndex = 0
      const revealInterval = setInterval(() => {
        if (currentIndex <= comment.text.length) {
          setDisplayText(comment.text.substring(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(revealInterval)
          setIsAnimating(false)
        }
      }, 25)

      return () => clearInterval(revealInterval)
    }, 300)
  }, [comment.text, isVisible])

  if (!isVisible) return null

  return (
    <div
      className="absolute z-40 transition-all duration-700 ease-out pointer-events-auto"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translateX(-50%) translateY(-50%)",
        opacity: opacity,
      }}
    >
      <div className="bg-background/20 backdrop-blur-md border border-accent/30 rounded-lg p-3 max-w-xs shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-accent font-mono">AI_SCORE: {comment.aiScore.toFixed(2)}</div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ×
            </button>
          )}
        </div>

        <div
          className="text-sm text-foreground/90 leading-relaxed font-light italic"
          style={{
            textShadow: "0 0 8px rgba(0,0,0,0.8)",
            fontFamily: "var(--font-mono)",
          }}
        >
          "{displayText}"{isAnimating && <span className="animate-pulse text-accent">|</span>}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-accent/20">
          <div className="text-xs text-muted-foreground">{comment.author}</div>
          <div className="text-xs text-muted-foreground font-mono">{comment.timestamp}</div>
        </div>
      </div>
    </div>
  )
}

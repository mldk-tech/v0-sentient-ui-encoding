"use client"

import { useState, useEffect } from "react"
import { FloatingComment } from "./floating-comment"

interface Comment {
  id: string
  text: string
  author: string
  timestamp: string
  aiScore: number
  frequency: string
  tileId?: string
}

interface CommentResonanceSystemProps {
  hoveredTile: string | null
  selectedFrequency: string | null
  tiles: any[]
  isVisible: boolean
}

export function CommentResonanceSystem({
  hoveredTile,
  selectedFrequency,
  tiles,
  isVisible,
}: CommentResonanceSystemProps) {
  const [activeComments, setActiveComments] = useState<Comment[]>([])
  const [commentPositions, setCommentPositions] = useState<Map<string, { x: number; y: number }>>(new Map())

  const mockComments: Comment[] = [
    {
      id: "c1",
      text: "The fractal patterns here remind me of consciousness emerging from chaos - each iteration revealing deeper complexity.",
      author: "neural_observer",
      timestamp: "2m ago",
      aiScore: 0.89,
      frequency: "CHAOS",
    },
    {
      id: "c2",
      text: "This generative process mirrors biological growth - organic, unpredictable, yet following hidden mathematical laws.",
      author: "bio_architect",
      timestamp: "5m ago",
      aiScore: 0.92,
      frequency: "CREATION",
    },
    {
      id: "c3",
      text: "The matrix flows here feel like watching the universe compile itself - raw information becoming reality.",
      author: "code_mystic",
      timestamp: "1m ago",
      aiScore: 0.87,
      frequency: "CODE",
    },
    {
      id: "c4",
      text: "There's something deeply spiritual about these fluid forms - like watching thoughts take shape in the collective unconscious.",
      author: "digital_shaman",
      timestamp: "3m ago",
      aiScore: 0.94,
      frequency: "SOUL",
    },
    {
      id: "c5",
      text: "The resonance between these nodes suggests a deeper pattern - perhaps consciousness itself is a frequency we're tuning into.",
      author: "frequency_hunter",
      timestamp: "7m ago",
      aiScore: 0.91,
      frequency: "SOUL",
    },
  ]

  useEffect(() => {
    if (!isVisible || (!hoveredTile && !selectedFrequency)) {
      setActiveComments([])
      return
    }

    let relevantComments: Comment[] = []

    if (selectedFrequency) {
      // Show frequency-specific comments
      relevantComments = mockComments
        .filter((comment) => comment.frequency === selectedFrequency)
        .filter((comment) => comment.aiScore > 0.85) // Only high-quality comments
        .slice(0, 2) // Limit to prevent overcrowding
    } else if (hoveredTile) {
      // Show general exploration comments
      const hoveredTileData = tiles.find((t) => t.id === hoveredTile)
      if (hoveredTileData) {
        relevantComments = mockComments.filter((comment) => comment.frequency === hoveredTileData.frequency).slice(0, 1)
      }
    }

    setActiveComments(relevantComments)

    const newPositions = new Map()
    relevantComments.forEach((comment, index) => {
      // Distribute comments around the canvas avoiding center
      const angle = index * 120 + Math.random() * 60 // Spread with randomness
      const radius = 25 + Math.random() * 15 // Distance from center
      const x = 50 + Math.cos((angle * Math.PI) / 180) * radius
      const y = 50 + Math.sin((angle * Math.PI) / 180) * radius

      newPositions.set(comment.id, {
        x: Math.max(15, Math.min(85, x)), // Keep within bounds
        y: Math.max(15, Math.min(85, y)),
      })
    })

    setCommentPositions(newPositions)
  }, [hoveredTile, selectedFrequency, tiles, isVisible])

  const handleDismissComment = (commentId: string) => {
    setActiveComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  return (
    <>
      {activeComments.map((comment) => {
        const position = commentPositions.get(comment.id)
        if (!position) return null

        return (
          <FloatingComment
            key={comment.id}
            comment={comment}
            x={position.x}
            y={position.y}
            isVisible={true}
            onDismiss={() => handleDismissComment(comment.id)}
          />
        )
      })}
    </>
  )
}

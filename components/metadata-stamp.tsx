"use client"

import { useState, useEffect } from "react"

interface MetadataStampProps {
  tileId: string
  metadata: string
}

export function MetadataStamp({ tileId, metadata }: MetadataStampProps) {
  const [displayText, setDisplayText] = useState("")
  const [isScanning, setIsScanning] = useState(true)

  useEffect(() => {
    // Character scan reveal effect
    setIsScanning(true)
    setDisplayText("")

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let currentIndex = 0

    const scanInterval = setInterval(() => {
      if (currentIndex < metadata.length) {
        // Show random characters before settling on correct one
        let iterations = 0
        const charInterval = setInterval(() => {
          if (iterations < 5) {
            setDisplayText(
              (prev) =>
                prev.substring(0, currentIndex) +
                chars[Math.floor(Math.random() * chars.length)] +
                prev.substring(currentIndex + 1),
            )
            iterations++
          } else {
            setDisplayText(
              (prev) => prev.substring(0, currentIndex) + metadata[currentIndex] + prev.substring(currentIndex + 1),
            )
            clearInterval(charInterval)
            currentIndex++
          }
        }, 30)
      } else {
        setIsScanning(false)
        clearInterval(scanInterval)
      }
    }, 150)

    return () => {
      clearInterval(scanInterval)
    }
  }, [metadata, tileId])

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded px-3 py-2">
        <div className={`font-mono text-sm text-card-foreground ${isScanning ? "character-scan" : ""}`}>
          {displayText}
          {isScanning && <span className="animate-pulse">_</span>}
        </div>
      </div>
    </div>
  )
}

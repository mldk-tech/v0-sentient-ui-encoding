"use client"

import { useState, useEffect, useMemo } from "react"
import { ResonanceChamber } from "./resonance-chamber"
import { ResonanceThread } from "./resonance-thread"

interface Story {
  id: string
  title: string
  content: string
  location: string
  frequency: "CHAOS" | "CREATION" | "SOUL" | "CODE"
  timestamp: string
  author: string
  tags: string[]
  resonanceScore: number
}

interface StoriesDisplayProps {
  isVisible: boolean
  selectedFrequency: string | null
  hoveredTile: string | null
  tiles: any[]
}

export function StoriesDisplay({ isVisible, selectedFrequency, hoveredTile, tiles }: StoriesDisplayProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [activeStory, setActiveStory] = useState<Story | null>(null)
  const [storyConnections, setStoryConnections] = useState<any[]>([])

  // Sample 972 Stories data
  useEffect(() => {
    const sampleStories: Story[] = [
      {
        id: "story-001",
        title: "The Digital Archaeologist of Jaffa",
        content:
          "In the ancient port city of Jaffa, a young developer discovers fragments of code embedded in the city's stone walls, revealing a hidden network of digital memories spanning centuries...",
        location: "Jaffa, Tel Aviv",
        frequency: "CODE",
        timestamp: "2024-03-15T14:30:00Z",
        author: "Maya Chen",
        tags: ["archaeology", "technology", "heritage"],
        resonanceScore: 87.3,
      },
      {
        id: "story-002",
        title: "Frequencies of the Negev",
        content:
          "A sound artist ventures into the Negev Desert with experimental equipment, capturing the electromagnetic signatures of ancient trade routes and discovering they form musical patterns...",
        location: "Negev Desert",
        frequency: "SOUL",
        timestamp: "2024-03-14T09:15:00Z",
        author: "David Rosenberg",
        tags: ["desert", "sound", "mysticism"],
        resonanceScore: 92.1,
      },
      {
        id: "story-003",
        title: "The Startup That Became a Forest",
        content:
          "A failed tech startup in Herzliya transforms their abandoned office into an urban forest, creating a new model for regenerative technology spaces...",
        location: "Herzliya",
        frequency: "CREATION",
        timestamp: "2024-03-13T16:45:00Z",
        author: "Noa Goldstein",
        tags: ["sustainability", "innovation", "transformation"],
        resonanceScore: 78.9,
      },
      {
        id: "story-004",
        title: "Chaos Theory in the Shuk",
        content:
          "A mathematician studying crowd dynamics in Jerusalem's Mahane Yehuda Market discovers that the seemingly random flow of people follows ancient patterns of sacred geometry...",
        location: "Jerusalem",
        frequency: "CHAOS",
        timestamp: "2024-03-12T11:20:00Z",
        author: "Eli Katz",
        tags: ["mathematics", "markets", "patterns"],
        resonanceScore: 85.7,
      },
    ]
    setStories(sampleStories)
  }, [])

  const filteredStories = useMemo(() => {
    return selectedFrequency ? stories.filter((story) => story.frequency === selectedFrequency) : stories
  }, [selectedFrequency, stories])

  // Show story when tile is hovered
  useEffect(() => {
    if (hoveredTile && isVisible) {
      const tileData = tiles.find((t) => t.id === hoveredTile)
      if (tileData) {
        const relatedStories = stories.filter((story) =>
          selectedFrequency ? story.frequency === selectedFrequency : story.frequency === tileData.frequency,
        )
        if (relatedStories.length > 0) {
          const randomStory = relatedStories[Math.floor(Math.random() * relatedStories.length)]
          setActiveStory(randomStory)

          // Generate connections to other stories
          const connections = stories
            .filter((s) => s.id !== randomStory.id && s.frequency === randomStory.frequency)
            .slice(0, 2)
            .map((story, index) => ({
              startX: tileData.x + tileData.width / 2,
              startY: tileData.y + tileData.height / 2,
              endX: Math.random() * 80 + 10,
              endY: Math.random() * 80 + 10,
              linkedContent: {
                title: story.title,
                preview: story.content.substring(0, 100) + "...",
              },
            }))
          setStoryConnections(connections)
        }
      }
    } else {
      setActiveStory(null)
      setStoryConnections([])
    }
  }, [hoveredTile, isVisible, stories, selectedFrequency, tiles])

  if (!isVisible || !activeStory) return null

  return (
    <>
      {/* Story Content Display */}
      <ResonanceChamber
        content={`📖 ${activeStory.title}\n\n${activeStory.content}\n\n📍 ${activeStory.location}\n✍️ ${activeStory.author}\n🎯 Resonance: ${activeStory.resonanceScore}%`}
        x={25}
        y={75}
        isVisible={true}
      />

      {/* Story Connections */}
      {storyConnections.map((connection, index) => (
        <ResonanceThread
          key={`story-thread-${activeStory.id}-${index}`}
          startX={connection.startX}
          startY={connection.startY}
          endX={connection.endX}
          endY={connection.endY}
          isActive={true}
          linkedContent={connection.linkedContent}
        />
      ))}

      {/* Story Metadata Overlay */}
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-sm">
          <div className="text-xs text-muted-foreground font-mono mb-2">972 STORIES</div>
          <div className="text-sm font-medium text-card-foreground mb-1">{activeStory.title}</div>
          <div className="text-xs text-muted-foreground mb-2">{activeStory.location}</div>
          <div className="flex flex-wrap gap-1 mb-2">
            {activeStory.tags.map((tag) => (
              <span key={tag} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(activeStory.timestamp).toLocaleDateString()} • {activeStory.author}
          </div>
        </div>
      </div>
    </>
  )
}

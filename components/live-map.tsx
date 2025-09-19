"use client"

import { useState, useEffect } from "react"

interface LiveMapProps {
  isVisible: boolean
  onLocationSelect?: (location: string) => void
  onTileRequest?: (tileId: string) => void
  onNitzotzTrigger?: (cityData: CityData) => void // Added callback for triggering Nitzotz with city data
}

interface MapLocation {
  id: string
  x: number
  y: number
  name: string
  nameHe: string // Added Hebrew names
  importance: number
  dataStamp: string // Added data stamp for city information
}

interface CityData {
  id: string
  name: string
  nameHe: string
  dataStamp: string
  question: string
}

interface ConsciousnessLayer {
  id: string
  name: string
  nameHe: string
  color: string
  data: Array<{ x: number; y: number; intensity: number }>
}

interface TransientEvent {
  id: string
  x: number
  y: number
  title: string
  titleHe: string
  type: "protest" | "festival" | "conference" | "ceremony"
  intensity: number
  tileId: string // Connected to main canvas tile
  timestamp: number
}

interface HistoricalLayer {
  id: string
  name: string
  nameHe: string
  year: number
  data: Array<{ x: number; y: number; label: string; labelHe: string }>
}

interface LifeArtery {
  id: string
  name: string
  nameHe: string
  type: "train" | "data" | "flight"
  path: Array<{ x: number; y: number }>
  color: string
  pulseSpeed: number
}

interface TopographicFeature {
  id: string
  name: string
  nameHe: string
  x: number
  y: number
  elevation: number // Relative elevation for 3D effect
  type: "mountain" | "valley" | "plain" | "coast"
}

export function LiveMap({ isVisible, onLocationSelect, onTileRequest, onNitzotzTrigger }: LiveMapProps) {
  const [is3D, setIs3D] = useState(false)
  const [sonarPing, setSonarPing] = useState(false)
  const [activeLayer, setActiveLayer] = useState<string | null>(null)
  const [showTransientEvents, setShowTransientEvents] = useState(true)
  const [timelineYear, setTimelineYear] = useState(2024) // Added timeline state
  const [showHistoricalLayer, setShowHistoricalLayer] = useState(false) // Added historical layer toggle
  const [showLifeArteries, setShowLifeArteries] = useState(true) // Added state for life arteries
  const [showTopography, setShowTopography] = useState(false) // Added state for topography

  const [locations] = useState<MapLocation[]>([
    {
      id: "tel-aviv",
      x: 45,
      y: 60,
      name: "Tel Aviv",
      nameHe: "תל אביב",
      importance: 0.9,
      dataStamp: "400 חברות סטארט-אפ // 24/7 חיי לילה // 1 חוף ים",
    },
    {
      id: "jerusalem",
      x: 48,
      y: 65,
      name: "Jerusalem",
      nameHe: "ירושלים",
      importance: 1.0,
      dataStamp: "3 דתות // 70 שערים // 1 חברת יוניקורן",
    },
    {
      id: "haifa",
      x: 42,
      y: 45,
      name: "Haifa",
      nameHe: "חיפה",
      importance: 0.7,
      dataStamp: "1 נמל // 2 אוניברסיטאות // 18 שכונות",
    },
    {
      id: "eilat",
      x: 46,
      y: 85,
      name: "Eilat",
      nameHe: "אילת",
      importance: 0.5,
      dataStamp: "365 ימי שמש // 4 מלונות // 1 שונית אלמוגים",
    },
    {
      id: "beer-sheva",
      x: 47,
      y: 75,
      name: "Beer Sheva",
      nameHe: "באר שבע",
      importance: 0.6,
      dataStamp: "1 אוניברסיטה // 7 בארות // 50 חברות הייטק",
    },
  ])

  const [consciousnessLayers] = useState<ConsciousnessLayer[]>([
    {
      id: "startups",
      name: "Startup Density",
      nameHe: "צפיפות סטארט-אפים",
      color: "#00ff88",
      data: [
        { x: 45, y: 60, intensity: 0.95 }, // Tel Aviv
        { x: 42, y: 45, intensity: 0.7 }, // Haifa
        { x: 48, y: 65, intensity: 0.6 }, // Jerusalem
        { x: 47, y: 75, intensity: 0.4 }, // Beer Sheva
      ],
    },
    {
      id: "archaeology",
      name: "Archaeological Sites",
      nameHe: "אתרים ארכיאולוגיים",
      color: "#ff8800",
      data: [
        { x: 48, y: 65, intensity: 1.0 }, // Jerusalem
        { x: 50, y: 70, intensity: 0.8 }, // Bethlehem area
        { x: 44, y: 55, intensity: 0.7 }, // Caesarea
        { x: 47, y: 75, intensity: 0.6 }, // Beer Sheva
      ],
    },
    {
      id: "water-agriculture",
      name: "Agricultural Water Use",
      nameHe: "צריכת מים בחקלאות",
      color: "#0088ff",
      data: [
        { x: 40, y: 50, intensity: 0.9 }, // Jordan Valley
        { x: 35, y: 40, intensity: 0.8 }, // Galilee
        { x: 52, y: 80, intensity: 0.7 }, // Negev agriculture
      ],
    },
    {
      id: "desert-coverage",
      name: "Desert Coverage",
      nameHe: "שטח מדברי",
      color: "#ffaa00",
      data: [
        { x: 50, y: 85, intensity: 1.0 }, // Deep Negev
        { x: 48, y: 80, intensity: 0.9 }, // Central Negev
        { x: 45, y: 75, intensity: 0.7 }, // Northern Negev
      ],
    },
    {
      id: "5g-networks",
      name: "5G Network Density",
      nameHe: "תדר רשתות 5G",
      color: "#ff0088",
      data: [
        { x: 45, y: 60, intensity: 0.95 }, // Tel Aviv
        { x: 42, y: 45, intensity: 0.8 }, // Haifa
        { x: 48, y: 65, intensity: 0.75 }, // Jerusalem
      ],
    },
    {
      id: "bird-migration",
      name: "Bird Migration Routes",
      nameHe: "נתיבי נדידת ציפורים",
      color: "#88ff00",
      data: [
        { x: 40, y: 50, intensity: 0.9 }, // Jordan Valley
        { x: 35, y: 35, intensity: 0.8 }, // Hula Valley
        { x: 46, y: 85, intensity: 0.7 }, // Eilat
      ],
    },
  ])

  const [transientEvents, setTransientEvents] = useState<TransientEvent[]>([
    {
      id: "tlv-protest",
      x: 45,
      y: 60,
      title: "Democracy Protest",
      titleHe: "הפגנה לדמוקרטיה",
      type: "protest",
      intensity: 0.8,
      tileId: "CHAOS_democracy_protest",
      timestamp: Date.now(),
    },
    {
      id: "mitzpe-festival",
      x: 48,
      y: 82,
      title: "Desert Music Festival",
      titleHe: "פסטיבל מוזיקה במדבר",
      type: "festival",
      intensity: 0.6,
      tileId: "CREATION_desert_music",
      timestamp: Date.now() - 30000,
    },
    {
      id: "technion-conference",
      x: 42,
      y: 45,
      title: "AI Research Conference",
      titleHe: "כנס מחקר בינה מלאכותית",
      type: "conference",
      intensity: 0.7,
      tileId: "CODE_ai_research",
      timestamp: Date.now() - 60000,
    },
  ])

  const [historicalLayers] = useState<HistoricalLayer[]>([
    {
      id: "ancient-kingdoms",
      name: "Ancient Kingdoms",
      nameHe: "ממלכות עתיקות",
      year: -1000,
      data: [
        { x: 48, y: 65, label: "Kingdom of Judah", labelHe: "ממלכת יהודה" },
        { x: 45, y: 55, label: "Kingdom of Israel", labelHe: "ממלכת ישראל" },
        { x: 40, y: 40, label: "Phoenician Cities", labelHe: "ערי פניקיה" },
      ],
    },
    {
      id: "spice-routes",
      name: "Spice Trade Routes",
      nameHe: "דרכי הבשמים",
      year: 100,
      data: [
        { x: 46, y: 85, label: "Eilat Port", labelHe: "נמל אילת" },
        { x: 48, y: 65, label: "Jerusalem", labelHe: "ירושלים" },
        { x: 42, y: 45, label: "Acre", labelHe: "עכו" },
        { x: 50, y: 75, label: "Nabatean Route", labelHe: "דרך הנבטים" },
      ],
    },
    {
      id: "ottoman-period",
      name: "Ottoman Administration",
      nameHe: "מנהל עותמני",
      year: 1500,
      data: [
        { x: 48, y: 65, label: "Jerusalem Sanjak", labelHe: "סנג'ק ירושלים" },
        { x: 42, y: 45, label: "Acre Eyalet", labelHe: "איילת עכו" },
        { x: 35, y: 35, label: "Damascus Route", labelHe: "דרך דמשק" },
      ],
    },
    {
      id: "british-mandate",
      name: "British Mandate",
      nameHe: "המנדט הבריטי",
      year: 1920,
      data: [
        { x: 48, y: 65, label: "Government House", labelHe: "בית הממשלה" },
        { x: 45, y: 60, label: "Tel Aviv Municipality", labelHe: "עיריית תל אביב" },
        { x: 42, y: 45, label: "Haifa Port", labelHe: "נמל חיפה" },
      ],
    },
  ])

  const [lifeArteries] = useState<LifeArtery[]>([
    {
      id: "train-tlv-jerusalem",
      name: "Tel Aviv - Jerusalem Railway",
      nameHe: "רכבת תל אביב - ירושלים",
      type: "train",
      path: [
        { x: 45, y: 60 }, // Tel Aviv
        { x: 46, y: 62 }, // Lod Junction
        { x: 47, y: 64 }, // Ramle
        { x: 48, y: 65 }, // Jerusalem
      ],
      color: "#00ff88",
      pulseSpeed: 3000,
    },
    {
      id: "train-coastal",
      name: "Coastal Railway",
      nameHe: "רכבת החוף",
      type: "train",
      path: [
        { x: 42, y: 45 }, // Haifa
        { x: 43, y: 50 }, // Netanya
        { x: 44, y: 55 }, // Herzliya
        { x: 45, y: 60 }, // Tel Aviv
        { x: 46, y: 65 }, // Ashkelon
      ],
      color: "#00ff88",
      pulseSpeed: 4000,
    },
    {
      id: "data-submarine-cables",
      name: "Submarine Data Cables",
      nameHe: "כבלים תת-ימיים",
      type: "data",
      path: [
        { x: 35, y: 60 }, // Mediterranean entry
        { x: 40, y: 58 }, // Offshore
        { x: 44, y: 55 }, // Herzliya landing
        { x: 45, y: 60 }, // Tel Aviv data centers
      ],
      color: "#0088ff",
      pulseSpeed: 1500,
    },
    {
      id: "data-fiber-backbone",
      name: "National Fiber Backbone",
      nameHe: "עמוד השדרה הסיבי הלאומי",
      type: "data",
      path: [
        { x: 42, y: 45 }, // Haifa
        { x: 45, y: 60 }, // Tel Aviv
        { x: 48, y: 65 }, // Jerusalem
        { x: 47, y: 75 }, // Beer Sheva
        { x: 46, y: 85 }, // Eilat
      ],
      color: "#0088ff",
      pulseSpeed: 800,
    },
    {
      id: "flights-ben-gurion",
      name: "Ben Gurion Airport Traffic",
      nameHe: "תנועת נמל התעופה בן גוריון",
      type: "flight",
      path: [
        { x: 46, y: 61 }, // Ben Gurion Airport
        { x: 40, y: 55 }, // Western approach
        { x: 52, y: 67 }, // Eastern approach
        { x: 46, y: 50 }, // Northern approach
        { x: 46, y: 72 }, // Southern approach
      ],
      color: "#ff8800",
      pulseSpeed: 2000,
    },
  ])

  const [topographicFeatures] = useState<TopographicFeature[]>([
    {
      id: "judean-hills",
      name: "Judean Hills",
      nameHe: "הרי יהודה",
      x: 48,
      y: 65,
      elevation: 0.8,
      type: "mountain",
    },
    {
      id: "galilee-mountains",
      name: "Galilee Mountains",
      nameHe: "הרי הגליל",
      x: 40,
      y: 35,
      elevation: 0.7,
      type: "mountain",
    },
    {
      id: "coastal-plain",
      name: "Coastal Plain",
      nameHe: "מישור החוף",
      x: 44,
      y: 55,
      elevation: 0.1,
      type: "plain",
    },
    {
      id: "jordan-valley",
      name: "Jordan Valley",
      nameHe: "עמק הירדן",
      x: 52,
      y: 50,
      elevation: -0.3,
      type: "valley",
    },
    {
      id: "negev-highlands",
      name: "Negev Highlands",
      nameHe: "רמת הנגב",
      x: 48,
      y: 80,
      elevation: 0.5,
      type: "mountain",
    },
  ])

  useEffect(() => {
    if (!isVisible) return

    // Sonar ping effect every 3 seconds
    const pingInterval = setInterval(() => {
      setSonarPing(true)
      setTimeout(() => setSonarPing(false), 1000)
    }, 3000)

    const eventsInterval = setInterval(() => {
      setTransientEvents((prev) =>
        prev.map((event) => ({
          ...event,
          intensity: Math.max(0.1, event.intensity * 0.98), // Fade over time
        })),
      )
    }, 5000)

    return () => {
      clearInterval(pingInterval)
      clearInterval(eventsInterval)
    }
  }, [isVisible])

  const handleEventClick = (event: TransientEvent) => {
    onTileRequest?.(event.tileId)
  }

  const handleCityClick = (location: MapLocation) => {
    const cityQuestions = {
      jerusalem: "ירושלים. מה תרצה לחקור קודם - את השכבות הדתיות, את הפוליטיקה, או את החדשנות הטכנולוגית?",
      "tel-aviv": "תל אביב. עיר שלא ישנה - מה מעניין אותך יותר, הסצנה התרבותית או מהפכת הסטארט-אפים?",
      haifa: "חיפה. עיר של דו-קיום - איך מתנהלים כאן יחסים בין קבוצות שונות?",
      eilat: "אילת. שער לעולם - מה הקשר בין המיקום הגיאוגרפי לזהות התרבותית?",
      "beer-sheva": "באר שבע. בירת הנגב - איך מדבר הופך למרכז טכנולוגי?",
    }

    const cityData: CityData = {
      id: location.id,
      name: location.name,
      nameHe: location.nameHe,
      dataStamp: location.dataStamp,
      question: cityQuestions[location.id as keyof typeof cityQuestions] || "מה תרצה לחקור כאן?",
    }

    onNitzotzTrigger?.(cityData)
  }

  const getCurrentHistoricalLayer = () => {
    if (!showHistoricalLayer) return null

    // Find the most recent historical layer for the current timeline year
    const relevantLayers = historicalLayers.filter((layer) => layer.year <= timelineYear)
    return relevantLayers.length > 0 ? relevantLayers[relevantLayers.length - 1] : null
  }

  const LifeArteryPulse = ({ artery }: { artery: LifeArtery }) => {
    const [pulsePosition, setPulsePosition] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setPulsePosition((prev) => (prev + 1) % artery.path.length)
      }, artery.pulseSpeed / artery.path.length)

      return () => clearInterval(interval)
    }, [artery])

    return (
      <g className="pointer-events-none">
        {/* Static path */}
        <path
          d={`M ${artery.path.map((p) => `${p.x} ${p.y}`).join(" L ")}`}
          stroke={artery.color}
          strokeWidth="0.3"
          fill="none"
          opacity="0.4"
          strokeDasharray={artery.type === "data" ? "1,1" : artery.type === "flight" ? "0.5,2" : "none"}
        />

        {/* Pulsing dot */}
        <circle
          cx={artery.path[pulsePosition]?.x || 0}
          cy={artery.path[pulsePosition]?.y || 0}
          r="0.8"
          fill={artery.color}
          opacity="0.9"
          className="animate-pulse"
        >
          <animate attributeName="r" values="0.5;1.2;0.5" dur="1s" repeatCount="indefinite" />
        </circle>

        {/* Trailing glow */}
        {artery.path.slice(Math.max(0, pulsePosition - 2), pulsePosition).map((point, idx) => (
          <circle key={idx} cx={point.x} cy={point.y} r="0.4" fill={artery.color} opacity={0.3 - idx * 0.1} />
        ))}
      </g>
    )
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-4 z-40">
      <div
        className={`bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 transition-all duration-700 ${
          is3D ? "w-96 h-80" : "w-80 h-64"
        }`}
      >
        <div className="text-xs font-mono text-card-foreground mb-2 opacity-60 flex justify-between">
          <span>CONSCIOUSNESS MAP // ישראל</span>
          <span className="text-accent">DENSITY ANALYSIS</span>
        </div>

        <div className="mb-2 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setShowHistoricalLayer(!showHistoricalLayer)}
              className={`px-2 py-1 rounded transition-all duration-200 ${
                showHistoricalLayer
                  ? "bg-accent text-accent-foreground"
                  : "bg-background/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              ציר זמן
            </button>
            <button
              onClick={() => setShowLifeArteries(!showLifeArteries)}
              className={`px-2 py-1 rounded transition-all duration-200 ${
                showLifeArteries
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-background/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              עורקי חיים
            </button>
            {is3D && (
              <button
                onClick={() => setShowTopography(!showTopography)}
                className={`px-2 py-1 rounded transition-all duration-200 ${
                  showTopography
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-background/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                טופוגרפיה
              </button>
            )}
            {showHistoricalLayer && (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-muted-foreground">-1000</span>
                <input
                  type="range"
                  min="-1000"
                  max="2024"
                  value={timelineYear}
                  onChange={(e) => setTimelineYear(Number.parseInt(e.target.value))}
                  className="flex-1 h-1 bg-background rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((timelineYear + 1000) / 3024) * 100}%, var(--background) ${((timelineYear + 1000) / 3024) * 100}%, var(--background) 100%)`,
                  }}
                />
                <span className="text-muted-foreground">2024</span>
                <span className="text-accent font-mono">
                  {timelineYear > 0 ? timelineYear : `${Math.abs(timelineYear)} BCE`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {consciousnessLayers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
              className={`text-xs px-2 py-1 rounded transition-all duration-200 ${
                activeLayer === layer.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-background/50 text-muted-foreground hover:text-foreground"
              }`}
              style={{
                borderColor: layer.color,
                borderWidth: activeLayer === layer.id ? "1px" : "0px",
              }}
            >
              {layer.nameHe}
            </button>
          ))}
        </div>

        <div
          className={`relative w-full h-full bg-background/20 rounded transition-all duration-700 overflow-hidden ${
            is3D ? "transform perspective-1000 rotateX-15" : ""
          }`}
          style={{
            backgroundImage: `
              linear-gradient(45deg, var(--border) 1px, transparent 1px),
              linear-gradient(-45deg, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "10px 10px",
          }}
          onClick={() => setIs3D(!is3D)}
        >
          {showHistoricalLayer && getCurrentHistoricalLayer() && (
            <div className="absolute inset-0 pointer-events-none">
              {getCurrentHistoricalLayer()!.data.map((point, idx) => (
                <div key={idx} className="absolute group">
                  <div
                    className="w-3 h-3 border-2 border-yellow-500 bg-yellow-500/20 rounded-sm animate-pulse"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-yellow-900/90 text-yellow-100 text-xs px-2 py-1 rounded whitespace-nowrap">
                      <div className="font-semibold">{point.labelHe}</div>
                      <div className="text-yellow-300">{point.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeLayer && (
            <div className="absolute inset-0 pointer-events-none">
              {consciousnessLayers
                .find((l) => l.id === activeLayer)
                ?.data.map((point, idx) => (
                  <div
                    key={idx}
                    className="absolute rounded-full animate-pulse"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      width: `${point.intensity * 60}px`,
                      height: `${point.intensity * 60}px`,
                      backgroundColor: consciousnessLayers.find((l) => l.id === activeLayer)?.color + "40",
                      border: `2px solid ${consciousnessLayers.find((l) => l.id === activeLayer)?.color}80`,
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 20px ${consciousnessLayers.find((l) => l.id === activeLayer)?.color}60`,
                    }}
                  />
                ))}
            </div>
          )}

          {is3D && showTopography && (
            <div className="absolute inset-0 pointer-events-none">
              {topographicFeatures.map((feature) => (
                <div key={feature.id} className="absolute group">
                  <div
                    className={`rounded-full transition-all duration-500 ${
                      feature.type === "mountain"
                        ? "bg-gradient-to-t from-stone-600/40 to-stone-400/20 border border-stone-500/30"
                        : feature.type === "valley"
                          ? "bg-gradient-to-b from-blue-600/20 to-blue-800/40 border border-blue-500/30"
                          : feature.type === "plain"
                            ? "bg-gradient-to-r from-green-600/20 to-green-400/30 border border-green-500/20"
                            : "bg-gradient-to-r from-blue-400/30 to-blue-600/20 border border-blue-400/40"
                    }`}
                    style={{
                      left: `${feature.x}%`,
                      top: `${feature.y}%`,
                      width: `${Math.abs(feature.elevation) * 80 + 20}px`,
                      height: `${Math.abs(feature.elevation) * 60 + 15}px`,
                      transform: `translate(-50%, -50%) ${
                        feature.elevation > 0
                          ? `translateZ(${feature.elevation * 20}px) rotateX(-${feature.elevation * 30}deg)`
                          : `translateZ(${feature.elevation * 10}px)`
                      }`,
                      boxShadow:
                        feature.elevation > 0
                          ? `0 ${feature.elevation * 10}px ${feature.elevation * 20}px rgba(0,0,0,0.3)`
                          : `inset 0 ${Math.abs(feature.elevation) * 5}px ${Math.abs(feature.elevation) * 10}px rgba(0,0,0,0.4)`,
                    }}
                  />
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-stone-900/90 text-stone-100 text-xs px-2 py-1 rounded whitespace-nowrap">
                      <div className="font-semibold">{feature.nameHe}</div>
                      <div className="text-stone-300">{feature.name}</div>
                      <div className="text-stone-400">
                        {feature.elevation > 0
                          ? `+${Math.round(feature.elevation * 1000)}m`
                          : `${Math.round(feature.elevation * 400)}m`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showLifeArteries && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {lifeArteries.map((artery) => (
                  <g key={artery.id}>
                    <LifeArteryPulse artery={artery} />
                  </g>
                ))}
              </svg>
            </div>
          )}

          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <path
                d="M20,20 L80,20 L80,80 L20,80 Z M30,30 L70,30 M30,40 L70,40 M30,50 L70,50"
                stroke="currentColor"
                strokeWidth="0.5"
                fill="none"
                className="text-border"
              />
            </svg>
          </div>

          {locations.map((location) => (
            <div key={location.id} className="absolute group cursor-pointer">
              <div
                className={`relative transition-all duration-300 ${sonarPing ? "animate-ping" : ""}`}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCityClick(location)
                }}
              >
                {sonarPing && (
                  <>
                    <div className="absolute inset-0 w-4 h-4 border border-accent rounded-full animate-ping opacity-75" />
                    <div
                      className="absolute inset-0 w-6 h-6 border border-accent rounded-full animate-ping opacity-50"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </>
                )}

                <div className="w-2 h-2 bg-accent rounded-full shadow-lg" />

                {is3D && (
                  <div
                    className="absolute bottom-0 left-1/2 bg-gradient-to-t from-accent to-transparent opacity-60"
                    style={{
                      width: "2px",
                      height: `${location.importance * 40}px`,
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 10px var(--accent)",
                    }}
                  />
                )}
              </div>

              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap max-w-48">
                  <div className="font-semibold">{location.nameHe}</div>
                  <div className="text-muted-foreground text-xs mt-1">{location.dataStamp}</div>
                </div>
              </div>
            </div>
          ))}

          {showTransientEvents &&
            transientEvents.map((event) => (
              <div
                key={event.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${event.x}%`,
                  top: `${event.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEventClick(event)
                }}
              >
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{
                    backgroundColor:
                      event.type === "protest"
                        ? "#ff4444"
                        : event.type === "festival"
                          ? "#44ff44"
                          : event.type === "conference"
                            ? "#4444ff"
                            : "#ffff44",
                    opacity: event.intensity,
                    boxShadow: `0 0 10px ${
                      event.type === "protest"
                        ? "#ff4444"
                        : event.type === "festival"
                          ? "#44ff44"
                          : event.type === "conference"
                            ? "#4444ff"
                            : "#ffff44"
                    }`,
                  }}
                />

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                    <div className="font-semibold">{event.titleHe}</div>
                    <div className="text-muted-foreground">{event.title}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Click layers • Click cities • Drag timeline</span>
          <div className="flex items-center gap-2">
            {showHistoricalLayer && <span className="text-yellow-500">● {getCurrentHistoricalLayer()?.nameHe}</span>}
            {showLifeArteries && <span className="text-green-400">● ARTERIES</span>}
            {is3D && showTopography && <span className="text-orange-400">● TOPO</span>}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTransientEvents(!showTransientEvents)
              }}
              className={`transition-opacity duration-300 ${showTransientEvents ? "opacity-100" : "opacity-50"}`}
            >
              ● EVENTS
            </button>
            <span className={`transition-opacity duration-300 ${sonarPing ? "opacity-100" : "opacity-50"}`}>
              ● SCANNING
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

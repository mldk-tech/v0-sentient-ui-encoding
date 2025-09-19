"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  messageType?: "text" | "data" | "video" | "resonance" | "curatorial"
}

interface CuratorialData {
  signalStrength: number
  culturalRelevance: number
  narrativeDepth: number
  sonicQuality: number
  resonanceScore: number
  authenticity: number
  productionStatus: "live" | "curated" | "amplified"
}

interface NitzotzChatbotProps {
  onResonanceThread?: (query: string) => void
  currentTileContext?: string
  curatorialData?: CuratorialData
}

export default function NitzotzChatbot({ onResonanceThread, currentTileContext, curatorialData }: NitzotzChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [cursorBlink, setCursorBlink] = useState(true)
  const [sessionContext, setSessionContext] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorBlink((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 500)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        typeMessage(getOpeningMessage())
      }, 800)
    }
  }, [isOpen])

  const getOpeningMessage = () => {
    if (currentTileContext) {
      return `נראה שהאות מ${currentTileContext} מעניין אותך. יש מה לחקור שם.`
    }
    return "הזרם מחובר. מה תרצה לחקור?"
  }

  const typeMessage = async (
    content: string,
    messageType: "text" | "data" | "video" | "resonance" | "curatorial" = "text",
  ) => {
    setIsTyping(true)
    const messageId = Date.now().toString()

    // Add empty message first
    const newMessage: Message = {
      id: messageId,
      type: "bot",
      content: "",
      timestamp: new Date(),
      messageType,
    }

    setMessages((prev) => [...prev, newMessage])

    // Type character by character
    for (let i = 0; i <= content.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 40))
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, content: content.slice(0, i) } : msg)))
    }

    setIsTyping(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Update session context (keep last 5 messages)
    setSessionContext((prev) => [...prev.slice(-4), inputValue])

    const response = generateResponse(inputValue, sessionContext)
    setInputValue("")

    // Delay before bot response
    setTimeout(
      () => {
        typeMessage(response.content, response.type)
      },
      500 + Math.random() * 1000,
    )
  }

  const generateResponse = (input: string, context: string[]) => {
    const lowerInput = input.toLowerCase()

    // Error handling - never say "I don't understand"
    if (input.length < 2) {
      return {
        content: "האות שהעברת אינו ברור. נסה למקד את החקירה.",
        type: "text" as const,
      }
    }

    // Socratic responses based on key concepts
    if (lowerInput.includes("שלום") || lowerInput.includes("peace")) {
      return {
        content: "האם שלום הוא היעדר קונפליקט, או ניהול מתמיד שלו? [מציג אריח וידאו של דיון סוער בכנסת]",
        type: "video" as const,
      }
    }

    if (lowerInput.includes("דמוקרטיה") || lowerInput.includes("democracy")) {
      return {
        content: "דמוקרטיה - האם זה כלל הרוב, או הגנה על המיעוט? מה קורה כשהשניים מתנגשים?",
        type: "text" as const,
      }
    }

    if (lowerInput.includes("זהות") || lowerInput.includes("identity")) {
      return {
        content: "זהות ישראלית - האם היא נבנית מהעבר, או מהעתיד שאנחנו בוחרים? איך אתה מגדיר את עצמך?",
        type: "text" as const,
      }
    }

    if (lowerInput.includes("טכנולוגיה") || lowerInput.includes("קוד") || lowerInput.includes("code")) {
      if (curatorialData) {
        return {
          content: `האות שאתה חוקר (CODE) זוהה על ידי האוצר הראשי כבעל 'עומק נרטיבי' של ${Math.round(curatorialData.narrativeDepth)}%, אך 'הרלוונטיות התרבותית' שלו עדיין ${curatorialData.culturalRelevance < 50 ? "נמוכה" : "גבוהה"}. מדוע לדעתך זה כך?`,
          type: "curatorial" as const,
        }
      }
      return {
        content: "הטכנולוגיה משנה אותנו, או שאנחנו משנים אותה? איפה הגבול בין כלי לזהות?",
        type: "text" as const,
      }
    }

    if (lowerInput.includes("תרבות") || lowerInput.includes("אמנות")) {
      if (curatorialData) {
        return {
          content: `מעניין - האותנטיות של האות הזה עומדת על ${Math.round(curatorialData.authenticity)}%. האם אמנות 'אמיתית' חייבת להיות ספונטנית, או שגם יצירה מתוכננת יכולה לגעת בנשמה?`,
          type: "curatorial" as const,
        }
      }
      return {
        content: "תרבות - האם היא משקפת מי שאנחנו, או מעצבת מי שנהיה? איך אמנות משנה חברה?",
        type: "text" as const,
      }
    }

    if (lowerInput.includes("כלכלה") || lowerInput.includes("עסקים")) {
      return {
        content: "הצלחה כלכלית - האם היא מטרה או אמצעי? מה קורה כשהיא מתנגשת עם ערכים?",
        type: "text" as const,
      }
    }

    // Context-aware curatorial insights
    if (currentTileContext && curatorialData) {
      const insights = [
        `האות מ${currentTileContext} מראה רמת תהודה של ${Math.round(curatorialData.resonanceScore * 10) / 10}Hz. למה לדעתך הוא מהדהד דווקא עכשיו?`,
        `מעניין - האות הזה (${currentTileContext}) נמצא במצב '${curatorialData.productionStatus}'. איך זה משפיע על האמינות שלו?`,
        `האיכות הסונית של האות הזה ${curatorialData.sonicQuality > 70 ? "גבוהה" : "נמוכה"}. האם צליל טוב הופך מסר לאמין יותר?`,
      ]

      if (Math.random() < 0.4) {
        // 40% chance for curatorial insight
        return {
          content: insights[Math.floor(Math.random() * insights.length)],
          type: "curatorial" as const,
        }
      }
    }

    // Paradoxical Socratic questions
    const socraticResponses = [
      "השאלה שלך מעלה פרדוקס - האם החיפוש אחר תשובות חשוב יותר מהתשובות עצמן?",
      "מעניין. אתה מחפש וודאות בעולם של ספקות. איך זה משפיע על מה שאתה מוצא?",
      "השאלה הזו מזכירה לי משהו - האם אנחנו שואלים כדי לדעת, או כדי להבין שאנחנו לא יודעים?",
      "יש כאן משהו עמוק. מה אם התשובה שאתה מחפש כבר קיימת בשאלה עצמה?",
      "זה מעורר מחשבה - האם המציאות משתנה כשאנחנו צופים בها, או שאנחנו משתנים?",
    ]

    return {
      content: socraticResponses[Math.floor(Math.random() * socraticResponses.length)],
      type: "text" as const,
    }
  }

  const handleResonanceClick = (query: string) => {
    onResonanceThread?.(query)
    setIsOpen(false)
  }

  return (
    <>
      {!isOpen && (
        <motion.div
          className="fixed bottom-8 right-8 z-50 cursor-pointer"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div
            className="text-cyan-400 font-mono text-xl select-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            _
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ scaleY: 0, scaleX: 0 }}
            animate={{ scaleY: 1, scaleX: 1 }}
            exit={{ scaleY: 0, scaleX: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 1, 0.5, 1],
              scaleY: { duration: 0.2 },
              scaleX: { duration: 0.4, delay: 0.1 },
            }}
            style={{ transformOrigin: "center" }}
          >
            <div className="w-[400px] h-[600px] bg-[#0A0A0A] border border-gray-700 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
                  animation: "static-flicker 0.2s infinite",
                }}
              />

              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <div className="text-cyan-400 font-mono text-sm">ניצוץ</div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                  ×
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto h-[480px] space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`${message.type === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block max-w-[80%] ${
                        message.type === "user" ? "text-white font-inter" : "text-white/80 font-mono"
                      }`}
                    >
                      {message.messageType === "data" ? (
                        <pre className="bg-gray-900 p-2 rounded text-green-400 text-xs">{message.content}</pre>
                      ) : message.messageType === "curatorial" ? (
                        <div className="bg-blue-900/20 border border-blue-500/30 p-2 rounded">
                          <div className="text-blue-400 text-xs mb-1">📊 CURATORIAL INSIGHT</div>
                          <div>{message.content}</div>
                        </div>
                      ) : message.messageType === "video" ? (
                        <div className="bg-red-900/20 border border-red-500/30 p-2 rounded">
                          <div className="text-red-400 text-xs mb-1">🎥 VIDEO REFERENCE</div>
                          <div>{message.content}</div>
                        </div>
                      ) : message.messageType === "resonance" ? (
                        <div>
                          <div className="mb-2">{message.content}</div>
                          <button
                            onClick={() => handleResonanceClick(message.content)}
                            className="text-cyan-400 hover:text-cyan-300 underline text-sm"
                          >
                            [חקור את הקשר ⇲]
                          </button>
                        </div>
                      ) : (
                        message.content
                      )}
                      {message.type === "bot" && isTyping && message.id === messages[messages.length - 1]?.id && (
                        <span className={`ml-1 ${cursorBlink ? "opacity-100" : "opacity-0"}`}>█</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent text-white font-inter outline-none border-b border-gray-600 focus:border-cyan-400 transition-colors pb-1"
                    placeholder="הקלד כאן..."
                    disabled={isTyping}
                    dir="rtl"
                  />
                  <div
                    className={`absolute left-0 bottom-1 w-2 h-4 bg-cyan-400 ${cursorBlink ? "opacity-100" : "opacity-0"}`}
                  />
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes static-flicker {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-1px, 1px); }
          20% { transform: translate(1px, -1px); }
          30% { transform: translate(-1px, -1px); }
          40% { transform: translate(1px, 1px); }
          50% { transform: translate(-1px, 1px); }
          60% { transform: translate(1px, -1px); }
          70% { transform: translate(-1px, -1px); }
          80% { transform: translate(1px, 1px); }
          90% { transform: translate(-1px, 1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </>
  )
}

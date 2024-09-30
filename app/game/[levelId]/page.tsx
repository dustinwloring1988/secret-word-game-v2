'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'
import { levels, getLLMResponse } from '@/lib/gameData'
import { supabase } from '@/lib/supabase'

export default function GamePage({ params }: { params: { levelId: string } }) {
  const router = useRouter()
  const [isLoaded, setIsLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [prompt, setPrompt] = useState("")
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [gameStatus, setGameStatus] = useState<"Start" | "playing" | "won" | "lost">("Start")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [showStartButton, setShowStartButton] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const [isLastLevel, setIsLastLevel] = useState(false)
  const [currentLevelState, setCurrentLevelState] = useState<typeof levels[0] | undefined>(undefined)
  const chatWindowRef = useRef<HTMLElement | null>(null)
  const [currentLevelData, setCurrentLevelData] = useState<typeof levels[0] | undefined>(undefined)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
      setIsLoaded(true)
      if (!user) {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    if (isLoaded && userId) {
      const levelId = parseInt(params.levelId)
      setCurrentLevel(levelId)
      const foundLevel = levels.find(l => l.id === levelId)
      setCurrentLevelState(foundLevel)
      setCurrentLevelData(foundLevel)
    }
  }, [isLoaded, userId, params.levelId])

  useEffect(() => {
    chatWindowRef.current = document.getElementById('chat-window')
  }, [])

  useEffect(() => {
    if (currentLevelData) {
      setTimeLeft(currentLevelData.timeLimit)
      setMessages([{ role: 'ai', content: `Welcome to level ${currentLevel}. Click 'Start Game' to begin!` }])
      setGameStatus("Start")
      setIsTimerRunning(false)
      setShowStartButton(true)
      setGameStarted(false)
      setIsLastLevel(currentLevel === levels[levels.length - 1].id)
    }
  }, [currentLevelData, currentLevel])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (timeLeft > 0 && gameStatus === "playing" && isTimerRunning) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameStatus === "playing") {
      setGameStatus("lost")
    }
    return () => clearInterval(timer)
  }, [timeLeft, gameStatus, isTimerRunning])

  useEffect(() => {
    let cooldownTimer: NodeJS.Timeout
    if (cooldown > 0) {
      cooldownTimer = setInterval(() => {
        setCooldown(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(cooldownTimer)
  }, [cooldown])

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  const submitPrompt = async () => {
    if (cooldown > 0 && gameStatus !== "won") return

    if (!isTimerRunning) {
      setIsTimerRunning(true)
    }

    const currentLevelData = levels.find(l => l.id === currentLevel)
    if (!currentLevelData) return
    const response = await getLLMResponse(prompt, currentLevelData.systemPrompt)
    
    // Save prompt and response to Supabase
    await savePromptResponse(prompt, response, currentLevel, userId)

    setMessages(prev => [
      ...prev,
      { role: 'user', content: prompt },
      ...(response ? [{ role: 'ai', content: response }] : [])
    ] as Array<{ role: 'user' | 'ai', content: string }>)

    if (prompt.toLowerCase() === currentLevelData.secretWord.toLowerCase()) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: "Congratulations! You've guessed the secret word correctly!" }
      ])
      setGameStatus("won")
    } else if (currentLevelData.secretWord.toLowerCase().includes(prompt.toLowerCase()) || prompt.toLowerCase().includes(currentLevelData.secretWord.toLowerCase())) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: "You're very close! Part of your guess is correct, but it's not the exact word we're looking for." }
      ])
      setCooldown(5) // Shorter cooldown for close guesses
    } else {
      setCooldown(10)
    }

    setPrompt("")
  }

  const startGame = () => {
    setIsTimerRunning(true)
    setShowStartButton(false)
    setGameStatus("playing")
    setGameStarted(true)
  }

  const handleNextLevel = () => {
    if (isLastLevel) {
      router.push('/dashboard')
    } else {
      setCurrentLevel(prev => prev + 1)
    }
  }

  const foundLevelData = levels.find(l => l.id === currentLevel)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex gap-6">
          {/* Left side: Chat interface */}
          <div className="w-2/3">
            <div id="chat-window" className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 h-[calc(100vh-200px)] overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    {message.content}
                  </div>
                  {message.role === 'ai' && gameStatus === "won" && index === messages.length - 1 && (
                    <Button onClick={handleNextLevel} className="ml-2 bg-white text-black hover:bg-gray-200">
                      {isLastLevel ? "Congratulations! Back to Dashboard" : "Next Level"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here"
                disabled={!gameStarted || gameStatus !== "playing"}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && (cooldown === 0 || gameStatus === "won") && gameStarted) {
                    submitPrompt();
                  }
                }}
                className="flex-grow bg-gray-700 text-white border-gray-600"
              />
              <Button onClick={submitPrompt} disabled={!gameStarted || (gameStatus !== "playing" && gameStatus !== "won") || (cooldown > 0 && gameStatus !== "won")} className="bg-white text-black hover:bg-gray-200">
                Send {cooldown > 0 && gameStatus !== "won" ? `(${cooldown}s)` : ''}
              </Button>
            </div>
          </div>

          {/* Right side: Room information */}
          <div className="w-1/3">
            <h1 className="text-3xl font-bold mb-2">{foundLevelData?.name}</h1>
            <p className="text-gray-400 mb-4">{foundLevelData?.difficulty}</p>
            <div className="mb-4">
              <p className="text-lg">Time Left: {timeLeft} seconds</p>
              <p className="text-lg font-semibold">Status: {gameStatus}</p>
            </div>
            <p className="mb-4 text-gray-300">{foundLevelData?.description}</p>
            {showStartButton && (
              <Button onClick={startGame} className="w-full mb-4 bg-white text-black hover:bg-gray-200">
                Start Game
              </Button>
            )}
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
              Back to Level Select
            </Button>
            
            {/* How to Play section */}
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-2">How to Play</h2>
              <ol className="list-decimal list-inside text-sm text-gray-300 space-y-2">
                <li>Start the game by clicking the "Start Game" button.</li>
                <li>Try to guess the secret word by asking questions or making guesses.</li>
                <li>The AI will respond, but won't directly reveal the word.</li>
                <li>You have a limited time to guess the word.</li>
                <li>There's a cooldown between attempts to prevent spamming.</li>
                <li>If you guess correctly, you'll move to the next level.</li>
                <li>If time runs out, you'll need to try the level again.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const savePromptResponse = async (prompt: string, response: string, level: number, userId: string | null) => {
  try {
    const { error } = await supabase
      .from('prompt_responses')
      .insert({
        user_id: userId,
        level,
        prompt,
        response,
        ai_model: "gpt-4o-mini", // You may want to make this dynamic if you use different models
        created_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving prompt and response:', error)
  }
}
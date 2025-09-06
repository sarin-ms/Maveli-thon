"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 0, y: -1 }

interface FoodType {
  image: string
  points: number
  probability: number
}

interface Position {
  x: number
  y: number
}

interface Food {
  position: Position
  type: keyof typeof FOOD_TYPES
  points: number
}

interface GameStats {
  papadamsEaten: number
  payasamsEaten: number
  bananasEaten: number
  totalFoodsEaten: number
}

interface TouchStart {
  x: number
  y: number
}

interface LeaderboardEntry {
  name: string
  score: number
  date: string
}

const FOOD_TYPES: Record<string, FoodType> = {
  papadam: { image: "/papadam.webp", points: 1, probability: 0.6 },
  payasam: { image: "/payasam.webp", points: 5, probability: 0.25 },
  banana: { image: "/banana.webp", points: 3, probability: 0.15 },
}

export default function OnamSnakeGame(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Food>({ position: { x: 15, y: 15 }, type: "papadam", points: 1 })
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(200)
  const [gameStats, setGameStats] = useState<GameStats>({
    papadamsEaten: 0,
    payasamsEaten: 0,
    bananasEaten: 0,
    totalFoodsEaten: 0,
  })
  const [touchStart, setTouchStart] = useState<TouchStart | null>(null)
  const [canvasSize, setCanvasSize] = useState<number>(400)
  const [maveliImage, setMaveliImage] = useState<HTMLImageElement | null>(null)
  const [tailImage, setTailImage] = useState<HTMLImageElement | null>(null)
  const [username, setUsername] = useState<string>('')
  const [showNameInput, setShowNameInput] = useState<boolean>(false)

  useEffect(() => {
    const img = new Image()
    img.src = '/maveli.webp'
    img.onload = () => {
      setMaveliImage(img)
    }
  }, [])

  useEffect(() => {
    const img = new Image()
    img.src = '/tail.webp'
    img.onload = () => {
      setTailImage(img)
    }
  }, [])

  // Set responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      const isMobile = window.innerWidth < 768
      const newSize = isMobile ? Math.min(320, window.innerWidth - 48) : 400
      setCanvasSize(newSize)
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [])

  useEffect(() => {
    const savedHighScore = localStorage.getItem("onam-snake-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
    
    // Load saved username
    const savedUsername = localStorage.getItem("onam-snake-username")
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  // Helper functions for leaderboard
  const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
      const response = await fetch('/api/leaderboard')
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          return data
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard from API:', error)
    }
    
    // Fallback to localStorage for local development
    try {
      const localData = localStorage.getItem("onam-snake-leaderboard")
      return localData ? JSON.parse(localData) : []
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return []
    }
  }

  const updateLeaderboard = async (name: string, score: number): Promise<void> => {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous',
          score
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        // If KV is not available, fallback to localStorage
        if (!result.kvAvailable) {
          const localLeaderboard = JSON.parse(localStorage.getItem("onam-snake-leaderboard") || "[]")
          const playerName = name.trim() || 'Anonymous'
          
          // Check if player already exists
          const existingPlayerIndex = localLeaderboard.findIndex((entry: LeaderboardEntry) => 
            entry.name.toLowerCase() === playerName.toLowerCase()
          )
          
          if (existingPlayerIndex !== -1) {
            // Player exists - only update if new score is higher
            if (score > localLeaderboard[existingPlayerIndex].score) {
              localLeaderboard[existingPlayerIndex] = {
                name: playerName,
                score,
                date: new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              }
            }
          } else {
            // New player - add new entry
            const newEntry: LeaderboardEntry = {
              name: playerName,
              score,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
            localLeaderboard.push(newEntry)
          }
          
          localLeaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
          localStorage.setItem("onam-snake-leaderboard", JSON.stringify(localLeaderboard.slice(0, 10)))
        }
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error)
      // Fallback to localStorage
      try {
        const localLeaderboard = JSON.parse(localStorage.getItem("onam-snake-leaderboard") || "[]")
        const playerName = name.trim() || 'Anonymous'
        
        // Check if player already exists
        const existingPlayerIndex = localLeaderboard.findIndex((entry: LeaderboardEntry) => 
          entry.name.toLowerCase() === playerName.toLowerCase()
        )
        
        if (existingPlayerIndex !== -1) {
          // Player exists - only update if new score is higher
          if (score > localLeaderboard[existingPlayerIndex].score) {
            localLeaderboard[existingPlayerIndex] = {
              name: playerName,
              score,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          }
        } else {
          // New player - add new entry
          const newEntry: LeaderboardEntry = {
            name: playerName,
            score,
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
          localLeaderboard.push(newEntry)
        }
        
        localLeaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
        localStorage.setItem("onam-snake-leaderboard", JSON.stringify(localLeaderboard.slice(0, 10)))
      } catch (localError) {
        console.error('Error with localStorage fallback:', localError)
      }
    }
  }

  const generateFood = useCallback((): Food => {
    const canvas = canvasRef.current
    if (!canvas) return { position: { x: 15, y: 15 }, type: "papadam", points: 1 }

    let newPosition: Position
    let attempts = 0
    const maxAttempts = 50

    do {
      newPosition = {
        x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
        y: Math.floor(Math.random() * (canvas.height / GRID_SIZE)),
      }
      attempts++
    } while (
      attempts < maxAttempts &&
      snake.some((segment) => segment.x === newPosition.x && segment.y === newPosition.y)
    )

    const rand = Math.random()
    let foodType: keyof typeof FOOD_TYPES = "papadam"

    if (rand < FOOD_TYPES.banana.probability) {
      foodType = "banana"
    } else if (rand < FOOD_TYPES.banana.probability + FOOD_TYPES.payasam.probability) {
      foodType = "payasam"
    }

    return {
      position: newPosition,
      type: foodType,
      points: FOOD_TYPES[foodType].points,
    }
  }, [snake])

  const playChendaSound = (): void => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log("Audio not supported")
    }
  }

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      head.x += direction.x
      head.y += direction.y

      const canvas = canvasRef.current
      if (!canvas) return currentSnake
      
      const maxX = Math.floor(canvas.width / GRID_SIZE)
      const maxY = Math.floor(canvas.height / GRID_SIZE)

      if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
        setGameOver(true)
        return currentSnake
      }

      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        return currentSnake
      }

      newSnake.unshift(head)

      if (head.x === food.position.x && head.y === food.position.y) {
        playChendaSound()

        setGameStats((prev) => ({
          ...prev,
          [`${food.type}sEaten`]: prev[`${food.type}sEaten` as keyof GameStats] as number + 1,
          totalFoodsEaten: prev.totalFoodsEaten + 1,
        }))

        setScore((prev) => {
          const newScore = prev + food.points
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("onam-snake-high-score", newScore.toString())
            
            // Add to leaderboard if we have a username
            if (username.trim()) {
              updateLeaderboard(username, newScore).catch(console.error)
            }
          }
          return newScore
        })

        if (food.type === "banana") {
          setSpeed((prev) => Math.max(100, prev - 15))
        }

        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameStarted, gameOver, score, highScore, generateFood, gameStats])

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, speed)
    return () => clearInterval(gameLoop)
  }, [moveSnake, speed])

  // Handle game over
  useEffect(() => {
    if (gameOver && gameStarted) {
      handleGameOver()
    }
  }, [gameOver, gameStarted])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (!gameStarted) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          if (direction.y === 0) setDirection({ x: 0, y: -1 })
          break
        case "ArrowDown":
          e.preventDefault()
          if (direction.y === 0) setDirection({ x: 0, y: 1 })
          break
        case "ArrowLeft":
          e.preventDefault()
          if (direction.x === 0) setDirection({ x: -1, y: 0 })
          break
        case "ArrowRight":
          e.preventDefault()
          if (direction.x === 0) setDirection({ x: 1, y: 0 })
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [direction, gameStarted])

  // Prevent mobile browser behaviors globally
  useEffect(() => {
    const preventDefaultBehaviors = (e: TouchEvent): void => {
      // Only prevent pull-to-refresh and overscroll when game is active
      // and not touching interactive elements
      if (gameStarted && e.touches && e.touches.length > 0) {
        const target = e.target as Element
        // Don't prevent default on buttons and interactive elements
        if (target && (target.closest('button') || target.closest('[role="button"]'))) {
          return
        }
        e.preventDefault()
      }
    }

    const preventScroll = (e: TouchEvent): void => {
      // Prevent scrolling when game is active
      if (gameStarted) {
        const target = e.target as Element
        // Don't prevent default on buttons and interactive elements
        if (target && (target.closest('button') || target.closest('[role="button"]'))) {
          return
        }
        e.preventDefault()
      }
    }

    // Add touch event listeners to document to capture all touch events
    document.addEventListener('touchstart', preventDefaultBehaviors, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('touchend', preventDefaultBehaviors, { passive: false })

    // Prevent pull-to-refresh specifically
    document.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 1) return
      const touch = e.touches[0]
      const startY = touch.pageY
      if (startY <= 50 && gameStarted) {
        const target = e.target as Element
        if (target && (target.closest('button') || target.closest('[role="button"]'))) {
          return
        }
        e.preventDefault()
      }
    }, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventDefaultBehaviors)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('touchend', preventDefaultBehaviors)
    }
  }, [gameStarted])

  // Add CSS to prevent mobile browser behaviors only during gameplay
  useEffect(() => {
    if (gameStarted) {
      // Disable pull-to-refresh and overscroll only during game
      document.body.style.overscrollBehavior = 'none'
      document.documentElement.style.overscrollBehavior = 'none'
      
      // Prevent text selection and callouts (with proper typing)
      ;(document.body.style as any).webkitTouchCallout = 'none'
      ;(document.body.style as any).webkitUserSelect = 'none'
      document.body.style.userSelect = 'none'
      
      // Disable pull-to-refresh in Chrome/Safari
      document.body.style.touchAction = 'pan-x pan-y'
    } else {
      // Reset styles when game is not active
      document.body.style.overscrollBehavior = ''
      document.documentElement.style.overscrollBehavior = ''
      ;(document.body.style as any).webkitTouchCallout = ''
      ;(document.body.style as any).webkitUserSelect = ''
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overscrollBehavior = ''
      document.documentElement.style.overscrollBehavior = ''
      ;(document.body.style as any).webkitTouchCallout = ''
      ;(document.body.style as any).webkitUserSelect = ''
      document.body.style.userSelect = ''
      document.body.style.touchAction = ''
    }
  }, [gameStarted])

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault()
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault() // Prevent scrolling during swipe
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>): void => {
    e.preventDefault()
    if (!touchStart || !gameStarted) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 30 && direction.x === 0) setDirection({ x: 1, y: 0 })
      if (deltaX < -30 && direction.x === 0) setDirection({ x: -1, y: 0 })
    } else {
      if (deltaY > 30 && direction.y === 0) setDirection({ x: 0, y: 1 })
      if (deltaY < -30 && direction.y === 0) setDirection({ x: 0, y: -1 })
    }

    setTouchStart(null)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f0f9ff")
    gradient.addColorStop(0.5, "#ecfdf5")
    gradient.addColorStop(1, "#fffbeb")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "#e0f2fe"
    ctx.lineWidth = 0.5
    for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i <= canvas.height; i += GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    snake.forEach((segment, index) => {
      const isHead = index === 0
      const isTail = index === snake.length - 1

      if (isHead && maveliImage) {
        // Draw Maveli image as snake head
        ctx.drawImage(
          maveliImage,
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        )
      } else if (isTail && tailImage) {
        // Draw tail image as snake tail
        ctx.drawImage(
          tailImage,
          segment.x * GRID_SIZE + 1,
          segment.y * GRID_SIZE + 1,
          GRID_SIZE - 2,
          GRID_SIZE - 2
        )
      } else if (isTail && !tailImage) {
        // Fallback: Draw yellow square emoji as tail if image not loaded
        ctx.font = `${GRID_SIZE - 4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          '🟨',
          segment.x * GRID_SIZE + GRID_SIZE / 2,
          segment.y * GRID_SIZE + GRID_SIZE / 2
        )
      } else {
        // Draw body segments with yellow square emoji
        ctx.font = `${GRID_SIZE - 4}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          '🟨',
          segment.x * GRID_SIZE + GRID_SIZE / 2,
          segment.y * GRID_SIZE + GRID_SIZE / 2
        )

        // Fallback for head if Maveli image not loaded
        if (isHead && !maveliImage) {
          // Draw gradient background for head fallback
          const segmentGradient = ctx.createRadialGradient(
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            0,
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2,
          )
          segmentGradient.addColorStop(0, "#22c55e")
          segmentGradient.addColorStop(1, "#16a34a")
          
          ctx.fillStyle = segmentGradient
          ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
          
          // Draw eyes for head fallback
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(segment.x * GRID_SIZE + 5, segment.y * GRID_SIZE + 5, 3, 3)
          ctx.fillRect(segment.x * GRID_SIZE + 12, segment.y * GRID_SIZE + 5, 3, 3)
          ctx.fillStyle = "#000000"
          ctx.fillRect(segment.x * GRID_SIZE + 6, segment.y * GRID_SIZE + 6, 1, 1)
          ctx.fillRect(segment.x * GRID_SIZE + 13, segment.y * GRID_SIZE + 6, 1, 1)
        }
      }
    })

    const foodColors: Record<string, string> = {
      papadam: "#fbbf24",
      payasam: "#f59e0b",
      banana: "#eab308",
    }

    ctx.fillStyle = foodColors[food.type]
    ctx.fillRect(food.position.x * GRID_SIZE + 2, food.position.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4)

    const foodImage = new Image()
    foodImage.src = FOOD_TYPES[food.type].image
    foodImage.onload = () => {
      ctx.drawImage(
        foodImage,
        food.position.x * GRID_SIZE + 2,
        food.position.y * GRID_SIZE + 2,
        GRID_SIZE - 4,
        GRID_SIZE - 4,
      )
    }
  }, [snake, food, maveliImage, tailImage])

  const startGame = (): void => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood(generateFood())
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
    setSpeed(200)
    setShowNameInput(false) // Hide name input when starting
    setGameStats({
      papadamsEaten: 0,
      payasamsEaten: 0,
      bananasEaten: 0,
      totalFoodsEaten: 0,
    })
  }

  const handleGameOver = (): void => {
    // Add current score to leaderboard if we have a username
    if (username.trim() && score > 0) {
      updateLeaderboard(username, score).catch(console.error)
    } else if (score > 0) {
      // Show name input if no username is set and player has a score
      setShowNameInput(true)
    }
  }

  const handleNameSubmit = (): void => {
    if (username.trim()) {
      localStorage.setItem("onam-snake-username", username.trim())
      if (score > 0) {
        updateLeaderboard(username, score).catch(console.error)
      }
    }
    setShowNameInput(false)
  }

  const resetGame = (): void => {
    setGameStarted(false)
    setGameOver(false)
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setScore(0)
    setSpeed(200)
    setGameStats({
      papadamsEaten: 0,
      payasamsEaten: 0,
      bananasEaten: 0,
      totalFoodsEaten: 0,
    })
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-yellow-50 to-orange-50 p-2 sm:p-4"
      style={{
        touchAction: gameStarted ? 'none' : 'auto',
        overscrollBehavior: gameStarted ? 'none' : 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
      onTouchStart={gameStarted ? (e: React.TouchEvent<HTMLDivElement>) => e.preventDefault() : undefined}
      onTouchMove={gameStarted ? (e: React.TouchEvent<HTMLDivElement>) => e.preventDefault() : undefined}
      onTouchEnd={gameStarted ? (e: React.TouchEvent<HTMLDivElement>) => e.preventDefault() : undefined}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#fbbf24_2px,_transparent_2px),radial-gradient(circle_at_80%_80%,_#34d399_2px,_transparent_2px),radial-gradient(circle_at_40%_60%,_#f97316_1px,_transparent_1px)] bg-[length:80px_80px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-emerald-800 mb-2 sm:mb-4 text-balance">Onam Snake & Papadam</h1>
          <p className="text-base sm:text-lg text-emerald-700 mb-4 sm:mb-6 text-pretty px-2">
            Celebrate Onam with this festive snake game! Collect papadams and enjoy the feast!
          </p>

          <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap px-2">
            <Card className="px-4 py-2 bg-white/80 backdrop-blur border-emerald-200">
              <div className="text-sm text-emerald-600">Score</div>
              <div className="text-2xl font-bold text-emerald-800">{score}</div>
            </Card>
            <Card className="px-4 py-2 bg-white/80 backdrop-blur border-yellow-200">
              <div className="text-sm text-yellow-600">High Score</div>
              <div className="text-2xl font-bold text-yellow-800">{highScore}</div>
            </Card>
            {gameStarted && (
              <Card className="px-4 py-2 bg-white/80 backdrop-blur border-orange-200">
                <div className="text-sm text-orange-600">Foods Eaten</div>
                <div className="text-lg font-bold text-orange-800">{gameStats.totalFoodsEaten}</div>
              </Card>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Card className="p-2 sm:p-4 bg-white/90 backdrop-blur mb-4 sm:mb-6 border-emerald-200 relative mx-2">
            <canvas
              ref={canvasRef}
              width={canvasSize}
              height={canvasSize}
              className="border-2 border-emerald-300 rounded-lg bg-gradient-to-br from-emerald-50 to-yellow-50 max-w-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </Card>

          <div className="text-center space-y-4">
            {/* Username input */}
            {(!gameStarted && !gameOver) && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <Input
                    type="text"
                    placeholder="Enter your name (optional)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="max-w-xs"
                    maxLength={20}
                  />
                  {username.trim() && (
                    <Button
                      onClick={() => localStorage.setItem("onam-snake-username", username.trim())}
                      variant="outline"
                      size="sm"
                    >
                      Save Name
                    </Button>
                  )}
                </div>
                <Button
                  onClick={startGame}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    startGame()
                  }}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 touch-manipulation"
                >
                  Start Onam Feast
                </Button>
                <div>
                  <Link href="/leaderboard" className="text-emerald-600 hover:text-emerald-800 underline">
                    View Leaderboard 🏆
                  </Link>
                </div>
              </div>
            )}

            {/* Name input modal for game over */}
            {showNameInput && gameOver && (
              <div className="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-lg font-semibold text-yellow-800">
                  Great score! Enter your name for the leaderboard:
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="max-w-xs"
                    maxLength={20}
                    onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  />
                  <Button
                    onClick={handleNameSubmit}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Save to Leaderboard
                  </Button>
                </div>
              </div>
            )}

            {gameOver && !showNameInput && (
              <div className="space-y-4">
                <div className="text-xl font-bold text-red-600">Game Over! Try again for a better feast!</div>
                <div className="text-lg text-emerald-700">
                  Final Score: <span className="text-emerald-800 font-bold">{score}</span>
                </div>
                <div className="text-sm text-emerald-600 space-y-1">
                  <div>Papadams eaten: {gameStats.papadamsEaten}</div>
                  <div>Payasams enjoyed: {gameStats.payasamsEaten}</div>
                  <div>Bananas collected: {gameStats.bananasEaten}</div>
                </div>
                <Button
                  onClick={startGame}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    startGame()
                  }}
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 py-3 touch-manipulation"
                >
                  Start New Feast
                </Button>
                <div>
                  <Link href="/leaderboard" className="text-emerald-600 hover:text-emerald-800 underline">
                    View Leaderboard 🏆
                  </Link>
                </div>
              </div>
            )}

            {gameStarted && !gameOver && (
              <Button
                onClick={resetGame}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  resetGame()
                }}
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-transparent touch-manipulation"
              >
                Reset Game
              </Button>
            )}
          </div>

          <Card className="mt-8 p-6 bg-white/80 backdrop-blur max-w-2xl border-emerald-200">
            <h3 className="text-lg font-bold mb-4 text-center text-emerald-800">How to Play</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-emerald-700">Controls:</h4>
                <ul className="space-y-1 text-emerald-600">
                  <li>🖥️ Desktop: Arrow keys</li>
                  <li>📱 Mobile: Swipe to move</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-emerald-700">Foods:</h4>
                <ul className="space-y-1 text-emerald-600">
                  <li>🍪 Papadam: +1 point</li>
                  <li>🍜 Payasam: +5 points</li>
                  <li>🍌 Banana: +3 points + speed boost</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12 text-emerald-600">
          <p className="text-sm">🌺 Celebrating the harvest festival of Kerala 🌺</p>
        </div>
      </div>
    </div>
  )
}

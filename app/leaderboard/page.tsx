"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LeaderboardEntry {
  name: string
  score: number
  date: string
}

export default function LeaderboardPage(): JSX.Element {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard')
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setLeaderboard(data)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard from API:', error)
      }
      
      // Fallback to localStorage for local development
      try {
        const localData = localStorage.getItem("onam-snake-leaderboard")
        if (localData) {
          setLeaderboard(JSON.parse(localData))
        }
      } catch (error) {
        console.error('Error reading from localStorage:', error)
      }
    }
    
    fetchLeaderboard()
  }, [])

  const getRankEmoji = (index: number): string => {
    switch (index) {
      case 0: return "🥇"
      case 1: return "🥈"
      case 2: return "🥉"
      default: return `${index + 1}.`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-yellow-50 to-orange-50 p-4">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,_#fbbf24_2px,_transparent_2px),radial-gradient(circle_at_80%_80%,_#34d399_2px,_transparent_2px),radial-gradient(circle_at_40%_60%,_#f97316_1px,_transparent_1px)] bg-[length:80px_80px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-emerald-800 mb-4">
            🏆 Onam Snake Leaderboard 🏆
          </h1>
          <p className="text-lg text-emerald-700 mb-6">
            Top players in the festive snake game!
          </p>
          
          <div className="flex justify-center gap-4 mb-6 flex-wrap">
            <Link href="/">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                ← Back to Game
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {leaderboard.length === 0 ? (
            <Card className="p-8 bg-white/90 backdrop-blur border-emerald-200 text-center">
              <div className="text-2xl font-bold text-emerald-800 mb-4">
                No scores yet! 🐍
              </div>
              <div className="text-emerald-600 mb-6">
                Be the first to set a high score and claim your place on the leaderboard.
              </div>
              <Link href="/">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Play Now
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-emerald-600 mb-4">
                Showing top {leaderboard.length} players
              </div>
              {leaderboard.map((entry, index) => (
                <Card 
                  key={`${entry.name}-${entry.score}-${entry.date}`}
                  className={`p-4 bg-white/90 backdrop-blur border-emerald-200 ${
                    index < 3 ? 'ring-2 ring-yellow-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-emerald-800 min-w-[3rem]">
                        {getRankEmoji(index)}
                      </div>
                      <div>
                        <div className="font-bold text-emerald-800 text-lg">
                          {entry.name}
                        </div>
                        <div className="text-sm text-emerald-600">
                          {entry.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-800">
                        {entry.score}
                      </div>
                      <div className="text-sm text-yellow-600">
                        points
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <Card className="p-6 bg-white/80 backdrop-blur max-w-2xl mx-auto border-emerald-200">
            <h3 className="text-lg font-bold mb-4 text-emerald-800">How to get on the leaderboard</h3>
            <div className="text-sm text-emerald-600 space-y-2">
              <div>🎮 Enter your name before playing</div>
              <div>🍪 Collect papadams, payasams, and bananas</div>
              <div>📈 Beat your high score to climb the rankings</div>
              <div>🏆 Top 10 scores are saved automatically</div>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8 text-emerald-600">
          <p className="text-sm">🌺 Celebrating the harvest festival of Kerala 🌺</p>
        </div>
      </div>
    </div>
  )
}

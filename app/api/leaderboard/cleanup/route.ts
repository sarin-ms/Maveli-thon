import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface LeaderboardEntry {
  name: string
  score: number
  date: string
}

const LEADERBOARD_KEY = 'onam-snake-leaderboard'

export async function POST() {
  try {
    // Get current leaderboard
    const leaderboard = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY) || []
    
    // Create a map to keep only the highest score for each player
    const playerBestScores = new Map<string, LeaderboardEntry>()
    
    leaderboard.forEach(entry => {
      const playerKey = entry.name.toLowerCase()
      const existing = playerBestScores.get(playerKey)
      
      if (!existing || entry.score > existing.score) {
        playerBestScores.set(playerKey, entry)
      }
    })
    
    // Convert back to array and sort
    const cleanedLeaderboard = Array.from(playerBestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
    
    // Save cleaned leaderboard
    await kv.set(LEADERBOARD_KEY, cleanedLeaderboard)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leaderboard cleaned up',
      before: leaderboard.length,
      after: cleanedLeaderboard.length,
      leaderboard: cleanedLeaderboard
    })
  } catch (error) {
    console.error('Error cleaning leaderboard:', error)
    return NextResponse.json({ error: 'Failed to cleanup leaderboard' }, { status: 500 })
  }
}

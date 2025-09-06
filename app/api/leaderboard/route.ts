import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

interface LeaderboardEntry {
  name: string
  score: number
  date: string
}

const LEADERBOARD_KEY = 'onam-snake-leaderboard'

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    // Try to get from Vercel KV
    const leaderboard = await kv.get<LeaderboardEntry[]>(LEADERBOARD_KEY)
    return leaderboard || []
  } catch (error) {
    console.warn('KV not available (likely local development):', error)
    // Return empty array for local development - client will handle localStorage
    return []
  }
}

async function setLeaderboard(leaderboard: LeaderboardEntry[]): Promise<boolean> {
  try {
    // Try to set in Vercel KV
    await kv.set(LEADERBOARD_KEY, leaderboard)
    return true
  } catch (error) {
    console.warn('KV not available (likely local development):', error)
    return false
  }
}

export async function GET() {
  try {
    const leaderboard = await getLeaderboard()
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error)
    return NextResponse.json({ error: 'Failed to read leaderboard' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, score } = body

    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const leaderboard = await getLeaderboard()
    
    const newEntry: LeaderboardEntry = {
      name: name.trim(),
      score,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    leaderboard.push(newEntry)
    
    // Sort by score (highest first) and keep only top 10
    leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
    const topLeaderboard = leaderboard.slice(0, 10)
    
    const saved = await setLeaderboard(topLeaderboard)
    
    return NextResponse.json({ 
      success: true, 
      leaderboard: topLeaderboard,
      kvAvailable: saved
    })
  } catch (error) {
    console.error('Error in POST /api/leaderboard:', error)
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await setLeaderboard([])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/leaderboard:', error)
    return NextResponse.json({ error: 'Failed to clear leaderboard' }, { status: 500 })
  }
}

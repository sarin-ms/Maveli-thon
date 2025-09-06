# Onam Snake Game 🐍

*A festive snake game celebrating the Kerala harvest festival of Onam, built with Next.js and featuring custom graphics.*

---

## Table of Contents

- [About](#about)  
- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [Installation & Setup](#installation--setup)  
- [Deployment to Vercel](#deployment-to-vercel)
- [Game Controls](#game-controls)
- [Leaderboard System](#leaderboard-system)
- [Project Structure](#project-structure) 

---

## About

*Onam Snake Game* is a modern twist on the classic Snake game, featuring beautiful Onam-themed graphics, custom Maveli snake head, traditional Kerala foods, and a global leaderboard system powered by Vercel KV.

---

## Tech Stack

- **Framework:** Next.js 14 
- **Languages:** TypeScript  
- **UI Framework:** Tailwind CSS + shadcn/ui
- **Storage:** Vercel KV (Redis) for production, localStorage fallback
- **Deployment:** Vercel
- **Audio:** HTML5 Audio API with traditional Chenda sounds

---

## Features

- 🐍 Custom Maveli snake head with emoji body segments
- 🎯 Multiple food types (papadams, payasams, bananas) with different points
- 📱 Mobile-responsive with touch controls and swipe gestures
- 🏆 Global leaderboard with persistent storage (Vercel KV)
- 🎵 Traditional Chenda sound effects
- 🌺 Beautiful Onam-themed UI with festive Kerala colors
- 👤 Username system with score tracking
- 🎮 Smooth canvas-based gameplay with 60fps rendering

---

## Installation & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd Mavelii-thon

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

> **Note**: In local development, the leaderboard uses localStorage as a fallback since Vercel KV is not available locally.

---

## Deployment to Vercel

### Step 1: Deploy to Vercel
```bash
npm install -g vercel
vercel deploy
```

### Step 2: Add Vercel KV Database
1. Go to your project dashboard on [Vercel](https://vercel.com)
2. Navigate to the "Storage" tab
3. Click "Create Database" 
4. Select "KV (Redis)"
5. Choose a database name (e.g., `onam-snake-leaderboard`)
6. Click "Create"

### Step 3: Connect KV to Your Project
1. In the KV database page, click "Connect Project"
2. Select your project
3. Vercel will automatically set the environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 4: Redeploy
```bash
vercel --prod
```

Your leaderboard will now work globally across all users!

---

## Game Controls

### Desktop:
- **Arrow Keys**: Move snake (↑↓←→)
- **Space**: Start/Pause game

### Mobile:
- **Swipe**: Move snake (up/down/left/right)
- **Tap**: Start/Pause game

---

## Leaderboard System

- **Production**: Uses Vercel KV (Redis) for persistent, global storage
- **Development**: Falls back to localStorage for local testing
- **Features**: 
  - Top 10 scores automatically maintained
  - Player names with timestamps
  - Real-time updates across all users
  - Secure API endpoints

## Food Types & Scoring

| Food | Emoji | Points | Rarity | Special Effect |
|------|-------|--------|--------|----------------|
| Papadam | 🟡 | 1 | Common (60%) | Basic growth |
| Payasam | 🥛 | 5 | Uncommon (25%) | High points |
| Banana | 🍌 | 3 | Rare (15%) | Speed boost |bash
# Clone the repository
git clone https://github.com/sarin‑ms/Maveli‑thon.git
cd Maveli‑thon

# Install dependencies
npm install
# or
yarn install

# Run in development mode
npm run dev
# or
yarn dev

# Build and preview production version
npm run build
npm run start
```

---

## Project Structure

```
Maveli‑thon/
├─ app/                 # Core Next.js application files
├─ components/          # Reusable UI components
├─ hooks/               # Custom React hooks
├─ lib/                 # Utility modules and helpers
├─ public/              # Static assets (images, icons, etc.)
├─ styles/              # CSS and styling files
├─ .gitignore           # Git ignore rules
├─ components.json      # (Context-specific metadata)
├─ next.config.mjs      # Next.js configuration
├─ package.json         # Project dependencies and scripts
├─ postcss.config.mjs   # PostCSS settings
├─ tsconfig.json        # TypeScript configuration
└─ package-lock.json    # Lockfile for dependencies
```
# Maveli‑thon

*A modern, modular Next.js-powered project blending creativity and structure.*

---

## Table of Contents

- [About](#about)  
- [Tech Stack](#tech-stack)  
- [Features](#features)  
- [Installation & Setup](#installation--setup)  
- [Project Structure](#project-structure) 

---

## About

*Snake and Papadam* is a Next.js project built with TypeScript, and modern styling workflows. 

---

## Tech Stack

- **Framework:** Next.js  
- **Languages:** TypeScript  
- **Styling:** CSS (PostCSS configured)  
   - `postcss.config.mjs` – PostCSS setup  
- **Folders:**  
   - `app/` – core application entry  
   - `components/` – reusable UI components  
   - `hooks/` – custom React hooks  
   - `lib/` – utility or helper modules  
   - `styles/` – global and component-specific styles  
   - `public/` – static assets (images, icons, etc.)

---

## Features

- Modular component design for scalable UI development  
- TypeScript-first approach for type safety and developer confidence  
- Custom hooks and utilities for cleaner state management and logic reuse  
- PostCSS integration for future-proof styling workflows  
- Static and public assets ready to support rich media experiences

---

## Installation & Setup

```bash
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
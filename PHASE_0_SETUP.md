# 🚀 PHASE 0: PROJECT SETUP - Schritt für Schritt

**Ziel:** Dev-Environment aufsetzen mit Vite/React/TypeScript/boardgame.io  
**Zeit:** 2-3 Tage  
**After Phase 0:** `pnpm run dev` works, alle Tools funktionieren

---

## ✅ Schritt 0.1: Vite/React/TypeScript Projekt Setup

### Kommandos

```bash
cd /Users/ulrich.frank/Dev/private/molthar/game-web

# Initialisiere leeres React/TypeScript Vite Projekt
pnpm create vite . --template react-ts

# Install Dependencies
pnpm install

# Test: Start dev server
pnpm run dev
```

### Was wird erwartet?

```
✅ VITE v5.x.x ready in 50 ms
✅ Local:   http://localhost:5173/
✅ Browser öffnet http://localhost:5173 - React App sichtbar
✅ npm run dev läuft ohne Fehler
```

### Verifikation

```bash
# Terminal 1
pnpm run dev

# Terminal 2 (in neuem Terminal)
curl http://localhost:5173/

# Sollte HTML zurückgeben mit <div id="root">
```

**Checkpoint:** Wenn Dev-Server läuft → ✅ **GO to 0.2**

---

## ✅ Schritt 0.2: Dependencies installieren

### Schritt 0.2.1: UI & Styling Libraries

```bash
cd game-web

# React & UI
pnpm install react react-dom react-router-dom
pnpm install zustand  # State management

# Styling
pnpm install -D tailwindcss postcss autoprefixer

# Components
pnpm install shadcn-ui @radix-ui/react-* lucide-react

# Init tailwind
npx tailwindcss init -p
```

**Was wird erstellt:**
- `tailwind.config.js` — Tailwind configuration
- `postcss.config.js` — PostCSS configuration

### Schritt 0.2.2: Testing & Dev Tools

```bash
# Testing
pnpm install -D vitest @testing-library/react @testing-library/jest-dom
pnpm install -D @vitest/ui

# Code Quality
pnpm install -D typescript eslint prettier eslint-config-prettier
pnpm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Types
pnpm install -D @types/react @types/react-dom @types/node
```

### Schritt 0.2.3: Game Engine

```bash
pnpm install boardgame.io
pnpm install -D @types/boardgame.io
```

### Schritt 0.2.4: Verifikation

```bash
# Check alle packages installiert
pnpm ls | grep -E "tailwindcss|boardgame|vitest|eslint"

# Sollte zeigen (mindestens):
# tailwindcss@3.x.x
# boardgame.io@0.x.x
# vitest@x.x.x
# eslint@x.x.x
```

**Checkpoint:** Alle Dependencies installiert → ✅ **GO to 0.3**

---

## ✅ Schritt 0.3: Configuration Files

### Datei 1: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Game colors
        slate: {
          900: '#0f172a',
          800: '#1e293b',
        }
      },
    },
  },
  plugins: [],
}
```

### Datei 2: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  }
})
```

### Datei 3: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

### Datei 4: `.eslintrc.json`

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["warn"]
  }
}
```

### Datei 5: `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Datei 6: `tsconfig.json` (update)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "modifyEsc": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Aliases (optional) */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Datei 7: `package.json` - Scripts

Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Datei 8: `.gitignore`

```
# dependencies
node_modules/
/.pnpm-store

# production
/dist

# testing
/coverage
/test-results

# misc
.DS_Store
*.pem
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*
lerna-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

### Verifikation

```bash
# Build & Type Check
pnpm run type-check
# ✅ Should complete without errors

pnpm run build
# ✅ dist/ folder created with files

pnpm run lint
# ✅ No critical linting errors

# Dev Server
pnpm run dev
# ✅ http://localhost:5173 works
```

**Checkpoint:** Alle Configs in place, Tools funktionieren → ✅ **GO to 0.4**

---

## ✅ Schritt 0.4: Folder Structure & TypeScript Types

### Schritt 0.4.1: Create Folder Structure

```bash
cd game-web/src

# Create folders
mkdir -p game/{engine,moves,abilities}
mkdir -p components/{cards,portals,lobby,board}
mkdir -p pages
mkdir -p hooks
mkdir -p lib/utils
mkdir -p styles
mkdir -p test

# Create test setup file
cat > test/setup.ts << 'EOF'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})
EOF
```

### Schritt 0.4.2: Create `src/lib/types.ts`

```typescript
// Cost Components (9 types from card-manager)
export type CostComponent =
  | { type: 'number'; value: number }
  | { type: 'nTuple'; n: number }
  | { type: 'sumAnyTuple'; sum: number }
  | { type: 'sumTuple'; min: number; max: number }
  | { type: 'run'; length: number }
  | { type: 'evenTuple'; count: number }
  | { type: 'oddTuple'; count: number }
  | { type: 'drillingChoice'; val1: number; val2: number }
  | { type: 'none' }

// Ability Types (14 types)
export enum AbilityType {
  // Red Abilities (instant, once per card)
  ThreeExtraActions = 'threeExtraActions',
  NextPlayerOneExtraAction = 'nextPlayerOneExtraAction',
  DiscardOpponentCharacter = 'discardOpponentCharacter',
  StealOpponentHandCard = 'stealOpponentHandCard',
  TakeBackPlayedPearl = 'takeBackPlayedPearl',
  
  // Blue Abilities (persistent)
  OnesCanBeEights = 'onesCanBeEights',
  ThreesCanBeAny = 'threesCanBeAny',
  TradeTwoForDiamond = 'tradeTwoForDiamond',
  HandLimitPlusOne = 'handLimitPlusOne',
  OneExtraActionPerTurn = 'oneExtraActionPerTurn',
  ChangeHandActions = 'changeHandActions',
  ProvidesVirtualPearl = 'providesVirtualPearl',
  Irrlicht = 'irrlicht',
  
  // None
  None = 'none'
}

// Pearl Card
export interface PearlCard {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  hasSwapSymbol: boolean
}

// Character Card
export interface CharacterCard {
  id: string
  name: string
  cost: CostComponent[]
  powerPoints: number
  diamonds: number
  ability: AbilityType
  imageUrl?: string
}

// Player State
export interface PlayerState {
  id: string
  name: string
  hand: PearlCard[]
  portal: {
    characters: CharacterCard[]
    diamonds: number
    powerPoints: number
  }
  actionCount: number
}

// Game State
export interface IGameState {
  players: PlayerState[]
  currentPlayer: number
  pearlDeck: PearlCard[]
  pearlDiscardPile: PearlCard[]
  characterDeck: CharacterCard[]
  characterDiscardPile: CharacterCard[]
  faceUpPearls: PearlCard[]
  faceUpCharacters: CharacterCard[]
  gamePhase: 'takingActions' | 'discardingExcessCards' | 'gameFinished'
  finalRoundActive: boolean
  finalRoundPlayers: number[]
  winner?: string
  gameLog: GameAction[]
}

// Game Actions
export enum GameActionType {
  TakePearlCard = 'takePearlCard',
  PlaceCharacter = 'placeCharacter',
  ActivateCharacter = 'activateCharacter',
  EndTurn = 'endTurn',
  DiscardCards = 'discardCards',
  UseRedAbility = 'useRedAbility'
}

export interface GameAction {
  type: GameActionType
  playerId: string
  payload?: any
  timestamp: number
}
```

**File location:** `game-web/src/lib/types.ts`

### Schritt 0.4.3: Create `src/lib/constants.ts`

```typescript
import { CharacterCard, PearlCard } from './types'

// Game Rules
export const GAME_RULES = {
  PLAYERS_MIN: 2,
  PLAYERS_MAX: 4,
  HAND_LIMIT: 5,
  POWER_POINTS_TO_TRIGGER_FINAL_ROUND: 12,
  ACTIONS_PER_TURN: 3,
  FACE_UP_PEARLS: 4,
  FACE_UP_CHARACTERS: 2,
  PORTAL_CAPACITY: 2,
} as const

// Create Pearl Deck (56 cards: 7 per value 1-8)
export function createPearlDeck(): PearlCard[] {
  const deck: PearlCard[] = []
  for (let value = 1; value <= 8; value++) {
    for (let i = 0; i < 7; i++) {
      deck.push({
        value: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
        hasSwapSymbol: i === 0, // first card of each value has swap
      })
    }
  }
  // Shuffle
  return deck.sort(() => Math.random() - 0.5)
}

// Load character cards from JSON
export async function loadCharacterCards(): Promise<CharacterCard[]> {
  try {
    const response = await fetch('/cards.json')
    if (!response.ok) throw new Error('Failed to load cards')
    return response.json()
  } catch (error) {
    console.error('Error loading character cards:', error)
    return []
  }
}
```

**File location:** `game-web/src/lib/constants.ts`

### Verifikation

```bash
cd game-web

# Type check
pnpm run type-check
# ✅ Should complete without errors

# Verify imports work
node -e "import('src/lib/types').catch(e => process.exit(1))"
# ✅ No errors

# Lint
pnpm run lint
# ✅ Only warnings if any, no errors
```

**Checkpoint:** Types & Constants definiert, TypeScript happy → ✅ **GO to 0.5**

---

## ✅ Schritt 0.5: Create Sample App Component & Test

### Datei: `src/App.tsx`

```typescript
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <h1 className="text-4xl font-bold text-white mb-8">
          🎮 Portale von Molthar
        </h1>
        
        <div className="bg-slate-700 p-8 rounded-lg shadow-lg">
          <h2 className="text-xl text-white mb-4">Welcome to Web Edition</h2>
          
          <p className="text-slate-300 mb-6">
            Game setup and development environment ready!
          </p>
          
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Count is {count}
          </button>
        </div>

        <p className="text-slate-400 mt-8 text-sm">
          Vite + React + TypeScript + boardgame.io
        </p>
      </div>
    </>
  )
}

export default App
```

### Datei: `src/App.css`

```css
:root {
  color-scheme: light dark;
}

body {
  margin: 0;
  padding: 0;
}

button {
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  transform: scale(1.05);
}
```

### Datei: `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Datei: `src/styles/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  background: linear-gradient(to bottom right, #0f172a, #1e293b);
  color: #f1f5f9;
}
```

### Datei: `src/test/App.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    const heading = screen.getByText(/Portale von Molthar/i)
    expect(heading).toBeDefined()
  })

  it('renders button with initial count', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /Count is 0/i })
    expect(button).toBeDefined()
  })
})
```

### Verifikation

```bash
cd game-web

# Run tests
pnpm run test
# ✅ 1 test passes

# Start dev server
pnpm run dev
# ✅ Opens http://localhost:5173
# ✅ Shows "🎮 Portale von Molthar" header
# ✅ Count button works

# Build
pnpm run build
# ✅ dist/ folder created
# ✅ No build errors

# Build size check
du -h dist/
# ✅ Should be < 100KB
```

**Checkpoint:** App läuft, Tests green, Build erfolgreich → ✅ **PHASE 0 COMPLETE**

---

## 🎯 PHASE 0 COMPLETION CHECKLIST

Vor Phase 1 starten, alle müssen ✅ sein:

```
✅ pnpm install erfolgreich
✅ pnpm run dev startet auf http://localhost:5173
✅ App zeigt "Portale von Molthar" Heading
✅ pnpm run build erstellt dist/ Folder
✅ pnpm run test: 1 test passes
✅ pnpm run type-check: 0 errors
✅ pnpm run lint: 0 critical errors
✅ All configuration files in place
✅ src/lib/types.ts definiert
✅ src/lib/constants.ts definiert
✅ Folder struktur erstellt
✅ .gitignore gesetzt
✅ .env.local (optional) gesetzt
```

---

## 📋 Nächste Schritte

Wenn alle Phase 0 Checkpoints ✅:

1. Commit changes: `git add . && git commit -m "chore(p0): project setup complete"`
2. Starte **Phase 1**: Game Engine Implementation
3. Lese [IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md) Phase 1 section

---

## 🆘 Troubleshooting

### `pnpm run dev` startet nicht

```bash
# Fix 1: Clear cache
rm -rf node_modules .pnpm-store pnpm-lock.yaml
pnpm install

# Fix 2: Check Node version
node --version  # Should be >= 18

# Fix 3: Try with verbose output
pnpm run dev --verbose
```

### TypeScript Fehler in src/lib/types.ts

```bash
# Verify TypeScript installation
pnpm ls typescript

# Run type check
pnpm run type-check

# Check tsconfig.json exists
cat tsconfig.json
```

### Build fehlgeschlagen

```bash
# Clean build
rm -rf dist/
pnpm run build --verbose

# Check for syntax errors
pnpm run type-check
pnpm run lint
```

### Tests nicht aufgeführt

```bash
# Verify Vitest setup
pnpm ls vitest

# Check vitest.config.ts exists
cat vitest.config.ts

# Run with debug
pnpm run test -- --reporter=verbose
```

---

**Estimated Time:** 2-3 hours  
**Difficulty:** Beginner (mostly config)  
**Next Phase:** [Phase 1 - Game Engine](../IMPLEMENTATION_ROADMAP.md#phase-1-game-engine-rules-10-12-tage)

# 🚀 Implementierungs-Roadmap: Portale von Molthar Web Edition

**Basierend auf:** `game-web-spec.md`  
**Ziel:** Testbare, buildbare Schritte mit klaren Deliverables  
**Timeline:** 37-42 Tage (6-7 Wochen) für vollständiges Projekt

---

## 📋 Planungs-Prinzipien

1. **Build-Test-Deploy Cycle** — Nach jedem Schritt läuft die App
2. **Testbar** — Jeder Schritt hat automatisierte oder manuelle Tests
3. **Integriert** — Features bauen aufeinander auf, keine Doppelarbeit
4. **MVP-First** — Core vor Polish, Multiplayer am Ende
5. **Failure Recovery** — Bei Fehlern: Rollback & Alternative

---

## 🎯 High-Level Phasen

| Phase | Fokus | Tage | Milestones |
|-------|-------|------|-----------|
| **P0** | Setup | 2-3 | Dev Env bereit, Vite + TS + boardgame.io |
| **P1** | Game Engine | 10-12 | Spiellogik 100% + Unit Tests ≥80% |
| **P2** | UI & Single-Player | 10 | Responsive UI, lokal 2-Player spielbar |
| **P3** | Multiplayer & Lobby | 10 | Netzwerk funktioniert, matchmaking |
| **P4** | Polish & Deploy | 5-7 | Produktiv auf Vercel, E2E Tests |

**Total: 37-42 Tage** (mit Puffer für Debugging/Iteration)

---

## 🔧 PHASE 0: PROJECT SETUP (2-3 Tage)

### Schritt P0.1: Vite/React/TypeScript Projekt initialisieren

**Ziel:** Dev-Environment mit allen Tools läuft

```bash
cd game-web
pnpm create vite . --template react-ts
pnpm install react react-dom
pnpm install -D typescript tailwindcss postcss autoprefixer eslint prettier
pnpm install shadcn-ui @radix-ui/react-* lucide-react
```

**Folder-Struktur:**
```
game-web/
├── src/
│   ├── game/           # boardgame.io Game Engine
│   ├── components/     # React UI Components
│   ├── hooks/          # Custom React Hooks
│   ├── lib/            # Utilities, Types, Constants
│   ├── pages/          # Page Components
│   ├── styles/         # Global CSS
│   └── App.tsx
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

**Test:**
```bash
pnpm run dev
# ✅ http://localhost:5173 lädt
# ✅ React DevTools zeigt App
# ✅ Keine Console Errors
```

**Deliverable:** Funktionales React + TypeScript + Tailwind Setup

---

### Schritt P0.2: Dependencies & Configuration

**Abhängigkeiten installieren:**
```bash
# Game Engine
pnpm install boardgame.io

# UI/Components
pnpm install react-router-dom zustand

# Dev Tools
pnpm install -D vitest @testing-library/react @testing-library/jest-dom
pnpm install -D @types/node
pnpm install -D typescript prettier eslint eslint-config-prettier

# Optional: Networking/Utils
pnpm install axios uuid
```

**Configuration Files:**

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist', sourcemap: true }
})
```

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts']
  }
})
```

**package.json Scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

**Test:**
```bash
pnpm run build
# ✅ dist/ Ordner erstellt
# ✅ dist/index.html existiert
# ✅ Keine Build Errors

pnpm run test
# ✅ Vitest startet ohne Errors
```

**Deliverable:** Alle Dependencies installiert, Build-Pipeline funktioniert

---

### Schritt P0.3: TypeScript Types & Interfaces

**Datei:** `src/lib/types.ts`

```typescript
/* ==================== GAME TYPES ==================== */

// Cost Components (9 types from card-manager)
export type CostComponent =
  | { type: 'nTuple'; n: number } // n identical values
  | { type: 'sumAnyTuple'; sum: number } // any values summing to sum
  | { type: 'sumTuple'; min: number; max: number } // values summing to min-max range
  | { type: 'run'; length: number } // consecutive values
  | { type: 'evenTuple'; count: number } // even values only
  | { type: 'oddTuple'; count: number } // odd values only
  | { type: 'drillingChoice'; val1: number; val2: number } // val1 or val2 count
  | { type: 'number'; value: number } // exact fixed number
  | { type: 'none' }; // no cost

// Abilities (14 types)
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

// Character Card
export interface CharacterCard {
  id: string;
  name: string;
  cost: CostComponent[];
  powerPoints: number;
  diamonds: number;
  ability: AbilityType;
  imageUrl?: string;
}

// Pearl Card
export interface PearlCard {
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  hasSwapSymbol: boolean; // 1 per value in full deck
}

// Player State
export interface PlayerState {
  id: string;
  name: string;
  hand: PearlCard[];
  portal: {
    characters: CharacterCard[];
    diamonds: number;
    powerPoints: number;
  };
  actionCount: number;
}

// Game State
export interface IGameState {
  players: PlayerState[];
  currentPlayer: number;
  pearlDeck: PearlCard[];
  pearlDiscardPile: PearlCard[];
  characterDeck: CharacterCard[];
  characterDiscardPile: CharacterCard[];
  faceUpPearls: PearlCard[];
  faceUpCharacters: CharacterCard[];
  gamePhase: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  finalRoundActive: boolean;
  finalRoundPlayers: number[];
  winner?: string;
  gameLog: GameAction[];
}

// Game Actions (moves)
export enum GameActionType {
  TakePearlCard = 'takePearlCard',
  PlaceCharacter = 'placeCharacter',
  ActivateCharacter = 'activateCharacter',
  EndTurn = 'endTurn',
  DiscardCards = 'discardCards',
  UseRedAbility = 'useRedAbility'
}

export interface GameAction {
  type: GameActionType;
  playerId: string;
  payload?: any;
  timestamp: number;
}
```

**Test:**
```bash
pnpm run build
# ✅ tsc --noEmit passes (no type errors)
```

**Deliverable:** TypeScript Types 100% definiert, keine Typing-Fehler

---

### Schritt P0.4: Game Constants & Utilities

**Datei:** `src/lib/constants.ts`

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
  PORTAL_CAPACITY: 2 // max 2 characters
}

// Pearl Deck Setup (56 cards total: 7 per value 1-8)
export function createPearlDeck(): PearlCard[] {
  const deck: PearlCard[] = []
  for (let value = 1; value <= 8; value++) {
    for (let i = 0; i < 7; i++) {
      deck.push({
        value: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
        hasSwapSymbol: i === 0 // first card of each value has swap
      })
    }
  }
  return deck.sort(() => Math.random() - 0.5) // shuffle
}

// Utility: Load character cards from JSON
export async function loadCharacterCards(): Promise<CharacterCard[]> {
  const response = await fetch('/cards.json')
  return response.json()
}
```

**Test:**
```bash
pnpm run dev
# ✅ Constants importierbar, keine Fehler
# ✅ createPearlDeck() erzeugt 56 Karten
```

**Deliverable:** Constants + Utilities definiert, loadable

---

### Schritt P0.5: Phase 0 Completion Checklist

```
✅ Node/pnpm installiert
✅ Vite React TypeScript Projekt erstellt
✅ Alle Dependencies installiert
✅ pnpm run dev funktioniert
✅ pnpm run build funktioniert
✅ TypeScript Types definiert (types.ts)
✅ Constants & Utilities (constants.ts)
✅ VSCode/IDE lädt Projekt richtig
✅ Git .gitignore richtig konfiguriert
✅ Environment Variables dokumentiert
```

**GO/NO-GO Checkpoint:** Wenn alle Punkte ✅, starte Phase 1. Wenn nicht: Debuggen!

---

## 🎮 PHASE 1: GAME ENGINE & RULES (10-12 Tage)

### Schritt P1.1: Game Setup & Initial State

**Datei:** `src/game/gameEngine.ts`

```typescript
import { IGameState, GameAction, GameActionType, PlayerState } from '../lib/types'
import { GAME_RULES, createPearlDeck } from '../lib/constants'

export class GameEngine {
  // Initialize game with 2-4 players
  static initializeGame(playerNames: string[], characterCards: any[]): IGameState {
    const shuffledDeck = createPearlDeck()
    
    return {
      players: playerNames.map((name, idx) => ({
        id: `player-${idx}`,
        name,
        hand: [],
        portal: { characters: [], diamonds: 0, powerPoints: 0 },
        actionCount: GAME_RULES.ACTIONS_PER_TURN
      })),
      currentPlayer: 0,
      pearlDeck: shuffledDeck.slice(GAME_RULES.FACE_UP_PEARLS),
      pearlDiscardPile: [],
      characterDeck: characterCards.sort(() => Math.random() - 0.5),
      characterDiscardPile: [],
      faceUpPearls: shuffledDeck.slice(0, GAME_RULES.FACE_UP_PEARLS),
      faceUpCharacters: [], // will be filled by initial draws
      gamePhase: 'takingActions',
      finalRoundActive: false,
      finalRoundPlayers: [],
      gameLog: []
    }
  }

  // Main game loop: process action and return new state
  static processAction(state: IGameState, action: GameAction): IGameState {
    // Validate action
    if (state.gamePhase === 'gameFinished') {
      throw new Error('Game is finished')
    }

    const newState = { ...state }

    switch (action.type) {
      case GameActionType.TakePearlCard:
        return this.takePearlCard(newState, action.playerId, action.payload)
      case GameActionType.PlaceCharacter:
        return this.placeCharacter(newState, action.playerId, action.payload)
      case GameActionType.ActivateCharacter:
        return this.activateCharacter(newState, action.playerId, action.payload)
      case GameActionType.EndTurn:
        return this.endTurn(newState, action.playerId)
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private static takePearlCard(state: IGameState, playerId: string, { cardIndex }: any) {
    // Validation
    const player = state.players.find(p => p.id === playerId)!
    if (state.currentPlayer !== state.players.indexOf(player)) {
      throw new Error('Not your turn')
    }
    if (player.actionCount <= 0) {
      throw new Error('No actions remaining')
    }

    // Take card from face-up
    const card = state.faceUpPearls[cardIndex]
    player.hand.push(card)
    state.faceUpPearls.splice(cardIndex, 1)

    // Refill from deck
    if (state.pearlDeck.length > 0) {
      state.faceUpPearls.push(state.pearlDeck.shift()!)
    }

    player.actionCount--
    return state
  }

  // ... (other methods: placeCharacter, activateCharacter, etc.)
}
```

**Test:**
```bash
pnpm run test
# ✅ Game initialisiert mit 2+ Spielern
# ✅ 4 Perlen sichtbar
# ✅ currentPlayer = 0
# ✅ actionCount = 3
```

**Deliverable:** Game Setup komplett, initialisierbar

---

### Schritt P1.2-P1.8: Game Rules Implementation

*(Detaillierte Implementierung für jede Regel – siehe full implementation_plan.md)*

**Krit Features (Schritte P1.2-P1.8):**
- P1.2: Pearl & Character Decks
- P1.3: Take Pearl Card (move)
- P1.4: Place Character (move)
- P1.5: **Cost Validator (CRITICAL!)**
- P1.6: Activate Character & Abilities
- P1.7: All 14 Ability Types
- P1.8: Turn End & Hand Limit
- P1.9: Final Round & Winner Determination
- P1.10: Unit Tests ≥80% Coverage

**Test nach jedem Schritt:**
```bash
pnpm run test
# ✅ Alle Game Rules testen
# ✅ ≥80% Code Coverage
# ✅ Deterministische Moves
```

**Deliverable nach Phase 1:** Komplettes Spielsystem spielbar (2-4 Player lokal)

---

## 🎨 PHASE 2: UI COMPONENTS & SINGLE-PLAYER (10 Tage)

### Schritt P2.1: Game Board Layout

**Datei:** `src/components/GameBoard.tsx`

```typescript
import React from 'react'
import { IGameState } from '../lib/types'

interface GameBoardProps {
  gameState: IGameState
  onMove: (action: GameAction) => void
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameState, onMove }) => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Opponent Portals (Top) */}
      <div className="flex justify-between p-4">
        {gameState.players.slice(1).map(player => (
          <OpponentPortal key={player.id} player={player} />
        ))}
      </div>

      {/* Table Center (Pearls + Characters) */}
      <div className="flex-1 flex items-center justify-center">
        <TableCenter
          faceUpPearls={gameState.faceUpPearls}
          faceUpCharacters={gameState.faceUpCharacters}
          onTakePearl={idx => onMove({ type: 'takePearlCard', payload: { index: idx } })}
          onPlaceCharacter={idx => onMove({ type: 'placeCharacter', payload: { index: idx } })}
        />
      </div>

      {/* Your Portal + Actions (Bottom) */}
      <div className="border-t border-slate-700 p-4">
        <YourPortal
          player={gameState.players[0]}
          actionsRemaining={gameState.players[0].actionCount}
          onAction={onMove}
        />
      </div>
    </div>
  )
}
```

**Test (Manual):**
```
✅ Layout responsive (mobile/tablet/desktop)
✅ All portals visible
✅ Buttons clickable
```

**Deliverable:** GameBoard UI responsive, integrierbar

---

### Schritt P2.2-P2.7: UI Components & Responsive Design

*(See full implementation_plan.md for all components)*

**Components to build:**
- P2.2: PearlCard, CharacterCard, CardList
- P2.3: PlayerPortal (own + opponents)
- P2.4: Hand Display & Selection
- P2.5: Action Panel & Buttons
- P2.6: Single-Player Game Integration
- P2.7: Responsive Breakpoints
- P2.8: Game State Debugger

**Test after Phase 2:**
```bash
pnpm run dev
# ✅ GameBoard loads without errors
# ✅ Full game playable (2 players locally)
# ✅ Responsive on 375px, 768px, 1920px screens
# ✅ Touch-friendly on mobile
```

**Deliverable after Phase 2:** Full UI mit Single-Player game

---

## 🌐 PHASE 3: LOBBY & MULTIPLAYER (10 Tage)

### Schritt P3.1: boardgame.io Server Setup

**Datei:** `server/index.ts`

```typescript
import { Server } from 'boardgame.io/server'
import { MoltharGame } from '../src/game/gameEngine'

const server = new Server({
  games: [MoltharGame]
})

server.run(8000, () => {
  console.log('boardgame.io server running on http://localhost:8000')
})
```

**Test:**
```bash
node server/index.ts &
# ✅ Server startet auf port 8000
# ✅ curl http://localhost:8000/api/games/
# ✅ GET /games returns ["molthar"]
```

**Deliverable:** Server läuft, API funktioniert

---

### Schritt P3.2-P3.5: Lobby & Multiplayer

*(See full implementation_plan.md)*

**Features:**
- P3.2: LobbyClient Integration
- P3.3: Lobby Screen (Create/Join Game)
- P3.4: Multiplayer Client Connection
- P3.5: Game Over & Rematch

**Test after Phase 3:**
```bash
# Terminal 1
node server/index.ts

# Terminal 2
pnpm run dev

# Browser 1 & 2: localhost:5173
# ✅ Create Game → Get matchID
# ✅ Join Game with matchID + playerID
# ✅ 2 Players connected
# ✅ Player 1 makes move → Player 2 sees update in real-time
# ✅ Game ends → Both see winner
```

**Deliverable after Phase 3:** Vollständiges Multiplayer-System

---

## 🧪 PHASE 4: POLISH & TESTING (5-7 Tage)

### Schritt P4.1: Error Handling & Reconnection

**Features:**
- Network errors → "Connecting..." message
- Auto-reconnect after 3s
- Invalid credentials → Proper error message
- Connection state UI

**Test:**
```
✅ Disconnect Player 1 → P2 sees "Opponent disconnected"
✅ Reconnect P1 → Game resumes
✅ Invalid credentials → 401 error handled
```

---

### Schritt P4.2-P4.5: Integration, E2E, Performance, Deploy

*(See full implementation_plan.md)*

**Final Tests:**
- Integration Tests (Vitest): ≥80% coverage
- E2E Tests (Playwright): Full game flows
- Performance (Lighthouse): >90 score
- Bundle Size: <500KB gzipped
- Deploy: Vercel, zero-downtime

**Deliverable after Phase 4:** Production-ready app on Vercel

---

## 📊 TESTING STRATEGY

| Phase | Test Type | Tools | Coverage |
|-------|-----------|-------|----------|
| P0 | Manual | Browser | Setup only |
| P1 | Unit | Vitest | ≥80% |
| P2 | Component | Testing Library | ≥70% |
| P3 | Integration | Playwright | ≥70% |
| P4 | E2E + Performance | Playwright + Lighthouse | Full flow |

---

## 🚨 CRITICAL COMPONENTS

**Must Get Right:**
1. **Cost Validator (P1.5)** — Handles 9 types, diamonds, abilities
2. **Ability System (P1.7)** — 14 ability types with correct logic
3. **Game State Immutability (P1)** — No mutations, deterministic
4. **Networking (P3)** — Real-time sync, credentials, rollback

**High Risk:**
- Responsive layout on mobile (test early)
- Cost validation edge cases (test thoroughly)
- Networking lag/disconnects (test with throttling)

---

## 📋 DEPENDENCIES & SEQUENCING

```
P0.1 → P0.2 → P0.3 → P0.4 → P0.5 ✓
                        ↓
P1.1 → P1.2 → P1.3 → ... → P1.10 ✓
                        ↓
P2.1 → P2.2 → ... → P2.8 ✓ (parallel with P3.1)
                        ↓
P3.1 → P3.2 → ... → P3.5 ✓
                        ↓
P4.1 → P4.2 → ... → P4.5 ✓ LAUNCH!
```

**Can Run Parallel:**
- P2 (UI) and P3.1 (Server) can start once P1.10 (Engine) is done

---

## ✅ GO/NO-GO CHECKPOINTS

After each phase, ask:

1. **Phase 0:** Can I build and run `pnpm run dev`? → **YES → GO**
2. **Phase 1:** Can I play a full game locally (2 players)? → **YES → GO**
3. **Phase 2:** Can I see the game board with UI, fully responsive? → **YES → GO**
4. **Phase 3:** Can 2 players connect and play together? → **YES → GO**
5. **Phase 4:** Does the app work on Vercel with no errors? → **YES → LAUNCH!**

**If NO to any checkpoint:** Debug, don't proceed.

---

## 📁 Project Structure (Final)

```
game-web/
├── src/
│   ├── game/
│   │   ├── gameEngine.ts       # P1: Game rules
│   │   ├── moves.ts            # P1: Move validation
│   │   └── abilities.ts        # P1: Ability logic
│   ├── components/
│   │   ├── GameBoard.tsx       # P2: Main UI
│   │   ├── cards/              # P2: Card components
│   │   ├── portals/            # P2: Player portals
│   │   └── lobby/              # P3: Lobby UI
│   ├── pages/
│   │   ├── LobbyPage.tsx       # P3: Matchmaking
│   │   ├── GamePage.tsx        # P2: Game board
│   │   └── GameOverPage.tsx    # P3: Results
│   ├── hooks/
│   │   ├── useGame.ts          # Game state
│   │   └── useNetworking.ts    # P3: Multiplayer
│   ├── lib/
│   │   ├── types.ts            # P0: TypeScript types
│   │   ├── constants.ts        # P0: Game constants
│   │   └── utils.ts            # Helpers
│   ├── styles/
│   │   └── globals.css         # Tailwind
│   └── App.tsx                 # Root component
├── server/
│   └── index.ts                # P3: boardgame.io server
├── tests/
│   ├── game.test.ts            # P1: Game engine tests
│   └── integration.test.ts     # P4: Integration tests
├── e2e/
│   └── game.spec.ts            # P4: E2E (Playwright)
├── public/
│   ├── cards.json              # Character card data
│   └── index.html
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🎯 Summary

- **Phase 0:** 2-3 Tage → Setup
- **Phase 1:** 10-12 Tage → Engine (CRITICAL)
- **Phase 2:** 10 Tage → UI
- **Phase 3:** 10 Tage → Multiplayer
- **Phase 4:** 5-7 Tage → Polish & Deploy
- **Total:** 37-42 Tage

**Each phase has testable milestones. Move only when checkpoint is GO.**

**Next Step:** Start Phase 0 – Initialize game-web project!

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portale von Molthar** is a digital multiplayer adaptation of the card game "Portale von Molthar." It's a turn-based strategy game where players activate character cards using pearl cards (numbered 1-8) to gain power points. The web application uses **boardgame.io** for multiplayer networking and state synchronization.

### Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand (state)
- **Backend:** Express.js, boardgame.io server, Node.js 18+
- **Game Logic:** Shared library with boardgame.io integration
- **Testing:** Vitest (all packages), React Testing Library
- **Linting:** ESLint + TypeScript-ESLint
- **Package Manager:** pnpm with workspaces
- **UI Components:** Shadcn/UI with Tailwind CSS

## Monorepo Structure

This is a **pnpm workspace monorepo** with 4 main packages:

```
molthar/
├── shared/              # Shared game logic, types, cost calculation
├── backend/             # Express + boardgame.io server
├── game-web/            # React frontend (Vite)
├── card-manager/        # Card management utility
├── assets/              # Game card images and resources
└── openspec/            # Experimental OpenSpec workflow files
```

### Key Directories

- **shared/src/game/** — Core game logic:
  - `index.ts` — Main game state machine (boardgame.io)
  - `types.ts` — TypeScript types for game state, moves, etc.
  - `costCalculation.ts` — Complex cost validation (9 component types, 600+ lines)
  - `cardDatabase.ts` — Card definitions and metadata
  - Test files: `*.test.ts` files here test game mechanics

- **backend/src/** — Server implementation:
  - `server-bgio.ts` — Express server running boardgame.io

- **game-web/src/** — Frontend React app:
  - `components/` — React components (game board, card displays, UI)
  - `hooks/` — Custom React hooks for game state management
  - `lib/` — Utility functions
  - `contexts/` — React Context providers
  - `styles/` — Tailwind CSS and styled components
  - `test/` — Jest/Vitest test utilities

## Common Development Commands

All commands use **pnpm** (workspace-aware package manager). Use **make** commands for convenience:

### Installation & Setup
```bash
make install              # Install all dependencies (pnpm install)
pnpm install              # Alternative: direct pnpm install
```

### Development
```bash
make dev                  # Start backend (3001) + frontend (5173) in parallel
make backend              # Start backend only (localhost:3001)
make frontend             # Start frontend only (localhost:5173)
make stop                 # Kill backend and frontend processes
make status               # Check service status
```

### Building
```bash
make build                # Build backend only (requires shared built first)
make build-all            # Clean build: shared → backend
```

### Testing & Quality
```bash
make test                 # Run all tests (shared package)
make test-shared          # Run shared package tests
make test-watch           # Run tests in watch mode (for development)
make test-report          # Generate detailed test report (card validation)
```

Within specific packages:
```bash
cd shared && pnpm test -- --run           # Run all shared tests once
cd shared && pnpm test                    # Run shared tests in watch mode
cd shared && pnpm run type-check          # TypeScript type checking
cd backend && pnpm lint                   # ESLint check
cd game-web && pnpm lint                  # ESLint check
cd game-web && pnpm format                # Prettier formatting
```

### Cleanup
```bash
make clean                # Remove build artifacts (dist/ folders)
make clean-all            # Remove node_modules + dist + lock files
```

## Architecture & Key Patterns

### Game State Management (boardgame.io)
The game uses **boardgame.io**, a framework for turn-based games. Key concepts:
- **Game State:** Defined in `shared/src/game/index.ts` as a bgio game spec
- **Moves:** Player actions (take pearl, replace pearls, place character, activate character)
- **Game Context:** Flows through boardgame.io's turn system with proper player isolation

### Cost Calculation System
**File:** `shared/src/game/costCalculation.ts` (~600 lines)

The game supports a flexible cost component system with 9 component types:
- `number` — Exact pearl value (e.g., single 3)
- `nTuple` — N cards with same value (e.g., 2 pairs)
- `sumAnyTuple` — Cards summing to X (e.g., sum 10)
- `sumTuple` — Exactly N cards summing to X
- `run` — Sequential values (e.g., 4-5-6)
- `evenTuple` / `oddTuple` — Only even/odd values
- `diamond` — Modifier allowing +1/-1 adjustments
- `drillingChoice` — Pairs/triples of value A OR B

**Testing:** `costCalculation.test.ts` has 150+ test cases covering edge cases, diamonds, and combinations.

### Frontend State (Zustand)
React components use **Zustand** for lightweight state management alongside React Context.

### Component Organization
- **Board components** — Game display, piece rendering
- **UI components** — Buttons, dialogs, cards
- **Game flow components** — Turn display, action handling
- **Responsive design** — Adapts to iPhone, Tablet, Desktop via Tailwind

## Running a Single Test

To run one test file or specific test:

```bash
cd shared
pnpm test -- --run costCalculation.test.ts
pnpm test -- --run gameFlow.test.ts
pnpm test -- --run -t "specific test name"
```

The `--run` flag exits after completion (useful in CI and scripting). Omit it for watch mode.

## Ports & Services

When running `make dev`:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001 (boardgame.io server)
- Backend serves game state; frontend queries via HTTP/WebSocket

## Important Notes

### When Modifying Game Logic
1. Game moves are in `shared/src/game/index.ts` (the boardgame.io spec)
2. Cost calculation logic lives in `costCalculation.ts`
3. Always add tests for new mechanics in `*.test.ts` files
4. Run `make test-shared` or `make test-watch` to validate

### When Modifying the Frontend
1. Components are in `game-web/src/components/`
2. Styling uses **Tailwind CSS** (class-based) + optional CSS modules
3. Use React hooks from `game-web/src/hooks/`
4. Type safety is enforced via TypeScript

### Card Database
- Card data is loaded from `shared/src/game/cardDatabase.ts`
- The system supports dynamic card loading from external sources
- Cost validation automatically checks card costs against player hand

### Dependency Injection
- Shared package exports game logic and types via `package.json` exports field
- Backend and frontend both import from `@portale-von-molthar/shared`
- Keep backend and frontend tests separate (backend in `backend/src`, frontend in `game-web/src`)

## Build Output

After building:
- **shared/dist/** — Compiled game logic and types (consumed by backend & frontend)
- **backend/dist/** — Node.js server (run with `node dist/server-bgio.js`)
- **game-web/dist/** — Static frontend bundle (deployable to CDN/Vercel)

The backend must be built before running `make backend` or `make dev`.

## Character Ability System

**File:** `shared/src/game/abilityHandlers.ts`, `shared/src/game/index.ts`

Character cards have abilities in two tiers:

### Red Abilities (persistent: false) — executed once on activation
| Type | Effect | Example |
|------|--------|---------|
| `threeExtraActions` | +3 actions this turn | `G.maxActions += 3` |
| `nextPlayerOneExtraAction` | Next player +1 action | Sets `G.nextPlayerExtraAction = true` |
| `discardOpponentCharacter` | Remove opponent portal card | First opponent with card in portal |
| `stealOpponentHandCard` | Steal opponent hand card | First opponent with cards |
| `takeBackPlayedPearl` | Retrieve last played pearl | Uses `G.lastPlayedPearlId` |

### Blue Abilities (persistent: true) — permanent after activation
| Type | Effect | Where applied |
|------|--------|---------------|
| `handLimitPlusOne` | +1 hand limit | `player.handLimitModifier++` |
| `oneExtraActionPerTurn` | +1 action per turn | `turn.onBegin` recalculates |
| `onesCanBeEights` | 1-pearls count as 8 in cost | Frontend `PaymentSelection` |
| `threesCanBeAny` | 3-pearls count as any value | Frontend `PaymentSelection` |
| `decreaseWithPearl` | Spend 1 diamond to reduce pearl value by 1 | Frontend `PaymentSelection` |
| `changeCharacterActions` | Swap portal card before first action | `swapPortalCharacter` move |
| `changeHandActions` | Redraw hand after last action | `rehandCards` move |
| `previewCharacter` | Peek at character deck before first action | `peekCharacterDeck` move |
| `tradeTwoForDiamond` | Trade a 2-pearl for 1 diamond | `tradeForDiamond` move |
| `numberAdditionalCardActions` | Card has a printed pearl value | Frontend `PaymentSelection` |
| `anyAdditionalCardActions` | Card has a printed wildcard pearl | Frontend `PaymentSelection` |
| `irrlicht` | Shared activation — neighbors can activate | `activateSharedCharacter` move |

### Payment Selection (TIER 2+)

`activatePortalCard` accepts `PaymentSelection[]` instead of raw card indices:
```typescript
// Basic hand card
{ source: 'hand', handCardIndex: 0, value: 5 }

// Hand card with ability modifier (e.g. onesCanBeEights)
{ source: 'hand', handCardIndex: 1, value: 8, abilityType: 'onesCanBeEights' }

// Printed pearl from activated character (TIER 6)
{ source: 'ability', characterId: 'activated-char-id', value: 5 }
```

The backend validates all declarations (ability active, card exists, diamonds available). `costCalculation.ts` remains unchanged — it receives a pre-built virtual hand.

# Game-Web Frontend Specification

**Last Updated:** 2026-03-27
**Source of Truth:** `/game-web/src/` implementation (Code is authoritative)

## Overview

The **game-web** package is a **React 19 + Canvas-based multiplayer game frontend** for Portale von Molthar. It uses **boardgame.io** for real-time multiplayer via SocketIO and implements a lobby-based player matching system.

**Key Characteristics:**
- Canvas-based game board rendering (3:2 aspect ratio, 1200×800 model coordinates)
- HTML5 Canvas pointer event handling for card interaction
- Dialog Context for global modal management
- Responsive design via ResizeObserver and CSS transforms
- TypeScript strict mode throughout
- 16 test files with comprehensive coverage

## Architecture

### Core Flow

```
Lobby Screen
  ↓ (create/join game)
Wait for Players
  ↓ (all players joined)
Game Board (Canvas Rendering)
  ↓ (game play)
Game Finished Screen
  ↓ (results)
Back to Lobby
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 19.2.4 |
| **Multiplayer** | boardgame.io | 0.50.2 |
| **Real-time Comms** | SocketIO | (via boardgame.io) |
| **Build Tool** | Vite | 8.0.0 |
| **Styling** | Tailwind CSS | 4.2.1 |
| **State** | React Context + Hooks | — |
| **Testing** | Vitest | + React Testing Library |
| **Language** | TypeScript | 5.9.3 |

## Component Architecture

### Component Hierarchy

```
App.tsx (Root)
├── LobbyScreen
│   ├── GameCreationForm
│   └── GameJoinForm (polling every 3s)
├── WaitForPlayersScreen
├── CanvasGameBoard (Main Game View)
│   ├── ResponsiveGameBoard (wrapper)
│   ├── CardButtonOverlay (pointer events)
│   ├── Dialog modals:
│   │   ├── CharacterActivationDialog
│   │   ├── CharacterReplacementDialog
│   │   ├── DiscardCardsDialog
│   │   ├── ConfirmDialog
│   │   └── CostPaymentDialog
│   └── UI Elements:
│       ├── ActionCounterDisplay
│       ├── PlayerNameDisplay
│       ├── TurnIndicatorDisplay
│       └── ActionButtons
└── GameFinishedScreen

Supporting Components (rendered within CanvasGameBoard):
├── PlayerPortal (your character cards + diamonds)
├── PlayerHand (pearl card hand)
├── HandDisplay (hand rendering with hover)
├── FaceUpCards (Auslage display)
├── ActivatedCharacterDetailView (modal detail view)
├── OpponentPortals (opponent portals)
├── GameLog (event log)
├── ErrorBoundary (error handling)
└── Toast (notifications)
```

### Component Count: **29 components**

**Components by Category:**

| Category | Count | Examples |
|----------|-------|----------|
| Game Board & Canvas | 3 | CanvasGameBoard, ResponsiveGameBoard, CardButtonOverlay |
| Dialogs | 5 | CharacterActivationDialog, CharacterReplacementDialog, DiscardCardsDialog, ConfirmDialog, CostPaymentDialog |
| Card Display | 4 | PlayerPortal, PlayerHand, HandDisplay, FaceUpCards |
| UI Display | 4 | ActionCounterDisplay, PlayerNameDisplay, TurnIndicatorDisplay, ActionButtons |
| Game Flow | 4 | GameStartScreen, GameFinishedScreen, GameContainer (legacy), GameLog |
| Modals & Detail | 2 | ActivatedCharacterDetailView, CardInfo |
| System & Layout | 4 | ErrorBoundary, Toast, LayoutCustomizationPanel, CardButton |
| Opponents | 1 | OpponentPortals |
| Other | 2 | ErrorDisplay, DiscardButton |

## State Management

### React Context (Primary)

**DialogContext** (`/src/contexts/DialogContext.tsx`)
- **Purpose:** Manage all dialog states globally (eliminates prop drilling)
- **Dialog Types:** `'none' | 'replacement' | 'activation' | 'discard'`
- **API:**
  - `openReplacementDialog(cardsToPick, existingPortalCards)`
  - `openActivationDialog(cardIndex, cost, hand, pearlCounts)`
  - `openDiscardDialog(hand, discardCount)`
  - `closeDialog()`
- **Data Held:** Dialog type, character cards, hand state, pearl counts, callback handlers

**LayoutContext** (`/src/contexts/LayoutContext.tsx`)
- **Purpose:** Manage responsive layout state
- **API:** Wraps `useResponsiveLayout()` hook, provides layout preferences

### Local Component State

- **App/Lobby Components:** `useState` for match management, player info, credentials
- **Canvas Components:** Selection states (hovered cards, selected indices)
- **Game State Sync:** **boardgame.io Client** manages server state via SocketIO
  - All game state lives in `props.G` (immutable boardgame.io state)
  - Player actions dispatch moves: `moves.takeCharacterCard(index)`
  - Server broadcasts updated `GameState` to all clients

### No Zustand Used

Despite Zustand being listed in dependencies, it's **not actively used** in the current implementation. All state management is via React Context and boardgame.io's client state.

## Game Board Rendering & Interaction

### Canvas Rendering System

**Entry Point:** `CanvasGameBoard.tsx`
- Maintains Canvas ref, ResizeObserver, SocketIO connection
- Captures `onPointerDown`, `onPointerMove`, `onPointerLeave` events
- Converts client coordinates to model coordinates (1200×800)
- Calls drawing functions from `gameRender.ts`

**Rendering Library** (`/src/lib/gameRender.ts`)
- Central drawing utility with functions for:
  - `drawBackground()` — Game board background
  - `drawAuslage()` — Face-up character and pearl cards
  - `drawPlayerPortal()` — Player's portal and diamonds
  - `drawActivatedCharactersGrid()` — Activated character cards
  - `drawUI()` — Game UI elements (action counter, turn info)
- Renders card images from preloaded asset cache
- Coordinates are in **model space** (1200×800), scaled via CSS transforms

**Hit Detection** (`/src/lib/gameHitTest.ts`)
- Pointer coordinate hit testing system
- Determines clicked element: auslage card, portal slot, deck, button, etc.
- Returns hit object with type and index for dispatch to handler

**Layout Coordinates** (`/src/lib/cardLayoutConstants.ts`)
- Centralized card positioning and dimensions
- All card positions defined as constants (auslage slots, hand, portal, activated grid)
- Aspect ratio: **3:2** (letterboxed if container differs)

### Responsive Design

**ResizeObserver Pattern:**
- Tracks container size changes in real-time
- Maintains 3:2 aspect ratio via CSS letterboxing
- Canvas scales via `transform: scale(...)` based on DPI ratio
- Device pixel ratio scaling for crisp rendering on high-DPI displays

**Coordinate Transformation:**
```
Client Click (screen pixels)
  ↓ (divide by CSS scale factor)
Model Coordinates (1200×800)
  ↓ (hit test against card positions)
Card Index / Element Type
  ↓ (dispatch move or open dialog)
Backend / State Update
```

## Card Interaction Model

### Card Types & Interaction

| Card Type | Location | Interaction |
|-----------|----------|-------------|
| **Pearl Card** | Player hand | Click to toggle selection for cost payment |
| **Character Card** | Auslage (face-up) | Click to take (may trigger replacement dialog) |
| **Portal Card** | Player's portal slots | Click to activate (opens activation dialog with cost) |
| **Activated Character** | Activated grid | Click to view detail modal |

### Dialogs Triggered by Interaction

1. **Replacement Dialog** — Triggered when taking character card and player portal is full
   - Shows new character card image
   - Lists existing portal characters as clickable buttons
   - Player selects one to replace

2. **Activation Dialog** — Triggered when clicking a portal character
   - Shows character cost requirements
   - Hand cards displayed as toggle buttons (for multi-select)
   - Validates cost payment via `validateCostPayment()` from shared package
   - Supports cost types: numbers, n-tuples, runs, diamonds, etc.

3. **Discard Dialog** — Triggered when hand exceeds limit at turn end
   - Shows all hand cards as clickable buttons
   - Player selects cards to discard until hand is within limit

4. **Confirm Dialog** — Generic confirmation modal for various actions

### Cost Payment Validation

- Uses `validateCostPayment()` from `@portale-von-molthar/shared`
- Supports 9 cost component types (number, nTuple, sumAnyTuple, sumTuple, run, evenTuple, oddTuple, diamond, drillingChoice)
- Dialog shows available pearl card combinations for payment

## Card Assets & Images

### Image Loading

**Preload System** (`/src/lib/imageLoaderV2.ts`)
- Preloads all character card images on app start
- Fallback images: portal cards, pearl cards, back of card
- Caching via `loadImage()` utility
- Character cards loaded from shared package database (`getAllCards()`)

**Asset Organization:**
```
assets/
├── Charakterkarte1.png through Charakterkarte40.png
├── Charakterkarte Hinten.png (back of card)
├── Perlenkarte1.png through Perlenkarte8.png
├── Portal1.jpeg through Portal5.jpeg
└── raw/
    ├── Charakterkarte1.af through Charakterkarte40.af (Affinity source)
    └── Charakterkarte Hinten.af
```

### Card Database

- Character card definitions in `shared/src/game/cardDatabase.ts`
- Each card has: `id`, `name`, `imageName`, `cost`, `powerPoints`, `abilities`
- Loaded at app start via `getAllCards()` from shared package

## Backend Communication

### Multiplayer Connection

**boardgame.io SocketIO Client**
- Establishes WebSocket connection to `http://127.0.0.1:3001`
- Handles all game state synchronization automatically
- Real-time updates via SocketIO events

**Lobby Client** (LobbyAPI)
- `listMatches()` — List all open games (polled every 3 seconds)
- `createMatch()` — Create new game instance
- `joinMatch()` — Join existing game with credentials

### Move Dispatch Flow

```
User Action (click card)
  ↓ (hit test → move name)
Client calls moves.takeCharacterCard(index)
  ↓ (serialized via SocketIO)
Server validates move against GameState
  ↓
Server applies move, updates GameState
  ↓
Server broadcasts updated GameState to all clients
  ↓
Client receives update, re-renders from props.G
```

### Match Management

- Matches stored on server; client queries for listing
- Polling intervals:
  - Join lobby: every 3 seconds (list open games)
  - Waiting for players: every 1 second
- Player credentials required to rejoin; prevents unauthorized access

## Dialogs & Modals

### Dialog Implementation

**Via DialogContext:**
- Single source of truth for dialog state
- All dialogs rendered conditionally in `CanvasGameBoard`
- Dialog closes on: button click, Escape key, or programmatic `closeDialog()` call

**Modal Styling:**
- CSS classes: `dialogModal`, `characterActivationDialog`, etc.
- Overlay with semi-transparent background
- Positioned absolutely over canvas

**Dialog Types & Their Flows:**

| Dialog | Trigger | User Action | Result |
|--------|---------|-------------|--------|
| Replacement | Take character, portal full | Select card to replace | Dispatch move with replacement |
| Activation | Click portal card | Select pearl cards for cost | Validate cost, dispatch activation move |
| Discard | Turn end, hand > limit | Select cards to discard | Dispatch discard move |
| Confirm | Various confirmations | Yes/No click | Execute callback or cancel |
| Cost Payment | (legacy) | Select pearls | Validate, return selected |

## Testing

### Test Files (16 total)

| File | Purpose | Coverage |
|------|---------|----------|
| `game.test.ts` | Game state transitions | Largest test file (64KB) |
| `integration.test.ts` | Full game flows | End-to-end scenarios |
| `gameFlow.test.ts` | Turn-based actions | Player turn mechanics |
| `App.test.tsx` | App component rendering | Lobby, game screens |
| `confirmDialog.test.tsx` | Confirm dialog behavior | Modal interaction |
| `toast.test.tsx` | Toast notifications | Success/error/warning |
| `accessibility.test.ts` | WCAG compliance | Keyboard, screen readers |
| `keyboard.test.ts` | Keyboard shortcuts | Alt+F, Enter, Escape, etc. |
| `useLocalStorage.test.ts` | Persistence hook | Save/load game state |
| `useDebounce.test.ts` | Debounce utility | Timer logic |
| `layout.test.ts` | Layout calculations | Responsive dimensions |
| `stats.test.ts` | Statistics calculations | Score, wins tracking |
| Additional test files | (6 more) | Component-specific tests |

### Testing Setup

- **Runner:** Vitest with React plugin
- **Environment:** jsdom (simulated DOM)
- **Library:** React Testing Library + Jest DOM matchers
- **Setup:** `setup.ts` with Testing Library cleanup

## Build & Development

### Development Server

- **Framework:** Vite 8.0.0
- **Dev Server:** `http://127.0.0.1:5173` (localhost only)
- **Hot Module Replacement (HMR):** Enabled

### Build Process

1. **Development:** `npm run dev` starts Vite dev server
2. **Build:** `npm run build`
   - Cleans previous build
   - Vite bundles with Terser minification
   - Generates sourcemaps for debugging
   - Optimizes `@portale-von-molthar/shared` dependency
3. **Output:** Minified bundle ready for static hosting (CDN, Vercel, etc.)

### Scripts

```bash
npm run dev              # Start dev server (localhost:5173)
npm run build            # Production build
npm run test             # Run Vitest (watch mode)
npm run test:ui          # Vitest with UI dashboard
npm run test:coverage    # Generate coverage reports
npm run lint             # ESLint checks
npm run format           # Prettier formatting
```

### Code Quality

- **Linting:** ESLint 9.39.4 + TypeScript rules
- **Formatting:** Prettier 3.8.1
- **Type Safety:** TypeScript 5.9.3 strict mode
- **CSS:** Tailwind CSS 4.2.1 + PostCSS

## Key Hooks & Utilities

### Custom Hooks

- `useToast()` — Toast notification management (add, remove, auto-dismiss)
- `useToastManager()` — Toast lifecycle and state
- `useLocalStorage(key)` — Persist state to localStorage
- `useResponsiveLayout()` — Layout breakpoint tracking (mobile, tablet, desktop)
- `useViewportSize()` — Window/container size tracking
- `useLayoutPreferences()` — User layout customization persistence
- `useDebounce(fn, delay)` — Debounce function execution

### Utility Functions & Libraries

- `gameRender.ts` — Canvas drawing primitives
- `gameHitTest.ts` — Pointer coordinate hit detection
- `cardLayoutConstants.ts` — Centralized card positioning
- `layoutCalculations.ts` — Layout math (aspect ratio, scaling, etc.)
- `imageLoaderV2.ts` — Image preloading and caching
- `cost-helper.ts` — Cost description and calculation helpers
- `layoutPresets.ts` — Preset layout configurations

## Configuration Files

### vite.config.ts
```javascript
{
  plugins: [react({ babel: { plugins: ['@babel/plugin-syntax-decorators'] } })],
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  optimizeDeps: {
    include: ['@portale-von-molthar/shared']
  }
}
```

### tailwind.config.js
- Extends default theme with game-specific colors
- Integrates PostCSS for CSS variable support

### tsconfig.json
- Strict mode enabled
- Target: ES2020
- Module: ESNext
- Resolves paths: `@/*` → `src/*`

## Known Limitations & Technical Debt

1. **Server URL Hardcoded** — `http://127.0.0.1:3001` in App.tsx; should be configurable
2. **No React Router** — Only conditional rendering; consider Router for scalability
3. **GameContainer Component** — Older game orchestration, not actively used
4. **Zustand Dependency** — Listed in package.json but not used; consider removing
5. **Canvas Rendering Performance** — At scale (many activated characters), may benefit from optimization
6. **No PWA Support** — No service worker for offline capability
7. **Polling for Lobby** — Every 3 seconds; could use Server-Sent Events or WebSocket
8. **Limited Keyboard Navigation** — Some dialogs may not be fully keyboard-accessible

## Development Guidelines

### Adding New Components

1. **Game Logic:** Keep in shared package (`@portale-von-molthar/shared`)
2. **UI Components:** Add to `/src/components/` with test file
3. **State:** Use DialogContext if global, useState if local
4. **Styling:** Use Tailwind CSS (prefer) or CSS modules
5. **Testing:** Write tests in `/src/test/`; aim for 80%+ coverage

### Modifying Canvas Rendering

1. Add drawing function to `gameRender.ts`
2. Update layout coordinates in `cardLayoutConstants.ts` if needed
3. Update hit detection in `gameHitTest.ts` if clickable
4. Test with ResizeObserver on various screen sizes

### Adding New Dialogs

1. Create component in `/src/components/`
2. Add dialog type to DialogContext
3. Add `open*Dialog()` method to context
4. Render conditionally in CanvasGameBoard
5. Write tests for user interaction flow

### Debugging

- Use React DevTools for component props inspection
- Canvas rendering: Log coordinates to console (mouse vs. model space)
- State: Use Redux DevTools integration if needed
- Network: Check SocketIO events in browser DevTools Network tab

## Performance Considerations

### Canvas Rendering
- Renders on every state change; consider throttling if performance degrades
- Card image caching prevents redundant loading
- ResizeObserver debounces resize calculations

### State Updates
- boardgame.io provides immutability checks; state diffs are minimal
- React Strict Mode in development helps detect performance issues
- Consider memoization for expensive calculations (layout math, hit tests)

### Network
- SocketIO maintains persistent connection; bandwidth depends on move frequency
- Polling every 1-3 seconds during lobby; acceptable for user experience

## Integration with Shared Package

**Imports from `@portale-von-molthar/shared`:**
- `getAllCards()` — Get all character card definitions
- `validateCostPayment()` — Validate pearl card combinations against cost
- `GameState` type — Type definitions for game state
- Game move types and interfaces

**Usage Pattern:**
```typescript
import { getAllCards, validateCostPayment } from '@portale-von-molthar/shared';

// In component:
const cards = getAllCards();
const isValid = validateCostPayment(cost, selectedPearls);
```

## Deployment

### Frontend Build Artifacts

```
dist/
├── index.html           # Entry point
├── assets/
│   ├── *.js             # Bundled JavaScript
│   ├── *.css            # Bundled CSS
│   └── *.map            # Sourcemaps
└── (card images if bundled)
```

### Hosting Options

- **Static CDN** — Vercel, Netlify, AWS S3 + CloudFront
- **Server** — Express server serving static files
- **Docker** — Containerized with Node + Vite build stage

### Environment Variables

Currently hardcoded; should be configurable via `.env`:
```
VITE_BACKEND_URL=http://127.0.0.1:3001
VITE_LOBBY_URL=http://127.0.0.1:3001
```

## Conclusion

The game-web frontend is a **mature, well-tested Canvas-based game UI** with clear separation of concerns (rendering, interaction, state management). The architecture scales well for additional features and maintains good performance across device sizes through responsive design patterns.

**Key Strengths:**
- Canvas-based rendering provides uniform visuals
- DialogContext eliminates prop drilling
- Hit testing system is clean and maintainable
- Comprehensive test coverage (16 test files)
- Full TypeScript type safety
- Responsive and accessible design

**Areas for Enhancement:**
- Environment configuration
- Performance optimization at scale
- Service worker / offline support
- More sophisticated routing (React Router)

# 🎮 PHASE 4: Advanced Features - Multiplayer, AI & Visual Redesign

**Status:** Planning  
**Scope:** Multiplayer networking, AI opponents, visual component overhaul  
**Estimated Duration:** 12-15 days (3 weeks)  
**Successor to:** Phase 3 (100% complete)

---

## 📋 Phase 4 Overview

### Strategic Goals
1. ✅ **Multiplayer Gameplay** - Real-time play between multiple human players
2. ✅ **AI Opponents** - Computer players with strategic behavior
3. ✅ **Visual Immersion** - Card images instead of UI components
4. ✅ **Game Experience** - Polished, production-ready gameplay

### Phases Breakdown

| Sub-Phase | Focus | Duration | Deliverables |
|-----------|-------|----------|--------------|
| **P4.1** | Multiplayer Infrastructure | 4-5 days | WebSocket server, room management, sync |
| **P4.2** | AI Engine & Strategies | 4-5 days | Decision tree, 5 AI difficulty levels |
| **P4.3** | Visual Redesign | 3-4 days | Card images, portal UI, game board assets |
| **P4.4** | Integration & Polish | 1-2 days | End-to-end testing, deployment |

**Total: 12-15 days**

---

## 🌐 P4.1: Multiplayer Infrastructure (4-5 Days)

### 4.1.1 Backend Setup - WebSocket Server

**Goal:** Centralized game server managing sessions, state sync, and player messaging

```typescript
// Architecture: Node.js + Express + Socket.io
// - Room management (create/join/leave)
// - Game state synchronization
// - Action broadcasting
// - Spectator support
```

**Deliverables:**
- [ ] Express.js server with Socket.io
- [ ] Room management system
  - Create game room
  - Join room (max 5 players)
  - Leave room (game cleanup)
  - List available rooms
- [ ] Game state server
  - Store game state per room
  - Validate actions
  - Broadcast state to clients
  - Handle disconnections
- [ ] Player management
  - Player identification
  - Ready state tracking
  - Reconnection support

**Technology Stack:**
```
Backend:
- Express.js (server framework)
- Socket.io (real-time bidirectional communication)
- In-memory store or Redis (session management)
- TypeScript (for type safety)

Frontend:
- Socket.io client
- Zustand store (game state management)
- Auto-reconnect with exponential backoff
```

**Key Endpoints/Events:**

```typescript
// Client → Server
emit('CREATE_ROOM', { playerName, maxPlayers })
emit('JOIN_ROOM', { roomId, playerName })
emit('LEAVE_ROOM', { roomId })
emit('GAME_ACTION', { action, payload })
emit('READY_UP', { roomId })
emit('DISCONNECT', {})

// Server → Clients
on('ROOM_CREATED', { roomId, players })
on('PLAYER_JOINED', { playerId, playerName })
on('GAME_STATE_UPDATE', { gameState })
on('ACTION_BROADCAST', { action, timestamp })
on('GAME_STARTED', { gameState })
on('PLAYER_LEFT', { playerId })
on('PLAYER_RECONNECTED', { playerId })
on('GAME_FINISHED', { winners, stats })
```

**Testing Checklist:**
- [ ] Room creation & listing
- [ ] Multiple players joining same room
- [ ] Player disconnection handling
- [ ] State synchronization across clients
- [ ] Action validation on server
- [ ] Spectator join (view-only)
- [ ] Room cleanup on all players leave

---

### 4.1.2 Game State Management - Server-Side

**Goal:** Single source of truth for game state, server validates all actions

```typescript
interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  gameState: IGameState;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: Date;
  maxPlayers: number;
}

interface Player {
  id: string;
  name: string;
  socket: SocketId;
  isAI: boolean;
  status: 'connected' | 'reconnecting' | 'disconnected';
  readyUp: boolean;
}
```

**Action Validation Flow:**
```
Client sends action
  ↓
Server receives via Socket.io
  ↓
Validate action (GameEngine.processAction())
  ↓
If valid:
  - Update game state
  - Broadcast to all clients
  - Store action in history
  ↓
If invalid:
  - Send error to client
  - No state change
```

**Deliverables:**
- [ ] Room state storage (in-memory or Redis)
- [ ] Action queue per room
- [ ] State consistency checks
- [ ] Automatic AI turn handling
- [ ] Disconnect/reconnect grace period (10-15 seconds)
- [ ] Game history logging

---

### 4.1.3 Client-Side Networking

**Goal:** Seamless connection, automatic reconnect, offline support

**Deliverables:**
- [ ] Socket.io client integration
- [ ] Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s...)
- [ ] Game state sync from server
- [ ] Action queueing (optimistic updates)
- [ ] Network status indicator
- [ ] Spectator mode

**Client Store (Zustand):**
```typescript
interface GameStore {
  // Connection
  connected: boolean;
  roomId: string | null;
  playerId: string;
  
  // Game
  gameState: IGameState;
  players: Player[];
  localPlayerId: string;
  
  // UI
  networkError: string | null;
  isSpectating: boolean;
  
  // Methods
  joinRoom(roomId, playerName);
  leaveRoom();
  sendAction(action);
  reconnect();
}
```

**Deliverables:**
- [ ] Socket.io client setup
- [ ] Zustand store integration
- [ ] Optimistic action updates
- [ ] Conflict resolution on rejoin
- [ ] Network status UI component
- [ ] Error recovery UI

---

### 4.1.4 Lobby & Room System

**Goal:** Easy game creation and joining for players

**UI Screens:**
1. **Lobby Screen**
   - List of available rooms
   - "Create Room" button
   - "Join Room" input
   - Player name input

2. **Room Screen**
   - Player list (shows ready status)
   - "Ready Up" button
   - Game settings (2-4 players, include AI)
   - "Leave Room" option
   - Start game button (when all ready)

3. **Network Status**
   - Connection indicator (dot: green/yellow/red)
   - Ping display
   - Disconnect warning
   - Reconnecting spinner

**Deliverables:**
- [ ] Lobby component
- [ ] Room management UI
- [ ] Player list with status
- [ ] Network status indicator
- [ ] Error messaging

---

## 🤖 P4.2: AI Engine & Strategies (4-5 Days)

### 4.2.1 AI Decision Engine

**Goal:** Computer player that makes strategic decisions

```typescript
interface AIStrategy {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'genius';
  aggressiveness: number; // 0-1 (0=conservative, 1=aggressive)
  greediness: number;     // 0-1 (0=save resources, 1=always spend)
  adaptability: number;   // 0-1 (0=fixed, 1=responds to opponents)
}

class AIPlayer {
  strategy: AIStrategy;
  gameState: IGameState;
  
  decideTurn(): GameAction {
    // Analyze board state
    // Evaluate options
    // Make decision
    // Return action
  }
}
```

**Decision-Making Factors:**
- Current hand cards (value, count)
- Power points (own vs opponents)
- Distance to 12 power points
- Opponent power points
- Card availability (deck size)
- Character cards in play
- Special abilities available

---

### 4.2.2 AI Strategies (Proposed)

#### **Strategy 1: Conservative Accumulator** (Easy)
**Difficulty:** ⭐ (Beginner)

**Behavior:**
- Focuses on collecting pearl cards without spending
- Rarely activates characters
- Builds up large hand (waits for 8-9 value cards)
- Plays to reach 12 power points slowly
- Poor decision-making under pressure

**Best Against:** Aggressive players  
**Worst Against:** Balanced players  
**Winrate:** ~20-30%

**Implementation:**
```typescript
decideTurn(): GameAction {
  // Prefer taking pearl cards
  if (availablePearlCards.length > 0) {
    return { type: 'TakePearlCard', cardIndex: bestCard };
  }
  
  // Only activate if hand is large (8+ cards)
  if (hand.length >= 8 && characterCards.length > 0) {
    return { type: 'ActivateCharacter', ... };
  }
  
  // Otherwise place character
  return { type: 'PlaceCharacter', ... };
}
```

---

#### **Strategy 2: Aggressive Spender** (Medium)
**Difficulty:** ⭐⭐ (Intermediate)

**Behavior:**
- Immediately activates characters when possible
- Pursues power points aggressively
- Takes calculated risks
- Ignores hand size limitations
- Reasonable counter-play

**Best Against:** Conservative players  
**Worst Against:** Balanced/Expert players  
**Winrate:** ~35-45%

**Implementation:**
```typescript
decideTurn(): GameAction {
  // Prefer activating characters
  if (canActivateAnyCharacter()) {
    const bestChar = selectByHighestPowerReward();
    return activateCharacter(bestChar);
  }
  
  // Then place new characters
  if (availableCharacters.length > 0) {
    return placeCharacter(selectLowestCostCharacter());
  }
  
  // Fallback: take pearls
  return takePearlCard();
}
```

---

#### **Strategy 3: Balanced Player** (Medium-Hard)
**Difficulty:** ⭐⭐⭐ (Advanced)

**Behavior:**
- Mix of spending and saving
- Evaluates opportunity cost
- Adapts based on opponent progress
- Efficient resource management
- Competitive winrate

**Best Against:** Aggressive players  
**Worst Against:** Adaptive experts  
**Winrate:** ~40-55%

**Implementation:**
```typescript
decideTurn(): GameAction {
  const gamePhase = getGamePhase(); // early/mid/late
  const opponentDistance = getOpponentPowerDistance();
  
  if (gamePhase === 'late' && opponentDistance < 3) {
    // Rush mode: activate characters
    return prioritizeCharacterActivation();
  }
  
  // Mid-game: balance
  const activationValue = evaluateActivation();
  const placementValue = evaluateCharacterPlacement();
  
  if (activationValue > placementValue) {
    return activateCharacter(...);
  } else {
    return placeCharacter(...);
  }
}
```

---

#### **Strategy 4: Adaptive Strategist** (Hard)
**Difficulty:** ⭐⭐⭐⭐ (Expert)

**Behavior:**
- Real-time strategy adjustment
- Analyzes opponent patterns
- Predicts opponent moves
- Plays counter-strategy
- Very strong opponent

**Best Against:** Fixed strategies  
**Worst Against:** Other adaptive players  
**Winrate:** ~50-65%

**Implementation:**
```typescript
decideTurn(): GameAction {
  // Analyze opponent behavior
  const opponentPattern = analyzeOpponentMoves();
  
  // Predict next move
  const opponentPrediction = predictOpponentAction(opponentPattern);
  
  // Counter-play
  if (opponentPrediction.threat === 'reaching 12 points') {
    return blockOpponent(); // Place characters to prevent scoring
  }
  
  // Adaptive positioning
  return adaptToOpponentStrategy(opponentPattern);
}
```

---

#### **Strategy 5: Monte Carlo Master** (Genius)
**Difficulty:** ⭐⭐⭐⭐⭐ (Genius)

**Behavior:**
- Simulates future game states
- Evaluates win probability for each action
- Selects highest expected value move
- Nearly optimal play
- Extremely strong (may be unfair)

**Best Against:** Any single strategy  
**Worst Against:** Multiple adaptive opponents  
**Winrate:** ~65-80%

**Implementation:**
```typescript
decideTurn(): GameAction {
  // Simulate multiple future scenarios
  const allPossibleActions = generatePossibleActions();
  const evaluations = allPossibleActions.map(action => {
    const futureStates = simulateFutureStates(action, depth=3);
    const winProbability = evaluateWinProbability(futureStates);
    return { action, winProbability };
  });
  
  // Return action with highest win probability
  return evaluations.reduce((max, curr) => 
    curr.winProbability > max.winProbability ? curr : max
  ).action;
}
```

**Performance Note:** Expensive computation, may need optimization with alpha-beta pruning or iterative deepening.

---

### 4.2.3 Difficulty Settings

**How Players Choose AI:**

```typescript
enum AIDifficulty {
  EASY = 'conservative',      // Strategy 1
  MEDIUM = 'aggressive',      // Strategy 2
  BALANCED = 'balanced',      // Strategy 3
  HARD = 'adaptive',          // Strategy 4
  GENIUS = 'montecarlo',      // Strategy 5
}
```

**UI: Game Setup Screen**
```
Select Opponents:
☑ Human Player
☑ AI (Difficulty: [Easy] [Medium] [Hard] [Expert] [Genius])
☑ AI (Difficulty: [Easy] [Medium] [Hard] [Expert] [Genius])
☑ AI (Difficulty: [Easy] [Medium] [Hard] [Expert] [Genius])
```

**Deliverables:**
- [ ] AI decision engine base class
- [ ] Strategy implementations (5 strategies)
- [ ] Difficulty selector UI
- [ ] AI action simulation
- [ ] Performance optimization (if needed)
- [ ] Test suite for each strategy

---

### 4.2.4 AI vs AI Analytics

**Optional Feature: Watch AI Play**

```typescript
// Start AI-only game
const game = new GameEngine(['AI-Easy', 'AI-Hard', 'AI-Balanced']);
const results = simulateGame(game, iterations=100);

// Statistics
console.log(results);
{
  'AI-Easy': { wins: 18, avgPower: 12.5, winrate: 0.18 },
  'AI-Hard': { wins: 65, avgPower: 18.2, winrate: 0.65 },
  'AI-Balanced': { wins: 17, avgPower: 13.1, winrate: 0.17 }
}
```

**Deliverables:**
- [ ] Batch simulation engine
- [ ] Statistics collection
- [ ] Balance analysis tool
- [ ] Difficulty calibration

---

## 🎨 P4.3: Visual Redesign - Component Overhaul (3-4 Days)

### 4.3.1 Asset Requirements

**Key Insight:** Replace text/UI components with visual elements

#### **Card Assets**

**Pearl Cards (56 cards):**
- Sizes: 60x90px (hand), 120x180px (large)
- Values: 1-8 (7 variations each)
- Design: Number + decorative border
- Special: Swap symbol version per value
- Format: PNG/SVG with transparency

**Character Cards (54+ cards):**
- Sizes: 120x180px (hand/play), 150x225px (detail)
- Elements: Name, cost, power points, diamond value, ability icons
- Rarity: Color-coded borders (common/rare/epic)
- Back side: Unified card back design
- Format: PNG with layered components

**Card Back (Closed Deck):**
- Design: Portale von Molthar branding
- Sizes: 60x90px, 120x180px
- Animation: Subtle glow on hover

---

#### **Game Board Assets**

**Portal Backgrounds:**
- 4 player portals (one per player)
- Size: 800x600px base
- Design: Mystical portal theme
- Elements: 
  - Character card slots (face-up area)
  - Opponent name/color
  - Power point display (integrated)
  - Action counter (integrated)

**Portal Characteristics:**
```
┌─────────────────────────────────┐
│  Player Name                    │  ← Integrated
│  [Char1] [Char2] [Char3] [Char4]│  ← Character slots
│  Power: 15    Actions: 2/3      │  ← Integrated display
└─────────────────────────────────┘
```

**Pearl Deck Display:**
- Visual card stack
- Shows remaining count
- Tap to draw animation
- Discard pile indicator

---

### 4.3.2 Component Replacements

| Component | Current | Replacement | Priority |
|-----------|---------|-------------|----------|
| **Pearl Cards in Hand** | Text boxes | Card images (60x90) | **P1** |
| **Character in Play** | Text display | Card images (120x180) | **P1** |
| **Portal Area** | Grid layout | Custom portal background | **P2** |
| **Deck Visualization** | Counter only | Card stack image | **P2** |
| **Card Selection UI** | Button list | Card spread hover | **P2** |
| **Closed Deck** | "?"  | Card back image | **P1** |
| **Opponent Hands** | Card count | Card back stack | **P1** |

---

### 4.3.3 Visual Hierarchy Redesign

**Current (Text-Heavy):**
```
┌─────────────────────────┐
│ Player: Alice           │
│ Power: 15               │
│ Actions: 2/3            │
│ Hand: [5♠] [6♥] [8♣]   │
│ Active: Warrior (cost 3)│
└─────────────────────────┘
```

**New (Visual):**
```
┌────────────────────────────────────┐
│ Alice's Portal                  [15]│  ← Power points
│  ╔══════╗  ╔══════╗  ╔══════╗    │
│  ║ [  ] ║  ║Warrior║  ║ [  ] ║    │  ← Character slots
│  ║ Face ║  ║  ⚔️   ║  ║ Face ║    │
│  ╚══════╝  ╚══════╝  ╚══════╝    │
│                            ◉◉◉    │  ← Action counter
│ [Card Back] [Card Back] [Card Back]│  ← Hand (hidden from others)
│  ◯ Deck (20)              ◯ Discard│  ← Decks
└────────────────────────────────────┘
```

---

### 4.3.4 Asset Pipeline

**Deliverables:**
- [ ] Pearl card designs (SVG template + rendered PNGs)
- [ ] Character card templates (design system)
- [ ] Card back designs
- [ ] Portal background designs
- [ ] Animation sprites (hover, select, place)
- [ ] Asset folder structure

**Design Tool:** Figma / Adobe XD (export PNG + SVG)

**Folder Structure:**
```
game-web/public/assets/
├── cards/
│   ├── pearls/          # 56 pearl card images
│   ├── characters/      # 54+ character card images
│   ├── card-back.png    # Closed deck back
│   └── card-back.svg
├── portals/
│   ├── portal-1.png
│   ├── portal-2.png
│   ├── portal-3.png
│   └── portal-4.png
├── icons/
│   ├── action-counter.png
│   ├── power-points.png
│   └── ability-icons/
└── animations/
    ├── card-place.gif
    ├── card-select.gif
    └── activate.gif
```

---

### 4.3.5 Component Implementation

#### **PearlCard Component (Visual)**

**Before:**
```typescript
<div className="pearl-card">
  <span className="value">5</span>
</div>
```

**After:**
```typescript
interface PearlCardProps {
  value: number;
  size: 'small' | 'large';
  hasSwap?: boolean;
  isSelected?: boolean;
}

export function PearlCard({ value, size, hasSwap, isSelected }: PearlCardProps) {
  const imagePath = `/assets/cards/pearls/pearl-${value}${hasSwap ? '-swap' : ''}.png`;
  
  return (
    <div 
      className={`pearl-card pearl-${size} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect()}
    >
      <img src={imagePath} alt={`Pearl ${value}`} />
      {hasSwap && <div className="swap-indicator">⟲</div>}
    </div>
  );
}
```

---

#### **Portal Component (Visual)**

**Before:**
```typescript
<div className="portal">
  <h3>Alice</h3>
  <div className="characters">
    {gameState.characters.map(char => (
      <CharacterCard key={char.id} character={char} />
    ))}
  </div>
</div>
```

**After:**
```typescript
interface PortalProps {
  playerName: string;
  playerColor: string;
  powerPoints: number;
  characters: CharacterCard[];
  actionCount: number;
  onSelectCharacter: (index: number) => void;
}

export function Portal({ playerName, playerColor, powerPoints, characters, actionCount, onSelectCharacter }: PortalProps) {
  const portalBg = `/assets/portals/portal-${playerColor}.png`;
  
  return (
    <div 
      className="portal"
      style={{ backgroundImage: `url(${portalBg})` }}
    >
      <div className="portal-header">
        <h3>{playerName}</h3>
        <div className="power-display">{powerPoints}</div>
      </div>
      
      <div className="character-slots">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div 
            key={idx}
            className="character-slot"
            onClick={() => onSelectCharacter(idx)}
          >
            {characters[idx] ? (
              <CharacterCardImage character={characters[idx]} />
            ) : (
              <div className="empty-slot" />
            )}
          </div>
        ))}
      </div>
      
      <div className="action-counter">
        {'◉'.repeat(actionCount)}{'◯'.repeat(3 - actionCount)}
      </div>
    </div>
  );
}
```

---

#### **GameBoard Redesign**

**Current Layout:**
- Horizontal portals
- Text-based information
- Component-heavy UI

**New Layout:**
- Full-screen portal backgrounds
- Integrated information
- Image-based cards
- Animations on card placement

```typescript
export function GameBoardVisual({ gameState, onAction }: GameBoardProps) {
  return (
    <div className="game-board-visual">
      {/* Active Player Portal (center/large) */}
      <Portal 
        {...gameState.players[gameState.currentPlayer]}
        size="large"
      />
      
      {/* Opponent Portals (corners/smaller) */}
      {gameState.players
        .filter((_, idx) => idx !== gameState.currentPlayer)
        .map(player => (
          <Portal key={player.id} {...player} size="small" />
        ))}
      
      {/* Player Hand (bottom) */}
      <PlayerHand 
        cards={gameState.players[gameState.currentPlayer].hand}
        selectedIndices={selectedIndices}
        onSelectCard={(idx) => handleSelectCard(idx)}
      />
      
      {/* Decks & Discard (sides) */}
      <DeckDisplay deck={gameState.pearlDeck} discard={gameState.discardPile} />
      
      {/* Action Buttons */}
      <ActionBar onEndTurn={handleEndTurn} />
    </div>
  );
}
```

---

### 4.3.6 CSS & Animation Updates

**Deliverables:**
- [ ] Portal background styling
- [ ] Card image integration
- [ ] Hover animations
- [ ] Card placement transitions
- [ ] Power point visualization
- [ ] Action counter styling

**Example Animations:**

```css
@keyframes cardPlace {
  from {
    opacity: 0;
    transform: translate(0, -30px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}

.character-slot .character-card {
  animation: cardPlace 0.4s ease-out;
}

.card:hover {
  transform: scale(1.1) translateY(-10px);
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  z-index: 100;
}
```

---

## 🔗 P4.4: Integration & Polish (1-2 Days)

### 4.4.1 End-to-End Testing

**Deliverables:**
- [ ] Multiplayer game flow test
- [ ] AI vs Human test
- [ ] AI vs AI simulation
- [ ] Visual rendering test
- [ ] Network stability test
- [ ] Mobile responsiveness

---

### 4.4.2 Deployment - Vercel + Backend Architecture

#### **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                  Production Environment                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Vercel CDN     │         │  Vercel Edge     │    │
│  │  (Frontend)      │         │  Functions       │    │
│  │  game-web/       │         │  (API routes)    │    │
│  │  React SPA       │         │                  │    │
│  └────────┬─────────┘         └──────────┬───────┘    │
│           │                              │            │
│           └──────────────┬───────────────┘            │
│                          │                            │
│           ┌──────────────┴─────────────┐              │
│           │  WebSocket Connection      │              │
│           │  (Upgrade from HTTPS)      │              │
│           │                            │              │
│  ┌────────▼────────────────────────────▼────┐         │
│  │     Backend Server (Node.js)              │         │
│  │     Socket.io + Express                   │         │
│  │     - Room Management                     │         │
│  │     - Game State                          │         │
│  │     - AI Decision Engine                  │         │
│  │     - Player Authentication               │         │
│  │     Hosted: Railway/Heroku/AWS Lambda     │         │
│  └──────────────┬───────────────────────────┘         │
│                 │                                      │
│  ┌──────────────▼──────────────┐                      │
│  │   Database (Optional)        │                      │
│  │   - Game History             │                      │
│  │   - Player Stats             │                      │
│  │   - ELO/Rankings             │                      │
│  │   PostgreSQL/MongoDB/Redis   │                      │
│  └──────────────────────────────┘                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

Browser → Vercel (HTTPS) → Backend WebSocket
```

---

#### **4.4.2.1 Frontend Deployment - Vercel**

**Vercel Benefits:**
- ✅ Zero-config deployment from GitHub
- ✅ Automatic builds on every push
- ✅ Edge functions for API routes
- ✅ Preview deployments for PRs
- ✅ CDN globally distributed
- ✅ HTTPS automatic
- ✅ Environment variables management
- ✅ Analytics & monitoring built-in

**Setup Steps:**

**Step 1: Connect GitHub to Vercel**
```bash
# 1. Go to https://vercel.com/
# 2. Sign in with GitHub
# 3. Click "New Project"
# 4. Select /game-web folder
# 5. Click "Import"
```

**Step 2: Configure Vercel Project**

```yaml
# vercel.json (add to game-web root)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_BACKEND_URL": "https://api.portale-von-molthar.com",
    "VITE_WEBSOCKET_URL": "wss://api.portale-von-molthar.com",
    "VITE_API_KEY": "@VITE_API_KEY"
  },
  "regions": ["fra1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Step 3: Environment Variables in Vercel UI**

```
VITE_BACKEND_URL=https://api.portale-von-molthar.com
VITE_WEBSOCKET_URL=wss://api.portale-von-molthar.com
VITE_API_KEY=<your-api-key>
VITE_ENV=production
```

**Step 4: Deploy**

```bash
cd game-web
npm run build
# Vercel automatically detects changes on GitHub push
# Build output: game-web/dist/
# Deployed to: https://<project>.vercel.app
```

**Vercel Build Output:**
```
✓ Build completed in 45s
✓ Deployed to production
✓ URL: https://portale-von-molthar.vercel.app

Preview:
- Every PR gets automatic preview URL
- Example: https://pr-123.portale-von-molthar.vercel.app
```

---

#### **4.4.2.2 Backend Deployment Options**

**Option A: Railway (Recommended for Socket.io)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Set environment variables
railway variables set BACKEND_URL=https://api.portale-von-molthar.com
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=postgresql://...
```

**Railway Configuration:**
```yaml
# railway.json
{
  "name": "portale-von-molthar-backend",
  "services": {
    "api": {
      "builder": "dockerfile",
      "port": 3001,
      "numReplicas": 1,
      "restartPolicyType": "always"
    }
  }
}
```

**Dockerfile for Backend:**
```dockerfile
# Dockerfile (backend root)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

---

**Option B: Heroku (Simple, Free Tier Available)**

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create portale-von-molthar-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...

# Deploy from git
git push heroku main

# View logs
heroku logs --tail
```

---

**Option C: AWS Lambda (Serverless, Scalable)**

```typescript
// For Socket.io, use AWS API Gateway + Lambda + ALB
// More complex but highly scalable

// Alternative: Use AWS Fargate + ECS for persistent connections
// Recommended for Socket.io
```

---

#### **4.4.2.3 WebSocket Configuration for Vercel Frontend**

**Important:** Vercel serverless functions don't support WebSocket directly. Connect directly to backend:

```typescript
// src/lib/socket-client.ts
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL;

export const socket = io(WEBSOCKET_URL || BACKEND_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  secure: true, // HTTPS/WSS required
});

socket.on('connect', () => {
  console.log('Connected to backend');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Trigger reconnect UI
});
```

**Environment Variables for Production:**

```bash
# .env.production
VITE_BACKEND_URL=https://portale-von-molthar-api.railway.app
VITE_WEBSOCKET_URL=wss://portale-von-molthar-api.railway.app
VITE_API_KEY=prod_key_xyz123
```

---

#### **4.4.2.4 Asset Optimization for Vercel**

**Image Optimization:**
```typescript
// Use next-gen formats with Vercel Image Optimization
// OR use local optimization with Vite

// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotli' })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'socket.io': ['socket.io-client'],
          'game-engine': ['./src/game/engine'],
        }
      }
    }
  }
});
```

**Asset Caching Strategy:**
```
- .js, .css: Cache-Control: public, max-age=31536000, immutable
- Images (pearls, characters): Cache-Control: public, max-age=604800
- API responses: Cache-Control: private, max-age=0
```

---

#### **4.4.2.5 DNS & Custom Domain Setup**

**For Custom Domain:**

```bash
# 1. Buy domain (GoDaddy, Namecheap, etc.)
# 2. In Vercel Dashboard:
#    - Project Settings → Domains
#    - Add: portale-von-molthar.com
#    - Add: api.portale-von-molthar.com (for backend)

# 3. Update DNS records:
#    A     api  → Backend IP (Railway/Heroku provides)
#    CNAME www  → vercel.app
#    CNAME @    → vercel.app (or use A record with Vercel IP)
```

---

#### **4.4.2.6 Monitoring & Analytics**

**Vercel Analytics:**
```
Dashboard → Analytics
- Requests per minute
- Error rate
- Build duration
- Deployment history
```

**Backend Monitoring Options:**
- Railway: Built-in logs + metrics
- Heroku: Heroku Monitoring add-on
- AWS: CloudWatch
- Custom: Sentry for error tracking

```typescript
// src/lib/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  // code
} catch (error) {
  Sentry.captureException(error);
}
```

---

#### **4.4.2.7 Performance Checklist**

**Deliverables:**
- [ ] Vercel project connected to GitHub
- [ ] Automatic deployments on push
- [ ] Environment variables configured
- [ ] Backend server deployed (Railway/Heroku)
- [ ] WebSocket connection tested
- [ ] CDN caching configured
- [ ] Asset optimization (compression, minification)
- [ ] HTTPS/WSS enabled
- [ ] Custom domain configured
- [ ] Monitoring alerts set up
- [ ] Build time < 2 minutes
- [ ] FCP (First Contentful Paint) < 2s
- [ ] Lighthouse score > 85

---

#### **4.4.2.8 Deployment Commands**

```bash
# Frontend (Vercel)
cd game-web
npm run build  # Generates dist/
# Push to GitHub → Vercel auto-deploys

# Backend (Railway)
cd backend
railway up

# Check status
vercel status
railway logs

# Rollback if needed
vercel rollback
```

---

**Deployment Deliverables:**
- [ ] Vercel account & project created
- [ ] GitHub integration configured
- [ ] vercel.json file with config
- [ ] Backend server deployed
- [ ] Environment variables set
- [ ] WebSocket connection established
- [ ] Custom domain (optional)
- [ ] Monitoring/logging setup
- [ ] Performance optimizations
- [ ] SSL/HTTPS verified
- [ ] Smoke tests passed


---

### 4.4.3 Documentation

**Deliverables:**
- [ ] AI Strategy guide (for players)
- [ ] Deployment guide (Vercel + Backend)
- [ ] Architecture documentation
- [ ] Contributing guide
- [ ] Known issues & limitations
- [ ] Troubleshooting guide
- [ ] API documentation

**Documentation Files to Create:**

```
docs/
├── DEPLOYMENT.md          # Step-by-step Vercel setup
├── AI_STRATEGIES.md       # Player guide for each AI difficulty
├── ARCHITECTURE.md        # System design & WebSocket flow
├── BACKEND_SETUP.md       # How to run backend locally
├── TROUBLESHOOTING.md     # Common issues & solutions
├── API.md                 # Socket.io event reference
├── CONTRIBUTING.md        # Developer guide
└── PERFORMANCE.md         # Optimization tips
```

---

## 📊 Implementation Schedule

### Week 1: Multiplayer & AI
```
Day 1-2: P4.1 Backend setup + P4.2 AI engine foundation
Day 3-4: P4.2 Strategy implementations
Day 5: Integration & testing
```

### Week 2: Visual Redesign
```
Day 6: Asset gathering/design
Day 7: Component implementation
Day 8: Styling & animations
```

### Week 3: Polish & Deploy
```
Day 9-10: End-to-end testing
Day 11-12: Deployment & monitoring
Day 13-15: Bug fixes & optimization buffer
```

---

## 🎯 Success Criteria

### P4.1 (Multiplayer)
- [ ] 4 players can join same room
- [ ] Real-time state synchronization
- [ ] Disconnection recovery works
- [ ] 100ms latency tolerance

### P4.2 (AI)
- [ ] 5 strategies implemented
- [ ] AI makes valid moves only
- [ ] Difficulty impacts winrate (Easy ~25%, Hard ~55%, Genius ~75%)
- [ ] AI completes turn in <2 seconds

### P4.3 (Visual)
- [ ] All cards display as images
- [ ] Portal backgrounds show
- [ ] Animations smooth (60fps)
- [ ] Mobile responsive

### P4.4 (Deployment)
- [ ] Live server accessible
- [ ] WebSocket stable
- [ ] <500ms round-trip latency
- [ ] Load testing: 100 concurrent rooms

---

## 📝 Dependencies & Prerequisites

**Must Complete Before P4:**
- ✅ Phase 1: Game Engine (100%)
- ✅ Phase 2: Game UI (100%)
- ✅ Phase 3: Polish (100%)

**Required Technologies:**
- Node.js 18+ (backend)
- Express.js + Socket.io
- Figma or design tool (assets)
- WebSocket capability

**Asset Requirements:**
- Pearl card designs (can be simple)
- Character card designs (basic template)
- Portal backgrounds (custom artwork)

---

## 💡 Future Extensions (Post-P4)

### Phase 5: Advanced Features
- Spectator mode (watch ongoing games)
- Replay system (save & review games)
- ELO ranking system
- Leaderboards
- Achievements & badges

### Phase 6: Mobile App
- React Native adaptation
- Push notifications
- Offline mode
- Local multiplayer (same device)

### Phase 7: Community
- Chat integration
- Player profiles
- Friend system
- Tournament mode

---

## 🚀 Vercel Deployment Quick Start

### One-Command Deployment

```bash
# 1. Push code to GitHub
git add .
git commit -m "P4: Multiplayer, AI, Visual Redesign"
git push origin main

# 2. Vercel auto-deploys (takes ~2 minutes)
# Check: https://portale-von-molthar.vercel.app

# 3. Deploy backend (Railway)
railway up

# 4. Update Vercel environment variables
vercel env add VITE_BACKEND_URL https://portale-von-molthar-api.railway.app
vercel env add VITE_WEBSOCKET_URL wss://portale-von-molthar-api.railway.app

# 5. Redeploy frontend
vercel --prod
```

---

### Vercel Project Structure

```
game-web/
├── vercel.json                    # ← Vercel configuration
├── vite.config.ts                 # ← Build config
├── package.json                   # ← Dependencies
├── .env.production                # ← Prod environment vars
├── src/
│   ├── lib/socket-client.ts       # ← WebSocket client
│   └── ...
├── public/assets/                 # ← Card images (CDN cached)
└── dist/                          # ← Build output
```

---

### Vercel Environment Variables (Production)

Set these in Vercel Dashboard:

```
VITE_BACKEND_URL=https://portale-von-molthar-api.railway.app
VITE_WEBSOCKET_URL=wss://portale-von-molthar-api.railway.app
VITE_ENV=production
VITE_API_KEY=<production-key>
VITE_SENTRY_DSN=<sentry-dsn>
```

---

### Monitoring Vercel Deployment

**Vercel Dashboard:**
```
https://vercel.com/dashboard
- Project: portale-von-molthar
- Deployments: See all past deployments
- Analytics: Performance metrics
- Settings: Configure builds, domains, env vars
```

**View Live Site:**
```
Production: https://portale-von-molthar.vercel.app
Staging: https://staging--portale-von-molthar.vercel.app (if enabled)
PR Preview: https://pr-{number}--portale-von-molthar.vercel.app
```

---

### Troubleshooting Vercel Deployment

**Issue: Build fails**
```
→ Check build logs: Vercel Dashboard → Deployments → View Build Logs
→ Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies
```

**Issue: WebSocket connection fails**
```
→ Check that backend is running
→ Verify VITE_WEBSOCKET_URL in environment variables
→ Check browser console for connection errors
→ Ensure backend CORS allows Vercel domain
```

**Issue: Assets not loading**
```
→ Check asset paths in components
→ Verify public/assets/ folder exists
→ Check Vercel build output includes assets
→ Clear browser cache (Ctrl+Shift+Del)
```

---

## 🚀 Quick Start Checklist

**To Start P4 Implementation:**

```
SETUP PHASE:
□ Create GitHub repository (if not exists)
□ Sign up for Vercel (free tier)
□ Sign up for Railway (for backend)
□ Verify Vercel-GitHub connection works

DEVELOPMENT PHASE:
□ Decide on WebSocket framework (Socket.io)
□ Create backend project (Express + TypeScript)
□ Create vercel.json configuration
□ Implement room management system
□ Implement AI strategy framework
□ Create design assets (pearls, characters, portals)
□ Implement visual components

DEPLOYMENT PHASE:
□ Test backend locally with Socket.io
□ Deploy backend to Railway
□ Set Vercel environment variables
□ Deploy frontend to Vercel
□ Test WebSocket connection in production
□ Set up monitoring (Sentry)
□ Configure custom domain (optional)

LAUNCH PHASE:
□ Run end-to-end tests
□ Verify all 5 AI strategies work
□ Test multiplayer with multiple browsers
□ Performance test (100 concurrent connections)
□ Security audit

Estimated Start: Within 1 week of P3 completion
Total Duration: 12-15 days
```

---

## 📝 Vercel + Railway Cost Estimate

**Development/Testing:**
- Vercel: Free tier (unlimited deployments, 100GB bandwidth/month)
- Railway: ~$5/month (basic tier)
- Total: ~$5/month

**Production Scale (100+ concurrent users):**
- Vercel Pro: $20/month (unlimited bandwidth)
- Railway Standard: ~$10-20/month (depending on usage)
- Database: PostgreSQL $30/month (if needed)
- Total: ~$50-70/month

---

**Document Version:** 1.1  
**Last Updated:** Session 7 (Updated with Vercel Deployment)  
**Status:** Ready for implementation  
**Questions/Changes:** Update this document as requirements evolve

# 🎮 PHASE 4: Advanced Features - Multiplayer, AI & Visual Redesign

**Status:** Planning  
**Scope:** Multiplayer networking (boardgame.io), AI opponents, visual component overhaul  
**Estimated Duration:** 10-13 days (2-3 weeks) ✅ **OPTIMIZED: -2-3 days via boardgame.io**  
**Successor to:** Phase 3 (100% complete)
**Architecture:** boardgame.io (recommended by game-web-spec.md)

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
| **P4.1** | Multiplayer Infrastructure | **2-3 days** ⚡ | boardgame.io setup, lobby, game sync |
| **P4.2** | AI Engine & Strategies | 4-5 days | Decision tree, 5 AI difficulty levels |
| **P4.3** | Visual Redesign | 3-4 days | Card images, portal UI, game board assets |
| **P4.4** | Integration & Polish | **1 day** ⚡ | End-to-end testing, deployment |

**Total: 10-13 days** ⚡ **(Optimized: -2-3 days vs custom Socket.io)**

**Key Change:** Using **boardgame.io** (as specified in game-web-spec.md) instead of custom Express + Socket.io saves 2-3 days on P4.1 and simplifies P4.4.

---

## 🌐 P4.1: Multiplayer Infrastructure (2-3 Days) ⚡

### Architecture: boardgame.io Framework

**Why boardgame.io?**
- ✅ Built-in multiplayer (WebSocket)
- ✅ Automatic state synchronization
- ✅ Built-in lobby system
- ✅ Turn-based game flow management
- ✅ Move validation
- ✅ Reconnection handling
- ✅ Already recommended in game-web-spec.md
- ✅ Saves 2-3 days vs custom Socket.io

**Framework provides:**
```
✅ Multiplayer Lobby
✅ Room Management (create/join/leave)
✅ Game State Synchronization
✅ Turn Management
✅ Move Validation
✅ Spectator Mode
✅ Undo/Redo Support
```

**You provide:**
```
✅ Game rules (Moves in boardgame.io)
✅ AI strategies (custom bot logic)
✅ React UI components
✅ Visual assets
```

---

### 4.1.1 Game Setup with boardgame.io

**Goal:** Initialize boardgame.io game engine with Portale von Molthar rules

```typescript
// src/game/game.ts
import { Game, INVALID_MOVE } from 'boardgame.io/core';
import { PluginPlayer } from 'boardgame.io/plugins/plugin-player';

export const PortaleVonMolthar = {
  name: 'portale-von-molthar',
  minPlayers: 2,
  maxPlayers: 5,
  
  setup: (ctx) => ({
    pearlDeck: [...],      // 56 cards
    characterDeck: [...],  // 54 cards
    players: {
      [ctx.currentPlayer]: {
        hand: [],
        portal: [],
        activatedCharacters: [],
        powerPoints: 0,
        diamonds: 0
      }
    },
    pearlSlots: [],        // 4 face-up pearl cards
    characterSlots: [],    // 2 face-up character cards
    discardPile: []
  }),
  
  moves: {
    takePearlCard: (G, ctx, slotIndex) => {
      // Validate and execute move
      // Return INVALID_MOVE if not allowed
    },
    activateCharacter: (G, ctx, pearlCards) => {
      // Cost validation
      // State update
    },
    // ... other moves
  },
  
  turn: {
    maxMoves: 3,  // 3 actions per turn
    onBegin: (G, ctx) => {
      // Reset action count
    },
    onEnd: (G, ctx) => {
      // Check for hand limit, trigger final round, etc
    }
  },
  
  endIf: (G, ctx) => {
    // Check win condition (12+ power points)
    // Return { winner: playerId } or undefined
  },
  
  plugins: [PluginPlayer()]
};
```

**Deliverables:**
- [ ] Game definition with moves
- [ ] Move validation logic
- [ ] Game state setup
- [ ] Win condition
- [ ] Turn management

---

### 4.1.2 Frontend Integration

**Goal:** Connect React frontend to boardgame.io server

```typescript
// src/pages/GamePage.tsx
import { Client } from 'boardgame.io/react';
import { PortaleVonMolthar } from '../game/game';
import { Board } from '../components/Board';

const MyGame = Client({
  game: PortaleVonMolthar,
  board: Board,
  multiplayer: {
    server: process.env.VITE_BOARDGAME_SERVER,
    // e.g., 'http://localhost:8000' or 'https://api.railway.app'
  },
  debug: false
});

export default MyGame;
```

**What you get automatically:**
- ✅ Multiplayer connectivity
- ✅ State synchronization
- ✅ Move validation
- ✅ Turn management
- ✅ Reconnection
- ✅ Undo/Redo buttons

**What you implement:**
- ✅ Board component (React)
- ✅ Card display
- ✅ Action buttons
- ✅ Player hand UI

**Deliverables:**
- [ ] Board React component
- [ ] Player UI components
- [ ] Card display components
- [ ] Action buttons
- [ ] Game state hooks

---

### 4.1.3 Lobby Integration

**Goal:** Allow players to create and join games

```typescript
// Built-in boardgame.io Lobby
import { Lobby } from 'boardgame.io/react';

export function GameLobby() {
  return (
    <Lobby
      gameServer={process.env.VITE_BOARDGAME_SERVER}
      lobbyServer={process.env.VITE_LOBBY_SERVER}
      gameComponents={[
        { game: PortaleVonMolthar, board: Board }
      ]}
    />
  );
}
```

**Features provided:**
- ✅ Game list
- ✅ Create room
- ✅ Join room
- ✅ Player selection
- ✅ Ready button
- ✅ Start game

**Deliverables:**
- [ ] Lobby page
- [ ] Custom styling for lobby
- [ ] Player name input
- [ ] Game settings (2-5 players, include AI)

---

### 4.1.4 Server Deployment

**Goal:** Deploy boardgame.io server to Railway

**Option A: Using boardgame.io CLI (Simplest)**

```bash
# Install boardgame.io
npm install boardgame.io

# Create server config
npx boardgame.io start

# Deploy to Railway
git push origin main
```

**Option B: Custom Node.js Server (More Control)**

```typescript
// server.ts
import { Server } from 'boardgame.io/server';
import { PortaleVonMolthar } from './game';

const server = Server({
  games: [PortaleVonMolthar],
  port: process.env.PORT || 8000
});

server.run(() => {
  console.log('Game server running on port 8000');
});
```

**Deployment:**
- [ ] Deploy to Railway
- [ ] Set environment variables
- [ ] Test WebSocket connection
- [ ] Configure CORS
- [ ] Enable HTTPS (WSS)

**Environment Variables:**
```bash
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://portale-von-molthar.vercel.app
GAME_SERVER=https://api.railway.app
LOBBY_SERVER=https://api.railway.app/lobby
```

---

### 4.1.5 Testing

**Deliverables:**
- [ ] Local game creation and joining
- [ ] Multiplayer move validation
- [ ] State synchronization (all players see same state)
- [ ] Player disconnection and reconnection
- [ ] Win condition triggering
- [ ] Final round mechanics
- [ ] Spectator support (if enabled)

**Testing checklist:**
- [ ] Create room with 2 players
- [ ] Both players see game state
- [ ] Player 1 makes move → Player 2 sees update immediately
- [ ] Player 2 makes move → Player 1 sees update
- [ ] Disconnect Player 1 → Reconnect → Sees current state
- [ ] Win condition triggered at 12+ power points
- [ ] Final round executes correctly

---

### 4.1.6 What's NOT in boardgame.io (You implement)

**Visual UI Components** (boardgame.io provides game logic, you provide UI)
- [ ] Board component (React) - displays game state visually
- [ ] Card components - pearl cards, character cards
- [ ] Player hand UI
- [ ] Portal zone display
- [ ] Character slots display
- [ ] Action buttons (move triggers)
- [ ] Turn indicator
- [ ] Score display
- [ ] Animations and transitions

**AI Player Integration** (boardgame.io provides bot framework, you implement strategies)
- [ ] AI player detection in game setup
- [ ] AI decision engine (5 strategies)
- [ ] AI move execution
- [ ] Automatic turn triggering for AI
- [ ] Difficulty level selection in lobby

**Admin/Debug Tools** (not provided by boardgame.io)
- [ ] Game state viewer
- [ ] Move history inspector
- [ ] Card manager integration
- [ ] Test utilities

---

### 4.1.7 Expected Code Size

**With boardgame.io:**
- Game definition: ~200-300 lines
- Board component: ~400-500 lines
- Lobby customization: ~100-200 lines
- **Total: ~700-1000 lines** ⚡

**Compared to custom Socket.io:**
- Server setup: ~500+ lines
- Room management: ~200-300 lines
- State sync: ~150-200 lines
- Event handlers: ~200-300 lines
- Client integration: ~300-400 lines
- **Total: ~1500-1800 lines** 

**Saving: 500-800 lines of code**

---

## 🤖 P4.2: AI Engine & Strategies (4-5 Days)

**Note:** boardgame.io provides the bot framework, you implement custom strategies.

### 4.2.1 AI Integration with boardgame.io

**boardgame.io Bot Framework:**

```typescript
// Integrate AI into game definition
import { AI } from 'boardgame.io/ai';

export const PortaleVonMolthar = {
  // ... game definition ...
  
  // Optional: Add AI players automatically
  plugins: [
    PluginPlayer({
      // Enable random AI players
      setup: (ctx) => ctx.numPlayers
    })
  ]
};

// Use custom AI via enumerate pattern
const aiGame = {
  ...PortaleVonMolthar,
  ai: {
    strategies: {
      'conservative': new ConservativeStrategy(),
      'aggressive': new AggressiveStrategy(),
      'balanced': new BalancedStrategy(),
      'adaptive': new AdaptiveStrategy(),
      'monte-carlo': new MonteCarloStrategy()
    }
  }
};
```

---

### 4.2.2 AI Strategy Interface

**Define the strategy pattern:**

```typescript
interface AIStrategy {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'genius';
  aggressiveness: number;  // 0-1 (0=conservative, 1=aggressive)
  greediness: number;      // 0-1 (0=save resources, 1=spend)
  adaptability: number;    // 0-1 (0=fixed strategy, 1=responds to board)
  winRate: number;         // Expected win rate (0.25-0.75)
  
  decideTurn(G: GameState, ctx: Context): GameAction;
  evaluateMove(move: GameAction, G: GameState): number; // Score move 0-1
  selectCard(candidates: PearlCard[]): PearlCard;
}

abstract class BaseAIStrategy implements AIStrategy {
  // Common logic
  decideTurn(G: GameState, ctx: Context): GameAction {
    const validMoves = this.getValidMoves(G, ctx);
    const scored = validMoves.map(move => ({
      move,
      score: this.evaluateMove(move, G)
    }));
    return this.selectMove(scored);
  }
  
  abstract evaluateMove(move: GameAction, G: GameState): number;
}
```

---

### 4.2.2 Five AI Strategies

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

### 4.4.2 Deployment - boardgame.io Architecture

#### **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                  Production Environment                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Frontend (React SPA)                           │  │
│  │   - Vercel CDN                                   │  │
│  │   - game-web/ directory                          │  │
│  │   - Build: npm run build                         │  │
│  │   - HTTPS: Automatic                             │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │ WebSocket Upgrade                │
│                     │ (HTTPS → WSS)                    │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │   boardgame.io Server                            │  │
│  │   - Railway (persistent container)               │  │
│  │   - Node.js + boardgame.io framework             │  │
│  │   - Lobby management (built-in)                  │  │
│  │   - Room management (built-in)                   │  │
│  │   - Game state sync (automatic)                  │  │
│  │   - Move validation (built-in)                   │  │
│  │   - WebSocket support (native)                   │  │
│  │   - Your custom moves & AI logic                 │  │
│  └──────────────────┬───────────────────────────────┘  │
│                     │                                   │
│  ┌──────────────────▼───────────────────────────────┐  │
│  │   Optional: Database                             │  │
│  │   - Game history                                 │  │
│  │   - Player stats                                 │  │
│  │   - ELO/rankings                                 │  │
│  │   PostgreSQL (on Railway) or MongoDB             │  │
│  └─────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

Vercel (Frontend) → Railway (boardgame.io Server)
HTTP/HTTPS → WebSocket → In-memory game state
```

**Key improvements with boardgame.io:**
- ✅ Built-in lobby system (no custom code)
- ✅ Automatic state synchronization (no custom code)
- ✅ Native WebSocket support (works on Railway)
- ✅ Move validation built-in (no custom code)
- ✅ Turn management built-in (no custom code)
- ✅ Spectator mode built-in (no custom code)

---

#### **4.4.2.1 Frontend Deployment - Vercel**

**Vercel Benefits:**
- ✅ Zero-config deployment from GitHub
- ✅ Automatic builds on every push
- ✅ Preview deployments for PRs
- ✅ CDN globally distributed
- ✅ HTTPS automatic
- ✅ Environment variables management
- ✅ Analytics & monitoring built-in
- ✅ Perfect for static/SPA React apps
- ✅ Free tier generous (100GB bandwidth/month)

**⚠️ Vercel CANNOT run backend because:**
- ❌ Edge Functions timeout at 10 seconds (WebSocket needs persistent connections)
- ❌ No true persistent server state
- ❌ Socket.io requires TCP-level WebSocket support (not available on Vercel Functions)

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

#### **4.4.2.2 Backend Deployment - Railway (boardgame.io Server)**

**Why Railway for boardgame.io Server?**
- ✅ Persistent container (always running - boardgame.io needs this)
- ✅ WebSocket support at TCP level (boardgame.io multiplayer)
- ✅ Game state stays in memory (room data)
- ✅ Low latency (100ms average)
- ✅ Simple Node.js deployment
- ✅ Cost: $7-50/month (predictable)

**Simple boardgame.io Server (server.ts):**

```typescript
// server.ts
import { Server } from 'boardgame.io/server';
import { PortaleVonMolthar } from './game';

const gameServer = Server({
  games: [PortaleVonMolthar],
  port: process.env.PORT || 8000
});

gameServer.run(() => {
  console.log(`Game server running on port ${process.env.PORT || 8000}`);
});
```

**package.json:**
```json
{
  "name": "portale-backend",
  "scripts": {
    "start": "ts-node src/server.ts",
    "build": "tsc",
    "dev": "ts-node-dev src/server.ts"
  },
  "dependencies": {
    "boardgame.io": "^0.50.0",
    "typescript": "^5.0.0"
  }
}
```

**Deploy to Railway:**

```bash
# No Docker needed! Railway auto-detects Node.js

# 1. Connect GitHub to Railway
# 2. Select /backend folder
# 3. Railway automatically runs: npm install && npm start
# 4. Gets URL: https://api.railway.app
```

**Environment Variables (Railway Dashboard):**
```
PORT=8000
NODE_ENV=production
FRONTEND_URL=https://portale-von-molthar.vercel.app
```

**Test the deployment:**
```bash
# Connection should work
curl https://api.railway.app/

# WebSocket should upgrade to WSS automatically
```

---

**Option B: Heroku (Still works, but Railway is cheaper)**

```bash
# Heroku no longer has free tier
# But if you want to use it:
npm install -g heroku
heroku login
heroku create portale-backend
git push heroku main
heroku logs --tail
```

---

**Option C: AWS Fargate (Overkill for this, complex setup)**
- More expensive than Railway
- More complex to configure
- Only use if you have 10,000+ concurrent users
- **Not recommended for P4**

---

#### **4.4.2.3 Correct Architecture for P4**

**Frontend → Vercel (HTTP/HTTPS)**
```
Browser → Vercel CDN
         ↓
     Static HTML/JS/CSS
         ↓
   User sees UI fast
```

**Frontend + Backend → Railway (WebSocket)**
```
Browser → Vercel CDN (gets JS)
    ↓
    JS loads
    ↓
    JS opens WebSocket
         ↓
      To: wss://api.railway.app
         ↓
   Backend (Node.js) on Railway
         ↓
   Game state synced
```

**DO NOT try:**
- ❌ WebSocket on Vercel (won't work)
- ❌ Full app on Railway (fast builds on Vercel)
- ❌ REST API only (real-time won't work)

---

#### **4.4.2.4 WebSocket Configuration (Correct Way)**

**Important: WebSocket upgrade from HTTPS → WSS**

```typescript
// src/lib/socket-client.ts (Frontend)
import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (process.env.NODE_ENV === 'development') {
    // Local development: ws://localhost:3001
    return import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001';
  }
  // Production: Always use WSS on HTTPS
  return import.meta.env.VITE_WEBSOCKET_URL || 'wss://api.portale-von-molthar.com';
};

export const socket = io(getSocketURL(), {
  transports: ['websocket', 'polling'],  // Try WS first, fallback to polling
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  secure: location.protocol === 'https:',  // Auto-detect
});

socket.on('connect', () => {
  console.log('[Socket] Connected');
});

socket.on('disconnect', (reason) => {
  console.log('[Socket] Disconnected:', reason);
});
```

**Environment Variables (Frontend):**

```bash
# .env.local (development)
VITE_WEBSOCKET_URL=ws://localhost:3001
VITE_BACKEND_URL=http://localhost:3001

# .env.production (for Vercel)
VITE_WEBSOCKET_URL=wss://api.portale-von-molthar.railway.app
VITE_BACKEND_URL=https://api.portale-von-molthar.railway.app
```

**Backend (Express Server):**

```typescript
// src/server.ts
import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const httpServer = createServer(app);

// Socket.io auto-enables WebSocket upgrade
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

// Server listens on PORT (3001 local, Railway assigns)
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Railway auto-enables WSS:**
- Takes HTTP request to /socket.io
- Detects WebSocket upgrade header
- Switches to persistent WebSocket connection
- Uses Railway's HTTPS certificate (auto)
- Result: wss://api.portale-von-molthar.railway.app

---

#### **4.4.2.5 Asset Optimization for Vercel CDN**

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

---

**Document Version:** 1.2  
**Last Updated:** Session (Integrated boardgame.io Framework)  
**Architecture:** boardgame.io (game logic) + React (UI) + Railway (server) + Vercel (frontend)  
**Status:** Ready for implementation  
**Timeline:** 10-13 days (optimized: -2-3 days vs custom Socket.io)  
**Key Change:** Using boardgame.io instead of custom Express + Socket.io saves development time and reduces bugs

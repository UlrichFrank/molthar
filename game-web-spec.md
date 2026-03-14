# game-web-spec.md
# Technische Spezifikation: Webbasierte Multiplayer-Applikation "Portale von Molthar"

---

## 📋 Executive Summary

**Projektname:** Portale von Molthar — Web Edition  
**Plattform:** Web (Browser-basiert, responsive)  
**Game Engine:** boardgame.io  
**Tech Stack:** React 18, TypeScript, Shadcn/UI, Tailwind CSS, Vite, pnpm  
**Hosting:** Vercel (Frontend + Backend)  

### Ziel
Digitale Multiplayer-Adaption des Kartenspiels "Portale von Molthar" als moderne Web-Applikation mit vollständiger Spielregel-Umsetzung, responsivem Design für alle Geräte, und Multiplayer-Funktionalität via boardgame.io.

### Key Features
- ✅ **Turn-basiertes Spiel** mit vollständiger Regelumsetzung (3 Aktionen pro Zug, Kostenvalidierung)
- ✅ **Spezialfähigkeiten** (Rot/Blau Abilities, Irrlicht-Mechanik)
- ✅ **Responsive UI** für iPhone, Tablet, Desktop
- ✅ **Multiplayer** via boardgame.io (HTTP + WebSocket)
- ✅ **Admin-Tools** (Card Management, Game State Debugging)
- ✅ **Networking** mit State-Synchronisierung

---

## 🎮 Spielübersicht & Regelwerk

### Kernmechaniken

**Spiel-Setup:**
- 2–5 Spieler
- Drei Decks: Perlen (56 Karten, Werte 1–8), Charaktere (54 Karten), Ablagestapel
- Jeder Spieler hat ein Portal und Handkarten (max 5 am Ende des Zuges)
- 4 Perlenkarten und 2 Charakterkarten offen auf dem Tisch

**Turn-Struktur (3 Aktionen max.):**
1. **Pearl Card nehmen** — Eine der 4 offenen Perlen oder vom Nachziehstapel
2. **Pearl Cards ersetzen** — Alle 4 offenen Perlen entfernen und neue nachziehen
3. **Charakter ablegen** — Eine der 2 offenen Charakterkarten oder vom Deck auf sein Portal (max 2 Charaktere)
4. **Charakter aktivieren** — Perlenkarten aus der Hand spielen, Charakter um 180° drehen, rechts neben Portal legen

**Kosten-Systeme** — Komponentenbasiertes System (9 Komponenten-Typen):

Das neue CostComponent-System ermöglicht flexible Kosten-Kombinationen:

- `number: { value: 1-8 }` — Genau eine Perlenkarte mit Wert (z.B. single 3)
- `nTuple: { n: 2 }` — N Karten mit gleichem Wert, beliebig (z.B. 2x beliebig)
- `sumAnyTuple: { sum: 10 }` — Beliebig viele Karten, Summe = X (z.B. Summe 10)
- `sumTuple: { n: 3, sum: 15 }` — Genau N Karten mit Summe X (z.B. 3 Karten, Summe 15)
- `run: { length: 3 }` — Aufeinanderfolgende Werte (z.B. 4-5-6)
- `evenTuple: { n: 3 }` — N gerade Perlenkarten (z.B. 3x gerade: 2,4,6,8)
- `oddTuple: { n: 4 }` — N ungerade Perlenkarten (z.B. 4x ungerade: 1,3,5,7)
- `diamond` — Diamant-Modifikator (einzeln oder mit anderen kombiniert)
- `drillingChoice: { value1: 3, value2: 5 }` — Paar/Drilling von Wert A ODER B

**Komponenten kombinieren sich zu AND-Bedingungen:**
- `[nTuple(2), nTuple(2)]` = 2 Paare (Paar 1 UND Paar 2)
- `[number(1), number(2), number(3)]` = Exakt Werte 1, 2, 3 (UND verknüpft)
- `[run(3), diamond]` = 3er Reihe + 1 Diamant (beide erforderlich)

**Diamanten-Modifikatoren:**
- Pro aktivierter Charakter erhalten Spieler Diamanten
- Diamanten können beim Aktivieren von Charakteren genutzt werden, um Perlenwerte um 1 zu erhöhen
- Max. 1 Diamant pro Perlenkarte
- Nicht erlaubt: 9er-Perlenkarte bilden oder Wert 0 bilden

### Machtpunkte & Spielende

**Aktivierte Charaktere** bringen Machtpunkte (0–5 pro Charakter).

**Game End Trigger:**
- Sobald ein Spieler ≥12 Machtpunkte erreicht → **Final Round** wird ausgelöst
- Final Round läuft bis zum rechten Nachbarn des Startspielers
- Danach erhält jeder verbleibende Spieler noch genau einen Zug
- **Gewinner:** Spieler mit den meisten Machtpunkten
- **Tiebreaker:** Bei Gleichstand entscheidet die Anzahl der Diamanten

### Spezialfähigkeiten

#### Rote Fähigkeiten (Sofort, einmalig)
- **Extra Actions** — +3 Aktionen in diesem Zug
- **Next Player +1** — Nächster Spieler hat +1 Aktion in seinem nächsten Zug
- **Discard Opponent Character** — Ein Charakter vom Portal eines Gegners wird abgeworfen
- **Steal Opponent Card** — Eine Handkarte eines Gegners wird gestohlen
- **Take Back Pearl** — Eine gerade ausgespielte Perlenkarte wird zurückgenommen

#### Blaue Fähigkeiten (Dauerhaft, aktiv nach Aktivierung)
- **Ones as Eights** — 1er-Perlenkarten zählen als 8er
- **Threes are Jokers** — 3er-Perlenkarten können jeden Wert (1–8) annehmen
- **Trade 2s for Diamonds** — 2er-Perlenkarten gegen Diamanten tauschen
- **Hand Limit +1** — Handkartenlimit erhöht sich auf 6
- **Actions +1** — Ein zusätzliche Aktion pro Zug
- **Card Exchange** — Vor dem ersten Zug: Charakter vom Portal mit offener Karte tauschen
- **Hand Reshuffle** — Nach dem letzten Zug: Alle Handkarten ablegen, gleich viele nachziehen
- **Peek Deck** — Vor dem ersten Zug: Oberste Charakterkarte anschauen
- **Reduce Pearl Values** — Mit Diamanten Perlenwerte um 1 verringern (umgekehrt zu Standard)
- **Virtual Pearls** — Charakterkarte zeigt 1–2 virtuelle Perlenkarten, die bei Aktivierung mitgezählt werden

#### Spezial: Irrlicht
- Charakter wird "auf dem Kopf" auf das Portal gelegt
- Beide Nachbarn des Spielers können den Irrlicht **in ihrem Zug** zusätzlich aktivieren
- Jeder der drei (Portal-Besitzer, linker und rechter Nachbar) kann den Irrlicht aktivieren und erhält die Machtpunkte
- Aktivierter Irrlicht wird rechts neben das Portal des aktivierenden Spielers gelegt

### Das Tauschsymbol
Wenn beim Nachziehen von Perlenkarten eine Karte mit dem Tauschsymbol aufgedeckt wird:
- Beide offenen Charakterkarten werden sofort auf den Ablagestapel gelegt
- Zwei neue Charakterkarten vom Nachziehstapel werden aufgedeckt

### Handkartenlimit
Am Ende eines Zuges darf ein Spieler max. 5 Handkarten haben (oder 6 mit "Hand Limit +1"-Fähigkeit).  
Überzählige Karten müssen auf den Ablagestapel gelegt werden.

---

## 🎨 UI/UX Design

### Responsive Breakpoints

```
Mobile (< 640px):
  - Single-column layout
  - Vertikaler Spielfluss (unten: eigener Portal + Hand, oben: Gegner)
  - Kompakte Kartenansicht (Thumbnails)
  - Swipe-Navigation

Tablet (640px – 1024px):
  - Zwei-Spalten Layout (Spieler links/rechts)
  - Tischmitte zentral angeordnet
  - Moderate Kartengröße

Desktop (> 1024px):
  - Vollständiger Spieltisch
  - Alle Spieler rundum sichtbar
  - Volle Kartengröße
  - Hover-Effekte & Animationen
```

### Component Hierarchy

```
App
├── Router
│   ├── StartScreen
│   │   ├── MainMenu
│   │   └── GameRules (Rulebook)
│   ├── LobbyView
│   │   ├── HostJoinSelector
│   │   ├── PlayerList
│   │   └── GameStartButton
│   ├── GameBoardView
│   │   ├── Header (Turn Indicator, Players)
│   │   ├── TableCenter
│   │   │   ├── PearlCardSlot (x4)
│   │   │   ├── CharacterCardSlot (x2)
│   │   │   ├── PearlDeck & Discard
│   │   │   └── CharacterDeck & Discard
│   │   ├── PlayerPortals (Responsive Layout)
│   │   │   ├── YourPortal (Large)
│   │   │   │   ├── PortalSlots (x2)
│   │   │   │   ├── ActivatedCharacters
│   │   │   │   ├── Diamonds
│   │   │   │   ├── PowerPoints Display
│   │   │   │   └── HandCards (Interactive)
│   │   │   └── OpponentPortals (Compact)
│   │   │       ├── PortalPreview
│   │   │       ├── ActivatedCharactersPreview
│   │   │       ├── HandSize Indicator
│   │   │       └── PowerPoints Display
│   │   ├── ActionPanel
│   │   │   ├── ActionButtons
│   │   │   ├── CostValidator
│   │   │   └── UndoButton
│   │   └── GameLog / Chat
│   ├── GameOverScreen
│   │   ├── Leaderboard
│   │   ├── Stats
│   │   └── PlayAgainButton
│   └── AdminPanel (Dev-Mode)
│       ├── GameStateInspector
│       ├── CardBrowser
│       └── GameStateDebugger
│
├── CardManager (Separate Route)
│   └── (Integrated card-manager from Phase 5)
│
└── Global State (boardgame.io)
    └── GameEngine (Moves & State)
```

### Design Principles

- **Clarity** — Spielzustand immer klar erkennbar (Wessen Zug? Wie viel Aktionen? Welche Kosten?)
- **Accessibility** — High Contrast, Keyboard Navigation, Screen Reader Support
- **Performance** — Lazy Loading, Efficient Re-renders, Network Optimization
- **Responsiveness** — Mobile-First Design, Fluid Layouts
- **Visual Feedback** — Hover, Selection, Animations für Actions

### Key UI Components

#### 1. **Card Representations**
```
PearlCard:
  - Value (1–8)
  - Swap Symbol Indicator
  - Selected State
  - Draggable

CharacterCard:
  - Name
  - Image
  - Power Points
  - Diamonds Reward
  - Cost Display
  - Abilities Icons
  - Activated State
  - Flipped State (180°)

PortalSlot:
  - Card Slot (0–2 cards)
  - Empty State
  - Card Selection UI
```

#### 2. **Player Portal**
```
LocalPlayer:
  - Portal (visual container)
  - Active Characters (right side)
  - Diamonds Counter
  - Power Points Counter
  - Hand Cards (interactive, selectable)
  - Action Counter (3/3, 2/3, etc.)

OpponentPlayer:
  - Compact Portal Preview
  - Hidden Hand (card count only)
  - Active Characters (small)
  - Power Points Counter
  - Diamonds Counter
```

#### 3. **Turn Indicator**
```
Current Player:
  - Pulsing border / highlight
  - Player name in color
  - "Your Turn" / "{PlayerName}'s Turn" label
  - Remaining Actions display
```

#### 4. **Action Panel**
```
Buttons:
  - [Take Pearl Card]
  - [Replace All Pearl Cards]
  - [Place Character]
  - [Activate Character] (conditional)
  - [Undo Last Action]
  - [End Turn]

Validators:
  - Cost Display (when selecting cards)
  - "Can activate this character?" feedback
  - Valid card selection highlight
```

### Animations

- **Card Draw** — Slide from deck to hand
- **Character Activation** — 180° flip + move to activated area
- **Card Selection** — Scale + glow effect
- **Turn Transition** — Fade out active player, fade in next
- **Ability Trigger** — Flash effect on character card

---

## 🔧 Tech Stack & Architektur

### Frontend Stack

```
UI Framework:
  - React 18 (Hooks-based)
  - TypeScript 5 (Type Safety)
  - Shadcn/UI (Pre-built Components)
  - Tailwind CSS (Utility-first Styling)
  
Router:
  - TanStack Router (or React Router v6)
  
State Management:
  - boardgame.io (Game State + Moves)
  - React Context (UI State, Theme)
  
Build Tool:
  - Vite (Fast bundling & HMR)
  
Package Manager:
  - pnpm (Fast, efficient)

Linting & Formatting:
  - ESLint
  - Prettier
```

### Game Engine: boardgame.io

**Why boardgame.io?**
- Purpose-built for turn-based games
- Handles game state mutations immutably
- Built-in multiplayer (HTTP, WebSocket)
- Move validation framework
- Game logs & replay capability
- Excellent TypeScript support

**Integration Points:**
1. Define `Game` object with Game Rules
2. Define `GameState` Type
3. Define `Moves` (GameActions)
4. Moves handle validation & state mutations
5. Component consumers subscribe to state changes

### File Structure

```
game-web/
├── src/
│   ├── game/                          # Game Engine (boardgame.io)
│   │   ├── index.ts                   # Game definition export
│   │   ├── game-engine.ts             # Game moves & setup
│   │   ├── game-state.ts              # Type definitions
│   │   ├── rules/
│   │   │   ├── cost-validator.ts      # Cost checking logic
│   │   │   ├── abilities.ts           # Special ability resolver
│   │   │   ├── deck-manager.ts        # Deck shuffling & refill
│   │   │   └── end-conditions.ts      # Game end logic
│   │   ├── cards/
│   │   │   ├── card-types.ts          # Card interfaces
│   │   │   └── card-data.ts           # Card data (imported from card-manager)
│   │   └── utils/
│   │       ├── game-helpers.ts        # Utility functions
│   │       └── constants.ts           # Game constants
│   │
│   ├── components/                     # React UI Components
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── GameBoardLayout.tsx
│   │   │   └── ResponsiveContainer.tsx
│   │   ├── screens/
│   │   │   ├── StartScreen.tsx        # Menu
│   │   │   ├── LobbyScreen.tsx        # Game Setup
│   │   │   ├── GameBoardScreen.tsx    # Main Game
│   │   │   └── GameOverScreen.tsx     # Results
│   │   ├── game-board/
│   │   │   ├── GameBoard.tsx          # Main board container
│   │   │   ├── TableCenter.tsx        # Pearl & character display
│   │   │   ├── PlayerPortal.tsx       # Player portal display
│   │   │   ├── OpponentPortal.tsx     # Opponent portal (compact)
│   │   │   └── HandCards.tsx          # Hand card display
│   │   ├── cards/
│   │   │   ├── CardComponent.tsx
│   │   │   ├── PearlCard.tsx
│   │   │   ├── CharacterCard.tsx
│   │   │   └── CardSlot.tsx
│   │   ├── ui/
│   │   │   ├── ActionPanel.tsx
│   │   │   ├── TurnIndicator.tsx
│   │   │   ├── PowerPointsDisplay.tsx
│   │   │   ├── DiamondCounter.tsx
│   │   │   ├── GameLog.tsx
│   │   │   └── Modal.tsx
│   │   └── admin/
│   │       ├── GameStateDebugger.tsx
│   │       ├── CardBrowser.tsx
│   │       └── AdminPanel.tsx
│   │
│   ├── hooks/
│   │   ├── useGameState.ts            # boardgame.io state hook
│   │   ├── useGameMoves.ts            # boardgame.io moves hook
│   │   ├── useResponsive.ts           # Responsive layout hook
│   │   ├── useGameRules.ts            # Rules validation hook
│   │   └── useLocalStorage.ts         # Persistence hook
│   │
│   ├── lib/
│   │   ├── api.ts                     # boardgame.io API client
│   │   ├── types.ts                   # TypeScript type definitions
│   │   ├── constants.ts               # App constants
│   │   └── utils.ts                   # Helper functions
│   │
│   ├── styles/
│   │   ├── globals.css                # Global styles
│   │   ├── animations.css             # Animation definitions
│   │   └── theme.css                  # CSS variables (theming)
│   │
│   ├── App.tsx                        # Root component
│   ├── main.tsx                       # Entry point
│   └── vite-env.d.ts                  # Vite type definitions
│
├── public/
│   ├── assets/
│   │   ├── cards/
│   │   │   ├── pearl-cards/           # Pearl card images
│   │   │   └── character-cards/       # Character card images
│   │   └── icons/                     # UI icons (or use lucide-react)
│   └── index.html
│
├── tests/
│   ├── game/
│   │   ├── game-engine.test.ts
│   │   ├── cost-validator.test.ts
│   │   ├── abilities.test.ts
│   │   └── end-conditions.test.ts
│   ├── components/
│   │   └── GameBoard.test.tsx
│   └── e2e/
│       └── gameplay.spec.ts           # Playwright E2E tests
│
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── prettier.config.js
├── .env.example
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### Game State Type Definition

```typescript
interface GameState {
  players: {
    [playerId: string]: PlayerState;
  };
  currentPlayer: string;
  turn: number;
  round: number;
  phase: 'setup' | 'takingActions' | 'discardingExcess' | 'gameFinished';
  actionsRemaining: number;
  
  board: {
    pearlCards: PearlCard[];        // 4 face-up pearl cards
    characterCards: CharacterCard[]; // 2 face-up character cards
    pearlDeck: PearlCard[];         // Remaining pearl deck
    characterDeck: CharacterCard[]; // Remaining character deck
    pearlDiscard: PearlCard[];      // Pearl discard pile
    characterDiscard: CharacterCard[]; // Character discard pile
  };
  
  gameHistory: GameAction[];        // For replays
  finalRoundTriggered: boolean;     // When 12+ power points reached
  gameOverTriggers: { [playerId]: boolean }; // Final round tracking
}

interface PlayerState {
  id: string;
  name: string;
  hand: PearlCard[];
  portal: PortalSlots; // { left?: CharacterCard, right?: CharacterCard }
  activatedCharacters: CharacterCard[]; // Right side of portal
  diamonds: number;
  powerPoints: number;
  passedFinalRound: boolean;
}
```

### Moves Definition (boardgame.io)

```typescript
const moves = {
  // Moves map to GameActions
  takePearlCard: (G, ctx, pearlIndex) => {
    // Validate: Is this player's turn? Can they take this card?
    // Mutate state: Move pearl to hand, refill from deck, check swap symbol
  },
  
  replacePearlCards: (G, ctx) => {
    // Validate: Is this player's turn? Do they have actions?
    // Mutate: Replace all 4 pearls, refill from deck
  },
  
  placeCharacter: (G, ctx, characterIndex, portalSlot) => {
    // Validate: Is this player's turn? Character available? Portal slot free?
    // Mutate: Place character on portal
  },
  
  activateCharacter: (G, ctx, pearlIndices, characterIndex) => {
    // Validate: Cost check, pearls available, character can be activated?
    // Mutate: Flip character, move to activated, add power points/diamonds
    // Handle: Red abilities (trigger immediately)
  },
  
  endTurn: (G, ctx) => {
    // Validate: Enforce hand limit (<= 5 cards)
    // Mutate: Discard excess cards, move to next player
    // Check: Game end condition (12+ power points)
  },
  
  undo: (G, ctx) => {
    // (Optional) Revert last action within the turn
  }
};
```

---

## 🌐 Lobby System & Match Management

### Überblick

Das Lobby-System basiert auf der **boardgame.io Lobby REST API** und ermöglicht:
- **Match Creation** — Spieler erstellt neues Spiel (2–5 Spieler)
- **Player Join** — Andere Spieler treten Spiel bei
- **Credential Authentication** — Sichere Move-Validierung pro Spieler
- **Match Discovery** — Aktive Spiele auflistbar
- **Rematch Support** — Play Again nach Game Over

### Lobby Architecture & Game Lifecycle

```
GAME LIFECYCLE:

1. HOST CREATES GAME
   User: Wählt "Create Game" → Spieleranzahl (2-5)
   Client: POST /games/molthar/create { numPlayers: 3 }
   Server: Generiert matchID, erstellt Match-Struktur
   Client: Host auto-joins als Player 0 → erhalten credentials
   Route: LobbyWaitingRoom (zeigt "Warten auf Spieler...")

2. PLAYERS JOIN
   User: Sehen verfügbare Games → Wählen eines aus
   Client: POST /games/molthar/{matchID}/join { playerName: "Alice" }
   Server: Assigned playerID, generiert credentials
   Client: Speichert credentials lokal, Route zu LobbyWaitingRoom
   Client: Subscribed zu Match-Updates (WebSocket oder Polling)
   Server: Broadcast an alle Connected Clients: "Player joined"

3. HOST STARTS GAME
   Host: Sieht "Start Game" Button (nur wenn alle Slots gefüllt)
   Client: POST /games/molthar/{matchID}/start
   Server: Set Match State to STARTED
   Broadcast: Alle Clients → Route zu GameBoard
   Pass: matchID, playerID, credentials zu GameBoard

4. GAME PLAY
   GameBoard: boardgame.io Client startet
   GameBoard: Subscribed zu Match State via WebSocket
   Players: Senden Moves via Credentials-geschützte API
   Server: Validiert Moves, Broadcasts neuen State
   All Clients: Erhalten State Update → UI rerenders

5. GAME FINISHED
   GameEngine: Detectet 12+ Power Points + Final Round abgelaufen
   Server: Set Match State to FINISHED, Broadcast GameOver
   All Clients: Route zu GameOverScreen
   Show: Leaderboard, Stats, "Play Again" Button

6. PLAY AGAIN (OPTIONAL)
   User: Klickt "Play Again"
   Client: POST /games/molthar/{matchID}/playAgain { playerID, credentials }
   Server: Erstellt nextMatchID (neue Match mit gleicher Spieleranzahl)
   Client: Route zu neuer GameBoard
   Loop: Zurück zu Step 4
```

### boardgame.io Lobby REST API Reference

**Base URL:** `http://localhost:8000` (dev) oder `https://api.molthar.app` (production)

#### 1. List Available Games
```
GET /games
Returns: ["molthar"]
```

#### 2. List All Matches
```
GET /games/molthar
Returns: Array of Match objects
[
  {
    "matchID": "match-001",
    "players": [
      { "id": 0, "name": "Alice" },
      { "id": 1, "name": null }
    ],
    "setupData": null
  },
  ...
]
```

#### 3. Get Specific Match
```
GET /games/molthar/{matchID}
Returns: Match object (same structure as above)
```

#### 4. Create New Match
```
POST /games/molthar/create
Content-Type: application/json

Request:
{
  "numPlayers": 3,
  "setupData": null
}

Response:
{
  "matchID": "match-001"
}

Client Action:
- Auto-join as Player 0
- Extract playerID & credentials from response
- Store in localStorage (persist across sessions)
```

#### 5. Join Existing Match
```
POST /games/molthar/{matchID}/join
Content-Type: application/json

Request:
{
  "playerID": "1",          // Optional: if omitted, auto-assign
  "playerName": "Bob",      // Required
  "data": { "color": "blue" } // Optional: custom metadata
}

Response:
{
  "playerID": "1",
  "playerCredentials": "token-abc123def456"
}

Client Action:
- Store credentials locally
- Use credentials for all future moves
```

#### 6. Leave Match
```
POST /games/molthar/{matchID}/leave
Content-Type: application/json

Request:
{
  "playerID": "1",
  "credentials": "token-abc123def456"
}

Client Action:
- Called when user clicks "Leave Game"
- Route back to LobbyScreen
- Clear local credentials
```

#### 7. Update Player (Optional)
```
POST /games/molthar/{matchID}/update
Content-Type: application/json

Request:
{
  "playerID": "1",
  "credentials": "token-abc123def456",
  "newName": "Bobby"  // Optional rename
}

Usage: Spieler ändern Namen während Warten
```

#### 8. Play Again
```
POST /games/molthar/{matchID}/playAgain
Content-Type: application/json

Request:
{
  "playerID": "0",
  "credentials": "token-abc123def456",
  "numPlayers": 3  // Optional: defaults to previous match's numPlayers
}

Response:
{
  "nextMatchID": "match-002"
}

Client Action:
- Route zu GameBoard mit nextMatchID
- Loop: Play Again Automatik
```

### LobbyClient Integration

```typescript
// src/lib/lobbyClient.ts

import { LobbyClient } from 'boardgame.io/client';

export const lobbyClient = new LobbyClient({
  server: process.env.REACT_APP_SERVER_URL || 'http://localhost:8000'
});

// Helper Functions
export async function listGames() {
  return lobbyClient.listGames();
}

export async function listMatches(gameName: string) {
  return lobbyClient.listMatches(gameName);
}

export async function createMatch(gameName: string, numPlayers: number) {
  const { matchID } = await lobbyClient.createMatch(gameName, {
    numPlayers,
    setupData: null
  });
  
  // Auto-join as Player 0
  const { playerCredentials } = await lobbyClient.joinMatch(
    gameName,
    matchID,
    {
      playerID: '0',
      playerName: 'You' // Default, wird später updated
    }
  );
  
  return { matchID, playerID: '0', playerCredentials };
}

export async function joinMatch(gameName: string, matchID: string, playerName: string) {
  const { playerID, playerCredentials } = await lobbyClient.joinMatch(
    gameName,
    matchID,
    { playerName }
  );
  
  return { playerID, playerCredentials };
}

export async function playAgain(gameName: string, matchID: string, playerID: string, credentials: string) {
  const { nextMatchID } = await lobbyClient.playAgain(gameName, matchID, {
    playerID,
    credentials
  });
  
  return nextMatchID;
}
```

### Match & Player Data Structures

```typescript
// src/lib/types.ts - Lobby Types

interface Match {
  matchID: string;
  gameID: string;
  numPlayers: number;
  players: PlayerInfo[];
  setupData?: any;
  gameover?: GameoverData;
  createdAt?: string;
  updatedAt?: string;
}

interface PlayerInfo {
  id: number;                    // 0, 1, 2, ... (seat number)
  name: string | null;           // "Alice" or null if not joined
  isConnected?: boolean;         // Online status
  credentials?: string;          // Only for logged-in player
  data?: Record<string, any>;    // Custom metadata
}

interface GameoverData {
  winner: number;                // Player ID of winner
  scores: Record<number, number>; // Player ID → Power Points
  diamonds: Record<number, number>; // Player ID → Diamond Count
  reason: 'powerPoints' | 'timeout';
}

// Local Storage Types
interface StoredCredentials {
  matchID: string;
  playerID: string;
  playerCredentials: string;
  playerName: string;
  gameID: string;
  timestamp: number;
}
```

### Server Setup Requirements

**boardgame.io Server muss konfiguriert sein:**

```typescript
// server.ts (Node.js/Express Backend)

import { Server } from 'boardgame.io/server';
import { MoltharGame } from './game';

const server = new Server({
  games: [MoltharGame],
  
  // Lobby API aktivieren
  lobbyConfig: {
    uuid: 'v4',  // Use UUIDs for match IDs
    maxgames: 1000
  },
  
  // Optional: Custom Database Connector
  // db: new PostgresDB({ connectionString: process.env.DATABASE_URL })
  
  // Optional: Authentication
  // auth: (credentials, playerID, matchID, gameID) => {
  //   // Validate credentials here
  //   return true/false
  // }
});

server.run(8000);
```

**Environment Variables:**
```
REACT_APP_SERVER_URL=http://localhost:8000
REACT_APP_GAME_ID=molthar
NODE_ENV=development
DATABASE_URL=postgresql://... (optional)
JWT_SECRET=... (optional, für Auth)
```

### Lobby UI Components

**Component Hierarchy:**

```
LobbyScreen
├── GameBrowser
│   ├── CreateGameModal
│   │   ├── PlayerCountSelector (2-5)
│   │   ├── PlayerNameInput
│   │   └── CreateButton
│   ├── MatchList
│   │   ├── MatchListItem (for each match)
│   │   │   ├── GameInfo (Name, Player Count)
│   │   │   ├── PlayerStatus (Slots filled: 2/3)
│   │   │   └── JoinButton
│   │   └── NoMatchesPlaceholder
│   └── RefreshButton
├── LobbyWaitingRoom (when joined)
│   ├── MatchHeader (Match ID, Player Count)
│   ├── PlayerList
│   │   ├── YourPlayer (highlighted)
│   │   └── OtherPlayer (greyed if not joined)
│   ├── WaitingMessage
│   └── HostControls (if host)
│       ├── StartGameButton (enabled when full)
│       └── LeaveButton
└── ErrorBoundary
    └── ErrorMessage (Connection issues, etc.)
```

### Error Handling & Edge Cases

```typescript
// Fehlerbehandlung in LobbyClient

Error Cases:
1. Match Not Found (404)
   → Show "Match wurde beendet oder existiert nicht"
   → Route back to GameBrowser

2. All Slots Full (400)
   → Show "Spiel voll, versuche ein anderes"

3. Invalid Player ID (400)
   → Show "Ungültige Spieler-Position"

4. Network Error (No Connection)
   → Auto-Retry mit Exponential Backoff
   → Show "Verbindung wird hergestellt..."

5. Credentials Invalid (401)
   → Clear localStorage
   → Route to GameBrowser
   → Show "Authentifizierung erforderlich"

6. Player Disconnect
   → Server: Mark player as "disconnected"
   → Other Clients: Show "X hat das Spiel verlassen"
   → After 30s: Auto-remove from match
```

---

## 📦 CharacterCard JSON Schema & Card Data Format

### CharacterCard Interface Definition

```typescript
// src/lib/types.ts - Card Types

export interface CharacterCard {
  id: string;                    // Unique identifier: "char-01"
  name: string;                  // "Kämpfer"
  imageName: string;             // "kaempfer" (for assets/cards/{imageName}.jpg)
  powerPoints: number;           // 0-5
  diamondsReward: number;        // 0-3
  cost: Cost;                    // Array of CostComponent
  ability: Ability;
}

export type Cost = CostComponent[];

export type CostComponent =
  | { type: 'number'; value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 }
  | { type: 'nTuple'; n: number }
  | { type: 'evenTuple'; n: number }
  | { type: 'oddTuple'; n: number }
  | { type: 'sumTuple'; n: number; sum: number }
  | { type: 'sumAnyTuple'; sum: number }
  | { type: 'run'; length: number }
  | { type: 'diamond' }
  | { type: 'drillingChoice'; value1: number; value2: number };

export interface Ability {
  type: AbilityType;
  value?: number | null; // Only for providesVirtualPearl
}

export type AbilityType =
  | 'none'
  | 'threeExtraActions'
  | 'nextPlayerOneExtraAction'
  | 'discardOpponentCharacter'
  | 'stealOpponentHandCard'
  | 'takeBackPlayedPearl'
  | 'onesCanBeEights'
  | 'threesCanBeAny'
  | 'tradeTwoForDiamond'
  | 'handLimitPlusOne'
  | 'oneExtraActionPerTurn'
  | 'providesVirtualPearl'
  | 'changeHandActions'
  | 'irrlicht';
```

### CostComponent Type Definition (9 Komponenten)

**Component Types:**

| Typ | JSON Structure | Spiel-Bedeutung | Beispiel |
|-----|---|---|---|
| **number** | `{ type: 'number', value: 1-8 }` | Genau eine Perlenkarte mit Wert | Einzelne 3er |
| **nTuple** | `{ type: 'nTuple', n: 2 }` | N Karten mit gleichem Wert | 2x beliebiger Wert |
| **evenTuple** | `{ type: 'evenTuple', n: 3 }` | N gerade Perlenkarten | 3x (2,4,6, oder 8) |
| **oddTuple** | `{ type: 'oddTuple', n: 4 }` | N ungerade Perlenkarten | 4x (1,3,5, oder 7) |
| **sumAnyTuple** | `{ type: 'sumAnyTuple', sum: 10 }` | Beliebig viele, Summe = X | Kartensumme 10 |
| **sumTuple** | `{ type: 'sumTuple', n: 3, sum: 15 }` | Genau N Karten, Summe = X | 3 Karten, Summe 15 |
| **run** | `{ type: 'run', length: 3 }` | Aufeinanderfolgende Werte | 3er Reihe (z.B. 4-5-6) |
| **diamond** | `{ type: 'diamond' }` | Diamant-Modifikator | (Zusammen mit anderen) |
| **drillingChoice** | `{ type: 'drillingChoice', value1: 3, value2: 5 }` | Paar/Drilling von Wert A ODER B | 2x(3er oder 5er) |

### JSON Schema mit Beispielen

```json
{
  "characterCard": {
    "id": "char-01",
    "name": "Kämpfer",
    "imageName": "kaempfer",
    "powerPoints": 3,
    "diamondsReward": 1,
    "cost": [
      { "type": "nTuple", "n": 2 }
    ],
    "ability": {
      "type": "threeExtraActions"
    }
  },
  
  "example_complex": {
    "id": "char-08",
    "name": "Straßenmusiker",
    "imageName": "musiker",
    "powerPoints": 1,
    "diamondsReward": 1,
    "cost": [
      { "type": "nTuple", "n": 2 },
      { "type": "nTuple", "n": 2 }
    ],
    "ability": {
      "type": "stealOpponentHandCard"
    },
    "_comment": "Cost = [nTuple(2), nTuple(2)] = 2 Paare (AND komponiert)"
  },
  
  "example_exact": {
    "id": "char-06",
    "name": "Schatzsucher",
    "imageName": "schatzsucher",
    "powerPoints": 1,
    "diamondsReward": 3,
    "cost": [
      { "type": "number", "value": 1 },
      { "type": "number", "value": 2 },
      { "type": "number", "value": 3 }
    ],
    "ability": {
      "type": "tradeTwoForDiamond"
    },
    "_comment": "Cost = Exakt Werte 1, 2, 3 (AND komponiert)"
  },
  
  "example_sum": {
    "id": "char-09",
    "name": "Orakel",
    "imageName": "orakel",
    "powerPoints": 5,
    "diamondsReward": 0,
    "cost": [
      { "type": "sumTuple", "n": 3, "sum": 15 }
    ],
    "ability": {
      "type": "oneExtraActionPerTurn"
    },
    "_comment": "Cost = Genau 3 Karten mit Summe 15"
  }
}
```

### Validation Rules & Constraints

```typescript
// src/lib/validation.ts

export function validateCharacterCard(card: CharacterCard): ValidationResult {
  const errors: string[] = [];
  
  // ID validation
  if (!card.id || !/^char-\d+$/.test(card.id)) {
    errors.push('ID muss "char-NN" Format sein');
  }
  
  // Name validation
  if (!card.name || card.name.trim().length === 0) {
    errors.push('Name erforderlich');
  }
  if (card.name.length > 50) {
    errors.push('Name max. 50 Zeichen');
  }
  
  // Power Points validation
  if (card.powerPoints < 0 || card.powerPoints > 5) {
    errors.push('Machtpunkte müssen zwischen 0-5 sein');
  }
  
  // Diamonds validation
  if (card.diamondsReward < 0 || card.diamondsReward > 3) {
    errors.push('Diamanten müssen zwischen 0-3 sein');
  }
  
  // Cost validation
  if (!Array.isArray(card.cost) || card.cost.length === 0) {
    errors.push('Kosten erforderlich');
  }
  if (card.cost.length > 6) {
    errors.push('Maximal 6 Kostenkomponenten');
  }
  
  // Validate each cost component
  card.cost.forEach((comp, idx) => {
    const compErrors = validateCostComponent(comp);
    if (!compErrors.valid) {
      errors.push(`Kosten[${idx}]: ${compErrors.error}`);
    }
  });
  
  // Ability validation
  if (!card.ability || !ABILITY_TYPES.includes(card.ability.type)) {
    errors.push('Ungültige Fähigkeit');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Card Import/Export Process

**Export (card-manager → cards.json):**
```
1. User klickt "Export" Button
2. card-manager serialisiert alle Karten zu JSON
3. JSON wird downloaded: cards.json
4. User speichert in PortaleVonMolthar/Resources/cards.json (Swift)
   oder importiert in game-web (siehe unten)
```

**Import (cards.json → game-web):**
```
1. game-web lädt cards.json beim Start
2. Parse JSON:
   const cardsData = await fetch('/assets/cards.json')
   const cards = await cardsData.json()

3. Validate alle Karten:
   cards.forEach(card => {
     const result = validateCharacterCard(card)
     if (!result.valid) {
       console.error(`Card ${card.id}: ${result.errors.join(', ')}`)
     }
   })

4. Load in GameEngine:
   gameEngine.setCards(cards)
   
5. Use im Spiel:
   - Charaktere anzeigen
   - Fähigkeiten auslösen
   - Kosten validieren
```

---

## 🔗 Network & Multiplayer Synchronization

### Network Architecture

**Client-Server Modell via boardgame.io:**

```
┌─────────────┐       HTTP/WebSocket      ┌─────────────┐
│   Player A  │◄──────────────────────────►│             │
│   Client    │                            │   Server    │
└─────────────┘                            │  (Node.js)  │
                                           │             │
┌─────────────┐       HTTP/WebSocket       │  Game State │
│   Player B  │◄──────────────────────────►│  Store      │
│   Client    │                            │             │
└─────────────┘                            └─────────────┘

┌─────────────┐       HTTP/WebSocket
│   Player C  │◄──────────────────────────►
│   Client    │
└─────────────┘

Flow:
1. Player submits Move (+ credentials)
2. Client → Server (POST /games/{gameID}/{matchID}/move)
3. Server validates Move + credentials
4. If valid: Apply to GameState, Broadcast to all clients
5. All Clients: Receive new GameState, re-render
6. If invalid: Reject with error, no state change
```

### Move Submission & Validation

```typescript
// src/components/GameBoard.tsx

import { Client } from 'boardgame.io/react';

export const GameBoard = ({ matchID, playerID, credentials }) => {
  const moltharClient = Client({
    game: MoltharGame,
    board: GameBoardComponent,
    multiplayer: SocketIO({
      server: process.env.REACT_APP_SERVER_URL
    })
  });
  
  const GameComponent = moltharClient;
  
  return (
    <GameComponent
      matchID={matchID}
      playerID={playerID}
      credentials={credentials}
    />
  );
};

// Inside GameBoardComponent:
// ctx.moves.takePearlCard(index) automatically:
// 1. Sends move to server with credentials
// 2. Server validates in game rules
// 3. Broadcasts new state to all players
```

### State Broadcasting

**Server broadcasts nach jedem gültigen Move:**

```
Move kommt an → Server validiert → GameState updated → 
Broadcast an ALLE Clients:

{
  "type": "state_update",
  "gameState": {
    "players": {...},
    "board": {...},
    "currentPlayer": 1,
    "phase": "takingActions",
    ...
  },
  "timestamp": 1234567890
}

Alle Clients:
1. Empfangen State Update
2. Vergleichen mit lokalem State
3. Falls unterschiedlich: Re-render
4. Update Turn Indicator, Action Panel, etc.
```

### Player Disconnection & Reconnection

```typescript
// Disconnect Handling:

if (playerDisconnects) {
  Server: Mark player as "disconnected" (30s timeout)
  OtherClients: Show "{PlayerName} hat das Spiel verlassen"
  
  if (currentPlayer == disconnected) {
    // Skip turn, move to next player
    autoAdvanceTurn()
  }
  
  if (player reconnects within 30s) {
    Credentials: Still valid
    GameState: Continue from last state
    Client: Auto-resync
  } else {
    Remove player from match
    Close lobby for this match (if during setup)
    Or: Replace with AI if during game (optional)
  }
}
```

### Security & Credentials

**Credentials sind unverzichtbar:**

```
1. Host erstellt Match
   Server: Generiert 32-Byte random Token pro Player
   Client: Speichert in localStorage

2. Jeder Move enthält Credentials:
   POST /games/molthar/{matchID}/move {
     action: {...},
     playerID: "1",
     credentials: "abc123def456..."
   }

3. Server validiert IMMER:
   if (storedCredentials[playerID] != provided_credentials) {
     REJECT Move with 401 Unauthorized
   }

4. Credentials NOT im localStorage überschreiben:
   - Per-Browser/Device
   - Not Transferable zwischen Devices
   - Optional: Rotate nach einiger Zeit
```

---

## 🚀 Implementierungs-Roadmap

### Phase 1: Documentation & Specification ✅
**Deliverable:** game-web-spec.md (dieses Dokument)

**Todos:**
- [x] Spielregeln dokumentieren
- [x] UI/UX Design spezifizieren
- [x] Tech Stack festlegen
- [x] Dateistruktur definieren
- [x] Game State Types definieren

**Timeline:** ~2–3 Tage (Analysis & Documentation)

---

### Phase 2: Project Setup & Core Engine (1 Woche)
**Goal:** Funktionierendes boardgame.io Game mit Basis-Spiellogik

**Todos:**
- [ ] **P2.1:** Vite/React/TypeScript Project initialisieren
  - pnpm install (React 18, boardgame.io, Shadcn/UI, Tailwind)
  - Folder-Struktur anlegen
  - Dev-Environment testen (npm run dev)

- [ ] **P2.2:** boardgame.io Game Engine Setup
  - Game definition erstellen (game-engine.ts)
  - GameState Type definieren
  - Card Types definieren (PearlCard, CharacterCard)
  
- [ ] **P2.3:** Basis Moves implementieren
  - `takePearlCard` Move
  - `replacePearlCards` Move
  - `placeCharacter` Move
  - `endTurn` Move
  
- [ ] **P2.4:** Cost Validator implementieren
  - Cost checking für alle 7 Kostentypen
  - Diamanten-Modifier logic
  
- [ ] **P2.5:** Unit Tests schreiben
  - Cost validator tests
  - Game state mutation tests
  - Move validation tests

**Success Criteria:**
- Game kann initialisiert werden
- Basis-Moves funktionieren
- Cost validation validiert korrekt
- Tests grün

---

### Phase 3: Character Abilities & Game Rules (1 Woche)
**Goal:** Vollständige Spielregel-Umsetzung

**Todos:**
- [ ] **P3.1:** Special Abilities System
  - Red abilities (einmalig) implementieren
  - Blue abilities (dauerhaft) implementieren
  - Ability resolver schreiben
  
- [ ] **P3.2:** Irrlicht-Spezial-Mechanik
  - Nachbar-Aktivierungslogik
  - Irrlicht-Zustand tracking
  
- [ ] **P3.3:** Tauschsymbol-Logik
  - Symbol detection in pearls
  - Character refresh trigger
  
- [ ] **P3.4:** Game End Conditions
  - 12+ power points detection
  - Final round logic (last turn from starting player)
  - Winner determination (power points, diamonds tiebreaker)
  
- [ ] **P3.5:** Deck Management
  - Deck refill logic (when empty, shuffle discard)
  - Card draw mechanics
  
- [ ] **P3.6:** Integration Tests
  - Full game flow tests
  - Ability interaction tests
  - Edge case tests

**Success Criteria:**
- All 13 ability types implemented
- Game end conditions work correctly
- Final round logic correct
- Integration tests pass

---

### Phase 4: UI Components & Responsive Design (2 Wochen)
**Goal:** Spielbare Web-UI mit responsivem Design

**Todos:**
- [ ] **P4.1:** Component Foundation
  - Base components (Card, Button, Layout)
  - Shadcn/UI integration
  - Tailwind CSS setup
  
- [ ] **P4.2:** Game Board Components
  - GameBoard main container
  - TableCenter (pearl cards, character cards, decks)
  - PlayerPortal (local player)
  - OpponentPortal (compact view)
  - HandCards (interactive)
  
- [ ] **P4.3:** Card Components
  - PearlCard component (draggable)
  - CharacterCard component
  - CardSlot component
  - Card selection UI
  
- [ ] **P4.4:** Action UI
  - ActionPanel component
  - TurnIndicator component
  - PowerPoints & Diamonds display
  - GameLog / Action history
  
- [ ] **P4.5:** Responsive Design
  - Mobile layout (< 640px)
  - Tablet layout (640–1024px)
  - Desktop layout (> 1024px)
  - Touch-friendly interactions
  
- [ ] **P4.6:** Animations
  - Card draw animations
  - Character flip animations
  - Turn transition animations
  - Ability trigger effects
  
- [ ] **P4.7:** Component Tests
  - Snapshot tests
  - Interaction tests
  - Responsive layout tests

**Success Criteria:**
- Game fully playable via UI
- Responsive on all breakpoints
- Animations smooth & performant
- Component tests pass

---

### Phase 5: Multiplayer & Networking (1 Woche)
**Goal:** Multiplayer-ready boardgame.io integration

**Todos:**
- [ ] **P5.1:** boardgame.io Client Setup
  - Client initialization
  - Game state subscriptions
  - Move dispatching
  
- [ ] **P5.2:** Lobby System (MVP)
  - Game creation endpoint
  - Player join endpoint
  - Game state sync
  
- [ ] **P5.3:** Player Management
  - Player ID assignment
  - Player names
  - Spectator mode (optional)
  
- [ ] **P5.4:** Error Handling
  - Invalid move rejection
  - Network error recovery
  - Reconnection logic
  
- [ ] **P5.5:** Integration Tests
  - Multi-player game flow
  - Network sync tests
  - Error scenarios

**Success Criteria:**
- 2+ players can play together
- Game state stays in sync
- Network errors handled gracefully

---

### Phase 6: Lobby & Game Management (1 Woche)
**Goal:** Complete game setup & matchmaking

**Todos:**
- [ ] **P6.1:** Start Screen
  - Main menu UI
  - Game mode selector (Local vs. Online)
  - Rulebook viewer
  
- [ ] **P6.2:** Lobby Screen
  - Host/Join UI
  - Player list
  - Game settings (2–5 players)
  - Start game button
  
- [ ] **P6.3:** Game Over Screen
  - Final leaderboard
  - Stats display
  - Play again button
  
- [ ] **P6.4:** End-to-End Flow Tests
  - Full game creation → play → end flow

**Success Criteria:**
- Users can host/join games
- Game setup UI is intuitive
- Game over screen displays correctly

---

### Phase 7: Polish, Testing & Deployment (2 Wochen)
**Goal:** Production-ready Web App

**Todos:**
- [ ] **P7.1:** Card Import/Export
  - Integration with card-manager WebApp
  - JSON loading from cards.json
  - Card validation
  
- [ ] **P7.2:** Admin Panel (Dev Tools)
  - Game state inspector
  - Card browser
  - Move replay feature
  
- [ ] **P7.3:** Performance Optimization
  - Code splitting (lazy routes)
  - Image optimization
  - Bundle size analysis
  - Network optimization
  
- [ ] **P7.4:** E2E Testing with Playwright
  - Game creation test
  - Turn actions test
  - Ability interactions test
  - Game end test
  - Multiplayer sync test
  
- [ ] **P7.5:** Accessibility (a11y)
  - Keyboard navigation
  - Screen reader support
  - High contrast mode
  - ARIA labels
  
- [ ] **P7.6:** Documentation
  - User guide (How to Play)
  - Developer guide (Setup, Build, Deploy)
  - API documentation (for custom clients)
  
- [ ] **P7.7:** Deployment
  - Vercel setup
  - Environment variables
  - CI/CD pipeline (GitHub Actions)
  - Production monitoring

**Success Criteria:**
- All E2E tests pass
- Lighthouse score > 90
- Zero accessibility warnings
- Deployed & live on Vercel

---

## 📊 Development Timeline

| Phase | Duration | Start | End |
|-------|----------|-------|-----|
| Phase 1 (Docs) | 2–3 days | Week 1 | Week 1 |
| Phase 2 (Setup & Engine) | 1 week | Week 2 | Week 2 |
| Phase 3 (Abilities & Rules) | 1 week | Week 3 | Week 3 |
| Phase 4 (UI & Responsive) | 2 weeks | Week 4 | Week 5 |
| Phase 5 (Multiplayer) | 1 week | Week 6 | Week 6 |
| Phase 6 (Lobby) | 1 week | Week 7 | Week 7 |
| Phase 7 (Polish & Deploy) | 2 weeks | Week 8 | Week 9 |
| **Total** | **~9 weeks** | | |

---

## 🧪 Testing Strategy

### Unit Tests
- **Game Engine:** Cost validator, ability resolver, game rules
- **Utilities:** Deck shuffling, card filtering, state mutations
- **Components:** Card rendering, UI interactions

**Framework:** Vitest + React Testing Library

### Integration Tests
- Game flow (setup → turns → game end)
- Ability interactions
- Multi-player state sync
- Edge cases (hand limits, deck refill, final round)

### E2E Tests
- User scenarios (complete game play-through)
- Multiplayer interactions
- Error recovery
- Performance under load

**Framework:** Playwright

### Test Coverage Goals
- Game engine: 100%
- Components: 80%+
- Overall: 80%+

---

## 🌐 API Reference

### boardgame.io HTTP API

```
POST /games/{gameID}/join
  Body: { playerID: string, playerName: string, credentials: string }
  Returns: { playerID, credentials }

POST /games/{gameID}/
  Body: { playerID, credentials, action: GameAction }
  Returns: { success: boolean }

GET /games/{gameID}
  Returns: { G: GameState, ctx: Context }

WebSocket: /games/{gameID}
  Subscribes to real-time state updates
```

### Custom API Endpoints (Optional)

```
GET /api/games - List active games
POST /api/games - Create new game
GET /api/games/{gameID} - Get game details
POST /api/games/{gameID}/leave - Leave game
POST /api/games/{gameID}/chat - Send chat message
GET /api/cards - Fetch card data
POST /api/cards/export - Export cards.json
```

---

## 📦 Dependencies

### Core
```json
{
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "boardgame.io": "^0.52.0",
  "typescript": "^5.3.0",
  "vite": "^5.0.0"
}
```

### UI & Styling
```json
{
  "shadcn-ui": "latest",
  "tailwindcss": "^3.4.0",
  "postcss": "^8.4.0",
  "@radix-ui/react-*": "latest",
  "lucide-react": "^latest"
}
```

### Development
```json
{
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@playwright/test": "^1.40.0",
  "eslint": "^8.54.0",
  "prettier": "^3.1.0"
}
```

---

## 🚦 Success Metrics

- ✅ **Completeness:** 100% Regelwerk umgesetzt
- ✅ **Performance:** Lighthouse Score > 90
- ✅ **Multiplayer:** 2–5 Spieler, latency < 200ms
- ✅ **Responsive:** Funktioniert auf iPhone, iPad, Desktop
- ✅ **Test Coverage:** 80%+ code coverage
- ✅ **Accessibility:** WCAG 2.1 AA standard
- ✅ **Documentation:** User & Dev guides complete
- ✅ **Deployment:** Live on Vercel with CI/CD

---

## 📚 References

- **Game Rules:** assets/Anleitung.md
- **Existing Swift App:** PortaleVonMolthar/
- **Card Manager:** card-manager/ (Phase 5)
- **boardgame.io Docs:** https://boardgame.io/documentation
- **Shadcn/UI:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/

---

## 🎓 Implementation Notes

### Adoption from Swift App
The Swift application (`PortaleVonMolthar/`) already implements:
- ✅ Complete game engine with all rules
- ✅ Cost validation for all 7 types
- ✅ Special abilities (red, blue, Irrlicht)
- ✅ Game end conditions
- ✅ Responsive UI patterns

**Key Approach:** Port the game logic layer (GameEngine, rules, state mutations) from Swift into boardgame.io Moves. Rewrite the UI for React/Web.

### Why boardgame.io?
1. **Purpose-built** for turn-based games
2. **Multiplayer out-of-box** (HTTP + WebSocket)
3. **State immutability** (replay, determinism)
4. **Move validation** framework
5. **Excellent TypeScript** support
6. **Active community** & well-documented

### Card Management
Cards are defined in the `card-manager` WebApp and exported as `cards.json`. The game-web app imports this JSON at runtime, allowing balance changes without recompilation.

---

**Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Ready for Implementation (Phase 2)  

---

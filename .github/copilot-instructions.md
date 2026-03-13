# Copilot Instructions for Portale von Molthar

This repository contains a digital adaptation of the "Portale von Molthar" board game for iOS, iPadOS, and macOS, plus a web-based card management tool.

## Quick Commands

### Swift Application (PortaleVonMolthar)
- **Build:** `make -C PortaleVonMolthar build` or `cd PortaleVonMolthar && swift build`
- **Run:** `make -C PortaleVonMolthar run` or `cd PortaleVonMolthar && swift run`
- **Test:** `make -C PortaleVonMolthar test` or `cd PortaleVonMolthar && swift test`
- **Run single test:** `cd PortaleVonMolthar && swift test --filter GameEngineTests.testInitialSetup`
- **Format code:** `make -C PortaleVonMolthar format`
- **Generate Xcode project:** `make -C PortaleVonMolthar xcode`
- **Clean build:** `make -C PortaleVonMolthar clean`

### Web Card Manager
- **Run:** Open `card-manager/index.html` in a browser (no build step required)
- **Export format:** Outputs `cards.json` for import into the Swift app

## Project Structure

### Swift Application (`PortaleVonMolthar/`)
```
Sources/PortaleVonMolthar/
├── Models/           # Core game logic
│   ├── GameEngine.swift          # Main rules engine (641 lines)
│   ├── GameState.swift           # State definition + GameAction enum
│   ├── Cards.swift               # Card data structures
│   ├── Player.swift              # Player model
│   └── ImageLoader.swift         # Asset loading
├── ViewModels/
│   └── GameViewModel.swift       # State management for views
├── Views/
│   ├── StartView.swift           # Menu screen
│   ├── LobbyView.swift           # Networking/player selection
│   └── GameBoardView.swift       # Main game UI
├── Networking/
│   └── NetworkManager.swift      # MultipeerConnectivity
├── AI/
│   └── AIManager.swift           # Computer opponent logic (placeholder)
└── Resources/                    # Card images and assets

Tests/
└── PortaleVonMoltharTests/
    └── GameEngineTests.swift     # Core game logic tests
```

### Web Card Manager (`card-manager/`)
- `index.html` — UI template with card list and editor form
- `script.js` — Game-agnostic card management (add/edit/delete/export)
- `style.css` — Responsive styling (light/dark mode ready)

## Architecture & Key Concepts

### Game Engine Architecture

**GameEngine** is the single source of truth for game rules and state mutations. Key principles:

1. **State Immutability:** Changes flow through `GameEngine.processAction()`, which validates the action and returns a new `GameState`
2. **Deterministic:** All randomness (deck shuffles, starting player) happens at game start; gameplay is deterministic for replay/networking
3. **Action-Based:** All player moves are `GameAction` enums (defined in `GameState.swift`)
   - Examples: `.takePearlCard()`, `.activateCharacter()`, `.discardCards()`
4. **Turn Phases:** State machine with explicit phases:
   - `.takingActions` — Normal turn phase (3 actions max)
   - `.discardingExcessCards` — Hand limit enforcement (auto-triggered if hand > 5)
   - `.gameFinished` — Game over (no more actions allowed)

### The Three Decks
- **Pearl Deck (56 cards):** Values 1–8, each has 7 copies; one per value has a swap symbol
- **Character Deck (54 cards):** Named characters with cost, power points, diamond rewards, and abilities
- **Discard Piles:** Recycled when decks empty (subtract 1 from top card value)

### Cost System
Characters have a `CostType` enum:
- `.fixedSum(value)` — Exact sum (e.g., 10)
- `.identicalValues(count)` — N cards of same value
- `.run(length)` — Sequential values (e.g., 3-4-5)
- `.pairs(count)` — N pairs
- Diamonds modify costs (reduce total by 1 per diamond)

### Power Points & Game End
- Activating a character grants power points
- When a player reaches 12+ power points, the **final round** is triggered
- Each remaining player (in turn order) gets one last turn from the starting player onwards

### Special Abilities (Red & Blue)
- **Red abilities:** Instant, triggered once per card, cost varies
- **Blue abilities:** Persistent, triggered multiple times (e.g., extra action per turn)
- Irrlicht card: Unique rule allowing neighbors to also activate it

### The Swap Symbol
If a Pearl Card with the swap symbol fills the 4 face-up slots, **both face-up characters are discarded and replaced**

## Networking (Planned)

**MultipeerConnectivity** is integrated via `NetworkManager.swift` but not yet fully wired:
- One player acts as **host** (runs `GameEngine`, broadcasts state)
- Other players are **clients** (send actions, receive state updates)
- Game state syncs via `Codable` serialization
- All players must see consistent state

## Testing

Tests are minimal; the main test file is `GameEngineTests.swift`:
```bash
cd PortaleVonMolthar && swift test --filter GameEngineTests
```

When adding features:
1. Add a test in `Tests/PortaleVonMoltharTests/GameEngineTests.swift`
2. Ensure `GameEngine.processAction()` validates all edge cases
3. Verify state remains consistent after multiple actions

## Key Implementation Notes

### Card Data Lifecycle
1. **Web App:** User edits cards in `card-manager/` → exports `cards.json`
2. **Swift App:** App loads `cards.json` from `Resources/` at startup
3. **Benefit:** No need to recompile for balance changes

### Responsive Layouts
- Uses SwiftUI's `ViewThatFits` and `GeometryReader`
- **iPhone:** Single-player focus; opponents shown as compact bars
- **iPad/Mac:** Full table view with all players visible
- Min window size: 1000x700

### AppDelegate (macOS)
The app uses `NSApplicationDelegateAdaptor` to ensure macOS window is properly activated on launch

## Current Implementation Status

✅ **Complete:**
- Core game engine (all rules, cost validation, abilities, final round)
- Responsive UI with turn indicators
- Card management web tool
- Test infrastructure

🏗 **In Progress / Planned:**
- Start screen & lobby (player selection, AI count)
- Networking/multiplayer connection
- AI/computer opponents
- Final card data (54 characters)
- Additional edge case tests

## Git & Commits

- Initial commit: `bd2254e`
- Documentation: `implementierungs_plan.md` and `implementierungs_status.md`
- Game rules reference: `assets/Anleitung.md`

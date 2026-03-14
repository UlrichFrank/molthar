# 🎮 Portale von Molthar - Web Edition

Webbasierte Multiplayer-Version des Brettspiels "Portale von Molthar" basierend auf [game-web-spec.md](../game-web-spec.md) und der [IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md).

## 🚀 Schnelleinstieg

### Voraussetzungen
- Node.js >= 18
- pnpm >= 8

### Installation & Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
# App lädt auf http://localhost:5173

# Run tests
pnpm run test

# Build for production
pnpm run build
```

## 📋 Implementation Status

**Current Phase:** [Check IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md)

| Phase | Status | Beschreibung |
|-------|--------|-------------|
| **P0** | ⏳ | Project Setup (Dev Environment) |
| **P1** | ⏸️ | Game Engine & Rules (10-12 days) |
| **P2** | ⏸️ | UI Components & Single-Player (10 days) |
| **P3** | ⏸️ | Multiplayer & Lobby System (10 days) |
| **P4** | ⏸️ | Polish, Testing & Deployment (5-7 days) |

## 📁 Project Structure

```
game-web/
├── src/
│   ├── game/           # Game Engine Logic
│   │   ├── gameEngine.ts    # Core game rules
│   │   ├── moves.ts         # Valid moves & validation
│   │   └── abilities.ts     # Ability system (14 types)
│   ├── components/     # React UI Components
│   │   ├── GameBoard.tsx    # Main game board
│   │   ├── cards/           # Card components
│   │   └── portals/         # Player portals
│   ├── hooks/          # Custom React Hooks
│   │   ├── useGame.ts       # Game state management
│   │   └── useNetworking.ts # Multiplayer (Phase 3)
│   ├── lib/            # Utilities & Types
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── constants.ts     # Game constants
│   │   └── utils.ts         # Helper functions
│   ├── pages/          # Page Components
│   │   ├── LobbyPage.tsx    # Match creation/joining
│   │   ├── GamePage.tsx     # Game board
│   │   └── GameOverPage.tsx # Results screen
│   ├── styles/         # Global styles
│   └── App.tsx         # Root component
├── server/             # boardgame.io Server (Phase 3)
│   └── index.ts        # Server configuration
├── tests/              # Unit & Integration Tests
│   ├── game.test.ts         # Game engine tests
│   └── integration.test.ts  # Feature integration tests
├── e2e/                # End-to-End Tests (Playwright)
│   └── game.spec.ts
├── public/
│   └── cards.json      # Character card data
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md (this file)
```

## 🎯 Implementation Roadmap

### Phase 0: Project Setup (2-3 days)

- [ ] **P0.1** Vite/React/TypeScript Setup
  - `pnpm create vite . --template react-ts`
  - `pnpm install` dependencies
  - `pnpm run dev` ✅ works

- [ ] **P0.2** Dependencies & Configuration
  - boardgame.io, tailwindcss, testing-library
  - vite.config.ts, vitest.config.ts, tailwind.config.js
  - package.json scripts configured

- [ ] **P0.3** TypeScript Types (`src/lib/types.ts`)
  - 9 CostComponent types
  - 14 AbilityType enums
  - GameState, CharacterCard, PearlCard interfaces
  - GameAction enums & types

- [ ] **P0.4** Game Constants (`src/lib/constants.ts`)
  - GAME_RULES configuration
  - createPearlDeck() function
  - loadCharacterCards() async loader

- [ ] **P0.5** Phase 0 Checkpoint
  - ✅ `pnpm run dev` works
  - ✅ `pnpm run build` creates dist/
  - ✅ `pnpm run test` runs Vitest
  - ✅ No TypeScript errors
  - **→ START PHASE 1**

### Phase 1: Game Engine & Rules (10-12 days)

*See IMPLEMENTATION_ROADMAP.md for detailed steps*

Core game logic implementation:
- Game initialization & setup
- Pearl & Character deck management
- Move validation (take pearl, place character, activate)
- **Cost validator** (9 CostComponent types)
- **Ability system** (14 ability types)
- Turn management & hand limits
- Final round & winner determination
- Unit tests ≥80% coverage

**Deliverable:** Fully playable game logic (2-4 players, local)

### Phase 2: UI Components & Single-Player (10 days)

*See IMPLEMENTATION_ROADMAP.md for detailed steps*

Responsive UI implementation:
- GameBoard layout
- Card & Portal components
- Hand management & selection
- Action panel & buttons
- Game state display
- Responsive design (mobile/tablet/desktop)
- Debug tools

**Deliverable:** Complete UI, single-player game fully functional

### Phase 3: Multiplayer & Lobby (10 days)

*See IMPLEMENTATION_ROADMAP.md for detailed steps*

Networking & matchmaking:
- boardgame.io server setup
- Lobby system (create/join games)
- Real-time game synchronization
- Player credentials & security
- Game over & rematch flow

**Deliverable:** Multiplayer fully functional, lobby working

### Phase 4: Polish & Testing (5-7 days)

*See IMPLEMENTATION_ROADMAP.md for detailed steps*

Production readiness:
- Error handling & reconnection
- Integration tests (≥80% coverage)
- E2E tests (Playwright)
- Performance optimization (Lighthouse >90)
- Deployment to Vercel

**Deliverable:** Production-ready app live on Vercel

## 🧪 Testing

```bash
# Unit & Integration Tests
pnpm run test

# Watch mode for development
pnpm run test:watch

# Coverage report
pnpm run test:coverage

# E2E Tests (Phase 4)
pnpm run test:e2e

# Run specific test file
pnpm run test game.test.ts
```

## 🎨 Development

```bash
# Start dev server
pnpm run dev

# Format code with Prettier
pnpm run format

# Lint with ESLint
pnpm run lint

# Type check
pnpm run type-check

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview
```

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `boardgame.io` | Game engine & multiplayer |
| `react` | UI framework |
| `react-router-dom` | Client routing |
| `zustand` | State management |
| `tailwindcss` | Styling |
| `typescript` | Type safety |
| `vitest` | Testing framework |
| `@testing-library/react` | Component testing |

## 🎮 Game Rules

Full rules documentation:
- **Spec:** See [game-web-spec.md](../game-web-spec.md)
- **Original Rules:** See [assets/Anleitung.md](../assets/Anleitung.md)
- **Card Manager:** See [card-manager/](../card-manager/)

### Quick Rules Overview

**2-4 Players, 15-30 minutes**

1. Each turn: Take 3 actions (take pearl, place character, activate)
2. Place pearls to match character costs
3. Activate character → gain power points + diamonds
4. First player to 12 power points triggers final round
5. Winner = most power points (tiebreaker: most diamonds)

**Cost System:**
- 9 different CostComponent types (nTuple, sumAnyTuple, run, etc.)
- Diamonds reduce cost (add +1 to pearl values)
- Blue abilities modify pearl interpretation

**14 Abilities:**
- 5 Red (instant, once per card): Extra actions, steal cards, discard opponents
- 8 Blue (persistent): Modify pearl interpretation, extra actions, hand limits
- Irrlicht (special): Neighbors can activate

## 🚀 Deployment

### Development
```bash
pnpm run dev
# http://localhost:5173
```

### Production
```bash
pnpm run build
# Outputs optimized dist/

pnpm run preview
# Test production build locally
```

### Vercel Deployment (Phase 4)
```bash
vercel deploy
# App live at https://molthar-game-web.vercel.app
```

## 📚 Documentation

- **[game-web-spec.md](../game-web-spec.md)** — Complete technical specification
- **[IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md)** — Detailed implementation plan with testable steps
- **[card-manager/](../card-manager/)** — Web-based card editor
- **[assets/Anleitung.md](../assets/Anleitung.md)** — Original game rules
- **[implementierungs_status.md](../implementierungs_status.md)** — Swift app status
- **[implementierungs_plan.md](../implementierungs_plan.md)** — Swift app implementation plan

## ⚙️ Environment Variables

`.env.local` (create in project root):

```bash
# Server
VITE_SERVER_URL=http://localhost:8000
VITE_API_BASE=http://localhost:8000/api

# Game Config (optional)
VITE_MAX_PLAYERS=4
VITE_DEBUG=false
```

## 🐛 Debugging

### Game State Debugger (Phase 2)
- Toggle with `Cmd+Shift+D`
- View current GameState JSON
- View game log with all moves

### Network Debugger (Phase 3)
- Monitor message traffic
- View connection status
- Test reconnection flows

### React DevTools
```bash
# Install React DevTools Browser Extension
# Inspect component hierarchy, state, props
```

## 📊 Performance Targets (Phase 4)

- **Lighthouse Score:** > 90
- **Bundle Size:** < 500KB (gzipped)
- **Load Time:** < 3 seconds
- **FPS:** 60 during gameplay
- **Memory:** No leaks after 1+ hour play

## 🤝 Contributing

When adding features:

1. **Create feature branch:** `git checkout -b feature/my-feature`
2. **Write tests first** (TDD approach)
3. **Follow existing code style** (see `.eslintrc`, `prettier.config.js`)
4. **Update documentation** if adding new features
5. **Run tests:** `pnpm run test` ≥ 80% coverage
6. **Commit:** `git commit -m "feat: description"`
7. **Push & create PR:** Reference any related issues

## 📄 License

See [../LICENSE](../LICENSE) if exists

## 🆘 Troubleshooting

### `pnpm run dev` fails
- Delete `node_modules/` and `.pnpm-lock.yaml`
- Run `pnpm install` again
- Check Node version (≥ 18)

### TypeScript errors
- Run `pnpm run type-check`
- Check `tsconfig.json` in project root
- Ensure all imports have correct paths

### Tests fail
- Run `pnpm run test --ui` for visual debugging
- Check `.test.ts` files for typos
- Ensure vitest.config.ts is correct

### Build fails
- Run `pnpm run clean` if exists
- Delete `dist/` folder
- Run `pnpm run build` again with verbose output

---

**Next Step:** Start with [Phase 0 Setup](../IMPLEMENTATION_ROADMAP.md#phase-0-project-setup-2-3-days)

Last Updated: 2024-03-14

# 🎮 Portale von Molthar - Web Edition
## Implementierungs-Roadmap & Schnelleinstieg

Dieses Dokument erklärt die **komplette Implementierungs-Struktur** für die Web-Version des Spiels.

---

## 📚 Dokumentation Übersicht

| Dokument | Zweck | Für wen? |
|----------|--------|---------|
| **[START_HERE.md](START_HERE.md)** | Dieser Index, Übersicht | Alle |
| **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** | Komplette 4-Phasen Roadmap mit allen Details | Projekt Manager, Architekten |
| **[PHASE_0_SETUP.md](PHASE_0_SETUP.md)** | Schritt-für-Schritt Phase 0 (Dev Setup) | Entwickler (jetzt starten!) |
| **[game-web-spec.md](game-web-spec.md)** | Technische Spezifikation, Game Rules | Architekten, Senior Dev |
| **[game-web/README.md](game-web/README.md)** | Game-web Projekt README | Entwickler |
| **[assets/Anleitung.md](assets/Anleitung.md)** | Original Spielregeln (Deutsch) | Tester, Designer |
| **[card-manager/](card-manager/)** | Web-Tool zum Verwalten von Spielkarten | Game Designer |

---

## 🚀 Quick Start für Entwickler

### 1️⃣ **Jetzt starten (Phase 0):**

```bash
cd game-web
# Folge PHASE_0_SETUP.md Schritt-für-Schritt
```

**Ergebnis nach Phase 0 (2-3 Tage):**
- ✅ Dev-Environment läuft (`pnpm run dev`)
- ✅ TypeScript konfiguriert
- ✅ Alle Tools bereit (Vite, Vitest, Tailwind, boardgame.io)

### 2️⃣ **Danach Phase 1 (Game Engine):**

Lese [IMPLEMENTATION_ROADMAP.md Phase 1](IMPLEMENTATION_ROADMAP.md#phase-1-game-engine--rules-10-12-tage)

**Ergebnis nach Phase 1 (10-12 Tage):**
- ✅ Komplettes Spielsystem implementiert
- ✅ Alle Game Rules (Cost Validator, Abilities, etc.)
- ✅ Unit Tests ≥80% Coverage
- ✅ Lokal 2-4 Spieler spielbar

### 3️⃣ **Dann Phase 2 (UI):**

Lese [IMPLEMENTATION_ROADMAP.md Phase 2](IMPLEMENTATION_ROADMAP.md#phase-2-ui-components--single-player-10-tage)

**Ergebnis nach Phase 2 (10 Tage):**
- ✅ Responsive GameBoard UI
- ✅ Alle Komponenten (Cards, Portals, Actions)
- ✅ Single-Player game fully functional

### 4️⃣ **Dann Phase 3 (Multiplayer):**

Lese [IMPLEMENTATION_ROADMAP.md Phase 3](IMPLEMENTATION_ROADMAP.md#phase-3-lobby--multiplayer-10-tage)

**Ergebnis nach Phase 3 (10 Tage):**
- ✅ boardgame.io Server läuft
- ✅ Lobby System (Create/Join Games)
- ✅ Real-time Multiplayer
- ✅ Netzwerk-Synchronisation

### 5️⃣ **Zum Abschluss Phase 4 (Polish & Deploy):**

Lese [IMPLEMENTATION_ROADMAP.md Phase 4](IMPLEMENTATION_ROADMAP.md#phase-4-polish--testing-5-7-tage)

**Ergebnis nach Phase 4 (5-7 Tage):**
- ✅ E2E Tests (Playwright)
- ✅ Performance Optimization (Lighthouse >90)
- ✅ Deployed on Vercel
- ✅ Production-ready

---

## 📊 Timeline Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: Setup (2-3d)  ✅ START HERE                       │
├─────────────────────────────────────────────────────────────┤
│ PHASE 1: Engine (10-12d) ⭐ CRITICAL & LONGEST             │
├─────────────────────────────────────────────────────────────┤
│ PHASE 2: UI (10d)      Responsive UI Components           │
├─────────────────────────────────────────────────────────────┤
│ PHASE 3: Multiplayer (10d) Networking & Lobby             │
├─────────────────────────────────────────────────────────────┤
│ PHASE 4: Polish (5-7d)  Testing & Deployment              │
└─────────────────────────────────────────────────────────────┘
  TOTAL: 37-42 Tage (6-7 Wochen)
```

---

## 🎯 Implementation Strategy

### ✅ Build-Test-Deploy Cycle
Nach jedem Schritt:
1. Schreibe Code
2. Schreibe Tests
3. Verifiziere Tests pass
4. Commit & Push

### ✅ Testable Milestones
Jede Phase hat klare GO/NO-GO Checkpoints:
- **Phase 0:** `pnpm run dev` works → **GO**
- **Phase 1:** Komplettes Spiel lokal spielbar → **GO**
- **Phase 2:** Responsive UI, alle Infos sichtbar → **GO**
- **Phase 3:** 2 Spieler online verbunden → **GO**
- **Phase 4:** App auf Vercel deployed → **LAUNCH!**

### ✅ No Incomplete Features
Alles muss am Ende "fertig" sein:
- Feature + Tests + Documentation
- Nicht: "Halfway done" Features

---

## 🎮 Spielregeln Kurzfassung

**2-4 Spieler, 15-30 Minuten**

1. **Setup:** Jeder Spieler hat leeres Portal, 3 Aktionen pro Turn
2. **Turn:** Nimm bis zu 3 Aktionen:
   - **Take Pearl Card** — Perle von Tisch zu Hand
   - **Place Character** — Charakter vom Tisch auf Hand
   - **Activate Character** — Spiele Perlenkarten → aktiviere Charakter → gewinn Machtpunkte
3. **Kosten:** Verschiedene Charaktere brauchen verschiedene Perlenkombinationen
   - 9 Cost Types (nTuple, sumAnyTuple, run, etc.)
   - Diamanten senken Kosten
4. **Abilities:** 14 verschiedene Charakter-Fähigkeiten
   - 5 Red: Instant Effekte
   - 8 Blue: Persistent Effekte
5. **Win Condition:**
   - Erreiche 12+ Machtpunkte → Triggere Final Round
   - Alle Spieler bekommen noch einen Turn
   - Gewinner = max Machtpunkte (Tiebreaker: max Diamanten)

**Weitere Details:** Siehe [game-web-spec.md](game-web-spec.md) oder [assets/Anleitung.md](assets/Anleitung.md)

---

## 🛠️ Tech Stack

| Komponente | Technologie | Grund |
|-----------|-----------|--------|
| **Framework** | React + TypeScript | Type safety, component-based |
| **Game Engine** | boardgame.io | Multiplayer framework, proven |
| **Styling** | Tailwind CSS | Rapid responsive design |
| **State Management** | Zustand | Lightweight, simple |
| **Build Tool** | Vite | Fast, modern, HMR support |
| **Testing** | Vitest + Testing Library | Fast unit & component tests |
| **E2E Testing** | Playwright | Cross-browser, real scenarios |
| **Server** | boardgame.io Server | Node.js backend, SocketIO |
| **Deployment** | Vercel | Easy, serverless, free tier |
| **Database** | MongoDB (optional Phase 4) | User accounts, game history |

---

## 📋 Kritische Komponenten

**Must-get-right:**
1. **Cost Validator** (Phase 1, Schritt 1.5)
   - Validiert 9 verschiedene CostComponent Typen
   - Hangt Diamonds-Modifikation
   - Prüft Blue Ability Modifikationen
   - **→ Test gründlich!**

2. **Ability System** (Phase 1, Schritt 1.7)
   - 14 verschiedene Fähigkeiten implementieren
   - Red vs. Blue logic unterschiedlich
   - Irrlicht Spezialregel (neighbors)
   - **→ Jede Fähigkeit isolated testen!**

3. **Game State Immutability** (Phase 1, überall)
   - Keine Mutations!
   - Deterministische Moves
   - Replay-fähig
   - **→ Tests mit Snapshots!**

4. **Network Synchronization** (Phase 3, Schritt 3.2-3.4)
   - Echte Real-time Sync
   - Reconnection handling
   - Credentials/Security
   - **→ Mit Netzwerk-Throttling testen!**

---

## 📁 Projektstruktur

```
molthar/
├── game-web/                    # ← DAS PROJEKT (starten hier!)
│   ├── src/
│   │   ├── game/               # Phase 1: Game Engine
│   │   │   ├── gameEngine.ts
│   │   │   ├── moves.ts
│   │   │   └── abilities.ts
│   │   ├── components/         # Phase 2: UI Components
│   │   │   ├── GameBoard.tsx
│   │   │   ├── cards/
│   │   │   ├── portals/
│   │   │   └── lobby/
│   │   ├── pages/              # Phase 2/3: Page Routes
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── lib/                # Phase 0: Types, Constants, Utils
│   │   ├── styles/             # CSS
│   │   └── test/               # Test Setup
│   ├── server/                 # Phase 3: boardgame.io Server
│   ├── tests/                  # Phase 1/4: Unit Tests
│   ├── e2e/                    # Phase 4: E2E Tests
│   ├── public/                 # Static Assets
│   │   ├── cards.json          # Character Card Data
│   │   └── index.html
│   ├── vite.config.ts          # Phase 0
│   ├── vitest.config.ts        # Phase 0
│   ├── tailwind.config.js      # Phase 0
│   ├── tsconfig.json           # Phase 0
│   ├── package.json            # Phase 0
│   └── README.md               # Project Guide
├── IMPLEMENTATION_ROADMAP.md   # Kompletter 4-Phasen Plan
├── PHASE_0_SETUP.md            # Detaillierter Phase 0 Guide
├── game-web-spec.md            # Technische Spezifikation
├── START_HERE.md               # Dieser Datei
├── card-manager/               # Web-Tool für Karten
├── PortaleVonMolthar/          # Swift Desktop App
└── assets/                     # Game Resources
    ├── Anleitung.md            # Original Spielregeln
    └── ...
```

---

## ✅ Getting Started Checklist

**Heute (Session 1):**
- [ ] Lese diese START_HERE.md komplett
- [ ] Öffne [PHASE_0_SETUP.md](PHASE_0_SETUP.md)
- [ ] Folge Schritt 0.1 & 0.2 (Vite Setup)

**Morgen (Session 2):**
- [ ] Folge Schritt 0.3, 0.4, 0.5 (Config & Types)
- [ ] Verifiziere Phase 0 Checkpoint
- [ ] `git commit "chore(p0): setup complete"`

**Dann (Sessions 3+):**
- [ ] Öffne [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
- [ ] Lese Phase 1 komplett
- [ ] Beginne mit P1.1 (Game Setup)
- [ ] Implementiere Schritt für Schritt

---

## 🎯 Key Success Factors

1. **Folge dem Plan** — Don't skip steps, don't freelance
2. **Test als du gehst** — Jeder Schritt muss testbar sein
3. **Commit oft** — Nach jedem funktionierenden Schritt
4. **Kommuniziere** — Bei Blockers, Fragen, unklare Specs
5. **Priorisiere richtig** — Phase 1 Cost Validator ist kritisch!

---

## 🆘 Help & Support

### Fragen zum Plan?
→ Lese [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)

### Fragen zu Spielregeln?
→ Lese [game-web-spec.md](game-web-spec.md) oder [assets/Anleitung.md](assets/Anleitung.md)

### Tech-Setup Probleme?
→ Siehe "Troubleshooting" in [PHASE_0_SETUP.md](PHASE_0_SETUP.md#-troubleshooting)

### Game Engine Fragen (Phase 1)?
→ Lese [game-web-spec.md Kosten-Systeme & Abilities](game-web-spec.md)

### Multiplayer / Networking Fragen (Phase 3)?
→ Lese [boardgame.io documentation](https://boardgame.io/)

---

## 📞 Contact & Git

**Repository:** `/Users/ulrich.frank/Dev/private/molthar`

**Main Branch:** `main`

**Commit Format:**
```bash
git commit -m "feat(phase-1): implement cost validator"
git commit -m "test(game): add pearl card selection tests"
git commit -m "docs: update implementation roadmap"
```

**Co-authored-by (Copilot):**
```
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## 🎓 Lessons from Similar Projects

1. **Game State Immutability is HARD** — Start simple, avoid mutations from day 1
2. **Cost Validation is Complex** — Test every combination early
3. **Responsive Design Needs Early Testing** — Don't leave for Phase 4
4. **Networking Testing Needs Throttling** — Test with bad internet early
5. **E2E Tests are slow** — Keep them lean, test happy path + common errors

---

## 🚀 Ready to Start?

**👉 Next Step: [PHASE_0_SETUP.md](PHASE_0_SETUP.md)**

Folge Schritt 0.1 "Vite/React/TypeScript Projekt Setup".

**Expected Duration:** 2-3 hours for Phase 0

**Expected Outcome:** `pnpm run dev` lädt die App auf http://localhost:5173

---

**Last Updated:** 2024-03-14  
**Status:** ✅ Ready to Start  
**Difficulty:** Intermediate (Game Engine) + Intermediate (Networking)

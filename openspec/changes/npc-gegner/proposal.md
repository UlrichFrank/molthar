## Why

Portale von Molthar erfordert bisher mehrere menschliche Spieler. NPCs ermöglichen Solo-Spiele und Partien mit weniger verfügbaren Mitspieler:innen, ohne auf das Spielerlebnis verzichten zu müssen.

## What Changes

- Neue Lobby-UI: Spieler konfigurieren Anzahl Menschen + Anzahl NPCs (Summe 2–5, min. 1 Mensch)
- Für jeden NPC-Slot wählbare Strategie mit Fantasy-Namen (5 Strategien)
- NPC-Slots werden automatisch beim Match-Erstellen gejoint — kein Warten im WaitingRoom
- Backend-BotRunner startet Bot-Clients (boardgame.io `Client` via SocketIO) für NPC-Spieler
- Bots agieren mit menschlich-wirkender Verzögerung (1–2,5 Sek. pro Aktion)
- Neuer Payment Solver in `shared/`: findet alle gültigen Zahlungskombinationen aus einer Hand

## Capabilities

### New Capabilities

- `npc-lobby-configuration`: Konfiguration von NPC-Slots im Lobby (Anzahl, Strategie pro Slot)
- `npc-bot-runner`: Server-seitiger BotRunner — startet/stoppt Bot-Clients, reagiert auf Zugwechsel
- `npc-strategies`: 5 regelbasierte Bot-Strategien (random, greedy, diamond, efficient, aggressive)
- `npc-payment-solver`: Algorithmus zur Bestimmung gültiger Zahlungskombinationen aus einer Hand

### Modified Capabilities

- `game-persistence`: `setupData` wird um `npcSlots` erweitert (breaking für gespeicherte Matches)

## Impact

- **shared/**: Neues Modul `botPaymentSolver.ts`
- **backend/**: Neues Modul `bot-runner.ts`, Anpassung `server-bgio.ts` (BotRunner-Start bei Match-Erstellung)
- **game-web/**: `CreateMatch.tsx` (NPC-Auswahl), `WaitingRoom.tsx` (nur auf Menschen warten), `LobbyScreen.tsx` (npcSlots in setupData)
- **Abhängigkeit**: boardgame.io `Bot`, `Step` aus `boardgame.io/ai` (bereits in Paket vorhanden)
- Keine Änderungen an Spiellogik (`index.ts`, `costCalculation.ts`)

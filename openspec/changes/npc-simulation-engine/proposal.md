## Why

Die fünf NPC-Strategien wurden bisher nur im Live-Spiel beobachtet — ein systematischer Vergleich war nicht möglich. Eine In-Process-Simulation ermöglicht es, Hunderte Spiele in Sekunden zu spielen, Stärken und Schwächen jeder Strategie zu messen und Parameter (Softmax-Temperaturen, Timing-Schwellen, Pearl-Scoring) datengetrieben zu optimieren.

## What Changes

- **Neue Simulation Engine** (`backend/src/simulation/`): In-Process-Spielsimulation ohne Server oder Netzwerk, basierend auf boardgame.io's `CreateGameReducer` + `InitializeGame`
- **Deterministisch mit seedrandom**: Jedes Spiel wird mit `(masterSeed + gameIndex)` geseeded — Turniere sind exakt reproduzierbar
- **Turnier-Runner**: Alle Strategie-Kombinationen für 2–5 Spieler, N Spiele pro Matchup
- **JSON-Report**: Vollständiges Spielprotokoll + Aggregat-Statistiken
- **HTML-Dashboard**: Selbst-enthaltene Datei mit Win-Rate-Tabelle, Head-to-Head-Matrix, Punkteverteilung (Box-Plots), Spieldauer-Histogramm
- **CLI-Einstiegspunkt**: `pnpm tsx src/simulation/run.ts` mit Flags für Spieleranzahl, Spiele, Seed, Strategien, Output-Pfad

## Capabilities

### New Capabilities

- `npc-simulation-engine`: In-Process-Spielsimulation — startet ein Spiel vollständig im Speicher, steuert Bots über ihre bestehenden Strategie-Funktionen, gibt ein strukturiertes `GameResult` zurück
- `npc-tournament-runner`: Orchestriert N Spiele über alle Strategie-Kombinationen, aggregiert Ergebnisse zu Turnierstatistiken (Win-Rates, Durchschnittspunkte, Head-to-Head)
- `npc-report-generation`: Generiert JSON-Bericht (Spiellog + Statistiken) und selbst-enthaltenes HTML-Dashboard aus Turnierergebnissen

### Modified Capabilities

<!-- Keine bestehenden Specs betroffen — Multiplayer-Betrieb und Bot-Logik bleiben unverändert -->

## Impact

- **Neue Abhängigkeit**: `seedrandom` (npm) im `backend`-Package
- **Neue Dateien**: `backend/src/simulation/engine.ts`, `tournament.ts`, `reporter.ts`, `run.ts`
- **Keine Änderungen**: `shared/`, `bot-runner.ts`, bestehende Bot-Dateien, `server-bgio.ts`
- **boardgame.io intern**: Nutzt `CreateGameReducer` + `InitializeGame` aus `boardgame.io/core` (bereits als CJS-Export bestätigt)

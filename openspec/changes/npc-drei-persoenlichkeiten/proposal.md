## Why

Die aktuellen NPC-Bots sind gegenüber menschlichen Spielern strukturell zu schwach. Ein 75-Spiel-Turnier (2P, 2026-04-24) zeigt: Der stärkste Bot (`diamond`) erreicht 77% Winrate, aber 53% der Spiele werden durch Fortschritts-Timeout abgebrochen — die Bots blockieren sich gegenseitig. Aus der Explore-Session sind vier strukturelle Lücken bekannt (Portal-Tausch fehlt, Timing zu grob, Contest-Score kontraproduktiv, Portal-Sackgassen bei WendelinBot), plus eine fünfte durch Code-Review: keiner der Bots nutzt aktiv die blauen Fähigkeiten (`swapPortalCharacter`, `rehandCards`, `peekCharacterDeck`, `tradeForDiamond`) — obwohl die Moves im Spielcode existieren.

Die fünf bisherigen Strategien (`random`, `greedy`, `diamond`, `efficient`, `aggressive`) werden durch drei stark spielende Persönlichkeiten mit klar unterschiedlichen Schwerpunkten ersetzt.

## What Changes

- **Neu**: `shared/src/game/botPortalSwap.ts` — Helper zur Bewertung von Portal-Tausch-Kandidaten (Lücke 1+4)
- **Neu**: `backend/src/bots/blueAbilities.ts` — Helper zur Aktivierung blauer Fähigkeiten (Lücke 5)
- **Geändert**: `backend/src/bots/timing.ts` — kontinuierlicher Multiplikator statt 3 Stufen (Lücke 2)
- **Geändert**: `shared/src/game/botPearlScorer.ts` — Contest-Score darf Score nicht unter eigenen Nutzen drücken (Lücke 3)
- **Geändert**: Drei überarbeitete Bots (WendelinBot, RalfBot, EdelsteinBot) nutzen den Smart Core und tragen jeweils eine klare Persönlichkeits-Priorisierung
- **Entfernt**: `IrrnisBot` (random) und `GierBot` (greedy) aus dem Spiel-Rotationssatz — `random` bleibt als Alias für Tests/Regressionen erhalten
- **Geändert**: `NpcStrategy`-Typ und Lobby-Defaults reflektieren die drei neuen Persönlichkeiten
- **Neu**: Turnier-Baseline-Skript um WinRate-Balance und Aborted-Rate als Akzeptanzkriterien zu prüfen

## Capabilities

### Modified Capabilities

- `npc-gegner`: Ersetzt fünf Strategien durch drei stark spielende Persönlichkeiten mit gemeinsamem Smart Core

### New Capabilities

- `npc-drei-persoenlichkeiten`: Definiert die drei Bot-Archetypen (Stratege, Raubritter, Sammler) mit ihren Priorisierungs-Deltas und dem gemeinsamen Smart Core

## Impact

- `shared/src/game/botPearlScorer.ts` — Contest-Score-Berechnung angepasst
- `shared/src/game/botPortalSwap.ts` — neu, mit Tests
- `backend/src/bots/timing.ts` — kontinuierlicher Multiplikator
- `backend/src/bots/blueAbilities.ts` — neu
- `backend/src/bots/{Wendelin,Ralf,Edelstein}Bot.ts` — überarbeitet
- `backend/src/bots/{Gier,Irrnis}Bot.ts` — entfernt (Irrnis als Test-Alias verschoben nach `backend/src/bots/testBots/`)
- `backend/src/bots/index.ts` — Factory reduziert auf drei Strategien + Test-Alias
- `shared/src/game/types.ts` — `NpcStrategy`-Typ auf drei Werte reduziert (mit `random` als Test-Alias)
- `game-web/src/components/**` — Lobby-Auswahl auf drei Optionen reduziert
- Keine Änderungen an boardgame.io Server, Move-API oder Frontend-Game-Logik

## Erfolgskriterien

Nach vollständiger Implementierung gilt der Change als erfolgreich, wenn ein 200-Spiele-Turnier zwischen den drei neuen Bots folgende Werte erreicht:

- Abgebrochene Spiele (Fortschritts-Timeout): **< 5%** (heute: 53%)
- Durchschnittliche Rundenzahl pro Sieg: **< 20 Runden** (heute: 22)
- Keine der drei Persönlichkeiten liegt unter **30% Winrate** gegen die anderen zwei
- Jede der drei Persönlichkeiten schlägt den alten `diamond`-Bot in einem Kontroll-Turnier mit **> 55% Winrate**

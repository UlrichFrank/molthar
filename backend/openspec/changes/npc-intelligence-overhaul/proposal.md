## Why

NPC-Bots ignorieren Aktionskarten (Fähigkeiten) vollständig, planen keinen Zug als Ganzes und reagieren nicht auf Spielphasen oder Gegneraktionen — dadurch wirken sie mechanisch und leicht zu durchschauen. Da die Grundinfrastruktur (Pearl-Scoring, Payment-Solver) nun stabil ist, ist jetzt der richtige Zeitpunkt für echte Spielintelligenz.

## What Changes

- Neue shared Utility `effectiveCardValue()`: bewertet Charakterkarten nach Punkten + Fähigkeitsbonus (abhängig von Spielzustand, Strategie, verbleibenden Runden)
- `turnPlan`-Feld in `BotClient`: zu Zugbeginn befüllter Aktionsplan, der Reihenfolge und Chaining berücksichtigt
- Neue shared Utility `planTurn()` in `turnPlanner.ts`: berechnet optimale Aktionssequenz für den gesamten Zug
- Aktivierungsreihenfolge: `threeExtraActions`-Karten immer vor anderen aktivieren; `changeHandActions` als letzte Aktion
- Portal-Tausch-Logik: Bots ersetzen die schlechteste Portal-Karte wenn eine deutlich bessere im Display liegt
- Blind Draw / `replacePearlSlots`: Bots berechnen Erwartungswert aus `pearlDeck` und ziehen blind oder ersetzen alle Slots wenn sinnvoll
- Deck-Peek für Charakterkarten: `characterDeck.at(-1)` wird in die Kartenauswahl einbezogen
- Endspiel-Reaktion: ab `G.finalRound` oder wenn Gegner ≥8 Punkte hat, stark erhöhte Aktivierungsbereitschaft
- Alle bestehenden Bots (GierBot, WendelinBot, EdelsteinBot, RalfBot) integrieren `effectiveCardValue` und Deck-Peek
- **Neuer Bot „Flinker Fritz"** (Strategie: `tempo`): Tempo-Spieler, priorisiert günstige Karten und Aktivierungsketten
- **Neuer Bot „Kluge Karla"** (Strategie: `synergy`): Synergist, baut Fähigkeitskombinationen auf

## Capabilities

### New Capabilities

- `npc-card-value-estimation`: Fähigkeits-bewusste Kartenbewertung mit `effectiveCardValue()` — Bonus pro Fähigkeitstyp, skaliert mit Spielphase
- `npc-turn-planning`: Zugplanung als Ganzes — `turnPlanner.ts` berechnet optimale Aktionsreihenfolge inkl. Chaining und Endspiel-Anpassung
- `npc-portal-swap`: Portal-Tausch-Logik — Bots ersetzen schwache Portal-Karten durch deutlich bessere Display-Karten
- `npc-blind-draw-strategy`: Informiertes Blind-Draw-Kalkül für Perlen und Charakterkarten basierend auf Deck-Zusammensetzung
- `npc-tempo-bot`: Flinker Fritz — Tempo-Strategie mit Fokus auf Aktivierungsketten und Action-Fähigkeiten
- `npc-synergy-bot`: Kluge Karla — Synergie-Strategie mit Fokus auf Fähigkeitskombinationen und Langzeit-Aufbau

### Modified Capabilities

## Impact

- `shared/src/game/botCardValueEstimator.ts` — neu
- `shared/src/game/types.ts` — `NpcStrategy` erweitert um `'tempo'` und `'synergy'`
- `shared/src/index.ts` — neue Exports
- `backend/src/bot-runner.ts` — `BotClient` bekommt `turnPlan`-Feld
- `backend/src/bots/turnPlanner.ts` — neu
- `backend/src/bots/FlinkBot.ts` — neu (Flinker Fritz)
- `backend/src/bots/KarlaBot.ts` — neu (Kluge Karla)
- `backend/src/bots/index.ts` — neue Bots registrieren
- `backend/src/bots/GierBot.ts`, `WendelinBot.ts`, `EdelsteinBot.ts`, `RalfBot.ts` — `effectiveCardValue` + Deck-Peek integrieren
- Keine Änderungen an Spielregeln, Moves oder Game State

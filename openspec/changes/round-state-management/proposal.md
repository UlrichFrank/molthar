## Why

Der Spielzustand hat kein explizites Konzept einer "Runde" (alle Spieler einmal an der Reihe, beginnend mit dem Startspieler). Das Spielende nach Erreichen von 12+ Punkten wird stattdessen über rohe Turn-Arithmetik berechnet (`2 * N - 1 - startingPlayerIdx`), was schwer nachvollziehbar und fehleranfällig ist. Die aktuelle Implementierung setzt `finalRound = true` sofort beim Trigger — mitten in einer Runde — obwohl die letzte Runde erst mit dem nächsten Zug des Startspielers beginnt.

## What Changes

- Ein `roundNumber`-Zähler (1-basiert) wird dem `GameState` hinzugefügt. Er zählt, wie viele vollständige Runden begonnen haben, und wird am **Ende des letzten Spielerzugs einer Runde** erhöht (wenn der nächste Spieler der Startspieler wäre).
- `finalRoundNumber: number | null` ersetzt `finalRoundTriggerTurn` und `finalRoundStartingPlayer`. Es wird auf `roundNumber + 1` gesetzt, wenn ein Spieler ≥12 Punkte erreicht.
- `finalRound` bleibt erhalten, wird aber erst in `turn.onBegin` des Startspielers auf `true` gesetzt, wenn `roundNumber === finalRoundNumber`.
- `endIf` vereinfacht sich zu: `roundNumber > finalRoundNumber`.

## Capabilities

### Modified Capabilities

- `round-state`: Explizite Rundenverwaltung im GameState; Spielende basiert auf Rundenzähler statt Turn-Arithmetik

## Impact

- `shared/src/game/types.ts` — `GameState` um `roundNumber: number` und `finalRoundNumber: number | null` erweitern; `finalRoundTriggerTurn` und `finalRoundStartingPlayer` entfernen
- `shared/src/game/index.ts` — Setup, `turn.onEnd`, `turn.onBegin`, Trigger-Stellen (≥12 Punkte), `endIf` anpassen
- `shared/src/game/*.test.ts` — Tests für Spielende und `finalRound`-Verhalten aktualisieren

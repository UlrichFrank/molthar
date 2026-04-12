## Why

Das Spiel endet einen Zug zu spät: Die letzte Runde schließt nicht beim Spieler ab, der sie ausgelöst hat (dem `finalRoundStartingPlayer`), sondern läuft eine volle Runde zu weit bis zum Spieler unmittelbar davor in der Zugreihenfolge.

Der Fehler liegt in der `endIf`-Berechnung in `shared/src/game/index.ts`. Die aktuelle Formel `turnsNeeded = (N - 1 - startingPlayerIdx) + N` zählt N Züge zu viel: Sie addiert zur verbleibenden aktuellen Runde **eine volle Runde N** statt nur die Züge bis zum auslösenden Spieler. Korrekt wäre immer genau **N** weitere Züge nach dem Auslöse-Zug.

## What Changes

- `endIf` in `shared/src/game/index.ts`: Formel vereinfachen zu `turnsNeeded = N` (unveränderlich für alle Spieleranzahlen und Startpositionen).

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `final-round-indicator`: Die Bedingung zum Spielende trifft genau dann zu, wenn der auslösende Spieler seinen letzten Zug beendet hat.

## Impact

- `shared/src/game/index.ts` (Zeile ~820): Eine Zeile ändern
- `shared/src/game/*.test.ts`: Bestehende Tests zu finalRound-Endverhalten prüfen und ggf. korrigieren

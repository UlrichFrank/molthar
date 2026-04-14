## Why

Wenn ein Spieler 12 Punkte erreicht, wird `turnsNeeded = N` (Spieleranzahl) verwendet, um das Spielende zu berechnen. Das ist nur korrekt, wenn der Auslöser der letzte Spieler der aktuellen Runde ist. In allen anderen Fällen endet das Spiel zu früh: die aktuelle Runde wird nicht vollständig fertiggespielt und die Schlussrunde ist unvollständig.

## What Changes

- `endIf` in `shared/src/game/index.ts`: `turnsNeeded` von `N` auf `2 * N - 1 - startingPlayerIdx` korrigieren
- Die bereits berechnete Variable `startingPlayerIdx` wird jetzt tatsächlich in der Berechnung verwendet (aktuell tot)

## Capabilities

### New Capabilities

### Modified Capabilities
- `final-round-indicator`: Das Verhalten der Schlussrunde ändert sich — wann das Spiel endet und wie viele Züge nach dem Auslösen gespielt werden.

## Impact

- `shared/src/game/index.ts` — `endIf`-Funktion, ein-Zeilen-Fix
- `shared/src/game/*.test.ts` — ggf. bestehende Tests zur Spielende-Logik prüfen/ergänzen

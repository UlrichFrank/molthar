## 1. Typen

- [x] 1.1 `GameState` in `shared/src/game/types.ts`: `roundNumber: number` und `finalRoundNumber: number | null` hinzufügen; `finalRoundTriggerTurn` und `finalRoundStartingPlayer` entfernen

## 2. Setup

- [x] 2.1 In `shared/src/game/index.ts` Setup: `roundNumber: 1`, `finalRoundNumber: null` initialisieren; `finalRoundTriggerTurn` und `finalRoundStartingPlayer` entfernen

## 3. Rundenzähler

- [x] 3.1 In `turn.onEnd`: `roundNumber` erhöhen wenn `nextPlayer === G.startingPlayer`

## 4. `finalRound`-Flag

- [x] 4.1 In `turn.onBegin`: `finalRound = true` setzen wenn `roundNumber === finalRoundNumber` und `currentPlayer === startingPlayer`

## 5. Trigger (≥12 Punkte)

- [x] 5.1 In `activatePortalCard`: Trigger-Block auf `finalRoundNumber = roundNumber + 1` umstellen; `finalRoundStartingPlayer` und `finalRoundTriggerTurn` entfernen
- [x] 5.2 Dasselbe in `activateSharedCharacter`

## 6. `endIf`

- [x] 6.1 `endIf` auf `roundNumber > finalRoundNumber` vereinfachen; alte Turn-Arithmetik entfernen

## 7. Tests

- [x] 7.1 Bestehende Tests für `finalRound` / Spielende auf neue State-Felder aktualisieren
- [x] 7.2 Neuer Test: Trigger in Runde 3 → `finalRoundNumber === 4`, `finalRound` erst in Runde 4 `true`
- [x] 7.3 Neuer Test: Spiel endet nach vollständiger Runde 4 (alle Spieler haben gespielt)
- [x] 7.4 Neuer Test: Zweiter Spieler überschreitet 12 Punkte → `finalRoundNumber` bleibt unverändert

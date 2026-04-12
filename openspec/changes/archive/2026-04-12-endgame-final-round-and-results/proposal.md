## Why

Das Spiel hat bereits eine funktionierende Endrundenlogik (`finalRound`, `endIf`), aber zwei Lücken: (1) Bei Punktgleichstand wird kein Tiebreaker (Diamanten) angewendet — es gewinnen mehrere Spieler gleichzeitig. (2) Nach Spielende gibt es kein UI — die Spieler sehen den letzten Spielzustand ohne Ergebnis-Anzeige oder Rückkehr-Option.

## What Changes

- `endIf` im Backend: Diamanten als Tiebreaker einführen — bei Punktgleichstand gewinnt, wer mehr Diamanten hat; erst wenn auch diese gleich sind, gilt echtes Unentschieden
- Neues `GameResultsDialog`-Frontend-Komponente: Zeigt Ranking aller Spieler (Punkte, Diamanten), Gewinner-Hervorhebung, und schließt sich nach einem Countdown automatisch — danach Rückkehr zur Lobby
- `CanvasGameBoard` erkennt `ctx.gameover` und rendert den Dialog

## Capabilities

### New Capabilities

- `endgame-tiebreaker`: Diamond-Tiebreaker in `endIf` — definiert eindeutige Gewinner bei Punktgleichstand
- `game-results-dialog`: Abschluss-Dialog mit Ranking, Gewinner-Hervorhebung und automatischer Countdown-Rückkehr zur Lobby

### Modified Capabilities

*(keine bestehenden Spec-Capabilities betroffen)*

## Impact

- `shared/src/game/index.ts` — `endIf`: Tiebreaker-Logik mit Diamanten ergänzen; Rückgabeformat für Gewinner anpassen (Ranking-Daten inkl. Diamanten)
- `game-web/src/components/GameResultsDialog.tsx` — neue Komponente (Rangliste + Countdown)
- `game-web/src/components/CanvasGameBoard.tsx` — `ctx.gameover`-Detection, `GameResultsDialog` rendern, Rückkehr-Callback zur Lobby
- `game-web/src/lobby/` — Rückkehr-Mechanismus (Lobby-Navigation nach Spielende)

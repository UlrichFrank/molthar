## Why

Das Spiel hat keinen sichtbaren Endzustand: Spieler wissen nicht, wann die letzte Runde läuft, wann jemand das 12-Punkte-Ziel erreicht hat, und es gibt keinen abschließenden Überblick über Ergebnisse und Ränge. Das frustriert das Spielerlebnis genau am entscheidenden Moment.

## What Changes

- Wenn ein Spieler ≥ 12 Punkte erreicht, wird das dauerhaft und auffällig auf dem Spielfeld angezeigt
- Während der letzten Runde erscheint ein zusätzlicher Hinweis, dass dies die Schlussrunde ist
- Nach Ende der letzten Runde öffnet sich automatisch ein Ergebnis-Dialog mit Ranking und Punkte-Übersicht aller Spieler
- Nach Bestätigung des Dialogs kehrt der Spieler zur Lobby zurück (Session wird gelöscht)

## Capabilities

### New Capabilities

- `threshold-reached-indicator`: Dauerhafte Anzeige auf dem Spielfeld wenn ≥ 1 Spieler das 12-Punkte-Ziel erreicht hat
- `final-round-indicator`: Hinweis-Banner während der letzten Runde (nach Erreichen des Punkteziels, bis alle Spieler ihren Zug gemacht haben)
- `endgame-results-dialog`: Modaler Dialog am Spielende mit Rang-Tabelle (Punkte, Errungenschaften) und Bestätigungsbutton für Rückkehr zur Lobby

### Modified Capabilities

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — neue Overlays für Threshold- und Final-Round-Indikator; `ctx.gameover`-Handling für Ergebnis-Dialog
- `game-web/src/components/` — neue `EndgameResultsDialog`-Komponente
- `shared/src/game/index.ts` — `gameover`-Payload muss Spielergebnisse (Punkte, Errungenschaften) enthalten
- `game-web/src/lobby/LobbyScreen.tsx` — Session-Cleanup nach Dialog-Bestätigung (bereits vorhanden, wird wiederverwendet)

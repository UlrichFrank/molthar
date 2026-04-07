## Context

Das Spiel verwaltet `G.finalRound` (bool) und `G.finalRoundStartingPlayer` in `shared/src/game/index.ts`. Die `endIf`-Funktion berechnet bei Spielende bereits die Gewinner und gibt `{ winner: { [playerID]: boolean } }` als `ctx.gameover`-Payload zurück. Punkte (`powerPoints`) und aktivierte Charaktere (`activatedCharacters`) sind je Spieler in `G.players[id]` gespeichert.

Der Canvas-Board (`CanvasGameBoard.tsx`) rendert bereits ein Gameover-Overlay wenn `ctx.gameover !== undefined`, zeigt aber nur einen Text. Die `LobbyScreen.tsx` hört auf `pvm:gameOver`-Events und handled Session-Cleanup bereits.

## Goals / Non-Goals

**Goals:**
- Threshold-Indikator: permanente sichtbare Markierung auf dem Spielfeld sobald ein Spieler ≥ 12 Punkte hat
- Final-Round-Banner: deutlicher Hinweis während der Schlussrunde (`G.finalRound === true && ctx.gameover === undefined`)
- Endgame-Dialog: strukturierte Ergebnis-Übersicht (Rang, Punkte, Anzahl aktivierter Charaktere) nach Spielende, mit Bestätigungs-Button → Lobby

**Non-Goals:**
- Kein detailliertes Achievement-System (nur: wie viele/welche Charaktere aktiviert)
- Keine Animationen für den Ergebnis-Dialog
- Keine Änderungen am Spielablauf oder Punkteberechnung

## Decisions

**D1: `gameover`-Payload um Spielergebnisse erweitern**
`endIf` gibt aktuell nur `{ winner: {...} }` zurück. Der Payload wird um `players: Array<{ id, name, powerPoints, activatedCount }>` (sortiert nach Rang) erweitert — so hat der Frontend-Dialog alle nötigen Daten ohne G lesen zu müssen.
Alternative: Frontend liest direkt aus `G.players`. Abgelehnt, weil `endIf` in boardgame.io nach Spielende auf `G` zugegriffen werden kann, aber es sauberer ist, den Payload selbst vollständig zu machen.

**D2: Threshold- und Final-Round-Indikator als React-Overlays, nicht auf Canvas**
Beide Indikatoren werden als positionierte `<div>`-Overlays über dem Canvas gerendert (wie bestehende Dialoge). Das vermeidet Komplexität im rAF-Loop und ist responsiv.
Alternative: Canvas-basiertes Rendern. Abgelehnt — zu aufwändig für rein informativen Text.

**D3: Endgame-Dialog ersetzt das bisherige `ctx.gameover`-Overlay**
Das bestehende einfache `gameover`-Overlay in `CanvasGameBoard.tsx` wird durch den neuen `EndgameResultsDialog` ersetzt. Der Dialog ist modal, zeigt eine Rang-Tabelle und hat einen "Zurück zur Lobby"-Button, der `pvm:gameOver` feuert.

**D4: Spieler-Ranking: Punkte absteigend, bei Gleichstand alphabetisch**
Einfache, nachvollziehbare Sortierung. Der `winner`-Flag aus `ctx.gameover.winner` markiert Erstplatzierte.

## Risks / Trade-offs

- `endIf` läuft server-seitig in boardgame.io — der erweiterte Payload muss TypeScript-kompatibel sein und darf nicht zu groß werden → Mitigation: nur skalare Werte (kein deep-clone von `G.players`)
- Das bisherige `gameover`-Overlay wird entfernt → kein Rückfall — Mitigation: Der neue Dialog deckt alle Fälle ab (`terminated` und normale Spielende)

## ADDED Requirements

### Requirement: Final-Round-Banner während der Schlussrunde anzeigen
Das System SHALL während der laufenden Schlussrunde einen deutlichen Banner anzeigen, der kommuniziert, dass dies die letzte Runde ist. Der Banner MUSS verschwinden sobald das Spiel endet (`ctx.gameover !== undefined`).

#### Scenario: Banner sichtbar während Schlussrunde
- **WHEN** `G.finalRound === true` UND `ctx.gameover === undefined`
- **THEN** wird ein Banner mit einem Text wie "🏁 Letzte Runde!" im Spielfeld angezeigt

#### Scenario: Banner nicht sichtbar vor Schlussrunde
- **WHEN** `G.finalRound === false`
- **THEN** wird kein Final-Round-Banner angezeigt

#### Scenario: Banner verschwindet bei Spielende
- **WHEN** `ctx.gameover !== undefined`
- **THEN** wird der Final-Round-Banner nicht mehr gerendert (der Endgame-Dialog übernimmt)

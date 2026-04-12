## ADDED Requirements

### Requirement: Spiel endet genau nach dem letzten Zug des auslösenden Spielers
`endIf` SHALL das Spiel beenden, nachdem der `finalRoundStartingPlayer` seinen letzten Zug in der Schlussrunde gespielt hat — nicht einen Zug später. Die Anzahl der Züge nach dem Auslöse-Zug beträgt stets **N** (Anzahl der Spieler), unabhängig von der Position des auslösenden Spielers.

#### Scenario: 2 Spieler, Spieler 0 löst aus — Spiel endet nach Zug T+N
- **WHEN** Spieler 0 (idx=0) bei Zug T auslöst, N=2
- **THEN** ist `endIf` bei `ctx.turn = T+2` noch `undefined`
- **AND** ist `endIf` bei `ctx.turn = T+3` definiert (Spiel endet)

#### Scenario: 2 Spieler, letzter Spieler löst aus — Spiel endet nach Zug T+N
- **WHEN** Spieler 1 (idx=1) bei Zug T auslöst, N=2
- **THEN** ist `endIf` bei `ctx.turn = T+2` noch `undefined`
- **AND** ist `endIf` bei `ctx.turn = T+3` definiert (Spiel endet)

#### Scenario: 4 Spieler, Spieler 2 löst aus — Spiel endet nach Zug T+N
- **WHEN** Spieler 2 (idx=2) bei Zug T auslöst, N=4
- **THEN** ist `endIf` bei `ctx.turn = T+4` noch `undefined`
- **AND** ist `endIf` bei `ctx.turn = T+5` definiert (Spiel endet)

#### Scenario: Kein sofortiges Spielende im Auslöse-Zug selbst
- **WHEN** `ctx.turn === finalRoundTriggerTurn`
- **THEN** gibt `endIf` `undefined` zurück

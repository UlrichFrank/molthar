## ADDED Requirements

### Requirement: Pending-Flag wird gesetzt wenn Gegner Handkarten hat
Wenn die Ability `stealOpponentHandCard` ausgelöst wird und mindestens ein Gegner Handkarten (`hand.length > 0`) hat, SHALL das System `G.pendingStealOpponentHandCard = true` setzen. Die Karte wird NICHT automatisch gestohlen.

#### Scenario: Flag gesetzt wenn Gegner Handkarten hat
- **WHEN** `applyRedAbility` mit `stealOpponentHandCard` aufgerufen wird und mind. ein Spieler mit `playerId !== currentPlayer` und `hand.length > 0` existiert
- **THEN** wird `G.pendingStealOpponentHandCard = true` gesetzt und keine Karte entfernt

#### Scenario: Ability ignoriert wenn niemand Handkarten hat
- **WHEN** `applyRedAbility` mit `stealOpponentHandCard` aufgerufen wird und kein Gegner `hand.length > 0` hat
- **THEN** bleibt `G.pendingStealOpponentHandCard = false`, kein Effekt

### Requirement: Resolve-Move überträgt gewählte Karte
Der Move `resolveStealOpponentHandCard(targetPlayerId, handCardIndex)` SHALL die Karte an Position `handCardIndex` aus `players[targetPlayerId].hand` entfernen, in die Hand des aktiven Spielers legen und `pendingStealOpponentHandCard = false` setzen.

#### Scenario: Erfolgreiche Kartenübertragung
- **WHEN** `resolveStealOpponentHandCard` mit gültigem `targetPlayerId` (nicht currentPlayer) und gültigem `handCardIndex` aufgerufen wird und `pendingStealOpponentHandCard === true`
- **THEN** wird `players[targetPlayerId].hand[handCardIndex]` entfernt, zu `players[currentPlayer].hand` hinzugefügt, und `pendingStealOpponentHandCard = false`

#### Scenario: No-op wenn Flag nicht gesetzt
- **WHEN** `resolveStealOpponentHandCard` aufgerufen wird und `pendingStealOpponentHandCard === false`
- **THEN** ändert sich der Game-State nicht

#### Scenario: No-op wenn eigene playerId
- **WHEN** `resolveStealOpponentHandCard` mit `targetPlayerId === ctx.currentPlayer` aufgerufen wird
- **THEN** ändert sich der Game-State nicht

#### Scenario: No-op bei ungültigem handCardIndex
- **WHEN** `resolveStealOpponentHandCard` mit `handCardIndex` außerhalb von `players[targetPlayerId].hand` aufgerufen wird
- **THEN** ändert sich der Game-State nicht

### Requirement: Initialzustand
`pendingStealOpponentHandCard` SHALL im `setup` mit `false` initialisiert werden.

#### Scenario: Spielstart
- **WHEN** ein neues Spiel gestartet wird
- **THEN** ist `G.pendingStealOpponentHandCard === false`

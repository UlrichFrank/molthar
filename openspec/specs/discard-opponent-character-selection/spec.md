## ADDED Requirements

### Requirement: Pending-Flag wird bei discardOpponentCharacter gesetzt
Wenn die Ability `discardOpponentCharacter` ausgelöst wird und mindestens ein Gegner eine Karte im `portal` hat, SHALL das System `G.pendingDiscardOpponentCharacter` auf `true` setzen. Die Karte wird NICHT automatisch entfernt.

#### Scenario: Flag wird gesetzt wenn Gegner Portal-Karte hat
- **WHEN** `applyRedAbility` mit `discardOpponentCharacter` aufgerufen wird und mind. ein anderer Spieler eine Karte in `portal` hat
- **THEN** wird `G.pendingDiscardOpponentCharacter = true` gesetzt und keine Karte entfernt

#### Scenario: Ability wird ignoriert wenn kein Gegner Portal-Karte hat
- **WHEN** `applyRedAbility` mit `discardOpponentCharacter` aufgerufen wird und kein anderer Spieler eine Karte in `portal` hat
- **THEN** bleibt `G.pendingDiscardOpponentCharacter = false` und der Move läuft normal weiter

### Requirement: Resolve-Move entfernt gewählte Karte
Der Move `resolveDiscardOpponentCharacter(targetPlayerId, portalEntryId)` SHALL die identifizierte Portal-Karte aus dem `portal` des Zielspielers entfernen, auf `characterDiscardPile` legen und `pendingDiscardOpponentCharacter` auf `false` setzen.

#### Scenario: Erfolgreiche Auswahl
- **WHEN** `resolveDiscardOpponentCharacter` mit gültigem `targetPlayerId` und `portalEntryId` aufgerufen wird und `pendingDiscardOpponentCharacter === true`
- **THEN** wird die Karte aus `players[targetPlayerId].portal` entfernt, zu `characterDiscardPile` hinzugefügt, und `pendingDiscardOpponentCharacter` wird `false`

#### Scenario: Move wird ignoriert wenn kein Pending-Flag
- **WHEN** `resolveDiscardOpponentCharacter` aufgerufen wird und `pendingDiscardOpponentCharacter === false`
- **THEN** ändert sich der Game-State nicht (no-op, Schutz gegen Move-Injection)

#### Scenario: Move schlägt fehl bei ungültiger portalEntryId
- **WHEN** `resolveDiscardOpponentCharacter` mit einer `portalEntryId` aufgerufen wird, die im `portal` von `targetPlayerId` nicht existiert
- **THEN** ändert sich der Game-State nicht

#### Scenario: Move schlägt fehl bei eigenem Portal
- **WHEN** `resolveDiscardOpponentCharacter` aufgerufen wird und `targetPlayerId === ctx.currentPlayer`
- **THEN** ändert sich der Game-State nicht

### Requirement: Initialzustand
`pendingDiscardOpponentCharacter` SHALL im `setup` mit `false` initialisiert werden.

#### Scenario: Spielstart
- **WHEN** ein neues Spiel gestartet wird
- **THEN** ist `G.pendingDiscardOpponentCharacter === false`

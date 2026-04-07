## ADDED Requirements

### Requirement: Board triggert TakeBackPlayedPearlDialog
Die Board-Komponente SHALL `G.pendingTakeBackPlayedPearl` lesen und den `TakeBackPlayedPearlDialog` für den aktiven Spieler öffnen.

#### Scenario: Dialog wird bei Flag gerendert
- **WHEN** `G.pendingTakeBackPlayedPearl === true` und lokaler Spieler ist `ctx.currentPlayer`
- **THEN** rendert `CanvasGameBoard` den `TakeBackPlayedPearlDialog`

#### Scenario: Kein Dialog ohne Flag
- **WHEN** `G.pendingTakeBackPlayedPearl === false`
- **THEN** wird kein `TakeBackPlayedPearlDialog` gerendert

### Requirement: DialogContext erhält neuen Typ für Perlkarten-Rückgabe
`DialogContext` SHALL um den Typ `take-back-played-pearl` erweitert werden.

#### Scenario: Neuer Dialog-Typ im Context
- **WHEN** `openTakeBackPlayedPearlDialog` aufgerufen wird
- **THEN** ist `dialog.type === 'take-back-played-pearl'`

## ADDED Requirements

### Requirement: Board triggert DiscardOpponentCharacterDialog
Die Board-Komponente oder ein zugehöriger Hook SHALL `G.pendingDiscardOpponentCharacter` lesen und den `DiscardOpponentCharacterDialog` für den aktiven Spieler öffnen.

#### Scenario: Dialog wird bei Flag gerendert
- **WHEN** `G.pendingDiscardOpponentCharacter === true` und der lokale Spieler ist `ctx.currentPlayer`
- **THEN** rendert `CanvasGameBoard` den `DiscardOpponentCharacterDialog`

#### Scenario: Kein Dialog bei fehlendem Flag
- **WHEN** `G.pendingDiscardOpponentCharacter === false`
- **THEN** wird kein `DiscardOpponentCharacterDialog` gerendert

### Requirement: DialogContext erhält neuen Typ für Gegner-Kartenauswahl
`DialogContext` SHALL um den Typ `discard-opponent-character` erweitert werden, der den Dialog-State und die nötige Spielerliste trägt.

#### Scenario: Neuer Dialog-Typ im Context
- **WHEN** `openDiscardOpponentCharacterDialog` aufgerufen wird
- **THEN** ist `dialog.type === 'discard-opponent-character'` und der Dialog rendert den `DiscardOpponentCharacterDialog`

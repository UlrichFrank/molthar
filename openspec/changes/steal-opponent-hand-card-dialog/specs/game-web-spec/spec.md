## ADDED Requirements

### Requirement: Board triggert StealOpponentHandCardDialog
Die Board-Komponente SHALL `G.pendingStealOpponentHandCard` lesen und den `StealOpponentHandCardDialog` für den aktiven Spieler öffnen.

#### Scenario: Dialog wird bei Flag gerendert
- **WHEN** `G.pendingStealOpponentHandCard === true` und lokaler Spieler ist `ctx.currentPlayer`
- **THEN** rendert `CanvasGameBoard` den `StealOpponentHandCardDialog`

#### Scenario: Kein Dialog ohne Flag
- **WHEN** `G.pendingStealOpponentHandCard === false`
- **THEN** wird kein `StealOpponentHandCardDialog` gerendert

### Requirement: DialogContext erhält neuen Typ für Handkartendiebstahl
`DialogContext` SHALL um den Typ `steal-opponent-hand-card` erweitert werden, der den internen Schritt-Zustand (`selectedPlayerId: string | null`) verwaltet.

#### Scenario: Neuer Dialog-Typ im Context
- **WHEN** `openStealOpponentHandCardDialog` aufgerufen wird
- **THEN** ist `dialog.type === 'steal-opponent-hand-card'` mit `selectedPlayerId: null` (Stufe 1)

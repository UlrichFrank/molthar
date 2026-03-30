## ADDED Requirements

### Requirement: Austausch-Button-Regionen in buildRegions
`canvasRegions.ts` SHALL `portal-swap-btn`-Regionen unterhalb der Portal-Slots hinzufügen, wenn `changeCharacterActions` aktiv ist und `actionCount === 0`.

#### Scenario: Regionen bei aktiver Ability
- **WHEN** Spieler hat `changeCharacterActions` aktiv, `actionCount === 0`, Portal-Slot `i` belegt
- **THEN** enthält die Region-Liste einen Eintrag `{ type: 'portal-swap-btn', id: i }` unterhalb von `portal-slot i`

#### Scenario: Keine Regionen ohne Voraussetzungen
- **WHEN** Ability nicht aktiv ODER `actionCount > 0`
- **THEN** enthält die Region-Liste keine `portal-swap-btn`-Einträge

### Requirement: DialogContext erhält Typ swap-portal-character
`DialogContext` SHALL um den Typ `swap-portal-character` mit `portalCard`, `portalSlotIndex` und `tableCards` erweitert werden.

#### Scenario: Neuer Typ im Context
- **WHEN** `openSwapPortalCharacterDialog` aufgerufen wird
- **THEN** ist `dialog.type === 'swap-portal-character'` mit den übergebenen Daten

### Requirement: CanvasGameBoard rendert CharacterSwapDialog
`CanvasGameBoard` SHALL den `CharacterSwapDialog` rendern wenn `dialog.type === 'swap-portal-character'`.

#### Scenario: Dialog wird gerendert
- **WHEN** `dialog.type === 'swap-portal-character'`
- **THEN** wird `CharacterSwapDialog` mit `portalCard`, `portalSlotIndex` und `tableCards` gerendert

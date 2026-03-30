## ADDED Requirements

### Requirement: Echte Perlenkarten werden pro Zug geloggt
Wenn echte (nicht-virtuelle) Perlenkarten aus der Hand eines Spielers auf den `pearlDiscardPile` gelegt werden, SHALL ihre ID zum `playedRealPearlIds`-Array im `GameState` hinzugefügt werden.

#### Scenario: Karten-ID wird bei Aktivierung geloggt
- **WHEN** `activatePortalCard` oder `activateSharedCharacter` echte Handkarten konsumiert und auf `pearlDiscardPile` legt
- **THEN** wird die `id` jeder konsumierten Karte zu `G.playedRealPearlIds` hinzugefügt

#### Scenario: Virtuelle Karten werden nicht geloggt
- **WHEN** Perlenkarten mit `source: 'ability'` oder `abilityType` bei der Aktivierung verwendet werden
- **THEN** werden keine virtuellen Karten-IDs zu `playedRealPearlIds` hinzugefügt

#### Scenario: Log akkumuliert über mehrere Aktionen
- **WHEN** ein Spieler in einem Zug zwei Charakterkarten aktiviert und je 2 echte Perlenkarten verbraucht
- **THEN** enthält `playedRealPearlIds` 4 Einträge

### Requirement: Log wird am Zugende geleert
`playedRealPearlIds` SHALL am Ende jedes Zuges (in `turn.onEnd` oder äquivalent) auf ein leeres Array zurückgesetzt werden.

#### Scenario: Log nach Zugende leer
- **WHEN** der Zug endet (endTurn)
- **THEN** ist `G.playedRealPearlIds` ein leeres Array `[]`

### Requirement: Initialzustand und Entfernung des alten Feldes
`lastPlayedPearlId` SHALL aus dem `GameState` entfernt werden. `playedRealPearlIds` SHALL im `setup` als leeres Array `[]` initialisiert werden.

#### Scenario: Spielstart
- **WHEN** ein neues Spiel gestartet wird
- **THEN** ist `G.playedRealPearlIds === []` und `lastPlayedPearlId` existiert nicht mehr im State

### Requirement: Pending-Flag für die Ability
`pendingTakeBackPlayedPearl: boolean` SHALL im `GameState` vorhanden sein und im `setup` mit `false` initialisiert werden. Die `takeBackPlayedPearl`-Ability SHALL es auf `true` setzen.

#### Scenario: Flag gesetzt bei Ability-Aktivierung
- **WHEN** `applyRedAbility` mit `takeBackPlayedPearl` aufgerufen wird
- **THEN** wird `G.pendingTakeBackPlayedPearl = true` gesetzt (unabhängig davon ob `playedRealPearlIds` leer ist)

### Requirement: Resolve-Move `resolveReturnPearl`
Der Move `resolveReturnPearl(pearlId)` SHALL die Karte mit der gegebenen ID aus `pearlDiscardPile` entfernen, in die Hand des aktiven Spielers legen und `pendingTakeBackPlayedPearl = false` sowie die ID aus `playedRealPearlIds` entfernen.

#### Scenario: Erfolgreiche Rückgabe
- **WHEN** `resolveReturnPearl` mit einer `pearlId` aufgerufen wird, die in `pearlDiscardPile` und `playedRealPearlIds` existiert, und `pendingTakeBackPlayedPearl === true`
- **THEN** wird die Karte vom Discard-Pile in die Hand bewegt, `pendingTakeBackPlayedPearl = false`, ID aus `playedRealPearlIds` entfernt

#### Scenario: No-op wenn Flag nicht gesetzt
- **WHEN** `resolveReturnPearl` aufgerufen wird und `pendingTakeBackPlayedPearl === false`
- **THEN** ändert sich der Game-State nicht

#### Scenario: No-op wenn pearlId nicht in playedRealPearlIds
- **WHEN** `resolveReturnPearl` mit einer ID aufgerufen wird, die nicht in `playedRealPearlIds` ist
- **THEN** ändert sich der Game-State nicht (Schutz gegen Move-Injection)

### Requirement: Dismiss-Move `dismissReturnPearlDialog`
Der Move `dismissReturnPearlDialog()` SHALL nur `pendingTakeBackPlayedPearl = false` setzen, ohne Karten zu bewegen.

#### Scenario: Flag wird gelöscht
- **WHEN** `dismissReturnPearlDialog` aufgerufen wird und `pendingTakeBackPlayedPearl === true`
- **THEN** wird `pendingTakeBackPlayedPearl = false`

#### Scenario: No-op wenn Flag nicht gesetzt
- **WHEN** `dismissReturnPearlDialog` aufgerufen wird und `pendingTakeBackPlayedPearl === false`
- **THEN** ändert sich der Game-State nicht

## MODIFIED Requirements

### Requirement: Diamantanzahl-Prop im Aktivierungsdialog
Der `CharacterActivationDialog` SHALL die verfügbare Diamantenanzahl als `number` entgegennehmen. Der Aufrufer berechnet diesen Wert als `player.diamondCards.length`.

#### Scenario: Diamantenanzahl wird korrekt übergeben
- **WHEN** der Aktivierungsdialog geöffnet wird
- **THEN** erhält der Dialog `diamonds={player.diamondCards.length}` als Prop
- **AND** die interne Validierungslogik des Dialogs bleibt unverändert

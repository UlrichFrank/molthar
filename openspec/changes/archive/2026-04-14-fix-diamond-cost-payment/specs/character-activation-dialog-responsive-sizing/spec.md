## ADDED Requirements

### Requirement: Diamantkosten-Sektion responsive dargestellt
Die neue Diamantkosten-Sektion im Aktivierungsdialog SHALL das gleiche visuelle Muster wie bestehende Sektionen verwenden und auf allen Bildschirmgrößen korrekt dargestellt werden.

#### Scenario: Diamantkosten-Sektion auf kleinen Bildschirmen
- **WHEN** der Dialog auf einem Bildschirm < 500px angezeigt wird
- **THEN** ist die Diamantkosten-Sektion vollständig sichtbar ohne horizontales Scrollen
- **AND** der Toggle-Button hat eine ausreichende Touch-Target-Größe (≥ 44px Höhe)

#### Scenario: Diamantkosten-Sektion auf großen Bildschirmen
- **WHEN** der Dialog auf einem Bildschirm ≥ 500px angezeigt wird
- **THEN** ist die Diamantkosten-Sektion visuell konsistent mit den anderen Sektionen des Dialogs

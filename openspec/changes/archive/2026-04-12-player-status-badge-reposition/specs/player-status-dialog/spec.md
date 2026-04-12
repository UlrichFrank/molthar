## MODIFIED Requirements

### Requirement: Dialog-Größe entspricht Standard-Dialogen
Der `PlayerStatusDialog` SHALL keine einengenden Inline-Width-Styles verwenden. Stattdessen SHALL er die Standard-CSS-Klasse `.game-dialog` nutzen, die `max-width: min(600px, 95vw)`, `width: 100%` und `padding: 2rem` definiert — identisch zu allen anderen Dialogen im Spiel.

#### Scenario: Dialog hat Standard-Breite
- **WHEN** der Dialog geöffnet wird
- **THEN** hat er eine Breite von bis zu 600px (bzw. 95vw auf kleinen Screens), nicht weniger als ~400px durch natürlichen Inhaltsfluss

#### Scenario: Kein einengender Inline-Style
- **WHEN** der Dialog gerendert wird
- **THEN** setzt `game-dialog-body` keinen `minWidth`-Inline-Style, der die `.game-dialog`-CSS-Breite unterschreitet

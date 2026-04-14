## ADDED Requirements

### Requirement: Highlight-Glow-Overlay im Canvas-Render-Loop
Der Canvas-Render-Loop SHALL nach dem normalen Spielfeld-Rendering eine zusätzliche Overlay-Schicht zeichnen, die aktive Highlight-Glows auf geänderten Elementen darstellt.

#### Scenario: Highlight-Overlay wird nach Spielelementen gezeichnet
- **WHEN** aktive `HighlightEntry`-Objekte vorhanden sind
- **THEN** werden deren Glow-Rechtecke als letztes im rAF-Frame gezeichnet, sodass sie über allen Spielelementen liegen

#### Scenario: Kein Overlay bei leerer Highlight-Liste
- **WHEN** keine aktiven Highlights vorhanden sind
- **THEN** wird kein zusätzlicher Zeichenaufruf ausgeführt (Performance-neutral)

## MODIFIED Requirements

### Requirement: Aktivierte Charakterkarten werden im Grid gerendert

Das Canvas-Rendering SHALL aktivierte Charakterkarten in einem 3×2-Grid mit ACTIVATED_CARD_W = round(CARD_W * 0.90) und ACTIVATED_CARD_H = round(CARD_H * 0.90) zeichnen (zuvor 0.75). Es werden maximal 6 Karten pro Seite (ACTIVATED_PAGE_SIZE = 6) gerendert; welche Karten gezeigt werden, bestimmt der page-Parameter.

#### Scenario: Grid zeigt Karten der aktiven Seite
- **WHEN** `drawActivatedCharacters` aufgerufen wird mit page=0
- **THEN** werden die Karten mit Index 0–5 aus `activatedCards` an den Grid-Positionen gezeichnet

#### Scenario: Grid zeigt Seite 1
- **WHEN** `drawActivatedCharacters` aufgerufen wird mit page=1
- **THEN** werden die Karten mit Index 6–11 aus `activatedCards` an den Grid-Positionen gezeichnet

## MODIFIED Requirements

### Requirement: Discard Cards Button Visibility
Der "Discard Cards"-Button auf dem Canvas SHALL nur angezeigt werden, wenn `G.requiresHandDiscard === true` UND der Spieler keine Aktionen mehr hat (`actionCount >= maxActions`).

#### Scenario: Discard Cards sichtbar wenn keine Aktionen mehr und Karten abzuwerfen
- **WHEN** `G.requiresHandDiscard === true` und `actionCount >= maxActions`
- **THEN** zeigt das Canvas-UI-Panel den "Discard Cards"-Button

#### Scenario: Discard Cards nicht sichtbar wenn noch Aktionen übrig
- **WHEN** `G.requiresHandDiscard === true` und `actionCount < maxActions`
- **THEN** zeigt das Canvas-UI-Panel den normalen Aktionszähler (`actionCount / maxActions`), kein "Discard Cards"-Button

#### Scenario: End Turn nicht sichtbar wenn Karten abzuwerfen
- **WHEN** `G.requiresHandDiscard === true` und `actionCount >= maxActions`
- **THEN** wird kein "End Turn"-Button angezeigt (ersetzt durch "Discard Cards")

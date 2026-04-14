## MODIFIED Requirements

### Requirement: Perlkarten-Auslage-Slots sind positionsstabil
Die 4 Perlkarten-Auslage-Slots SHALL feste Positionen (0–3) behalten, wenn eine Karte genommen wird. Die Nachziehkarte erscheint an derselben Position wie die entnommene Karte. Andere belegte Slots verschieben sich nicht.

#### Scenario: Nachziehkarte erscheint an derselben Position
- **WHEN** ein Spieler die Perlkarte an Slot 1 nimmt und der Nachziehstapel nicht leer ist
- **THEN** erscheint die neue Karte an Slot 1
- **AND** die Karten an Slots 0, 2 und 3 bleiben an ihrer Position

#### Scenario: Leerer Slot bleibt leer wenn Deck leer
- **WHEN** ein Spieler die Perlkarte an Slot 2 nimmt und der Nachziehstapel leer ist
- **THEN** bleibt Slot 2 leer (keine Karte)
- **AND** die anderen Slots verschieben sich nicht

#### Scenario: Slot-Index entspricht stabiler Canvas-Position
- **WHEN** `buildCanvasRegions` aufgerufen wird
- **THEN** hat `pearlSlots[i]` (wenn nicht null) immer dieselbe Canvas-X-Position `AUSLAGE_START_X + (i+2) * (CARD_W + CARD_GAP)`
- **AND** ein leerer Slot (null) erzeugt keine Region und keinen Hover-Glow

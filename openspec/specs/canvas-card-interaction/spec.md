## MODIFIED Requirements

### Requirement: CanvasRegions werden aus Game-State gebaut
Das System SHALL für jedes interaktive Canvas-Element ein `CanvasRegion`-Objekt bereitstellen, das Position (x, y, w, h, angle), Typ, ID sowie `hoverProgress` (0–1) und `flashProgress` (0–1) enthält. Dies umfasst Karten, Decks und UI-Buttons. Portal-Slot-Regions werden nur für belegte Slots erstellt.

#### Scenario: CanvasRegions werden aus Game-State gebaut
- **WHEN** `buildCanvasRegions(G, playerID, isActive, existing)` aufgerufen wird
- **THEN** gibt es für jede Auslage-Karte, belegte Portal-Slot-Karte, Hand-Karte, aktivierte Karte, Deck (Character + Pearl) und UI-Button (End Turn, Discard Cards) eine `CanvasRegion` mit korrekter Position

#### Scenario: Leerer Portal-Slot erzeugt keine Region
- **WHEN** `me.portal[i]` nicht belegt ist
- **THEN** wird für diesen Slot keine `portal-slot`-Region erzeugt und kein Hover-Glow gezeigt

#### Scenario: Belegter Portal-Slot erzeugt eine Region
- **WHEN** `me.portal[i]` eine Karte enthält
- **THEN** wird eine `portal-slot`-Region mit korrekter Position erzeugt und Hover-Glow sowie Click sind aktiv

#### Scenario: Animations-Zustand bleibt bei State-Update erhalten
- **WHEN** das Spiel einen neuen State bekommt und `buildCanvasRegions` erneut aufgerufen wird
- **THEN** werden `hoverProgress` und `flashProgress` bestehender Regions beibehalten (in-place update)

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

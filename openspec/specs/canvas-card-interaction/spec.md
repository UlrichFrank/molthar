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

## MODIFIED Requirements

### Requirement: CanvasRegion kapselt Position und Animations-Zustand aller interaktiven Elemente
Das System SHALL für jedes interaktive Canvas-Element ein `CanvasRegion`-Objekt bereitstellen, das Position (x, y, w, h, angle), Typ, ID sowie `hoverProgress` (0–1) und `flashProgress` (0–1) enthält. Dies umfasst Karten, Decks und UI-Buttons.

#### Scenario: CanvasRegions werden aus Game-State gebaut
- **WHEN** `buildCanvasRegions(G, playerID)` aufgerufen wird
- **THEN** gibt es für jede Auslage-Karte, Portal-Slot, Hand-Karte, aktivierte Karte, Deck (Character + Pearl) und UI-Button (End Turn, Discard Cards) eine `CanvasRegion` mit korrekter Position

#### Scenario: Animations-Zustand bleibt bei State-Update erhalten
- **WHEN** das Spiel einen neuen State bekommt und `buildCanvasRegions` erneut aufgerufen wird
- **THEN** werden `hoverProgress` und `flashProgress` bestehender Regions beibehalten (in-place update)

---

### Requirement: Klick auf Charakterkarte öffnet Dialog statt direkten Move
Das System SHALL bei einem Klick auf eine Auslage-Charakterkarte oder den Charakterstapel keinen Move direkt auslösen, sondern stattdessen den Vorschau- bzw. Austauschdialog öffnen. Der Move wird erst nach Nutzerbestätigung im Dialog ausgeführt.

#### Scenario: Klick auf Auslage-Karte öffnet Vorschau-Dialog
- **WHEN** ein Klick-Event auf eine `CanvasRegion` vom Typ `characterDisplay` registriert wird
- **THEN** wird NICHT sofort `takeCharacterCard` aufgerufen
- **AND** stattdessen öffnet sich der Vorschau- oder Austauschdialog (je nach Portal-Status)

#### Scenario: Klick auf Charakterstapel öffnet Vorschau-Dialog
- **WHEN** ein Klick-Event auf eine `CanvasRegion` vom Typ `characterDeck` registriert wird
- **THEN** wird NICHT sofort `takeCharacterCard` aufgerufen
- **AND** stattdessen öffnet sich der Vorschau- oder Austauschdialog (je nach Portal-Status)

#### Scenario: Move wird nach Dialog-Bestätigung ausgeführt
- **WHEN** der Spieler im Vorschau-Dialog bestätigt
- **THEN** wird `takeCharacterCard` mit der entsprechenden Karten-ID aufgerufen

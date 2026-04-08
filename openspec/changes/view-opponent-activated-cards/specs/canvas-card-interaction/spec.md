## ADDED Requirements

### Requirement: Hit-Regions für gegnerische aktivierte Charakterkarten
Das System SHALL für jede aktivierte Charakterkarte jedes Gegners eine `CanvasRegion` mit Typ `opponent-activated-character` und ID `"<playerId>:<cardIndex>"` in Weltkoordinaten bereitstellen.

#### Scenario: Regions werden für alle Gegner gebaut
- **WHEN** `buildCanvasRegions(G, playerID, isActive, existing, neighbors)` aufgerufen wird
- **THEN** enthält das Ergebnis für jeden Gegner mit mindestens einer aktivierten Karte entsprechende `opponent-activated-character`-Regions

#### Scenario: Positionsberechnung stimmt mit Rendering überein
- **WHEN** eine `opponent-activated-character`-Region erstellt wird
- **THEN** liegen ihre `(x, y, w, h)`-Koordinaten im Weltkoordinatensystem genau über der gezeichneten Karte (kein Versatz)

#### Scenario: Animations-Zustand bleibt bei State-Update erhalten
- **WHEN** `buildCanvasRegions` nach einem State-Update erneut aufgerufen wird
- **THEN** werden `hoverProgress` und `flashProgress` bestehender `opponent-activated-character`-Regions beibehalten

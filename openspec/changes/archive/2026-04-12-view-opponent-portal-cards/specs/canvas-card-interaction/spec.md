## MODIFIED Requirements

### Requirement: Klick auf Charakterkarte öffnet Dialog statt direkten Move
Das System SHALL bei einem Klick auf eine Auslage-Charakterkarte oder den Charakterstapel keinen Move direkt auslösen, sondern stattdessen den Vorschau- bzw. Austauschdialog öffnen. Der Move wird erst nach Nutzerbestätigung im Dialog ausgeführt. Zusätzlich SHALL das System bei einem Klick auf eine Portal-Karte eines Gegners die read-only Detail-Ansicht öffnen — es sei denn, die Karte ist irrlicht-fähig und es ist der eigene Zug, dann wird der Aktivierungsdialog geöffnet.

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

#### Scenario: Klick auf Gegner-Portal-Karte öffnet Detail-Ansicht (immer)
- **WHEN** ein Klick-Event auf eine `CanvasRegion` vom Typ `opponent-portal-card` registriert wird
- **AND** es ist NICHT der eigene Zug ODER die Karte hat keine irrlicht-Fähigkeit
- **THEN** öffnet sich die read-only Detail-Ansicht (`ActivatedCharacterDetailView`) für diese Karte

#### Scenario: Klick auf Irrlicht-Portal-Karte im eigenen Zug öffnet Aktivierungsdialog
- **WHEN** ein Klick-Event auf eine `CanvasRegion` vom Typ `opponent-portal-card` registriert wird
- **AND** es ist der eigene Zug
- **AND** die Karte hat die Fähigkeit `irrlicht` oder `sharedActivation`
- **THEN** öffnet sich der Aktivierungsdialog für diese Karte

## ADDED Requirements

### Requirement: opponent-portal-card Regions immer vorhanden
Das System SHALL `CanvasRegion`-Objekte vom Typ `opponent-portal-card` für alle belegten Portal-Slots aller sichtbaren Nachbar-Gegner erzeugen — unabhängig davon ob es der eigene Zug ist oder ob die Karte irrlicht-fähig ist.

#### Scenario: Portal-Karten-Regions existieren außerhalb des eigenen Zugs
- **WHEN** `buildCanvasRegions(G, playerID, isActive=false, ...)` aufgerufen wird
- **AND** ein Nachbar-Gegner hat Karten im Portal
- **THEN** existieren für diese Karten `CanvasRegion`-Einträge vom Typ `opponent-portal-card`

#### Scenario: Portal-Karten-Regions existieren für Nicht-Irrlicht-Karten
- **WHEN** `buildCanvasRegions(G, playerID, isActive=true, ...)` aufgerufen wird
- **AND** ein Nachbar-Gegner hat eine Portal-Karte ohne irrlicht-Fähigkeit
- **THEN** existiert für diese Karte eine `CanvasRegion` vom Typ `opponent-portal-card`

### Requirement: Hover-Glow auf Gegner-Portal-Karten
Das System SHALL den Hover-Glow auf Portal-Karten von Gegnern identisch zum Hover-Glow auf aktivierten Gegner-Karten darstellen — immer, unabhängig vom Zug.

#### Scenario: Hover-Glow auf Gegner-Portal-Karte außerhalb des eigenen Zugs
- **WHEN** der Mouse-Pointer über eine Portal-Karte eines Gegners fährt
- **AND** es ist NICHT der eigene Zug
- **THEN** steigt `hoverProgress` der Region über Zeit von 0 auf 1 und der goldene Glow wird sichtbar

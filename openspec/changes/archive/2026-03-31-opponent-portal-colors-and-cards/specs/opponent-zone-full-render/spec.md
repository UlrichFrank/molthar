## ADDED Requirements

### Requirement: Gegner-Zonen rendern das korrekte Portal-Hintergrundbild
Jede besetzte Gegner-Zone SHALL das Portal-Hintergrundbild des jeweiligen Spielers zeigen — `Portal{colorIndex}.jpeg` oder `Portal-Startspieler{colorIndex}.jpeg`. Leere Zonen (kein Spieler zugewiesen) SHALL weiterhin `Schriftrolle.png` zeigen.

#### Scenario: Gegner mit colorIndex=4 in linker Zone
- **WHEN** der Spieler in der linken Zone `colorIndex=4` hat und kein Startspieler ist
- **THEN** wird `Portal4.jpeg` (rotiert 90°, skaliert auf Zonengröße) als Hintergrund gerendert

#### Scenario: Startspieler in oberer Zone
- **WHEN** der Spieler in der oberen linken Zone der Startspieler ist und `colorIndex=1` hat
- **THEN** wird `Portal-Startspieler1.jpeg` (rotiert 180°) als Hintergrund gerendert

#### Scenario: Leere Zone
- **WHEN** für eine Zone kein Spieler zugewiesen ist (weniger als 4 Spieler)
- **THEN** wird `Schriftrolle.png` für diese Zone gerendert (wie bisher)

### Requirement: Portal-Slot-Karten der Gegner werden offen angezeigt
Die Karten in den Portal-Slots (max. 2) jedes Gegners SHALL in der entsprechenden Zone sichtbar (Vorderseite) und korrekt rotiert gerendert werden. Die Karten SHALL auf die Zonengröße skaliert sein (ca. 35% der normalen Kartengröße).

#### Scenario: Gegner hat eine Karte in Slot 0
- **WHEN** der Gegner in der linken Zone eine Karte in `portal[0]` hat
- **THEN** wird das Kartenbild der Vorderseite (um 90° rotiert, skaliert) in der linken Zone angezeigt

#### Scenario: Leerer Portal-Slot nicht gerendert
- **WHEN** `portal[1]` des Gegners leer ist
- **THEN** wird kein Kartenbild für Slot 1 angezeigt (keine leere Rahmenbox)

### Requirement: Aktivierte Charaktere der Gegner werden offen angezeigt
Die `activatedCharacters` jedes Gegners SHALL in kleiner Darstellung (ca. 25% der normalen Kartengröße) in der Gegner-Zone sichtbar (Vorderseite) und korrekt rotiert gerendert werden.

#### Scenario: Gegner hat 2 aktivierte Karten
- **WHEN** der Gegner 2 aktivierte Charaktere hat
- **THEN** werden beide Kartenvorderseiten klein und rotiert in seiner Zone angezeigt

#### Scenario: Keine aktivierten Karten
- **WHEN** der Gegner keine aktivierten Charaktere hat
- **THEN** wird kein Platz für aktivierte Karten belegt

### Requirement: Handkarten der Gegner bleiben verdeckt
Die Handkarten aller Gegner SHALL als gestapelter verdeckter Stapel mit Anzahl-Label gerendert werden — die Kartenrückseite oder ein Standardrücken-Bild. Die tatsächlichen Kartenwerte dürfen nicht sichtbar sein.

#### Scenario: Gegner hat 4 Handkarten
- **WHEN** der Gegner 4 Karten in der Hand hat
- **THEN** wird ein verdeckter Stapel (Rückenansicht) mit dem Label "4" oder entsprechender Anzahl-Darstellung in seiner Zone angezeigt

#### Scenario: Leere Hand
- **WHEN** der Gegner keine Handkarten hat
- **THEN** wird kein Handkarten-Bereich oder "0" angezeigt

### Requirement: Alle Karten in Gegner-Zonen sind entsprechend rotiert
Alle Kartenbilder und Zonendarstellungen SHALL um den Zonenwinkel rotiert sein: links=90°, oben-links=180°, oben-rechts=180°, rechts=270°. Die Rotation gilt einheitlich für Portal-Hintergrund, Portal-Slot-Karten, aktivierte Charaktere und Handkarten-Stapel.

#### Scenario: Linke Zone — 90°-Rotation
- **WHEN** Gegner 2 in der linken Zone sitzt
- **THEN** sind Portal-Hintergrund und alle Karten-Elemente um 90° im Uhrzeigersinn rotiert (so dass sie für Spieler 2 aufrecht wirken)

#### Scenario: Obere Zonen — 180°-Rotation
- **WHEN** Gegner 3 oder 4 in einer oberen Zone sitzen
- **THEN** sind alle Elemente um 180° rotiert

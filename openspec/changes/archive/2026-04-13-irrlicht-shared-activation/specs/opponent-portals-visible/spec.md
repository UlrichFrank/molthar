## ADDED Requirements

### Requirement: Gegnerische Portalkarten werden für alle Spieler angezeigt
`drawOpponentPortals` SHALL die tatsächlich ausgelegten Charakterkarten aller Gegner in beiden Portal-Slots rendern. Leere Slots SHALL leer bleiben (kein Placeholder). Karten SHALL mit der Rotation der jeweiligen Opponent-Zone dargestellt werden.

#### Scenario: Karte in Opponent-Slot sichtbar
- **WHEN** ein Gegner eine Charakterkarte in Slot 0 seines Portals ausgelegt hat
- **THEN** wird diese Karte im entsprechenden Opponent-Bereich auf dem Canvas gerendert (mit Zonenrotation)

#### Scenario: Leerer Slot bleibt leer
- **WHEN** ein Gegner keinen oder nur einen Eintrag in seinem Portal hat
- **THEN** wird kein Kartenbild für den fehlenden Slot gerendert

#### Scenario: Alle vier Zonen rendern Karten
- **WHEN** bis zu 4 Gegner mit je 2 Karten im Portal vorhanden sind
- **THEN** werden in allen besetzten Zonen (links, oben-links, oben-rechts, rechts) die Kartenvorderseiten korrekt rotiert gerendert

### Requirement: Rotierte Karten verwenden die Zonenrotation
Die Opponent-Zonen haben feste Rotationswinkel (links=90°, oben-links=180°, oben-rechts=180°, rechts=270°). Charakterkarten in diesen Zonen SHALL mit dem entsprechenden Winkel gerendert werden, sodass sie für den jeweiligen Gegner aufrecht wirken.

#### Scenario: Karte in linker Zone (90°)
- **WHEN** Gegner 2 (linke Zone) eine Karte im Slot hat
- **THEN** wird die Karte mit 90° Rotation gerendert

#### Scenario: Karte in oberer Zone (180°)
- **WHEN** Gegner 3 oder 4 (obere Zonen) eine Karte im Slot hat
- **THEN** wird die Karte mit 180° Rotation gerendert

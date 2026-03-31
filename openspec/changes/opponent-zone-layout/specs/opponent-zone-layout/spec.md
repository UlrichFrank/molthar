## ADDED Requirements

### Requirement: Einheitlicher Skalierungsfaktor für alle Gegner-Zonen
Das System SHALL einen einzigen `OPP_SCALE`-Faktor verwenden, der für alle vier Gegner-Zonen und alle Kartentypen darin identisch ist. Der Faktor wird als `min(ZONE_CENTER_H / PORTAL_W, MARGIN_H / ZONE_PLAYER_H)` berechnet.

#### Scenario: Gleiche Kartengröße in allen Zonen
- **WHEN** mehrere Gegner gleichzeitig angezeigt werden
- **THEN** sind Portal-Slot-Karten, aktivierte Charaktere und Hand-Stapel in allen Zonen gleich groß

### Requirement: Gegner-Layout spiegelt Spieler-Layout
Das System SHALL die Gegner-Zone als skaliertes Abbild des Spieler-Layouts rendern. Die relativen Positionen von Hand-Stapel (links), Portal-Slots (Mitte) und aktivierten Charakteren (rechts) MÜSSEN identisch zu denen der Spieler-Zone sein, multipliziert mit `OPP_SCALE`.

#### Scenario: Portal-Slots aus Mitspielersicht oben
- **WHEN** Mitspieler 2 (links, 90° rotiert) angezeigt wird
- **THEN** erscheinen seine Portal-Slots auf der rechten Seite der Zone (= „oben" aus seiner Sicht)

#### Scenario: Hand-Stapel links aus Mitspielersicht
- **WHEN** ein Gegner angezeigt wird
- **THEN** befindet sich der Handkarten-Stapel auf der linken Seite aus Mitspielersicht (entsprechend der Rotation: unten/rechts/oben/links aus Spielersicht)

#### Scenario: Aktivierte Charaktere rechts der Portal-Slots
- **WHEN** ein Gegner aktivierte Charakterkarten hat
- **THEN** werden diese rechts der Portal-Slots dargestellt (aus Mitspielersicht)

### Requirement: Korrekte Portal-Hintergrundgröße
Das System SHALL den Portal-Hintergrund auf `PORTAL_W * OPP_SCALE × ZONE_PLAYER_H * OPP_SCALE` skalieren und im rotierten lokalen Koordinatensystem zentrieren.

#### Scenario: Portal-Hintergrund füllt skalierte Zone
- **WHEN** eine Gegner-Zone gerendert wird
- **THEN** füllt der Portal-Hintergrund genau den skalierten Bereich (keine Über- oder Untergröße)

### Requirement: Handkarten als verdeckter Stapel mit Badge
Das System SHALL die Gegner-Handkarten als einzelnen verdeckten Stapel (`Perlenkarte Hinten.png`) mit einem Anzahl-Badge darstellen.

#### Scenario: Handkarten-Stapel mit korrektem Bild
- **WHEN** ein Gegner Handkarten hat
- **THEN** wird `Perlenkarte Hinten.png` (nicht `Perlenkarte_Rueckseite.png`) als Stapelbild verwendet
- **THEN** zeigt ein Badge die Anzahl der Handkarten an

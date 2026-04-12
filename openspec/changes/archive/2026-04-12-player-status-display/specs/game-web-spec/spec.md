## ADDED Requirements

### Requirement: Status-Badges als HTML-Overlays im Canvas-Board
Die `CanvasGameBoard`-Komponente SHALL Status-Badges als absolute HTML-Overlays über dem Canvas rendern, konsistent mit dem bestehenden `PlayerNameDisplay`-Overlay-Muster.

#### Scenario: Eigener Spieler Badge-Position
- **WHEN** das Spielfeld gerendert wird und der lokale Spieler aktiv ist
- **THEN** wird das eigene Status-Badge direkt unterhalb von `PlayerNameDisplay` positioniert (oben links im Canvas-Container)

#### Scenario: Gegner Badge-Position
- **WHEN** das Spielfeld gerendert wird und Gegner vorhanden sind
- **THEN** werden die Gegner-Badges in den jeweiligen Gegner-Zonen des Canvas positioniert (entsprechend der links/oben-links/oben-rechts/rechts Positionen aus `buildOpponentsArray`)

#### Scenario: Responsive Skalierung
- **WHEN** das Browser-Fenster skaliert wird
- **THEN** skalieren die Badge-Overlays gemeinsam mit dem Canvas-Container (via CSS transform des Parent-Containers)

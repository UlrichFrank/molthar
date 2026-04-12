## MODIFIED Requirements

### Requirement: Status-Badges als HTML-Overlays im Canvas-Board
Die `CanvasGameBoard`-Komponente SHALL Status-Badges als absolute HTML-Overlays über dem Canvas rendern. `PlayerNameDisplay` und das Canvas-UI-Panel (`drawUIButton`) SHALL nicht mehr verwendet werden.

#### Scenario: Eigener Spieler Badge-Position
- **WHEN** das Spielfeld gerendert wird und der lokale Spieler aktiv oder inaktiv ist
- **THEN** wird das eigene Status-Badge horizontal zentriert am oberen Rand der Spielerportal-Zone positioniert (`left: '50%'`, `transform: 'translateX(-50%)'`, `top: ~64.5%`)

#### Scenario: Spielername im eigenen Badge
- **WHEN** das Spielfeld gerendert wird
- **THEN** enthält das eigene Status-Badge den aufgelösten Spielernamen (`resolvePlayerName`) als erste Zeile

#### Scenario: Aktionszähler im eigenen Badge
- **WHEN** der lokale Spieler der aktive Spieler ist
- **THEN** zeigt das eigene Badge den Aktionszähler `X/Y` mit korrekter Farbcodierung

#### Scenario: PlayerNameDisplay entfernt
- **WHEN** das Spielfeld gerendert wird
- **THEN** wird `PlayerNameDisplay` nicht gerendert

#### Scenario: Canvas-UI-Panel entfernt
- **WHEN** das Spielfeld gerendert wird
- **THEN** zeichnet der Canvas kein `drawUIButton`-Panel mehr

#### Scenario: Gegner Badge-Position
- **WHEN** das Spielfeld gerendert wird und Gegner vorhanden sind
- **THEN** werden die Gegner-Badges weiterhin in den jeweiligen Gegner-Zonen positioniert (unverändert)

#### Scenario: Responsive Skalierung
- **WHEN** das Browser-Fenster skaliert wird
- **THEN** skalieren Badge und End-Turn-Button gemeinsam mit dem Canvas-Container

## ADDED Requirements

### Requirement: End-Turn-Button als HTML-Overlay
Das System SHALL einen „Zug beenden"-Button als HTML-Overlay über dem Canvas anzeigen.

#### Scenario: Button erscheint bei erschöpften Aktionen
- **WHEN** der lokale Spieler aktiv ist und `actionCount >= maxActions`
- **THEN** wird der „Zug beenden"-Button sichtbar, zentriert unterhalb des eigenen Badges

#### Scenario: Button ist unsichtbar bei laufenden Aktionen
- **WHEN** `actionCount < maxActions` oder der lokale Spieler nicht aktiv ist
- **THEN** wird kein „Zug beenden"-Button angezeigt (kein Platzhalter, kein leeres Element)

#### Scenario: Klick beendet den Zug
- **WHEN** der Benutzer auf den „Zug beenden"-Button klickt
- **THEN** wird `moves.endTurn()` aufgerufen

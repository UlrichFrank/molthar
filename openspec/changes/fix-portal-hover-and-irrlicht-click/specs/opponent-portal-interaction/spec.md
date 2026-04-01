## ADDED Requirements

### Requirement: Irrlicht-Karten in Nachbar-Portalen sind klickbar
Das System SHALL für direkte Nachbar-Spieler (±1 in `playerOrder`) deren Portal-Karten mit `irrlicht`-Ability als `opponent-portal-card`-Region erfassen, wenn der lokale Spieler am Zug ist und Aktionen übrig hat. Diese Regions unterstützen Hover-Glow, Click-Flash und öffnen bei Klick den Aktivierungsdialog.

#### Scenario: Irrlicht-Region erscheint für direkten Nachbarn
- **WHEN** der aktive Spieler am Zug ist und ein direkter Nachbar eine Irrlicht-Karte im Portal hat
- **THEN** existiert eine `opponent-portal-card`-Region mit korrekter Position und Rotation für diese Karte

#### Scenario: Keine Irrlicht-Region für Nicht-Nachbarn
- **WHEN** ein Gegner keine direkter Nachbar ist (z.B. gegenüberliegender Spieler)
- **THEN** wird keine `opponent-portal-card`-Region für dessen Portal erzeugt

#### Scenario: Keine Irrlicht-Region wenn nicht am Zug
- **WHEN** der lokale Spieler nicht der aktive Spieler ist
- **THEN** werden keine `opponent-portal-card`-Regions erzeugt

#### Scenario: Keine Irrlicht-Region für Nicht-Irrlicht-Karte
- **WHEN** eine Karte im Nachbar-Portal keine `irrlicht`-Ability hat
- **THEN** wird keine `opponent-portal-card`-Region für diese Karte erzeugt

### Requirement: Hit-Testing für rotierte Gegner-Portal-Karten
Das System SHALL Mausklicks auf `opponent-portal-card`-Regions korrekt erkennen, auch wenn diese Karten in rotierten Gegner-Zonen (90°/180°/270°) gerendert werden.

#### Scenario: Klick trifft rotierte Irrlicht-Karte
- **WHEN** der Nutzer auf die Position einer Irrlicht-Karte in einem Gegner-Portal klickt
- **THEN** wird die zugehörige `opponent-portal-card`-Region als Hit erkannt

#### Scenario: Klick neben der Karte trifft nicht
- **WHEN** der Nutzer neben eine Irrlicht-Karte klickt (außerhalb ihres Bounds)
- **THEN** wird keine `opponent-portal-card`-Region als Hit erkannt

### Requirement: Klick auf Irrlicht-Karte öffnet Aktivierungsdialog
Das System SHALL beim Klick auf eine `opponent-portal-card`-Region den CharacterActivationDialog öffnen, der beim Bestätigen `moves.activateSharedCharacter(ownerPlayerId, slotIndex, selections)` aufruft.

#### Scenario: Aktivierungsdialog öffnet sich für Irrlicht-Karte
- **WHEN** ein berechtigter Nachbar-Spieler auf eine Irrlicht-Karte im Gegner-Portal klickt
- **THEN** öffnet sich der CharacterActivationDialog mit der Irrlicht-Karte und den Kosten des Besitzers

#### Scenario: Bestätigung ruft activateSharedCharacter auf
- **WHEN** der Spieler die Zahlung im Dialog bestätigt
- **THEN** wird `moves.activateSharedCharacter(ownerPlayerId, slotIndex, selections)` aufgerufen

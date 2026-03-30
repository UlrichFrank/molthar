## ADDED Requirements

### Requirement: Irrlicht-Karten der direkten Nachbarn sind klickbar
Ein aktiver Spieler SHALL auf Irrlicht-Karten in den Portal-Slots seiner direkten Nachbarn (Vorgänger und Nachfolger in `G.playerOrder`) klicken können, sofern die Karte noch nicht vom Besitzer aktiviert wurde (`PortalEntry.activated === false`) und der Spieler noch Aktionen übrig hat.

#### Scenario: Klick auf aktivierbare Irrlicht-Karte
- **WHEN** der aktive Spieler auf eine Irrlicht-Karte eines direkten Nachbarn klickt, die noch nicht aktiviert ist
- **THEN** öffnet sich der `CharacterActivationDialog` für diese Karte

#### Scenario: Nicht-Irrlicht-Karte des Nachbarn nicht klickbar
- **WHEN** der aktive Spieler auf eine Karte ohne `irrlicht`-Ability eines Nachbarn klickt
- **THEN** passiert nichts (Region ist deaktiviert oder nicht vorhanden)

#### Scenario: Bereits aktivierte Irrlicht-Karte nicht klickbar
- **WHEN** die Irrlicht-Karte des Nachbarn hat `PortalEntry.activated === true`
- **THEN** ist die Canvas-Region deaktiviert (nicht klickbar)

#### Scenario: Karte eines Nicht-Nachbarn nicht klickbar
- **WHEN** der aktive Spieler klickt auf eine Irrlicht-Karte eines Spielers, der kein direkter Nachbar ist
- **THEN** ist keine Canvas-Region für diese Karte registriert (nicht klickbar)

#### Scenario: Keine Aktion verfügbar
- **WHEN** `actionCount >= maxActions`
- **THEN** sind alle `opponent-portal-slot`-Regionen deaktiviert

### Requirement: CharacterActivationDialog öffnet sich für Gegner-Irrlicht-Karte
Beim Klick auf eine aktivierbare Irrlicht-Karte SHALL der `CharacterActivationDialog` geöffnet werden. Der Dialog SHALL identisch zum eigenen Portal-Aktivierungsdialog funktionieren, aber `moves.activateSharedCharacter` mit `ownerPlayerId` und `portalSlotIndex` aufrufen.

#### Scenario: Dialog zeigt Irrlicht-Karte und eigene Ressourcen
- **WHEN** der Dialog für eine Gegner-Irrlicht-Karte geöffnet wird
- **THEN** zeigt er die Irrlicht-Karte, die Hand des aktiven Spielers, seine Diamanten und seine aktivierten Charaktere (für Fähigkeiten)

#### Scenario: Aktivierung ruft activateSharedCharacter auf
- **WHEN** der Spieler auf "Activate" klickt
- **THEN** wird `moves.activateSharedCharacter(ownerPlayerId, portalSlotIndex, selections)` aufgerufen mit den Selections aus dem Dialog

#### Scenario: Abbrechen schließt Dialog ohne Move
- **WHEN** der Spieler auf "Cancel" klickt
- **THEN** wird kein Move aufgerufen und der Dialog geschlossen

### Requirement: Erfolgreich aktivierte Irrlicht-Karte verschwindet aus dem Gegner-Portal
Nach einer erfolgreichen `activateSharedCharacter`-Aktivierung aktualisiert sich der Game-State: Die Karte verbleibt im Portal des Besitzers als aktiviert (`activated: true`) oder wird entfernt und zu den `activatedCharacters` des Aktivierers hinzugefügt.

#### Scenario: Karte nach Aktivierung nicht mehr anklickbar
- **WHEN** eine Irrlicht-Karte durch `activateSharedCharacter` aktiviert wurde
- **THEN** ist `PortalEntry.activated === true` und die Canvas-Region ist deaktiviert

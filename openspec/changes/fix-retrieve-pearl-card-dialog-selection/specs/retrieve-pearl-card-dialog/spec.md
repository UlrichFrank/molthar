## ADDED Requirements

### Requirement: Klick auf eine Karte löst den Retrieve-Move aus und schließt den Dialog dauerhaft
Wenn der Spieler im Dialog eine Perlenkarte anklickt, SHALL `resolveReturnPearl(pearlId)` aufgerufen werden, die Karte in die Hand des Spielers gelegt werden, `pendingTakeBackPlayedPearl` auf `false` gesetzt werden und der Dialog sich dauerhaft schließen.

#### Scenario: Spieler klickt eine Karte im Dialog
- **WHEN** der "Perlenkarte zurückholen"-Dialog offen ist und gespielete Karten zeigt
- **WHEN** der Spieler auf eine der angezeigten Karten klickt
- **THEN** wird `resolveReturnPearl(card.id)` mit der ID der angeklickten Karte aufgerufen
- **THEN** schließt sich der Dialog
- **THEN** erscheint die Karte in der Hand des Spielers

#### Scenario: Dialog öffnet sich nach erfolgreichem Klick nicht erneut
- **WHEN** der Spieler eine Karte erfolgreich ausgewählt hat
- **THEN** bleibt der Dialog geschlossen (kein sofortiges Wiederöffnen durch den pending-State)

### Requirement: Move-Guards geben INVALID_MOVE zurück
Der `resolveReturnPearl`-Move SHALL bei allen Guard-Fehlern `INVALID_MOVE` zurückgeben, damit boardgame.io den Move korrekt als ungültig markiert und keinen State-Reset durchführt.

#### Scenario: Move aufgerufen wenn kein Retrieve ausstehend
- **WHEN** `resolveReturnPearl` aufgerufen wird aber `G.pendingTakeBackPlayedPearl` ist `false`
- **THEN** gibt der Move `INVALID_MOVE` zurück
- **THEN** findet keine State-Mutation statt

#### Scenario: Move aufgerufen mit unbekannter Pearl-ID
- **WHEN** `resolveReturnPearl` aufgerufen wird mit einer `pearlId` die nicht in `G.playedRealPearlIds` enthalten ist
- **THEN** gibt der Move `INVALID_MOVE` zurück

#### Scenario: Move aufgerufen wenn Karte nicht im Discard Pile
- **WHEN** `resolveReturnPearl` aufgerufen wird aber die Karte nicht in `G.pearlDiscardPile` gefunden werden kann
- **THEN** gibt der Move `INVALID_MOVE` zurück

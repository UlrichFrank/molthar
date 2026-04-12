## ADDED Requirements

### Requirement: Gegnerische aktivierte Karten sind anklickbar
Das System SHALL für jede aktivierte Charakterkarte jedes Gegners eine klickbare Hit-Region im Canvas bereitstellen, unabhängig davon ob der eigene Spieler am Zug ist oder noch Aktionen hat.

#### Scenario: Klick auf gegnerische aktivierte Karte öffnet Detailansicht
- **WHEN** der Spieler auf eine aktivierte Charakterkarte eines Gegners klickt oder tippt
- **THEN** öffnet sich die `ActivatedCharacterDetailView` mit den Daten dieser Karte

#### Scenario: Detailansicht auch außerhalb des eigenen Zugs verfügbar
- **WHEN** der Spieler nicht am Zug ist und auf eine gegnerische aktivierte Karte klickt
- **THEN** öffnet sich die `ActivatedCharacterDetailView` (identisch zum eigenen Zug)

#### Scenario: Detailansicht auch bei keinen verbleibenden Aktionen verfügbar
- **WHEN** der Spieler am Zug ist, aber `actionCount >= maxActions`, und auf eine gegnerische aktivierte Karte klickt
- **THEN** öffnet sich die `ActivatedCharacterDetailView`

### Requirement: Hover und Flash-Feedback für gegnerische aktivierte Karten
Das System SHALL Hover-Glow (Mouse) und Click-Flash für gegnerische aktivierte Karten identisch zu den eigenen aktivierten Karten anzeigen.

#### Scenario: Hover-Glow bei Mouse-Over
- **WHEN** die Maus über eine gegnerische aktivierte Karte fährt
- **THEN** erscheint der goldene Hover-Glow auf dieser Karte

#### Scenario: Click-Flash bei Klick
- **WHEN** eine gegnerische aktivierte Karte angeklickt wird
- **THEN** erscheint das weiße Flash-Overlay auf dieser Karte

### Requirement: Schließen der Detailansicht
Das System SHALL die `ActivatedCharacterDetailView` einer gegnerischen Karte über denselben Mechanismus schließbar machen wie die eigene (Escape-Taste oder Close-Button).

#### Scenario: Escape schließt gegnerische Detailansicht
- **WHEN** die `ActivatedCharacterDetailView` einer gegnerischen Karte offen ist und der Spieler Escape drückt
- **THEN** schließt sich die Detailansicht

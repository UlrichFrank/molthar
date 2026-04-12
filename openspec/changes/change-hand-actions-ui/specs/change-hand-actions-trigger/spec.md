## ADDED Requirements

### Requirement: „Hand neu ziehen"-Button nach letzter Aktion
Das System SHALL nach der letzten Aktion des Zuges einen Button „Hand neu ziehen" anzeigen, wenn der aktive Spieler die `changeHandActions`-Fähigkeit besitzt und den Button in diesem Zug noch nicht genutzt hat.

#### Scenario: Button erscheint nach letzter Aktion mit Fähigkeit
- **WHEN** `isActive === true`, `actionCount >= maxActions`, der Spieler hat `changeHandActions` in `activeAbilities`, und der Button wurde noch nicht genutzt
- **THEN** wird der „Hand neu ziehen"-Button sichtbar (zusätzlich zum „Zug beenden"-Button)

#### Scenario: Button erscheint nicht ohne Fähigkeit
- **WHEN** `isActive === true`, `actionCount >= maxActions`, der Spieler hat KEINE `changeHandActions`-Fähigkeit
- **THEN** wird kein „Hand neu ziehen"-Button angezeigt

#### Scenario: Button erscheint nicht während aktiver Aktionen
- **WHEN** `isActive === true` aber `actionCount < maxActions`
- **THEN** wird kein „Hand neu ziehen"-Button angezeigt (unabhängig von der Fähigkeit)

### Requirement: Klick löst rehandCards-Move aus und versteckt Button
Das System SHALL beim Klick auf „Hand neu ziehen" `moves.rehandCards()` aufrufen und den Button danach für den Rest des Zuges ausblenden.

#### Scenario: Klick ruft Move auf und blendet Button aus
- **WHEN** der Spieler auf „Hand neu ziehen" klickt
- **THEN** wird `moves.rehandCards()` aufgerufen und der Button verschwindet; „Zug beenden" bleibt sichtbar

#### Scenario: Button nach Zugende zurückgesetzt
- **WHEN** ein neuer Zug beginnt (`ctx.turn` ändert sich)
- **THEN** ist der Button-State zurückgesetzt — der Button erscheint erneut falls die Bedingungen erfüllt sind

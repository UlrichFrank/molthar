## ADDED Requirements

### Requirement: Charakter-Ablagestapel wird gemischt wenn Nachziehstapel leer ist
Wenn eine Karte vom `characterDeck` gezogen werden soll und `characterDeck` leer ist, aber `characterDiscardPile` Karten enthält, SHALL das System den `characterDiscardPile` mischen und als neuen `characterDeck` verwenden. Das Flag `isReshufflingCharacterDeck` im Game-State SHALL auf `true` gesetzt werden.

#### Scenario: Karte ziehen bei leerem Charakter-Nachziehstapel mit Ablagestapel
- **WHEN** eine Karte vom `characterDeck` gezogen wird und `characterDeck.length === 0` und `characterDiscardPile.length > 0`
- **THEN** wird `characterDiscardPile` geleert, gemischt und als neuer `characterDeck` gesetzt, `isReshufflingCharacterDeck` wird `true`, und die Karte wird erfolgreich gezogen

#### Scenario: Karte ziehen bei komplett leerem Charakter-Spiel
- **WHEN** eine Karte vom `characterDeck` gezogen wird und sowohl `characterDeck.length === 0` als auch `characterDiscardPile.length === 0`
- **THEN** wird keine Karte gezogen und `isReshufflingCharacterDeck` bleibt `false`

#### Scenario: Charakter-Reshuffle-Flag zurücksetzen
- **WHEN** der Move `acknowledgeReshuffle` mit `deckType: 'character'` aufgerufen wird und `isReshufflingCharacterDeck === true`
- **THEN** wird `isReshufflingCharacterDeck` auf `false` gesetzt

#### Scenario: Charakter-Reshuffle-Acknowledge ist idempotent
- **WHEN** der Move `acknowledgeReshuffle` mit `deckType: 'character'` aufgerufen wird und `isReshufflingCharacterDeck === false`
- **THEN** ändert sich der Game-State nicht (no-op)

### Requirement: Charakter-Reshuffle-Logik ist zentralisiert
Alle Stellen im Game-Code, die Karten vom `characterDeck` ziehen, SHALL dieselbe Hilfsfunktion verwenden, die das Reshuffle und das Flag-Setzen kapselt.

#### Scenario: Konsistentes Flag-Setzen beim Charakter-Deck
- **WHEN** ein Reshuffle beim `characterDeck` in `refillSlots` oder einem anderen Move stattfindet
- **THEN** wird `isReshufflingCharacterDeck` in allen Fällen auf `true` gesetzt

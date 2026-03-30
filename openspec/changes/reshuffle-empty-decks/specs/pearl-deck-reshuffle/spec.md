## ADDED Requirements

### Requirement: Perlen-Ablagestapel wird gemischt wenn Nachziehstapel leer ist
Wenn eine Karte vom `pearlDeck` gezogen werden soll und `pearlDeck` leer ist, aber `pearlDiscardPile` Karten enthält, SHALL das System den `pearlDiscardPile` mischen und als neuen `pearlDeck` verwenden. Das Flag `isReshufflingPearlDeck` im Game-State SHALL auf `true` gesetzt werden.

#### Scenario: Karte ziehen bei leerem Nachziehstapel mit Ablagestapel
- **WHEN** eine Karte vom `pearlDeck` gezogen wird und `pearlDeck.length === 0` und `pearlDiscardPile.length > 0`
- **THEN** wird `pearlDiscardPile` geleert, gemischt und als neuer `pearlDeck` gesetzt, `isReshufflingPearlDeck` wird `true`, und die Karte wird erfolgreich gezogen

#### Scenario: Karte ziehen bei komplett leerem Spiel
- **WHEN** eine Karte vom `pearlDeck` gezogen wird und sowohl `pearlDeck.length === 0` als auch `pearlDiscardPile.length === 0`
- **THEN** wird keine Karte gezogen und `isReshufflingPearlDeck` bleibt `false`

#### Scenario: Reshuffle-Flag zurücksetzen
- **WHEN** der Move `acknowledgeReshuffle` mit `deckType: 'pearl'` aufgerufen wird und `isReshufflingPearlDeck === true`
- **THEN** wird `isReshufflingPearlDeck` auf `false` gesetzt

#### Scenario: Reshuffle-Acknowledge ist idempotent
- **WHEN** der Move `acknowledgeReshuffle` mit `deckType: 'pearl'` aufgerufen wird und `isReshufflingPearlDeck === false`
- **THEN** ändert sich der Game-State nicht (no-op)

### Requirement: Reshuffle-Logik ist zentralisiert
Alle Stellen im Game-Code, die Karten vom `pearlDeck` ziehen, SHALL dieselbe Hilfsfunktion verwenden, die das Reshuffle und das Flag-Setzen kapselt.

#### Scenario: Konsistentes Flag-Setzen in allen Draw-Pfaden
- **WHEN** ein Reshuffle in `refillSlots`, `rehandCards` oder einem anderen Move stattfindet
- **THEN** wird `isReshufflingPearlDeck` in allen Fällen auf `true` gesetzt

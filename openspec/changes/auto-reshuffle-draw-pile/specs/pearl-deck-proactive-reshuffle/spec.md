## MODIFIED Requirements

### Requirement: Proaktiver Reshuffle beim direkten Deck-Ziehen
Wenn ein Spieler die letzte Karte direkt vom Perlenstapel nimmt (Deck-Klick, `slotIndex = -1`) und der Stapel danach leer ist, aber der Ablagestapel Karten enthält, SHALL `takePearlCard` den Ablagestapel sofort in den Nachziehstapel mischen und `isReshufflingPearlDeck = true` setzen — unabhängig davon ob die Auslage bereits voll belegt ist.

#### Scenario: Letzte Deck-Karte genommen, Auslage voll, Ablagestapel hat Karten
- **WHEN** `slotIndex === -1`, `G.pearlDeck.length` wird nach `drawCard()` zu `0`, `G.pearlDiscardPile.length > 0`, und `G.pearlSlots.length >= 4`
- **THEN** `G.pearlDiscardPile` wird in `G.pearlDeck` verschoben, gemischt, und `G.isReshufflingPearlDeck` wird `true` gesetzt; anschließend ist `G.pearlDeck.length > 0`

#### Scenario: Letzte Deck-Karte genommen, Auslage nicht voll, Ablagestapel hat Karten
- **WHEN** `slotIndex === -1`, `G.pearlDeck.length` wird nach `drawCard()` zu `0`, `G.pearlDiscardPile.length > 0`, und `G.pearlSlots.length < 4`
- **THEN** Verhalten bleibt wie bisher: `refillSlots` löst den Reshuffle via `drawCard` aus, `isReshufflingPearlDeck = true`; kein Doppel-Reshuffle

#### Scenario: Letzte Deck-Karte genommen, kein Ablagestapel
- **WHEN** `slotIndex === -1`, `G.pearlDeck.length` wird nach `drawCard()` zu `0`, `G.pearlDiscardPile.length === 0`
- **THEN** kein Reshuffle; `isReshufflingPearlDeck` bleibt `false`; Deck bleibt leer

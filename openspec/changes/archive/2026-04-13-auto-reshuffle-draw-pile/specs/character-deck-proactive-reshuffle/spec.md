## ADDED Requirements

### Requirement: Direktes Ziehen einer Charakterkarte löst Reshuffle aus
Wenn `takeCharacterCard` oder `discardPickedCharacterCard` mit `slotIndex = -1` aufgerufen wird und `G.characterDeck` leer aber `G.characterDiscardPile` nicht leer ist, SHALL der Ablagestapel sofort in den Nachziehstapel gemischt werden (`drawCard` statt `.pop()`), bevor die Karte gezogen wird. `G.isReshufflingCharacterDeck` SHALL auf `true` gesetzt werden.

#### Scenario: takeCharacterCard — Deck leer, Ablagestapel hat Karten
- **WHEN** `takeCharacterCard` mit `slotIndex = -1` aufgerufen wird, `G.characterDeck.length === 0`, und `G.characterDiscardPile.length > 0`
- **THEN** `G.characterDiscardPile` wird in `G.characterDeck` verschoben und gemischt, `G.isReshufflingCharacterDeck` wird `true`, eine Karte wird gezogen und dem Portal hinzugefügt

#### Scenario: takeCharacterCard — Deck hat noch Karten
- **WHEN** `takeCharacterCard` mit `slotIndex = -1` aufgerufen wird und `G.characterDeck.length > 0`
- **THEN** kein Reshuffle; eine Karte wird direkt vom Deck gezogen; `isReshufflingCharacterDeck` bleibt unverändert

#### Scenario: takeCharacterCard — Deck leer, Ablagestapel leer
- **WHEN** `takeCharacterCard` mit `slotIndex = -1` aufgerufen wird, `G.characterDeck.length === 0`, und `G.characterDiscardPile.length === 0`
- **THEN** kein Reshuffle; Move gibt `INVALID_MOVE` zurück

#### Scenario: discardPickedCharacterCard — Deck leer, Ablagestapel hat Karten
- **WHEN** `discardPickedCharacterCard` mit `slotIndex = -1` aufgerufen wird, `G.characterDeck.length === 0`, und `G.characterDiscardPile.length > 0`
- **THEN** `G.characterDiscardPile` wird in `G.characterDeck` verschoben und gemischt, `G.isReshufflingCharacterDeck` wird `true`, eine Karte wird gezogen und direkt auf den Ablagestapel gelegt

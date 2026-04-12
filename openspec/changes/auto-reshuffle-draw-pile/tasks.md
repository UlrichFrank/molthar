## 1. Charakterkarten-Deck — drawCard statt .pop()

- [x] 1.1 In `takeCharacterCard` (slotIndex === -1): `G.characterDeck.pop()` durch `drawCard(G.characterDeck, G.characterDiscardPile, () => { G.isReshufflingCharacterDeck = true; })` ersetzen
- [x] 1.2 In `discardPickedCharacterCard` (slotIndex === -1): `G.characterDeck.pop()` durch `drawCard(G.characterDeck, G.characterDiscardPile, () => { G.isReshufflingCharacterDeck = true; })` ersetzen

## 2. Perlenkarten-Deck — proaktiver Reshuffle nach letzter Deck-Karte

- [x] 2.1 In `takePearlCard` (slotIndex === -1): Nach dem `drawCard`-Aufruf prüfen ob `G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0 && G.pearlSlots.length >= 4` — wenn ja, Ablagestapel mischen und in Deck verschieben, `isReshufflingPearlDeck = true` setzen

## 3. Tests

- [x] 3.1 Test: `takeCharacterCard` mit leerem Deck und befülltem Ablagestapel → Karte wird gezogen, `isReshufflingCharacterDeck = true`
- [x] 3.2 Test: `discardPickedCharacterCard` mit leerem Deck und befülltem Ablagestapel → Karte wird gezogen und verworfen, `isReshufflingCharacterDeck = true`
- [x] 3.3 Test: `takePearlCard` — letzte Deck-Karte gezogen, Auslage voll, Ablagestapel hat Karten → Deck wird sofort neu befüllt, `isReshufflingPearlDeck = true`
- [x] 3.4 Test: `takePearlCard` — letzte Deck-Karte gezogen, Auslage nicht voll → kein Doppel-Reshuffle

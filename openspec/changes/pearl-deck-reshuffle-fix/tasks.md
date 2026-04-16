## 1. Fix

- [x] 1.1 In `shared/src/game/index.ts`, `takePearlCard`, Slot-Zug (~Zeile 125): `filledSlots`-Berechnung und `filledSlots >= 4` aus der Reshuffle-Bedingung entfernen
- [x] 1.2 Dasselbe für den Deck-Zug (~Zeile 144)

## 2. Tests

- [x] 2.1 Neuer Test: Deck hat 1 Karte, 3 Slots gefüllt, 1 leer, Discard hat Karten → nach Slot-Zug ist Deck neu gemischt
- [x] 2.2 Neuer Test: Deck hat 1 Karte, alle Slots gefüllt, Discard hat Karten → nach Deck-Zug ist Deck neu gemischt (Regressionstest für bestehendes Verhalten)

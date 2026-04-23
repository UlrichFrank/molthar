## Why

Wenn der Nachziehstapel leer wird und nicht alle 4 Perlenkarten-Slots gefüllt sind, wird der Ablagestapel nicht sofort neu gemischt. Der Spieler sieht einen leeren Nachziehstapel und kann keine verdeckte Perlenkarte ziehen.

## What Changes

In `takePearlCard` wird die proaktive Reshuffle-Bedingung vereinfacht: der Guard `filledSlots >= 4` entfällt. Immer wenn das Deck nach einem Zug leer ist und der Ablagestapel Karten enthält, wird sofort neu gemischt — unabhängig davon wie viele Slots gefüllt sind.

## Capabilities

### Modified Capabilities

- `pearl-deck-management`: Nachziehstapel wird immer sofort neu gemischt wenn er leer wird

## Impact

- `shared/src/game/index.ts` — zwei Stellen in `takePearlCard`: `filledSlots`-Berechnung und `filledSlots >= 4`-Bedingung entfernen

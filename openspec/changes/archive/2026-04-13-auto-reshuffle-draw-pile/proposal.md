## Why

Wenn der Nachziehstapel der Perlenkarten oder Charakterkarten leer wird, wird der Ablagestapel nicht automatisch neu gemischt — der Stapel bleibt optisch und funktional leer, bis ein anderer Spielzug einen Reshuffle auslöst. Dadurch können Spieler nicht mehr vom verdeckten Stapel ziehen, obwohl Karten im Ablagestapel vorhanden sind.

## What Changes

- **Perlenkarten:** Nach dem direkten Ziehen der letzten Karte vom Stapel (`slotIndex = -1`) und voller Auslage (4 Slots) wird der Ablagestapel sofort in den Nachziehstapel gemischt und `isReshufflingPearlDeck = true` gesetzt.
- **Charakterkarten:** `takeCharacterCard` und `discardPickedCharacterCard` verwenden für `slotIndex = -1` aktuell `G.characterDeck.pop()` direkt — wenn das Deck leer, aber der Ablagestapel nicht leer ist, gibt dies `undefined` zurück und der Move schlägt fehl. Stattdessen soll `drawCard()` verwendet werden, das den Reshuffle vor dem Ziehen durchführt.

## Capabilities

### New Capabilities
- `character-deck-proactive-reshuffle`: Direktes Ziehen einer Charakterkarte vom leeren Deck (`slotIndex = -1`) löst sofort den Reshuffle des Ablagestapels aus, bevor die Karte gezogen wird.

### Modified Capabilities
- `pearl-deck-proactive-reshuffle`: Implementierung der bereits spezifizierten Anforderung — proaktiver Reshuffle wenn die letzte Perlenkarte direkt vom Deck gezogen wird und die Auslage voll ist.

## Impact

- `shared/src/game/index.ts`: `takePearlCard` (Pearl-Reshuffle nach letzter Deck-Karte), `takeCharacterCard` und `discardPickedCharacterCard` (`.pop()` → `drawCard()`)
- Keine API-Änderungen, keine Frontend-Änderungen (Reshuffle-Flags existieren bereits)

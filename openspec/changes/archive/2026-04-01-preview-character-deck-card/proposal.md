## Why

Die Ability `previewCharacter` erlaubt es dem Spieler, die oberste Karte des Charakter-Nachziehstapels vor der ersten Aktion zu betrachten. Der Backend-Move `peekCharacterDeck` existiert bereits und speichert die Karte in `player.peekedCard` — aber das Frontend ignoriert diesen Zustand vollständig. Ein Klick auf den Stapel zieht die Karte sofort, ohne Preview-Modus.

## What Changes

- Ein Klick auf den Charakter-Nachziehstapel verhält sich unterschiedlich je nach Ability und Zustand:
  - Hat der Spieler `previewCharacter` aktiv und hat **noch keine Aktion** durchgeführt (`actionCount === 0`) und `peekedCard` ist `null` → Move `peekCharacterDeck` aufrufen (Karte "umdrehen")
  - Hat der Spieler `previewCharacter` aktiv und `peekedCard` ist gesetzt (Karte bereits aufgedeckt) → Karte nehmen (wie bisher: Replacement-Dialog oder `takeCharacterCard`)
  - Andernfalls (Ability nicht aktiv, oder `actionCount > 0`) → Karte direkt ziehen wie bisher
- Die aufgedeckte Karte wird visuell auf dem Stapel face-up dargestellt (oberste Karte zeigt Vorderseite statt Rückseite)
- Ein visueller Hinweis ("Klick zum Nehmen") signalisiert den zweiten Klick

## Capabilities

### New Capabilities

- `preview-character-deck-interaction`: Zweigeteilte Klick-Logik für den Charakter-Nachziehstapel mit Preview-State.
- `peeked-card-canvas-rendering`: Visuelle Darstellung der aufgedeckten Karte auf dem Charakter-Nachziehstapel.

### Modified Capabilities

- `game-web-spec`: Verhalten des Charakter-Deck-Klicks ändert sich bei aktiver `previewCharacter`-Ability.

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — `deck-character` Click-Handler: Preview-Logik einfügen
- `game-web/src/lib/gameRender.ts` — `drawDeckStack`: optionaler `peekedCard`-Parameter, zeichnet Top-Karte face-up
- `game-web/src/lib/canvasRegions.ts` — ggf. Hinweis-Label für Preview-Zustand
- Kein Backend-Change nötig — `peekCharacterDeck` und `peekedCard` sind bereits implementiert

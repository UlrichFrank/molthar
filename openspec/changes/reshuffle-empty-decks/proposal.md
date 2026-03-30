## Why

Wenn der Nachziehstapel für Perlen- oder Charakterkarten leer ist, kann das Spiel nicht fortgesetzt werden. Die abgelegten Karten müssen gemischt und als neuer Stapel bereitgestellt werden — mit einer kurzen visuellen Animation, damit alle Spieler den Vorgang wahrnehmen.

## What Changes

- Sobald die letzte Karte vom Perlen-Nachziehstapel gezogen wird, wird der Ablagestapel gemischt und zum neuen Nachziehstapel.
- Sobald die letzte Karte vom Charakter-Nachziehstapel gezogen wird, wird der Ablagestapel gemischt und zum neuen Nachziehstapel.
- Das Mischen löst eine kurze visuelle Animation im Frontend aus, die den Shuffle-Vorgang für alle Spieler darstellt.
- Die Spiellogik (boardgame.io) erkennt das Leer-werden des Stapels und setzt ein Flag im Game-State (für jeden Client), das das Frontend zur Animation veranlasst.
- Nach der Animation (clientseitig) wird das clientspezifische Flag zurückgesetzt und das Spiel läuft normal weiter.

## Capabilities

### New Capabilities

- `pearl-deck-reshuffle`: Automatisches Mischen des Perlen-Ablagestapels zum neuen Nachziehstapel, inkl. Game-State-Flag und Frontend-Animation.
- `character-deck-reshuffle`: Automatisches Mischen des Charakter-Ablagestapels zum neuen Nachziehstapel, inkl. Game-State-Flag und Frontend-Animation.
- `deck-shuffle-animation`: Visuelle Darstellung des Shuffle-Vorgangs im Frontend (für Perlen- und Charakterstapel).

### Modified Capabilities

- `game-web-spec`: Die Spieloberfläche muss den Shuffle-Zustand aus dem Game-State lesen und die Animation auslösen.

## Impact

- `shared/src/game/index.ts` — Misch-Logik in den Draw-Moves und ggf. `onMove`/`onBegin` Hooks
- `shared/src/game/types.ts` — Neues Flag `reshufflingPearlDeck` / `reshufflingCharacterDeck` im Game-State
- `game-web/src/components/` — Neue Shuffle-Animations-Komponente oder bestehende Deck-Komponenten erweitern
- Kein API-Breaking-Change; reine Ergänzung des Game-State

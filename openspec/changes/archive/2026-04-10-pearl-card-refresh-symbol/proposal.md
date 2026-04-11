## Why

Manche Perlenkarten tragen ein neues Symbol, das eine besondere Spielaktion auslöst: Sobald eine solche Perlenkarte aus dem Nachziehstapel aufgedeckt wird (d. h. in die Auslage gelangt), werden die beiden Charakterkarten in der gemeinsamen Auslage (`characterSlots`) auf den Ablagestapel gelegt und zwei neue Charakterkarten nachgezogen. Diese Mechanik ist im physischen Spiel vorhanden, aber bisher nicht digital umgesetzt.

## What Changes

- Drei Perlenkarten (Werte 3, 4 und 5) erhalten das Flag `hasRefreshSymbol: true` in der Kartendatenbank
- Wenn eine markierte Perlenkarte aus dem Nachziehstapel in die Perlenauslage (`pearlSlots`) aufgedeckt wird, wird die Refresh-Aktion automatisch ausgelöst
- Die beiden aktuellen Charakterkarten in der Auslage (`characterSlots`) werden auf den Ablagestapel gelegt und zwei neue Charakterkarten nachgezogen
- Das Symbol wird im Frontend auf der Perlenkarte angezeigt
- Im Spielverlauf wird die Aktion als Ereignis kommuniziert (Log/Anzeige)

## Capabilities

### New Capabilities

- `pearl-refresh-trigger`: Spielmechanik, die ausgelöst wird, wenn eine markierte Perlenkarte aus dem Nachziehstapel in die Perlenauslage aufgedeckt wird: die beiden Charakterkarten der gemeinsamen Auslage ablegen und zwei neue ziehen. Betrifft Game State (boardgame.io Moves), Kartendatenbank und Frontend-Darstellung.

### Modified Capabilities

- (keine — die bestehenden Aktivierungs- und Perlen-Mechaniken werden nicht in ihren Anforderungen geändert)

## Impact

- `shared/src/game/cardDatabase.ts` — neues Flag `hasRefreshSymbol` auf betroffenen Perlenkarten
- `shared/src/game/types.ts` — ggf. erweiterter Typ für Perlenkarten
- `shared/src/game/index.ts` — Auslösen der Refresh-Logik beim Aufdecken einer Perlenkarte
- `game-web/src/components/` — Symbol auf der Perlenkarte darstellen, Ereignis anzeigen
- `shared/src/game/cardDatabase.ts` — betroffene Karten markieren
- `assets/` — neue Kartenbilder `Perlenkarte3-neu.png`, `Perlenkarte4-neu.png`, `Perlenkarte5-neu.png` für die drei markierten Karten

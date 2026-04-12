## Why

Zwei Fehler im Spielstart:

1. **Falscher erster Spieler**: In `setup` wird `G.startingPlayer` zufällig aus allen Spielern gewählt. Der Spieler mit dem Startspieler-Portal zeigt das korrekte Bild. Allerdings richtet boardgame.io den ersten Zug immer an `ctx.playOrder[0]` — also den Spieler der die Partie angelegt hat — statt an `G.startingPlayer`. Die Konfiguration `turn.order.first` fehlt.

2. **Initiale Handkarten**: Beim Setup werden jedem Spieler 3 Perlenkarten ausgeteilt. Korrekt wäre: kein Spieler startet mit Handkarten.

## What Changes

- `turn.order.first` in der boardgame.io Spielkonfiguration ergänzen: gibt den Index von `G.startingPlayer` in `ctx.playOrder` zurück, sodass dieser Spieler als erstes an der Reihe ist.
- Das initiale Austeilen von 3 Perlenkarten aus `setup` entfernen.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

_(keine spec-level Änderungen — Bugfixes)_

## Impact

- `shared/src/game/index.ts` — `turn`-Konfiguration: `order.first` ergänzen; initiale Hand-Austeilen entfernen
- Tests in `shared/src/game/` ggf. anpassen (falls Tests mit initialem Handkartenstand arbeiten)

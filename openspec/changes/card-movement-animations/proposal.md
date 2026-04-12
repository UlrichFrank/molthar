## Why

Kartenbewegungen (Ziehen, Ablegen, Aktivieren) passieren ohne visuelle Rückmeldung — Karten erscheinen und verschwinden abrupt. Eine Fluganimation macht klar, was gerade im Spiel passiert, sowohl für den aktiven Spieler als auch für alle Mitspieler.

## What Changes

- Jede sichtbare Kartenbewegung löst eine Canvas-Fluganimation aus: die Karte gleitet von ihrer Ursprungsposition zur Zielposition.
- Abgeworfene / entfernte Karten fliegen zum gegenüberliegenden Bildschirmrand hinaus.
- Animationen laufen für den lokalen Spieler **und** für alle Mitspielerzonen (deren Karten sind bereits im World-Space positioniert).
- Kein neuer Server-State — Animationen werden rein clientseitig aus State-Diffs abgeleitet.

## Capabilities

### New Capabilities

- `card-movement-animations`: Fluganimationen für alle Kartenbewegungen auf dem Canvas-Board

### Modified Capabilities

_(keine)_

## Impact

- `game-web/src/components/CanvasGameBoard.tsx`: `prevGRef` hinzufügen, State-Diff-Logik, `FlyingCard`-Queue starten
- `game-web/src/lib/gameRender.ts`: überlagernde `FlyingCard`-Objekte im rAF-Loop zeichnen
- `game-web/src/lib/canvasRegions.ts`: Positions-Lookup-Funktionen für Ursprung/Ziel (bereits weitgehend vorhanden)
- Neue Datei `game-web/src/lib/cardAnimations.ts`: State-Diff → `FlyingCard`-Ereignisse, Easing, Lebenszyklus

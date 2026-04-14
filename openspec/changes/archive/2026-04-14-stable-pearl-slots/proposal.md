## Why

Wenn ein Spieler eine Perlkarte aus der Auslage nimmt, rücken alle nachfolgenden Karten um eine Position nach links auf, und die Nachziehkarte erscheint ganz rechts. Bei schnellem Spiel (z.B. mehrere Aktionen hintereinander) trifft der Klick dann eine andere Karte als beabsichtigt. Die Positionen der Auslage-Slots müssen stabil bleiben: eine genommene Karte wird an genau derselben Position durch eine neue ersetzt.

## What Changes

- `GameState.pearlSlots` wechselt von `PearlCard[]` (dichte Liste) zu `(PearlCard | null)[]` (4-elementige Liste mit festen Positionen)
- `takePearlCard` ersetzt `splice` durch direktes Setzen des Slots auf `null` und sofortiges In-Place-Ersetzen durch die nächste Deckskarte
- `replacePearlSlots` füllt alle 4 festen Positionen neu auf
- Canvas-Rendering und alle Konsumenten erhalten Null-Checks für leere Slots
- Die Slot-Indizes im Frontend bleiben 0–3 und entsprechen direkt den Array-Positionen

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `canvas-card-interaction`: Slot-IDs der Perlkarten-Auslage sind nun stabile Positionen (0–3), unabhängig davon wie viele Karten belegt sind

## Impact

- `shared/src/game/types.ts` — `pearlSlots: PearlCard[]` → `pearlSlots: (PearlCard | null)[]`
- `shared/src/game/index.ts` — `setup`, `takePearlCard`, `replacePearlSlots`, `applyPearlRefreshIfNeeded`
- `game-web/src/lib/canvasRegions.ts` — Null-Check beim Rendern der Pearl-Slots
- `game-web/src/lib/gameRender.ts` — Null-Check beim Zeichnen der Pearl-Slots
- `game-web/src/components/CanvasGameBoard.tsx` — Null-Check beim Click-Handling
- `shared/src/game/*.test.ts` — Test-Fixtures auf nullable Array anpassen

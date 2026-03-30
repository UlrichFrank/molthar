## Why

Der "Discard Cards"-Button auf dem Canvas erscheint sobald `G.requiresHandDiscard` gesetzt ist — unabhängig davon ob der Spieler noch Aktionen übrig hat. Korrekt ist: Der Button soll erst erscheinen wenn keine Aktionen mehr verbleiben.

## What Changes

- In `canvasRegions.ts` wird die Bedingung für den "Discard Cards"-Button um eine Aktionsprüfung erweitert: Der Button erscheint nur wenn `G.requiresHandDiscard === true` UND `actionCount >= maxActions`.
- Solange noch Aktionen übrig sind, zeigt das Canvas den normalen Aktionszähler (`actionCount / maxActions`), auch wenn `requiresHandDiscard` bereits gesetzt ist.
- Der "End Turn"-Button bleibt gesperrt, solange Aktionen übrig sind UND/ODER `requiresHandDiscard` gilt.

## Capabilities

### New Capabilities

*(keine neuen Capabilities — reine Bug-Fix-Änderung an bestehender Rendering-Logik)*

### Modified Capabilities

- `game-web-spec`: Anforderung an die Sichtbarkeit des "Discard Cards"-Buttons ändert sich.

## Impact

- `game-web/src/lib/canvasRegions.ts` — Einzige Änderung: Bedingung in der Button-Logik (ca. Zeile 205)

## Why

Im Spieler-Bereich (und bei Mitspielern) werden aktuell max. 8 aktivierte Charakterkarten in einem 4×2-Grid angezeigt. Karten darüber hinaus (realistisch bis ~10) werden via `.slice(0, 8)` lautlos weggeschnitten — der Spieler sieht keine Karten mehr und erhält keinen Hinweis darauf.

## What Changes

- Grid von 4×2 auf 3×2 reduzieren (6 Karten pro Seite)
- Kartengröße um 20% vergrößern (Faktor 0.75 → 0.90 von CARD_W/H)
- Canvas-native Paginierungspfeile (◄ / ►) links und rechts neben dem Grid
  - Immer sichtbar; ausgegraut wenn nicht nutzbar
  - Hover-Effekt
- Seite 0 zeigt Karten 0–5, Seite 1 zeigt Karten 6–11
- Auto-advance: wenn eine neue Karte aktiviert wird und Seite 0 bereits voll ist (count > 6), wird automatisch auf Seite 1 gewechselt
- Gegner-Bereiche erhalten dieselbe Paginierung, korrekt skaliert (OPP_SCALE) und rotiert

## Capabilities

### New Capabilities

- `activated-characters-pagination`: Paginierung des aktivierten Charakterkarten-Grids (eigener Spieler + Gegner), Canvas-native Pfeile, Auto-advance

### Modified Capabilities

- `canvas-ui-rendering`: Grid-Layout und Kartengrößen der aktivierten Charakterkarten ändern sich

## Impact

- `game-web/src/lib/cardLayoutConstants.ts` — Grid-Konstanten (COLS, MAX, Kartengrößen, Pfeil-Konstanten)
- `game-web/src/lib/canvasRegions.ts` — page-Parameter, neuer RegionType `activated-page-arrow`
- `game-web/src/lib/gameRender.ts` — drawActivatedCharacters mit page, drawActivatedPageArrows
- `game-web/src/components/CanvasGameBoard.tsx` — State, useEffect auto-advance, Click-Handler

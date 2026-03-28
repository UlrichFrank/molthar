## Why

Der HTML-Button-Overlay (CardButtonOverlay + CardButton) dupliziert die Positionslogik aus dem Canvas-Drawing und führt zu einer hybriden Architektur, die schwer wartbar ist. Hover-Effekte und visuelle Animationen lassen sich im reinen Canvas-Kontext natürlicher, konsistenter und performanter umsetzen.

## What Changes

- **BREAKING** `CardButtonOverlay.tsx` wird entfernt — alle Pointer-Interaktionen laufen künftig direkt über den Canvas
- **BREAKING** `CardButton.tsx` wird entfernt
- Neues `CardRegion`-Konzept: ein Objekt kapselt Position, Hit-Test und Animations-Zustand einer Karte
- Neue `buildCardRegions(G)` Funktion baut aus dem GameState ein `CardRegion[]`-Array als Single Source of Truth für Drawing und Hit-Testing
- `requestAnimationFrame`-Loop ersetzt das event-getriggerte `useEffect`-Redraw
- Hover-Effekt: goldener Glow (Canvas `shadowBlur`) smooth ein-/ausgeblendet bei Mouse-Hover
- Click-Feedback: weißes Flash-Overlay (~200ms) bei Klick (Mouse) und Tap (Touch)
- Touch-Verhalten: kein Hover-State, nur Flash bei `pointerDown`, dann sofort Aktion
- Cursor: `pointer` wenn über einer Karte, sonst `default`

## Capabilities

### New Capabilities

- `canvas-card-interaction`: Canvas-native Hover (Glow) und Click-Feedback (Flash) für Karten, mit einheitlichem `CardRegion`-Deskriptor für Drawing und Hit-Testing
- `canvas-animation-loop`: `requestAnimationFrame`-basierter Render-Loop mit zeitbasierter Animation (hoverProgress, flashProgress)

### Modified Capabilities

- `game-web-spec`: Interaktionsschicht wechselt von DOM-Buttons zu reinem Canvas

## Impact

- `game-web/src/components/CardButtonOverlay.tsx` — wird gelöscht
- `game-web/src/components/CardButton.tsx` — wird gelöscht
- `game-web/src/components/CanvasGameBoard.tsx` — Umbau auf rAF-Loop, CardRegion-Integration
- `game-web/src/lib/gameHitTest.ts` — bleibt, wird von CardRegion genutzt
- `game-web/src/lib/gameRender.ts` — Drawing-Funktionen erhalten CardRegion[] und zeichnen Hover/Flash
- `game-web/src/lib/cardLayoutConstants.ts` — bleibt unverändert
- Keine Änderungen an Game-Logic (moves, shared, backend)

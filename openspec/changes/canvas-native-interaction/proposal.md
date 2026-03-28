## Why

Der HTML-Button-Overlay (CardButtonOverlay + CardButton) dupliziert die Positionslogik aus dem Canvas-Drawing und führt zu einer hybriden Architektur, die schwer wartbar ist. Hover-Effekte und visuelle Animationen lassen sich im reinen Canvas-Kontext natürlicher, konsistenter und performanter umsetzen.

## What Changes

- **BREAKING** `CardButtonOverlay.tsx` wird entfernt — alle Pointer-Interaktionen laufen künftig direkt über den Canvas
- **BREAKING** `CardButton.tsx` wird entfernt
- **BREAKING** `ActionCounterDisplay.tsx` als React-Overlay wird entfernt — Aktionsanzeige, "End Turn" und "Discard Cards" werden auf dem Canvas gezeichnet
- Neues `CanvasRegion`-Konzept (ersetzt `CardRegion`): ein Objekt kapselt Position, Hit-Test und Animations-Zustand für **alle** interaktiven Canvas-Elemente (Karten, Decks, UI-Buttons)
- Neue `buildCanvasRegions(G)` Funktion baut aus dem GameState ein `CanvasRegion[]`-Array als Single Source of Truth für Drawing und Hit-Testing
- `requestAnimationFrame`-Loop ersetzt das event-getriggerte `useEffect`-Redraw
- Hover-Effekt: goldener Glow (Canvas `shadowBlur`) smooth ein-/ausgeblendet bei Mouse-Hover (Karten + Decks + Buttons)
- Click-Feedback: weißes Flash-Overlay (~200ms) bei Klick (Mouse) und Tap (Touch)
- Touch-Verhalten: kein Hover-State, nur Flash bei `pointerDown`, dann sofort Aktion
- Cursor: `pointer` wenn über einem interaktiven Element, sonst `default`
- **Toter Code entfernt:** `hitTestButtons()` in `gameHitTest.ts` und zugehörige `BTN_*`-Konstanten in `cardLayoutConstants.ts` (End-Turn-Button war nie auf Canvas gezeichnet, wurde durch React-Overlay abgedeckt)

## Capabilities

### New Capabilities

- `canvas-card-interaction`: Canvas-native Hover (Glow) und Click-Feedback (Flash) für alle interaktiven Canvas-Elemente (Karten, Decks, UI-Buttons), mit einheitlichem `CanvasRegion`-Deskriptor für Drawing und Hit-Testing
- `canvas-animation-loop`: `requestAnimationFrame`-basierter Render-Loop mit zeitbasierter Animation (hoverProgress, flashProgress)
- `canvas-ui-rendering`: Aktionsanzeige, "End Turn" und "Discard Cards" werden direkt auf dem Canvas gezeichnet statt als React-Overlay

### Modified Capabilities

- `game-web-spec`: Interaktionsschicht wechselt von DOM-Buttons zu reinem Canvas

## Impact

- `game-web/src/components/CardButtonOverlay.tsx` — wird gelöscht
- `game-web/src/components/CardButton.tsx` — wird gelöscht
- `game-web/src/components/ActionCounterDisplay.tsx` — wird gelöscht (Funktionalität wandert auf Canvas)
- `game-web/src/components/CanvasGameBoard.tsx` — Umbau auf rAF-Loop, CanvasRegion-Integration, ActionCounter-Logik übernehmen
- `game-web/src/lib/gameHitTest.ts` — `hitTestButtons()` und tote Button-Typen entfernen
- `game-web/src/lib/gameRender.ts` — Drawing-Funktionen erhalten CanvasRegion[] und zeichnen Hover/Flash; neue `drawActionCounter()`-Funktion
- `game-web/src/lib/cardLayoutConstants.ts` — `BTN_*`-Konstanten entfernen, neue UI-Konstanten für Canvas-Buttons
- `game-web/src/styles/turnActionCounter.css` — wird gelöscht (nicht mehr benötigt)
- Keine Änderungen an Game-Logic (moves, shared, backend)

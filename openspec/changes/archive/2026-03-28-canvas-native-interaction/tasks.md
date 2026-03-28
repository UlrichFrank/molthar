## 1. CanvasRegion-Infrastruktur

- [x] 1.1 `CanvasRegion`-Interface in `game-web/src/lib/canvasRegions.ts` definieren (type, id, x, y, w, h, angle, hoverProgress, flashProgress, label?, enabled?)
- [x] 1.2 `buildCanvasRegions(G, playerID)` implementieren — baut CanvasRegion[] aus Auslage, Portal-Slots, Hand-Karten, aktivierten Karten, Decks (Character + Pearl) und UI-Buttons (End Turn, Discard Cards) via `cardLayoutConstants`
- [x] 1.3 In-place Update-Logik: bestehende Regions per type+id matchen und Position/enabled aktualisieren ohne Animations-Zustand zu resetten

## 2. rAF-Loop in CanvasGameBoard

- [x] 2.1 `useRef` für `regionsRef` (CardRegion[]) und `gameStateRef` (aktuelle G) anlegen
- [x] 2.2 `requestAnimationFrame`-Loop starten (in `useEffect` on mount), `cancelAnimationFrame` on unmount
- [x] 2.3 Delta-Time Berechnung im Loop (`Δt = (now - lastTime) / 1000`)
- [x] 2.4 `hoverProgress` in jedem Frame zeitbasiert interpolieren (target: gehovertes Element → 1, sonst → 0, Rate: 5/s)
- [x] 2.5 `flashProgress` in jedem Frame zeitbasiert zerfallen lassen (Rate: 5/s, minimum: 0)
- [x] 2.6 `draw(ctx, regions)` im Loop aufrufen statt in `useEffect`

## 3. Hover- und Flash-Drawing in gameRender.ts

- [x] 3.1 Hilfsfunktion `drawElementWithEffects(ctx, region, drawFn)` schreiben: zeichnet beliebiges Canvas-Element mit Hover-Glow (shadowBlur * hoverProgress) und Click-Flash (weißes Rect * flashProgress)
- [x] 3.2 `drawAuslage`, `drawPlayerPortal`, `drawActivatedCharactersGrid` auf CanvasRegion[] umstellen — nutzen `drawElementWithEffects`
- [x] 3.3 `drawActionCounter(ctx, region, G, playerID)` implementieren: zeichnet Aktionsanzeige mit Farb-Coding (grün/gelb/rot/blau) an Position der `ui-*`-Region
- [x] 3.4 `drawUIButton(ctx, region)` implementieren: zeichnet "End Turn" / "Discard Cards" Button mit Label, enabled-State und Hover/Flash-Effekten

## 4. Pointer-Events in CanvasGameBoard

- [x] 4.1 `onPointerMove`: hit-test gegen `regionsRef`; bei `pointerType === 'mouse'` Hover-Target setzen (nur enabled Regions); Cursor-Management (`pointer`/`default`)
- [x] 4.2 `onPointerDown`: hit-test gegen `regionsRef`; `flashProgress = 1.0` auf getroffener Region (unabhängig von pointerType, nur wenn enabled); Dispatch an `handleCardClick` oder `handleUIClick`
- [x] 4.3 `handleUIClick(region)` implementieren: `ui-end-turn` → `moves.endTurn()`, `ui-discard-cards` → `dialog.openDiscardDialog(...)`
- [x] 4.4 `onPointerLeave`: Hover-Target zurücksetzen, Cursor auf `default`
- [x] 4.5 Touch-Spezifik: bei `pointerType === 'touch'` kein Hover-Target setzen

## 5. DOM-Overlays und toten Code entfernen

- [x] 5.1 `<CardButtonOverlay>` aus `CanvasGameBoard.tsx` entfernen
- [x] 5.2 `CardButtonOverlay.tsx` löschen
- [x] 5.3 `CardButton.tsx` löschen
- [x] 5.4 `<ActionCounterDisplay>` aus `CanvasGameBoard.tsx` entfernen
- [x] 5.5 `ActionCounterDisplay.tsx` löschen
- [x] 5.6 `game-web/src/styles/turnActionCounter.css` löschen
- [x] 5.7 `hitTestButtons()` aus `gameHitTest.ts` entfernen sowie `'button'` aus dem `HitTarget`-Typ
- [x] 5.8 `BTN_X`, `BTN_Y_1`, `BTN_Y_2`, `BTN_Y_3`, `BTN_W`, `BTN_H` aus `cardLayoutConstants.ts` entfernen
- [x] 5.9 Neue UI-Positions-Konstanten in `cardLayoutConstants.ts` für Canvas-Buttons anlegen (Position der Aktionsanzeige + End-Turn/Discard-Buttons)
- [x] 5.10 Alle verbleibenden Import-Referenzen bereinigen

## 6. Verifikation

- [x] 6.1 Manuell testen: Hover-Glow erscheint und verschwindet smooth auf Desktop (Karten, Decks, Buttons)
- [x] 6.2 Manuell testen: Click-Flash sichtbar bei Mausklick auf Karten und UI-Buttons
- [ ] 6.3 Manuell testen: Touch-Tap auf iPhone/iPad zeigt Flash und löst Aktion aus (kein Hover)
- [x] 6.4 Manuell testen: Aktionsanzeige zeigt korrekte Farben (grün/gelb/rot/blau)
- [x] 6.5 Manuell testen: End-Turn-Button erscheint wenn 0 Aktionen verbleiben, ist zuvor deaktiviert
- [x] 6.6 Manuell testen: Discard-Cards-Button erscheint wenn Handlimit überschritten
- [x] 6.7 Bestehende Tests laufen durch (`make test-shared`)

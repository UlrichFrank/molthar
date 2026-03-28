## 1. CanvasRegion-Infrastruktur

- [ ] 1.1 `CanvasRegion`-Interface in `game-web/src/lib/canvasRegions.ts` definieren (type, id, x, y, w, h, angle, hoverProgress, flashProgress, label?, enabled?)
- [ ] 1.2 `buildCanvasRegions(G, playerID)` implementieren — baut CanvasRegion[] aus Auslage, Portal-Slots, Hand-Karten, aktivierten Karten, Decks (Character + Pearl) und UI-Buttons (End Turn, Discard Cards) via `cardLayoutConstants`
- [ ] 1.3 In-place Update-Logik: bestehende Regions per type+id matchen und Position/enabled aktualisieren ohne Animations-Zustand zu resetten

## 2. rAF-Loop in CanvasGameBoard

- [ ] 2.1 `useRef` für `regionsRef` (CardRegion[]) und `gameStateRef` (aktuelle G) anlegen
- [ ] 2.2 `requestAnimationFrame`-Loop starten (in `useEffect` on mount), `cancelAnimationFrame` on unmount
- [ ] 2.3 Delta-Time Berechnung im Loop (`Δt = (now - lastTime) / 1000`)
- [ ] 2.4 `hoverProgress` in jedem Frame zeitbasiert interpolieren (target: gehovertes Element → 1, sonst → 0, Rate: 5/s)
- [ ] 2.5 `flashProgress` in jedem Frame zeitbasiert zerfallen lassen (Rate: 5/s, minimum: 0)
- [ ] 2.6 `draw(ctx, regions)` im Loop aufrufen statt in `useEffect`

## 3. Hover- und Flash-Drawing in gameRender.ts

- [ ] 3.1 Hilfsfunktion `drawElementWithEffects(ctx, region, drawFn)` schreiben: zeichnet beliebiges Canvas-Element mit Hover-Glow (shadowBlur * hoverProgress) und Click-Flash (weißes Rect * flashProgress)
- [ ] 3.2 `drawAuslage`, `drawPlayerPortal`, `drawActivatedCharactersGrid` auf CanvasRegion[] umstellen — nutzen `drawElementWithEffects`
- [ ] 3.3 `drawActionCounter(ctx, region, G, playerID)` implementieren: zeichnet Aktionsanzeige mit Farb-Coding (grün/gelb/rot/blau) an Position der `ui-*`-Region
- [ ] 3.4 `drawUIButton(ctx, region)` implementieren: zeichnet "End Turn" / "Discard Cards" Button mit Label, enabled-State und Hover/Flash-Effekten

## 4. Pointer-Events in CanvasGameBoard

- [ ] 4.1 `onPointerMove`: hit-test gegen `regionsRef`; bei `pointerType === 'mouse'` Hover-Target setzen (nur enabled Regions); Cursor-Management (`pointer`/`default`)
- [ ] 4.2 `onPointerDown`: hit-test gegen `regionsRef`; `flashProgress = 1.0` auf getroffener Region (unabhängig von pointerType, nur wenn enabled); Dispatch an `handleCardClick` oder `handleUIClick`
- [ ] 4.3 `handleUIClick(region)` implementieren: `ui-end-turn` → `moves.endTurn()`, `ui-discard-cards` → `dialog.openDiscardDialog(...)`
- [ ] 4.4 `onPointerLeave`: Hover-Target zurücksetzen, Cursor auf `default`
- [ ] 4.5 Touch-Spezifik: bei `pointerType === 'touch'` kein Hover-Target setzen

## 5. DOM-Overlays und toten Code entfernen

- [ ] 5.1 `<CardButtonOverlay>` aus `CanvasGameBoard.tsx` entfernen
- [ ] 5.2 `CardButtonOverlay.tsx` löschen
- [ ] 5.3 `CardButton.tsx` löschen
- [ ] 5.4 `<ActionCounterDisplay>` aus `CanvasGameBoard.tsx` entfernen
- [ ] 5.5 `ActionCounterDisplay.tsx` löschen
- [ ] 5.6 `game-web/src/styles/turnActionCounter.css` löschen
- [ ] 5.7 `hitTestButtons()` aus `gameHitTest.ts` entfernen sowie `'button'` aus dem `HitTarget`-Typ
- [ ] 5.8 `BTN_X`, `BTN_Y_1`, `BTN_Y_2`, `BTN_Y_3`, `BTN_W`, `BTN_H` aus `cardLayoutConstants.ts` entfernen
- [ ] 5.9 Neue UI-Positions-Konstanten in `cardLayoutConstants.ts` für Canvas-Buttons anlegen (Position der Aktionsanzeige + End-Turn/Discard-Buttons)
- [ ] 5.10 Alle verbleibenden Import-Referenzen bereinigen

## 6. Verifikation

- [ ] 6.1 Manuell testen: Hover-Glow erscheint und verschwindet smooth auf Desktop (Karten, Decks, Buttons)
- [ ] 6.2 Manuell testen: Click-Flash sichtbar bei Mausklick auf Karten und UI-Buttons
- [ ] 6.3 Manuell testen: Touch-Tap auf iPhone/iPad zeigt Flash und löst Aktion aus (kein Hover)
- [ ] 6.4 Manuell testen: Aktionsanzeige zeigt korrekte Farben (grün/gelb/rot/blau)
- [ ] 6.5 Manuell testen: End-Turn-Button erscheint wenn 0 Aktionen verbleiben, ist zuvor deaktiviert
- [ ] 6.6 Manuell testen: Discard-Cards-Button erscheint wenn Handlimit überschritten
- [ ] 6.7 Bestehende Tests laufen durch (`make test-shared`)

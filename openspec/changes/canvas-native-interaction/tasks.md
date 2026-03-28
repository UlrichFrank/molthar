## 1. CardRegion-Infrastruktur

- [ ] 1.1 `CardRegion`-Interface in `game-web/src/lib/cardRegions.ts` definieren (type, id, x, y, w, h, angle, hoverProgress, flashProgress)
- [ ] 1.2 `buildCardRegions(G, playerID)` implementieren — baut CardRegion[] aus Auslage, Portal-Slots, Hand-Karten, aktivierten Karten via `cardLayoutConstants`
- [ ] 1.3 In-place Update-Logik: bestehende Regions per type+id matchen und Position aktualisieren ohne Animations-Zustand zu resetten

## 2. rAF-Loop in CanvasGameBoard

- [ ] 2.1 `useRef` für `regionsRef` (CardRegion[]) und `gameStateRef` (aktuelle G) anlegen
- [ ] 2.2 `requestAnimationFrame`-Loop starten (in `useEffect` on mount), `cancelAnimationFrame` on unmount
- [ ] 2.3 Delta-Time Berechnung im Loop (`Δt = (now - lastTime) / 1000`)
- [ ] 2.4 `hoverProgress` in jedem Frame zeitbasiert interpolieren (target: gehovertes Element → 1, sonst → 0, Rate: 5/s)
- [ ] 2.5 `flashProgress` in jedem Frame zeitbasiert zerfallen lassen (Rate: 5/s, minimum: 0)
- [ ] 2.6 `draw(ctx, regions)` im Loop aufrufen statt in `useEffect`

## 3. Hover- und Flash-Drawing in gameRender.ts

- [ ] 3.1 Hilfsfunktion `drawCardWithEffects(ctx, image, region)` schreiben: zeichnet Karte mit Hover-Glow (shadowBlur * hoverProgress) und Click-Flash (weißes Rect * flashProgress)
- [ ] 3.2 `drawAuslage`, `drawPlayerPortal`, `drawActivatedCharactersGrid` auf CardRegion[] umstellen — nutzen `drawCardWithEffects` statt direktem `drawImage`

## 4. Pointer-Events in CanvasGameBoard

- [ ] 4.1 `onPointerMove`: hit-test gegen `regionsRef` statt `hitTest()`-Funktion; bei `pointerType === 'mouse'` Hover-Target setzen; Cursor-Management (`pointer`/`default`)
- [ ] 4.2 `onPointerDown`: hit-test gegen `regionsRef`; `flashProgress = 1.0` auf getroffener Region setzen (unabhängig von pointerType); `handleCardClick` aufrufen
- [ ] 4.3 `onPointerLeave`: Hover-Target zurücksetzen, Cursor auf `default`
- [ ] 4.4 Touch-Spezifik: bei `pointerType === 'touch'` kein Hover-Target setzen

## 5. DOM-Overlay entfernen

- [ ] 5.1 `<CardButtonOverlay>` aus `CanvasGameBoard.tsx` entfernen
- [ ] 5.2 `CardButtonOverlay.tsx` löschen
- [ ] 5.3 `CardButton.tsx` löschen
- [ ] 5.4 Import-Referenzen in `CanvasGameBoard.tsx` bereinigen

## 6. Verifikation

- [ ] 6.1 Manuell testen: Hover-Glow erscheint und verschwindet smooth auf Desktop
- [ ] 6.2 Manuell testen: Click-Flash sichtbar bei Mausklick auf Karten
- [ ] 6.3 Manuell testen: Touch-Tap auf iPhone/iPad zeigt Flash und löst Aktion aus (kein Hover)
- [ ] 6.4 Bestehende Tests laufen durch (`make test-shared`)

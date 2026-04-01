## 1. Canvas-Region: Neuen Typ registrieren

- [ ] 1.1 In `game-web/src/lib/canvasRegions.ts`: `CanvasRegionType` um `'ui-replace-pearl-slots'` erweitern
- [ ] 1.2 In `buildCanvasRegions`: Region für den Tauschen-Button unterhalb des Perlen-Nachziehstapels hinzufügen — nur wenn `isActive` und `G.actionCount < G.maxActions`

## 2. Canvas-Rendering: Button zeichnen

- [ ] 2.1 In `game-web/src/components/CanvasGameBoard.tsx` (Render-Loop): `drawUIButton` für die neue `'ui-replace-pearl-slots'`-Region aufrufen, analog zum End-Turn-Button

## 3. Klick-Handler: Move auslösen

- [ ] 3.1 In `CanvasGameBoard.tsx` (Click-Handler): Case für `region.type === 'ui-replace-pearl-slots'` ergänzen → `moves.replacePearlSlots()` aufrufen

## 4. Abschluss & Verifikation

- [ ] 4.1 Manueller Test: Button erscheint neben Perlenstapel, wenn aktiver Spieler noch Aktionen hat
- [ ] 4.2 Manueller Test: Klick tauscht alle 4 Perlenslots aus und verbraucht eine Aktion
- [ ] 4.3 Manueller Test: Button nicht sichtbar für inaktiven Spieler oder nach letzter Aktion
- [ ] 4.4 `make test-shared` grün

## 1. Bug Fix: Portal-Slot-Regions nur bei belegten Slots

- [x] 1.1 In `canvasRegions.ts`: `portal-slot`-Region nur hinzufügen, wenn `me?.portal[i]` belegt ist (Guard-Condition vor dem `regions.push`)

## 2. Zonen-Koordinaten exportieren

- [x] 2.1 In `gameRender.ts` (oder `cardLayoutConstants.ts`): Funktion/Konstante `getOpponentZones()` exportieren, die die vier Zonen-Bounding-Boxes `{x, y, w, h}` und ihre Rotationsgrade `[90, 180, 180, 270]` zurückgibt — analog zur lokalen Definition in `drawOpponentPortals`

## 3. Irrlicht-Regions in canvasRegions.ts

- [x] 3.1 `CanvasRegionType` um `'opponent-portal-card'` erweitern
- [x] 3.2 `buildCanvasRegions` einen Parameter `neighborOpponents: Array<{playerId: string, portal: ActivatedCharacter[]} | null>` hinzufügen (Index 0 = linker Nachbar, Index 1 = rechter Nachbar)
- [x] 3.3 Für jeden belegten Nachbar-Slot mit `irrlicht`-Karte: Welt-Koordinaten des Slot-Mittelpunkts berechnen (Rotation-Math aus design.md D3) und `opponent-portal-card`-Region mit `centered: true`, `angle`, und ID `"{playerId}:{slotIndex}"` hinzufügen — nur wenn `isActive` true ist

## 4. CanvasGameBoard.tsx anpassen

- [x] 4.1 `buildOpponentsArray` so erweitern (oder neue Hilfsfunktion), dass die direkten Nachbarn (Offset ±1) mit ihrer `playerId` und `portal`-Daten zurückgegeben werden
- [x] 4.2 `buildCanvasRegions`-Aufruf in `CanvasGameBoard` mit dem neuen `neighborOpponents`-Parameter aufrufen
- [x] 4.3 Im `handleCardClick`-Switch-Case: Zweig für `'opponent-portal-card'` hinzufügen — ID parsen (`"{playerId}:{slotIndex}"`), Karte aus `G.players[playerId].portal[slotIndex]` holen, `dialog.openActivationDialog` mit der Karte und `ownerPlayerId` aufrufen

## 5. Dialog-Hook für activateSharedCharacter

- [x] 5.1 `useDialog` / `openActivationDialog` um optionalen Parameter `ownerPlayerId?: string` erweitern
- [x] 5.2 Im `CharacterActivationDialog`: Wenn `ownerPlayerId` gesetzt ist, `moves.activateSharedCharacter(ownerPlayerId, slotIndex, selections)` statt `moves.activatePortalCard(slotIndex, selections)` aufrufen

## 6. Verifikation

- [ ] 6.1 Manuell testen: Leerer eigener Portal-Slot leuchtet nicht mehr auf
- [ ] 6.2 Manuell testen: Belegte eigene Portal-Karte leuchtet auf und öffnet bei Klick den Dialog
- [ ] 6.3 Manuell testen (2-Spieler-Spiel): Irrlicht-Karte im Nachbar-Portal leuchtet auf, Klick öffnet Dialog, Bestätigung und Bezahlung aktiviert die Karte korrekt


## 1. Frontend: canvasRegions — neue Region portal-swap-btn

- [x] 1.1 Neuen Region-Typ `'portal-swap-btn'` zum Typ-Union in `canvasRegions.ts` hinzufügen
- [x] 1.2 In `buildRegions`: nach den Portal-Slot-Regionen prüfen ob `changeCharacterActions` aktiv und `actionCount === 0`; falls ja, pro belegtem Portal-Slot eine `portal-swap-btn`-Region unterhalb des Portal-Slots hinzufügen (y = Slot-y + Slot-h + kleiner Abstand, passende w/h für den Button)

## 2. Frontend: gameRender — Button zeichnen

- [x] 2.1 In `drawPlayerPortal` (oder einem separaten Render-Schritt): wenn Swap-Button-Bedingung erfüllt, unterhalb jedes belegten Portal-Slots ein ⇄-Symbol als kleines Canvas-Label/Box zeichnen (Text oder Icon mit Hintergrundrahmen)
- [x] 2.2 Hover-Effekt für den Button analog zu anderen Canvas-Buttons (leichter Glow oder Helligkeitsänderung)

## 3. Frontend: DialogContext erweitern

- [x] 3.1 Neuen Dialog-Typ `swap-portal-character` in `DialogContext.tsx` mit Feldern `portalCard: CharacterCard`, `portalSlotIndex: number`, `tableCards: CharacterCard[]` hinzufügen
- [x] 3.2 `openSwapPortalCharacterDialog(portalCard, portalSlotIndex, tableCards)` Funktion ergänzen

## 4. Frontend: CharacterSwapDialog-Komponente

- [x] 4.1 Neue Datei `game-web/src/components/CharacterSwapDialog.tsx` erstellen
- [x] 4.2 Props: `portalCard: CharacterCard`, `portalSlotIndex: number`, `tableCards: CharacterCard[]`, `onSwap: (tableSlotIndex: number) => void`, `onCancel: () => void`
- [x] 4.3 Layout: Portal-Karte oben, ⇄-Symbol in der Mitte, Auslage-Karten unten als anklickbare Buttons (analog zu `CharacterReplacementDialog`)
- [x] 4.4 Leere `characterSlots` (`undefined`) nicht als Option rendern
- [x] 4.5 Cancel-Button einbauen

## 5. Frontend: CanvasGameBoard — Klick-Handler und Rendering

- [x] 5.1 `'portal-swap-btn'` in den Region-Typen importieren/kennen
- [x] 5.2 `case 'portal-swap-btn'`: in `handleCanvasClick` — `openSwapPortalCharacterDialog(me.portal[id].card, id, G.characterSlots)` aufrufen
- [x] 5.3 `CharacterSwapDialog` importieren und im Render-Tree bei `dialog.type === 'swap-portal-character'` einbinden
- [x] 5.4 `onSwap`: `moves.swapPortalCharacter(portalSlotIndex, tableSlotIndex)` aufrufen, Dialog schließen
- [x] 5.5 `onCancel`: Dialog schließen

## 6. Verifikation

- [ ] 6.1 Manuell: `changeCharacterActions` aktivieren — ⇄-Button unter Portal-Karten erscheint
- [ ] 6.2 Manuell: Button klicken — Dialog mit Portal-Karte oben und Auslage-Karten unten erscheint
- [ ] 6.3 Manuell: Auslage-Karte wählen — Karten tauschen, Dialog schließt sich
- [ ] 6.4 Manuell: Cancel klicken — Dialog schließt sich ohne Änderung
- [ ] 6.5 Manuell: Erste Aktion ausführen — ⇄-Button verschwindet
- [ ] 6.6 Manuell: Spieler ohne Ability — kein Button sichtbar

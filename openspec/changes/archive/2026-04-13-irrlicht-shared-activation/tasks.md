## 1. Layout: Hilfsfunktionen für Opponent-Slot-Positionen

- [x] 1.1 In `cardLayoutConstants.ts`: Opponent-Zonen als konstante Objekte exportieren — `OPPONENT_ZONES` Array mit je `{ x, y, w, h, angle }` für die vier Positionen (links=90°, oben-links=180°, oben-rechts=180°, rechts=270°)
- [x] 1.2 Hilfsfunktion `getOpponentZoneOrder(myPlayerId: string, playerOrder: string[]): string[]` exportieren — gibt die Gegner-IDs in Reihenfolge [links, oben-links, oben-rechts, rechts] zurück (modulo playerOrder.length, fehlende Positionen = `''`)
- [x] 1.3 Hilfsfunktion `getOpponentSlotCenter(zoneIndex: 0|1|2|3, slotIndex: 0|1): { x: number; y: number; angle: number }` exportieren — berechnet Kartenmittelpunkt und Rotationswinkel für einen Slot in einer Opponent-Zone, sodass Rendering und Hit-Test konsistente Koordinaten nutzen

## 2. Frontend: drawOpponentPortals — Charakterkarten rendern

- [x] 2.1 Signatur von `drawOpponentPortals` erweitern: zweiter Parameter `opponents: Array<{ playerId: string; portal: ActivatedCharacter[] } | null>` (4 Einträge, null = kein Spieler)
- [x] 2.2 Rendering der Hintergrundbilder (Gegner Portal2.png etc.) beibehalten
- [x] 2.3 Für jeden belegten Slot einer Opponent-Zone: Charakterkarte mit Vorderseite und korrekter Rotation rendern — Kartenposition via `getOpponentSlotCenter(zoneIndex, slotIndex)`
- [x] 2.4 `drawOpponentPortals`-Aufruf in `CanvasGameBoard.tsx` anpassen: Opponents-Array übergeben (berechnet aus `G.players`, `G.playerOrder`, `myPlayerID`)

## 3. Frontend: canvasRegions — opponent-portal-slot Regionen

- [x] 3.1 Neuen Regionstyp `'opponent-portal-slot'` zur Region-Typ-Union in `canvasRegions.ts` hinzufügen; ID-Typ: `{ ownerId: string; slotIndex: number }`
- [x] 3.2 Funktion `getOpponentPortalRegions(myPlayerId, G, isActive): CanvasRegion[]` implementieren:
  - Iteriert über `getOpponentZoneOrder(myPlayerId, G.playerOrder)` (4 Positionen)
  - Erstellt für jeden belegten Portal-Slot eines Nachbarn (direkter Vorgänger/Nachfolger) eine Region
  - Regionen sind `centered: true` mit `angle` aus Zone und `{ x, y }` aus `getOpponentSlotCenter`
  - `enabled`: nur wenn `isActive && !entry.activated && entry.card.abilities.some(a => a.type === 'irrlicht')`
  - Für Nicht-Nachbarn oder Nicht-Irrlicht-Karten: keine Region erstellen (oder `enabled: false`)
- [x] 3.3 `getOpponentPortalRegions` in den Regions-Aufbau in `CanvasGameBoard.tsx` integrieren (analog zu `getPortalSlotRegions`)

## 4. Frontend: DialogContext — opponent-activation Typ

- [x] 4.1 Neuen Dialogo-State-Typ `{ type: 'opponent-activation'; character: CharacterCard; ownerPlayerId: string; portalSlotIndex: number }` zur `DialogState`-Union in `DialogContext.tsx` hinzufügen
- [x] 4.2 Neue Methode `openOpponentActivationDialog(character, ownerPlayerId, portalSlotIndex)` in `DialogContextType` und `DialogProvider` implementieren

## 5. Frontend: CanvasGameBoard — Click-Handler und Dialog

- [x] 5.1 Im `onPointerDown`-Switch: neuen Case `'opponent-portal-slot'` hinzufügen
  - `dialog.openOpponentActivationDialog(entry.card, region.id.ownerId, region.id.slotIndex)` aufrufen
  - `entry` aus `G.players[ownerId].portal[slotIndex]` holen
- [x] 5.2 Im Render-Block: bei `dialog.dialog.type === 'opponent-activation'` den `CharacterActivationDialog` rendern:
  - `availableCharacters=[{ card: dialog.dialog.character, slotIndex: dialog.dialog.portalSlotIndex }]`
  - `hand={me.hand}`, `diamonds={me.diamonds}`, `activeAbilities={me.activeAbilities}`, `activatedCharacters={me.activatedCharacters}`
  - `onActivate={(slotIndex, selections) => { moves.activateSharedCharacter(dialog.dialog.ownerPlayerId, slotIndex, selections); dialog.closeDialog(); }}`
  - `onCancel={() => dialog.closeDialog()}`

## 6. Verifikation

- [x] 6.1 Manuell: Gegnerische Portale mit Karten sichtbar für alle Spieler
- [x] 6.2 Manuell: Irrlicht-Karte beim direkten Vorgänger/Nachfolger ist klickbar (Cursor ändert sich)
- [x] 6.3 Manuell: CharacterActivationDialog öffnet sich mit korrekter Karte und eigenen Ressourcen
- [x] 6.4 Manuell: Aktivierung konsumiert Karten aus eigener Hand, Move `activateSharedCharacter` wird aufgerufen
- [x] 6.5 Manuell: Bereits aktivierte Irrlicht-Karte (activated=true) ist nicht klickbar
- [x] 6.6 Manuell: Karte eines Nicht-Nachbarn (2 Plätze entfernt) ist nicht klickbar
- [x] 6.7 Manuell: Nicht-Irrlicht-Karten von Nachbarn sind nicht klickbar
- [x] 6.8 `make test-shared` grün (keine Shared-Änderungen erwartet)

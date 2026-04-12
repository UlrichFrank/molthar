## 1. PlayerStatusBadge erweitern

- [x] 1.1 Props `playerName?: string`, `actionCount?: number`, `maxActions?: number` zu `PlayerStatusBadge` hinzufügen
- [x] 1.2 Namensanzeige als erste Zeile im Badge rendern (wenn `playerName` gesetzt): kompakte Schrift, `max-width: 220px`, `overflow: hidden`, `text-overflow: ellipsis`
- [x] 1.3 Aktionszähler `X/Y` ins Badge integrieren (wenn `actionCount` und `maxActions` gesetzt): Farbcodierung grün/gelb/rot analog zu `drawUIButton`

## 2. EndTurnButton-Komponente erstellen

- [x] 2.1 `game-web/src/components/EndTurnButton.tsx` erstellen: Props `isActive: boolean`, `actionCount: number`, `maxActions: number`, `onEndTurn: () => void`; rendert `null` wenn `!isActive || actionCount < maxActions`
- [x] 2.2 Styling: roter Button (`#ef4444`), weißer Text, abgerundete Ecken, hover-Effekt

## 3. CanvasGameBoard anpassen

- [x] 3.1 Position des eigenen Badges ändern: `top: '64.5%'`, `left: '50%'`, `transform: 'translateX(-50%)'`
- [x] 3.2 Props `playerName`, `actionCount`, `maxActions` an eigenes Badge übergeben (nur wenn `isActive`)
- [x] 3.3 `EndTurnButton` unterhalb des Badges einbinden, zentriert (gleiche horizontale Position wie Badge); `onEndTurn={() => moves.endTurn?.()}` übergeben
- [x] 3.4 `PlayerNameDisplay`-Render-Block und Import entfernen
- [x] 3.5 Canvas-`drawUIButton`-Aufruf aus `renderFrame` in `CanvasGameBoard.tsx` entfernen

## 4. Canvas-UI-Panel entfernen

- [x] 4.1 `ui-end-turn`-Region und dessen Klick-Handler aus `canvasRegions.ts` bzw. `CanvasGameBoard.tsx` entfernen
- [x] 4.2 `drawUIButton`-Import aus `CanvasGameBoard.tsx` entfernen (falls nicht anderweitig genutzt)

## 5. PlayerNameDisplay löschen

- [x] 5.1 Datei `game-web/src/components/PlayerNameDisplay.tsx` löschen

## 6. Tests aktualisieren

- [x] 6.1 `PlayerStatusBadge`-Tests: `playerName`-Prop-Szenarien (Name angezeigt / nicht angezeigt)
- [x] 6.2 `PlayerStatusBadge`-Tests: Aktionszähler-Farbcodierung (grün/gelb/rot)
- [x] 6.3 `EndTurnButton`-Tests: sichtbar bei erschöpften Aktionen, unsichtbar sonst, Klick ruft Callback auf

## 7. Gegner-Badges mit Spielernamen

- [x] 7.1 `playerName`-Prop an alle Gegner-Badges in `CanvasGameBoard.tsx` übergeben: `resolvePlayerName(playerId, playerState.name)`

## 8. PlayerStatusDialog Größe anpassen

- [x] 8.1 Inline-`minWidth`- und `padding`-Override in `PlayerStatusDialog.tsx` entfernen; Dialog nutzt natürliche `.game-dialog`-CSS-Breite (`max-width: min(600px, 95vw)`, `padding: 2rem`)
- [x] 8.2 `PlayerStatusDialog`-Test: Dialog hat keine einengenden Inline-Width-Styles

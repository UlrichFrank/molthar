## 1. Shared: PlayerState — colorIndex

- [x] 1.1 In `shared/src/game/types.ts`: `colorIndex: number` zu `PlayerState` hinzufügen
- [x] 1.2 In `shared/src/game/index.ts` `setup`: `colorIndex = i + 1` sequenziell pro Spieler zuweisen
- [x] 1.3 In `setup`: `startingPlayer` zufällig aus `playerIds` wählen (via `Math.floor(Math.random() * playerIds.length)`)

## 2. Shared: colorSelection-Phase

- [x] 2.1 `phases`-Array im Game-Objekt einführen; bisherige `turn`-Konfiguration zur Haupt-Phase (`name: 'play'`) verschieben
- [x] 2.2 Neue Phase `colorSelection` als erste Phase (`start: true`) mit `activePlayers: { all: Stage, moveLimit: 2 }` konfigurieren (1× `selectColor` + 1× `confirmColor`)
- [x] 2.3 Move `selectColor(colorIndex: number)` implementieren: prüft dass `colorIndex` 1–5 und nicht von anderem Spieler belegt; setzt `G.players[ctx.currentPlayer].colorIndex = colorIndex`
- [x] 2.4 Move `confirmColor()` implementieren: setzt ein Flag `G.players[ctx.currentPlayer].colorConfirmed = true` (oder äquivalent)
- [x] 2.5 `endIf` der Phase: endet wenn alle Spieler confirmed haben → `Object.values(G.players).every(p => p.colorConfirmed)`
- [x] 2.6 `onEnd` der Phase: `colorConfirmed`-Flags zurücksetzen (wird nicht im Spielverlauf gebraucht)
- [x] 2.7 `colorConfirmed: boolean` zu `PlayerState` hinzufügen (temporäres Flag)

## 3. Shared: Tests

- [x] 3.1 Test: Default-Farbzuweisung im Setup (Spieler 0→1, 1→2, etc.)
- [x] 3.2 Test: `selectColor` — freie Farbe → Erfolg; belegte Farbe → `INVALID_MOVE`
- [x] 3.3 Test: Phase endet nach `confirmColor` aller Spieler
- [x] 3.4 Test: `startingPlayer` ist einer der `playerIds` (nicht deterministisch `playerIds[0]`)

## 4. Frontend: Hilfsfunktionen

- [x] 4.1 In `game-web/src/lib/gameRender.ts` (oder neuem Helper): `getPortalImageName(colorIndex: number, isStartingPlayer: boolean): string` — gibt korrekte Bilddatei zurück
- [x] 4.2 In `cardLayoutConstants.ts`: Skalierungskonstanten für Opponent-Zonen exportieren — `OPP_SLOT_W`, `OPP_SLOT_H` (35%), `OPP_ACT_W`, `OPP_ACT_H` (25%)
- [x] 4.3 Hilfsfunktion `drawOpponentZone(ctx, zone, opponentData, rotation)` in `gameRender.ts` implementieren:
  - `ctx.save() / translate(zoneMittelpunkt) / rotate(rotation)` für einheitliche Transformation
  - Portal-Hintergrund skaliert auf Zonengröße zeichnen
  - Portal-Slot-Karten (Vorderseite, skaliert) positionieren
  - Aktivierte Charaktere (Vorderseite, skaliert) in Reihe
  - Handkarten-Stapel (verdeckt, mit Anzahl-Label)
  - `ctx.restore()`

## 5. Frontend: drawPlayerPortal — Portal-Bild austauschen

- [x] 5.1 `drawPlayerPortal` bekommt neuen Parameter `colorIndex: number` und `isStartingPlayer: boolean`
- [x] 5.2 `Kleiderschrank Portal.png` durch `getPortalImageName(colorIndex, isStartingPlayer)` ersetzen
- [ ] 5.3 Aufruf in `CanvasGameBoard.tsx` anpassen: `colorIndex={me.colorIndex}` und `isStartingPlayer={myPlayerID === G.startingPlayer}` übergeben

## 6. Frontend: drawOpponentPortals — vollständiges Rendering

- [ ] 6.1 Signatur von `drawOpponentPortals` erweitern: Opponents-Array `Array<OpponentZoneData | null>` (4 Einträge) übergeben — `OpponentZoneData = { colorIndex, isStartingPlayer, portal, activatedCharacters, handCount }`
- [ ] 6.2 Für jede besetzte Zone `drawOpponentZone(...)` aufrufen; für leere Zonen `Schriftrolle.png` wie bisher
- [ ] 6.3 In `CanvasGameBoard.tsx`: Opponents-Array berechnen aus `G.playerOrder`, `G.players`, `myPlayerID` und `G.startingPlayer` — in Zonen-Reihenfolge (links, oben-links, oben-rechts, rechts)

## 7. Frontend: colorSelection-UI

- [ ] 7.1 In `CanvasGameBoard.tsx`: `ctx.phase === 'colorSelection'` erkennen
- [ ] 7.2 Wenn Phase aktiv: Farb-Auswahl-Overlay rendern (React-Overlay über Canvas) mit 5 Farb-Buttons (1=Lila, 2=Hellgrün, 3=Dunkelgrün, 4=Rot, 5=Hellblau)
- [ ] 7.3 Bereits belegte Farben (aus `G.players`) als deaktiviert darstellen
- [ ] 7.4 Aktuell gewählte Farbe des Spielers hervorheben
- [ ] 7.5 "Farbe bestätigen"-Button → ruft `moves.confirmColor()` auf; vorher optional `moves.selectColor(colorIndex)` wenn Farbe geändert
- [ ] 7.6 Wer bereits `colorConfirmed === true` hat: Overlay zeigt "Warten auf andere Spieler…"

## 8. Verifikation

- [ ] 8.1 Manuell: Farb-Auswahl-Overlay erscheint bei Spielstart, Farbwahl und Bestätigung funktionieren
- [ ] 8.2 Manuell: Belegte Farbe bei zweitem Spieler deaktiviert
- [ ] 8.3 Manuell: Eigenes Portal zeigt korrektes `Portal{colorIndex}.jpeg`; Startspieler zeigt `Portal-Startspieler{colorIndex}.jpeg`
- [ ] 8.4 Manuell: Gegner-Zonen zeigen deren Portal-Bild, Portal-Karten (offen), aktivierte Charaktere (offen), Handkarten (verdeckt)
- [ ] 8.5 Manuell: Karten in Gegner-Zonen korrekt rotiert (links=90°, oben=180°, rechts=270°)
- [ ] 8.6 Manuell: Leere Zonen bei 2–3 Spielern zeigen `Schriftrolle.png`
- [ ] 8.7 `make test-shared` grün

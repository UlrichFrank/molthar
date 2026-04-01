## 1. Shared: Types erweitern

- [x] 1.1 `GameState` in `shared/src/game/types.ts` um `pendingStealOpponentHandCard: boolean` erweitern

## 2. Shared: Ability-Handler anpassen

- [x] 2.1 In `shared/src/game/abilityHandlers.ts`, `stealOpponentHandCard`-Case: Auto-Steal-Logik entfernen
- [x] 2.2 Prüfen ob mind. ein Gegner `hand.length > 0` hat; falls ja, `G.pendingStealOpponentHandCard = true`; falls nein, no-op

## 3. Shared: Resolve-Move implementieren

- [x] 3.1 Neuen Move `resolveStealOpponentHandCard({ targetPlayerId, handCardIndex })` in `shared/src/game/index.ts` implementieren
- [x] 3.2 Validierungen: `pendingStealOpponentHandCard === true`, `targetPlayerId !== ctx.currentPlayer`, `handCardIndex` im gültigen Bereich
- [x] 3.3 Bei Erfolg: Karte aus `players[targetPlayerId].hand` entfernen, zu `players[currentPlayer].hand` hinzufügen, `pendingStealOpponentHandCard = false`
- [x] 3.4 Move in `moves`-Liste des boardgame.io Game-Specs eintragen
- [x] 3.5 `setup` in `index.ts`: Initialwert `pendingStealOpponentHandCard: false` setzen

## 4. Shared: Tests

- [x] 4.1 Test: Flag gesetzt wenn Gegner Handkarten hat
- [x] 4.2 Test: Flag bleibt `false` wenn niemand Handkarten hat
- [x] 4.3 Test: `resolveStealOpponentHandCard` überträgt Karte korrekt und löscht Flag
- [x] 4.4 Test: Move no-op wenn Flag nicht gesetzt
- [x] 4.5 Test: Move no-op bei eigenem `targetPlayerId`
- [x] 4.6 Test: Move no-op bei ungültigem `handCardIndex`

## 5. Frontend: DialogContext erweitern

- [x] 5.1 Neuen Dialog-Typ `steal-opponent-hand-card` in `DialogContext.tsx` mit internem `selectedPlayerId: string | null` hinzufügen
- [x] 5.2 `openStealOpponentHandCardDialog`-Funktion ergänzen (setzt `selectedPlayerId: null`, Stufe 1)

## 6. Frontend: StealOpponentHandCardDialog-Komponente

- [x] 6.1 Neue Komponente `StealOpponentHandCardDialog` in `game-web/src/components/` erstellen
- [x] 6.2 Stufe 1: Alle Gegner mit `hand.length > 0` auflisten; pro Gegner N Kartenrückseiten rendern
- [x] 6.3 Klick auf Gegner: setzt `selectedPlayerId` auf den gewählten Spieler (wechselt zu Stufe 2)
- [x] 6.4 Stufe 2: Karten des gewählten Gegners aufgedeckt anzeigen (Perlenwerte sichtbar)
- [x] 6.5 "Zurück"-Schaltfläche in Stufe 2: setzt `selectedPlayerId = null` zurück (zu Stufe 1)
- [x] 6.6 Klick auf Karte in Stufe 2: `resolveStealOpponentHandCard({ targetPlayerId, handCardIndex })` aufrufen, Dialog schließen
- [x] 6.7 Kein Abbrechen-Button; kein Escape/Außenklick-Schließen

## 7. Frontend: Board-Integration

- [x] 7.1 In `CanvasGameBoard.tsx`: `G.pendingStealOpponentHandCard` auslesen
- [x] 7.2 Bei `true` und lokalem Spieler = `currentPlayer`: `openStealOpponentHandCardDialog` aufrufen
- [x] 7.3 `StealOpponentHandCardDialog` im Render-Tree einbinden

## 8. Verifikation

- [ ] 8.1 Manuell: Karte mit `stealOpponentHandCard` aktivieren — Dialog Stufe 1 erscheint mit verdeckten Karten
- [ ] 8.2 Manuell: Gegner auswählen — Stufe 2 zeigt aufgedeckte Karten
- [ ] 8.3 Manuell: "Zurück" — Stufe 1 wieder sichtbar
- [ ] 8.4 Manuell: Karte wählen — Karte in eigener Hand, Dialog schließt sich
- [ ] 8.5 Manuell: Niemand hat Handkarten → kein Dialog, kein Effekt
- [x] 8.6 `make test-shared` grün

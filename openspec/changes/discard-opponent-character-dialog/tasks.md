## 1. Shared: Types erweitern

- [ ] 1.1 `GameState` in `shared/src/game/types.ts` um `pendingDiscardOpponentCharacter: boolean` erweitern

## 2. Shared: Ability-Handler anpassen

- [ ] 2.1 In `shared/src/game/abilityHandlers.ts`, `discardOpponentCharacter`-Case: Auto-Remove-Logik entfernen
- [ ] 2.2 Stattdessen: Prüfen ob mind. ein Gegner `portal.length > 0` hat; falls ja, `G.pendingDiscardOpponentCharacter = true` setzen; falls nein, no-op

## 3. Shared: Resolve-Move implementieren

- [ ] 3.1 Neuen Move `resolveDiscardOpponentCharacter({ targetPlayerId, portalEntryId })` in `shared/src/game/index.ts` implementieren
- [ ] 3.2 Validierungen: `pendingDiscardOpponentCharacter === true`, `targetPlayerId !== ctx.currentPlayer`, `portalEntryId` existiert in `players[targetPlayerId].portal`
- [ ] 3.3 Bei Erfolg: Karte aus `portal` entfernen, zu `characterDiscardPile` hinzufügen, `pendingDiscardOpponentCharacter = false`
- [ ] 3.4 Move in die `moves`-Liste des boardgame.io Game-Specs eintragen
- [ ] 3.5 `setup` in `index.ts`: Initialwert `pendingDiscardOpponentCharacter: false` setzen

## 4. Shared: Tests

- [ ] 4.1 Test: Flag wird gesetzt wenn Gegner Portal-Karte hat
- [ ] 4.2 Test: Flag bleibt `false` wenn kein Gegner Portal-Karte hat
- [ ] 4.3 Test: `resolveDiscardOpponentCharacter` entfernt Karte korrekt und löscht Flag
- [ ] 4.4 Test: Move ist no-op wenn Flag nicht gesetzt
- [ ] 4.5 Test: Move ist no-op bei eigenem `targetPlayerId`
- [ ] 4.6 Test: Move ist no-op bei ungültiger `portalEntryId`

## 5. Frontend: DialogContext erweitern

- [ ] 5.1 Neuen Dialog-Typ `discard-opponent-character` in `DialogContext.tsx` hinzufügen (mit zugehörigen Spieler-/Portal-Daten)
- [ ] 5.2 `openDiscardOpponentCharacterDialog`-Funktion und `closeDialog`-Aufruf ergänzen

## 6. Frontend: DiscardOpponentCharacterDialog-Komponente

- [ ] 6.1 Neue Komponente `DiscardOpponentCharacterDialog` in `game-web/src/components/` erstellen
- [ ] 6.2 Spielerliste in Reihenfolge ab nächstem Spieler berechnen (aus `G.playerOrder` + `currentPlayer`)
- [ ] 6.3 Spieler ohne Portal-Karten ausblenden
- [ ] 6.4 Pro Spieler: alle `portal`-Karten mit Name, Kosten, Fähigkeiten anzeigen (bestehende Kartendarstellung nutzen)
- [ ] 6.5 Kein Abbrechen-Button; Dialog schließt sich nur durch Kartenauswahl
- [ ] 6.6 Bei Klick auf Karte: `resolveDiscardOpponentCharacter` aufrufen, Dialog schließen

## 7. Frontend: Board-Integration

- [ ] 7.1 In `CanvasGameBoard.tsx`: `G.pendingDiscardOpponentCharacter` auslesen
- [ ] 7.2 Bei `true` und lokalem Spieler = `currentPlayer`: `openDiscardOpponentCharacterDialog` aufrufen
- [ ] 7.3 `DiscardOpponentCharacterDialog` im Render-Tree unterhalb von `CanvasGameBoard` einbinden

## 8. Abschluss & Verifikation

- [ ] 8.1 Manuelle Tests: Karte mit `discardOpponentCharacter` aktivieren — Dialog erscheint mit Gegner-Karten
- [ ] 8.2 Test: Karte auswählen — Karte verschwindet aus Gegner-Portal, Dialog schließt sich
- [ ] 8.3 Test: Ability ignoriert wenn kein Gegner eine Portal-Karte hat — kein Dialog
- [ ] 8.4 Multiplayer-Test: Beide Clients reagieren korrekt (Dialog nur beim aktiven Spieler)
- [ ] 8.5 `make test-shared` grün

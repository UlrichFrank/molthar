## 1. Shared: Types migrieren

- [x] 1.1 In `shared/src/game/types.ts`: `lastPlayedPearlId: string | null` entfernen
- [x] 1.2 `playedRealPearlIds: string[]` zum `GameState` hinzufügen
- [x] 1.3 `pendingTakeBackPlayedPearl: boolean` zum `GameState` hinzufügen

## 2. Shared: Setup und Turn-End aktualisieren

- [x] 2.1 In `shared/src/game/index.ts` `setup`: `lastPlayedPearlId: null` durch `playedRealPearlIds: []` und `pendingTakeBackPlayedPearl: false` ersetzen
- [x] 2.2 In `turn.onEnd` (oder äquivalent): `G.lastPlayedPearlId = null` durch `G.playedRealPearlIds = []` ersetzen

## 3. Shared: Pearl-Tracking in Aktivierungs-Moves

- [x] 3.1 In `activatePortalCard` (Zeile ~281): nach `consumedCards.forEach(card => G.pearlDiscardPile.push(card))` die IDs aller `consumedCards` zu `G.playedRealPearlIds` hinzufügen
- [x] 3.2 In `activateSharedCharacter` (Zeile ~476): analog zu 3.1, IDs der `consumed`-Karten zu `G.playedRealPearlIds` hinzufügen

## 4. Shared: Ability-Handler anpassen

- [x] 4.1 In `abilityHandlers.ts`, `takeBackPlayedPearl`-Case: gesamten bisherigen Rückholcode entfernen, nur `G.pendingTakeBackPlayedPearl = true` setzen

## 5. Shared: Neue Moves implementieren

- [x] 5.1 Move `resolveReturnPearl({ pearlId })` implementieren: Validierungen (Flag gesetzt, ID in `playedRealPearlIds`, ID in `pearlDiscardPile`), dann Karte bewegen, Flag löschen, ID aus Log entfernen
- [x] 5.2 Move `dismissReturnPearlDialog()` implementieren: nur `pendingTakeBackPlayedPearl = false` setzen, no-op wenn Flag bereits `false`
- [x] 5.3 Beide Moves in die `moves`-Liste des boardgame.io Game-Specs eintragen

## 6. Shared: Tests

- [x] 6.1 Test: `playedRealPearlIds` wird nach `activatePortalCard` mit echten Karten befüllt
- [x] 6.2 Test: Virtuelle Karten werden nicht in `playedRealPearlIds` eingetragen
- [x] 6.3 Test: `playedRealPearlIds` ist nach Zugende leer
- [x] 6.4 Test: `takeBackPlayedPearl`-Ability setzt `pendingTakeBackPlayedPearl = true`
- [x] 6.5 Test: `resolveReturnPearl` bewegt Karte korrekt, löscht Flag und Log-Eintrag
- [x] 6.6 Test: `resolveReturnPearl` no-op wenn Flag nicht gesetzt
- [x] 6.7 Test: `resolveReturnPearl` no-op wenn pearlId nicht in `playedRealPearlIds`
- [x] 6.8 Test: `dismissReturnPearlDialog` löscht nur das Flag
- [x] 6.9 Bestehende Tests auf entferntes `lastPlayedPearlId`-Feld anpassen

## 7. Frontend: DialogContext erweitern

- [x] 7.1 Neuen Dialog-Typ `take-back-played-pearl` in `DialogContext.tsx` hinzufügen
- [x] 7.2 `openTakeBackPlayedPearlDialog`-Funktion ergänzen

## 8. Frontend: TakeBackPlayedPearlDialog-Komponente

- [x] 8.1 Neue Komponente `TakeBackPlayedPearlDialog` in `game-web/src/components/` erstellen
- [x] 8.2 Karten aus `G.pearlDiscardPile` filtern nach `G.playedRealPearlIds`
- [x] 8.3 Karten mit Wert anzeigen (bestehende Perlenkarten-Darstellung nutzen)
- [x] 8.4 Klick auf Karte: `resolveReturnPearl(pearlId)` aufrufen, Dialog schließt sich
- [x] 8.5 Leerstate: Text "Nur virtuelle Perlenkarten wurden gespielt." anzeigen
- [x] 8.6 Klick auf Leerstate-Text: `dismissReturnPearlDialog()` aufrufen, Dialog schließt sich
- [x] 8.7 Kein separater Abbrechen-Button; kein Escape/Außenklick-Schließen

## 9. Frontend: Board-Integration

- [x] 9.1 In `CanvasGameBoard.tsx`: `G.pendingTakeBackPlayedPearl` auslesen
- [x] 9.2 Bei `true` und lokalem Spieler = `currentPlayer`: `openTakeBackPlayedPearlDialog` aufrufen
- [x] 9.3 `TakeBackPlayedPearlDialog` im Render-Tree einbinden

## 10. Verifikation

- [ ] 10.1 Manuell: Charakterkarte mit `takeBackPlayedPearl` aktivieren nach echten Perlenkarten-Einsatz → Dialog zeigt gespielte Karten
- [ ] 10.2 Manuell: Karte wählen → Karte zurück auf Hand, Dialog schließt sich
- [ ] 10.3 Manuell: Ability aktivieren wenn nur virtuelle Karten gespielt → Leerstate-Text erscheint
- [ ] 10.4 Manuell: Auf Leerstate-Text klicken → Dialog schließt sich
- [x] 10.5 `make test-shared` grün

## 1. Shared: Types migrieren

- [ ] 1.1 In `shared/src/game/types.ts`: `lastPlayedPearlId: string | null` entfernen
- [ ] 1.2 `playedRealPearlIds: string[]` zum `GameState` hinzufügen
- [ ] 1.3 `pendingTakeBackPlayedPearl: boolean` zum `GameState` hinzufügen

## 2. Shared: Setup und Turn-End aktualisieren

- [ ] 2.1 In `shared/src/game/index.ts` `setup`: `lastPlayedPearlId: null` durch `playedRealPearlIds: []` und `pendingTakeBackPlayedPearl: false` ersetzen
- [ ] 2.2 In `turn.onEnd` (oder äquivalent): `G.lastPlayedPearlId = null` durch `G.playedRealPearlIds = []` ersetzen

## 3. Shared: Pearl-Tracking in Aktivierungs-Moves

- [ ] 3.1 In `activatePortalCard` (Zeile ~281): nach `consumedCards.forEach(card => G.pearlDiscardPile.push(card))` die IDs aller `consumedCards` zu `G.playedRealPearlIds` hinzufügen
- [ ] 3.2 In `activateSharedCharacter` (Zeile ~476): analog zu 3.1, IDs der `consumed`-Karten zu `G.playedRealPearlIds` hinzufügen

## 4. Shared: Ability-Handler anpassen

- [ ] 4.1 In `abilityHandlers.ts`, `takeBackPlayedPearl`-Case: gesamten bisherigen Rückholcode entfernen, nur `G.pendingTakeBackPlayedPearl = true` setzen

## 5. Shared: Neue Moves implementieren

- [ ] 5.1 Move `resolveReturnPearl({ pearlId })` implementieren: Validierungen (Flag gesetzt, ID in `playedRealPearlIds`, ID in `pearlDiscardPile`), dann Karte bewegen, Flag löschen, ID aus Log entfernen
- [ ] 5.2 Move `dismissReturnPearlDialog()` implementieren: nur `pendingTakeBackPlayedPearl = false` setzen, no-op wenn Flag bereits `false`
- [ ] 5.3 Beide Moves in die `moves`-Liste des boardgame.io Game-Specs eintragen

## 6. Shared: Tests

- [ ] 6.1 Test: `playedRealPearlIds` wird nach `activatePortalCard` mit echten Karten befüllt
- [ ] 6.2 Test: Virtuelle Karten werden nicht in `playedRealPearlIds` eingetragen
- [ ] 6.3 Test: `playedRealPearlIds` ist nach Zugende leer
- [ ] 6.4 Test: `takeBackPlayedPearl`-Ability setzt `pendingTakeBackPlayedPearl = true`
- [ ] 6.5 Test: `resolveReturnPearl` bewegt Karte korrekt, löscht Flag und Log-Eintrag
- [ ] 6.6 Test: `resolveReturnPearl` no-op wenn Flag nicht gesetzt
- [ ] 6.7 Test: `resolveReturnPearl` no-op wenn pearlId nicht in `playedRealPearlIds`
- [ ] 6.8 Test: `dismissReturnPearlDialog` löscht nur das Flag
- [ ] 6.9 Bestehende Tests auf entferntes `lastPlayedPearlId`-Feld anpassen

## 7. Frontend: DialogContext erweitern

- [ ] 7.1 Neuen Dialog-Typ `take-back-played-pearl` in `DialogContext.tsx` hinzufügen
- [ ] 7.2 `openTakeBackPlayedPearlDialog`-Funktion ergänzen

## 8. Frontend: TakeBackPlayedPearlDialog-Komponente

- [ ] 8.1 Neue Komponente `TakeBackPlayedPearlDialog` in `game-web/src/components/` erstellen
- [ ] 8.2 Karten aus `G.pearlDiscardPile` filtern nach `G.playedRealPearlIds`
- [ ] 8.3 Karten mit Wert anzeigen (bestehende Perlenkarten-Darstellung nutzen)
- [ ] 8.4 Klick auf Karte: `resolveReturnPearl(pearlId)` aufrufen, Dialog schließt sich
- [ ] 8.5 Leerstate: Text "Nur virtuelle Perlenkarten wurden gespielt." anzeigen
- [ ] 8.6 Klick auf Leerstate-Text: `dismissReturnPearlDialog()` aufrufen, Dialog schließt sich
- [ ] 8.7 Kein separater Abbrechen-Button; kein Escape/Außenklick-Schließen

## 9. Frontend: Board-Integration

- [ ] 9.1 In `CanvasGameBoard.tsx`: `G.pendingTakeBackPlayedPearl` auslesen
- [ ] 9.2 Bei `true` und lokalem Spieler = `currentPlayer`: `openTakeBackPlayedPearlDialog` aufrufen
- [ ] 9.3 `TakeBackPlayedPearlDialog` im Render-Tree einbinden

## 10. Verifikation

- [ ] 10.1 Manuell: Charakterkarte mit `takeBackPlayedPearl` aktivieren nach echten Perlenkarten-Einsatz → Dialog zeigt gespielte Karten
- [ ] 10.2 Manuell: Karte wählen → Karte zurück auf Hand, Dialog schließt sich
- [ ] 10.3 Manuell: Ability aktivieren wenn nur virtuelle Karten gespielt → Leerstate-Text erscheint
- [ ] 10.4 Manuell: Auf Leerstate-Text klicken → Dialog schließt sich
- [ ] 10.5 `make test-shared` grün

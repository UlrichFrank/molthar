## 1. Shared: PaymentSelection-Typ erweitern

- [ ] 1.1 In `shared/src/game/types.ts`: `PaymentSelection.source` von `'hand' | 'ability'` auf `'hand' | 'ability' | 'trade'` erweitern
- [ ] 1.2 JSDoc-Kommentar für `source: 'trade'` ergänzen: relevante Felder sind `characterId` und `handCardIndex`

## 2. Shared: activatePortalCard — Trade-Verarbeitung

- [ ] 2.1 In `activatePortalCard` (Selections-Loop): Neuen `bonusDiamonds` Zähler einführen
- [ ] 2.2 Case `sel.source === 'trade'` hinzufügen:
  - Validierung: Charakter hat `tradeTwoForDiamond`, `hand[handCardIndex].value === 2`, Index nicht bereits in `handIndicesToRemove`
  - Bei Erfolg: `handIndicesToRemove.add(handCardIndex)`, `bonusDiamonds++`
  - Bei Fehler: `INVALID_MOVE`
- [ ] 2.3 Guard: max. 1 Trade-Selection pro Move (Duplikat-Guard auf `source === 'trade'`)
- [ ] 2.4 `remainingDiamondsForValidation` anpassen: `player.diamonds - diamondsToSpend + bonusDiamonds`
- [ ] 2.5 Diamond-Abzug am Ende anpassen: `player.diamonds -= (diamondsToSpend - bonusDiamonds)`, Guard: nicht unter 0

## 3. Shared: activateSharedCharacter — Trade-Verarbeitung

- [ ] 3.1 Dieselbe Trade-Verarbeitungslogik (Tasks 2.1–2.5) analog in `activateSharedCharacter` implementieren

## 4. Shared: Tests

- [ ] 4.1 Test: `activatePortalCard` mit `source: 'trade'` — 2-Perle wird konsumiert, Aktivierung valid trotz 0 echten Diamanten
- [ ] 4.2 Test: `source: 'trade'` mit `decreaseWithPearl` kombiniert — beide Selektionen im selben Move valid
- [ ] 4.3 Test: `source: 'trade'` mit nicht-2-Perle → `INVALID_MOVE`
- [ ] 4.4 Test: `source: 'trade'` ohne Ability → `INVALID_MOVE`
- [ ] 4.5 Test: 2-Perle doppelt verwendet (trade + hand) → `INVALID_MOVE`

## 5. Frontend: CharacterActivationDialog — virtualDiamonds State

- [ ] 5.1 Neuen State `virtualDiamonds: number` (initial `0`) im Dialog hinzufügen
- [ ] 5.2 Neuen State `tradeSelection: { characterId: string; handCardIndex: number } | null` (initial `null`) hinzufügen
- [ ] 5.3 `tradeTwoForDiamond` zu `PAYMENT_ABILITY_TYPES` hinzufügen (damit der Charakter in `paymentAbilityChars` erscheint)
- [ ] 5.4 Alle Stellen im Dialog die `diamonds` für Validierung oder `decreaseWithPearl`-Verfügbarkeit nutzen auf `diamonds + virtualDiamonds` umstellen:
  - `diamondsReserved >= diamonds` → `diamondsReserved >= diamonds + virtualDiamonds`
  - `validateCostPayment(..., diamonds - diamondsReserved)` → `validateCostPayment(..., diamonds + virtualDiamonds - diamondsReserved)`

## 6. Frontend: CharacterActivationDialog — Trade-Toggle UI

- [ ] 6.1 Im Render-Block der `paymentAbilityChars`: für Charaktere mit `tradeTwoForDiamond`-Ability einen Toggle-Button rendern
- [ ] 6.2 Toggle-Button-Label: z.B. "2-Perle → 💎" mit aktivem/inaktivem Zustand
- [ ] 6.3 Toggle ON-Handler:
  - Ersten freien (nicht in `handSelections`) 2-Perle-Index aus `hand` suchen
  - Falls keiner gefunden: Button bleibt deaktiviert
  - Sonst: `setTradeSelection({ characterId, handCardIndex })`, `setVirtualDiamonds(v => v + 1)`
- [ ] 6.4 Toggle OFF-Handler: `setTradeSelection(null)`, `setVirtualDiamonds(v => v - 1)`
- [ ] 6.5 Toggle deaktivieren wenn keine freie 2-Perle verfügbar (alle 2-Perlen in `handSelections` oder keine in Hand)
- [ ] 6.6 Die reservierte 2-Perle in `CardPicker` visuell als reserviert anzeigen (z.B. gedimmt mit 💎-Overlay)

## 7. Frontend: allSelections — Trade-Selection einbinden

- [ ] 7.1 In `allSelections` (useMemo): wenn `tradeSelection !== null`, `{ source: 'trade', characterId: tradeSelection.characterId, handCardIndex: tradeSelection.handCardIndex, value: 2 }` zum Array hinzufügen
- [ ] 7.2 Sicherstellen dass der reservierte `handCardIndex` in `allSelections` nicht nochmal als `source: 'hand'` auftaucht (Guard: `handSelections.delete(tradeSelection.handCardIndex)` beim Toggle ON, oder Filterung in allSelections)

## 8. Verifikation

- [ ] 8.1 Manuell: Charakter mit `tradeTwoForDiamond` aktiviert — Toggle erscheint in Fähigkeiten-Sektion
- [ ] 8.2 Manuell: Toggle ON mit 2-Perle in Hand — Diamant-Count steigt, 2-Perle als reserviert markiert
- [ ] 8.3 Manuell: Toggle OFF — Diamant-Count sinkt, 2-Perle wieder frei
- [ ] 8.4 Manuell: Toggle + `decreaseWithPearl` kombiniert — beide gleichzeitig nutzbar
- [ ] 8.5 Manuell: Aktivierung mit Trade — 2-Perle verschwindet aus Hand, Diamanten korrekt
- [ ] 8.6 Manuell: Keine 2-Perle in Hand — Toggle deaktiviert
- [ ] 8.7 `make test-shared` grün

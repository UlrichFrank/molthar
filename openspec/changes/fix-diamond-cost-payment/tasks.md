## 1. Datensatz & Typen

- [ ] 1.1 `assets/cards.json`: Captain Hooks `diamond`-Kostenelement um `"value": 1` ergänzen
- [ ] 1.2 `shared/src/game/types.ts`: `PaymentSelection` um `source: 'diamond'` mit `value: number` erweitern

## 2. Validierungslogik

- [ ] 2.1 `shared/src/game/costCalculation.ts`: `validateDiamondCost` korrigieren — `component.value ?? 1` statt `component.value || 0`, und `>=` statt `===`
- [ ] 2.2 `shared/src/game/costCalculation.ts`: Test-Cases für `validateDiamondCost` ergänzen (genau genug, mehr als genug, zu wenig, kein value-Feld)

## 3. Backend-Move

- [ ] 3.1 `shared/src/game/index.ts`: Diamond-Kosten-Abzug in `activatePortalCard` — bereits implementiert durch `diamonds-as-character-cards` (nutzt `c.value ?? 1` und schreibt in `characterDiscardPile`)
- [ ] 3.2 `shared/src/game/index.ts`: Diamond-Kosten-Abzug in `activateSharedCharacter` — bereits implementiert durch `diamonds-as-character-cards` (nutzt `c.value ?? 1` und schreibt in `characterDiscardPile`)

## 4. Frontend — Dialog UI

- [ ] 4.1 `CharacterActivationDialog.tsx`: State für Diamant-Bestätigung hinzufügen (`diamondCostConfirmed: boolean`)
- [ ] 4.2 `CharacterActivationDialog.tsx`: Diamant-Kosten aus `selectedCharacter.cost` ableiten (Summe aller `diamond`-Elemente)
- [ ] 4.3 `CharacterActivationDialog.tsx`: Neue Sektion "Diamanten bezahlen" rendern, wenn `totalDiamondCost > 0` — zeigt benötigte und verfügbare Anzahl, Toggle-Button zum Bestätigen
- [ ] 4.4 `CharacterActivationDialog.tsx`: `allSelections` um `{ source: 'diamond', value: totalDiamondCost }` ergänzen wenn `diamondCostConfirmed`
- [ ] 4.5 `CharacterActivationDialog.tsx`: `isValidPayment`-Berechnung prüft zusätzlich: wenn `totalDiamondCost > 0`, muss `diamondCostConfirmed === true` gelten

## 5. Verifikation

- [ ] 5.1 Captain Hook kann aktiviert werden wenn Spieler 3× Perle-2 und ≥ 1 Diamant hat
- [ ] 5.2 Aktivieren-Button bleibt inaktiv wenn Diamant-Toggle nicht bestätigt
- [ ] 5.3 Diamant wird korrekt vom Spieler abgezogen nach Aktivierung
- [ ] 5.4 Alle bestehenden Shared-Tests laufen durch (`make test-shared`)

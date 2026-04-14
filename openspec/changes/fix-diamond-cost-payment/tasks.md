## 1. Datensatz & Typen

- [x] 1.1 `assets/cards.json`: Captain Hooks `diamond`-Kostenelement um `"value": 1` ergänzen
- [x] 1.2 `shared/src/game/types.ts`: `PaymentSelection` um `source: 'diamond'` mit `value: number` erweitern

## 2. Validierungslogik

- [x] 2.1 `shared/src/game/costCalculation.ts`: `validateDiamondCost` korrigieren — `component.value ?? 1` statt `component.value || 0`, und `>=` statt `===`
- [x] 2.2 `shared/src/game/costCalculation.ts`: Test-Cases für `validateDiamondCost` ergänzen (genau genug, mehr als genug, zu wenig, kein value-Feld)

## 3. Backend-Move

- [x] 3.1 `shared/src/game/index.ts`: Diamond-Kosten-Abzug in `activatePortalCard` — bereits implementiert durch `diamonds-as-character-cards` (nutzt `c.value ?? 1` und schreibt in `characterDiscardPile`)
- [x] 3.2 `shared/src/game/index.ts`: Diamond-Kosten-Abzug in `activateSharedCharacter` — bereits implementiert durch `diamonds-as-character-cards` (nutzt `c.value ?? 1` und schreibt in `characterDiscardPile`)

## 4. Frontend — Dialog UI

- [x] 4.1 `CharacterActivationDialog.tsx`: State für Diamant-Bestätigung hinzufügen (`diamondCostConfirmed: boolean`)
- [x] 4.2 `CharacterActivationDialog.tsx`: Diamant-Kosten aus `selectedCharacter.cost` ableiten (Summe aller `diamond`-Elemente)
- [x] 4.3 `CharacterActivationDialog.tsx`: Neue Sektion "Diamanten bezahlen" rendern, wenn `totalDiamondCost > 0` — zeigt benötigte und verfügbare Anzahl, Toggle-Button zum Bestätigen
- [x] 4.4 `CharacterActivationDialog.tsx`: `allSelections` um `{ source: 'diamond', value: totalDiamondCost }` ergänzen wenn `diamondCostConfirmed`
- [x] 4.5 `CharacterActivationDialog.tsx`: `isValidPayment`-Berechnung prüft zusätzlich: wenn `totalDiamondCost > 0`, muss `diamondCostConfirmed === true` gelten

## 5. Verifikation

- [x] 5.1 Captain Hook kann aktiviert werden wenn Spieler 3× Perle-2 und ≥ 1 Diamant hat
- [x] 5.2 Aktivieren-Button bleibt inaktiv wenn Diamant-Toggle nicht bestätigt
- [x] 5.3 Diamant wird korrekt vom Spieler abgezogen nach Aktivierung
- [x] 5.4 Alle bestehenden Shared-Tests laufen durch (`make test-shared`)

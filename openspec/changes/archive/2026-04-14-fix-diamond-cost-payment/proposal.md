## Why

Karten mit `diamond`-Kostenelementen (z.B. Captain Hook: 3× Perle-2 + 1 Diamant) können nicht aktiviert werden, weil die Validierungslogik fehlerhaft ist und das Dialog-UI keinerlei Möglichkeit bietet, Diamanten als Kostenbestandteil auszuwählen. Da weitere Karten mit Diamantkosten geplant sind, muss die gesamte Unterstützung korrekt implementiert werden.

## What Changes

- `cards.json`: Fehlenden `value`-Wert bei Captain Hooks `diamond`-Kostelement ergänzen (`{ "type": "diamond", "value": 1 }`)
- `types.ts`: `PaymentSelection` um `source: 'diamond'` erweitern, damit das Backend die Diamantzahlung als explizite Selektion erkennt
- `costCalculation.ts`: `validateDiamondCost` korrigieren — `value ?? 1` statt `value || 0`, und `>=` statt `===` für den Vergleich
- `index.ts` (Backend): Diamond-Kosten-Abzug korrigieren (`c.value ?? 1` statt `c.value || 0`)
- `CharacterActivationDialog.tsx`: Neue UI-Sektion für Diamant-Kostenelement — zeigt den benötigten Betrag, der Spieler muss die exakte Anzahl bestätigen; Validierung schlägt fehl wenn nicht bestätigt

## Capabilities

### New Capabilities

- `diamond-cost-payment`: Spieler können Diamanten explizit als Kostenbestandteil im Aktivierungsdialog auswählen und bestätigen — mit Anzeige der benötigten und verfügbaren Anzahl

### Modified Capabilities

- `character-activation-dialog-responsive-sizing`: Der Dialog erhält eine neue Sektion für Diamantkosten (strukturelle Erweiterung)

## Impact

- `assets/cards.json` — Datensatz-Korrektur
- `shared/src/game/types.ts` — PaymentSelection-Typ (potenziell breaking für Konsumenten)
- `shared/src/game/costCalculation.ts` — Validierungslogik
- `shared/src/game/index.ts` (Backend-Move) — Diamant-Abzugslogik
- `game-web/src/components/CharacterActivationDialog.tsx` — UI-Erweiterung

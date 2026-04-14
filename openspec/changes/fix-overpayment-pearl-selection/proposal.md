## Why

Beim Aktivieren einer Charakterkarte prüft `validateCostPayment` nur, ob die ausgewählten Karten die Kosten *erfüllen* — nicht, ob sie sie *exakt* erfüllen. Wählt der Spieler mehr Karten als nötig, bleibt der Aktivierungs-Button aktiv, und alle überzähligen Karten werden zusammen mit den notwendigen entfernt. Das führt zu ungewolltem Kartenverlust und entspricht nicht der Spielregel, nach der genau der geforderte Betrag bezahlt wird.

## What Changes

- Der Aktivierungs-Button wird deaktiviert, wenn die Auswahl zwar die Kosten erfüllt, aber mehr Karten ausgewählt sind als mindestens nötig (Überzahlung erkannt)
- Dem Spieler wird eine klare Rückmeldung gegeben, warum der Button deaktiviert ist ("Zu viele Karten ausgewählt")
- Die Backend-Validierung in `activatePortalCard` erhält eine Gegenprüfung: überschüssige Karten führen zum `INVALID_MOVE`

## Capabilities

### New Capabilities
- `payment-exact-selection`: Der Zahlungsfluss im Aktivierungsdialog lässt nur exakt passende Auswahlen zu — keine Überzahlung möglich.

### Modified Capabilities

## Impact

- `game-web/src/components/CharacterActivationDialog.tsx` — `isValidPayment`-Logik erweitern: Überzahlungs-Check
- `shared/src/game/index.ts` — `activatePortalCard`-Move: Backend-Validierung gegen Überzahlung
- `shared/src/game/costCalculation.ts` — ggf. neue Hilfsfunktion zum Prüfen ob ein Subset der Auswahl bereits ausreichend wäre

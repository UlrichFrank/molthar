## Why

Wenn ein Spieler eine offen ausliegende Charakterkarte anklickt und sein Portal bereits voll ist, öffnet sich der Austauschdialog sofort — ohne Möglichkeit abzubrechen. Der Spieler ist gezwungen, entweder eine bestehende Portalkarte zu ersetzen oder die neue Karte zu verwerfen. Für offene Auslagekarten ist dies zu restriktiv: Der Spieler hat die Karte bewusst offen gesehen und sollte die Wahl haben, die Aktion doch nicht durchzuführen.

Bei verdeckt gezogenen Karten (Stapel) bleibt das bisherige Verhalten korrekt: Die Karte wurde bereits gezogen und ist nicht mehr anonym — ein Abbrechen wäre ein Informationsvorteil.

## What Changes

- Im `CharacterReplacementDialog` wird ein optionaler „Abbrechen"-Button ergänzt.
- Beim Klick auf eine offen ausliegende Karte (Auslage, `slotIndex >= 0`) mit vollem Portal wird der Dialog mit `canCancel = true` geöffnet → Abbrechen schließt den Dialog ohne Move.
- Beim Blind-Ziehen vom Stapel (`slotIndex = -1`) mit vollem Portal bleibt `canCancel = false` → kein Abbrechen möglich.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `take-character-card-dialog`: Das Verhalten des Austauschdialogs bei belegtem Portal unterscheidet sich je nach Kartenquelle (Auslage vs. Stapel). Bei Auslagekarten wird ein Abbrechen-Button ergänzt.

## Impact

- `game-web/src/components/CharacterReplacementDialog.tsx`: neues `canCancel`/`onCancel`-Prop
- `game-web/src/components/CanvasGameBoard.tsx`: `onCancel`-Handler im Replacement-Dialog verdrahten; Auslage-Klick gibt `canCancel = true` mit
- `game-web/src/contexts/DialogContext.tsx`: `canCancel`-Flag im `replacement`-Dialog-State ergänzen

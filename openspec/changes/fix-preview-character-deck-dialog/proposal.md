## Why

Die `previewCharacter`-Fähigkeit (blaue Karte: "Deck vor der ersten Aktion einsehen") hat zwei Probleme:

1. **Bug:** Die Karte des Nachziehstapels wird immer offen angezeigt sobald die Fähigkeit aktiv ist — auch mitten im Zug. Der Dialog-Parameter `faceDown` hängt nur davon ab ob die Fähigkeit *existiert* (`!hasPreviewAbility`), nicht ob die Karte tatsächlich *gepeekt* wurde (`peekedCard === null`).

2. **UX:** Das Einsehen erfolgt über einen zweistufigen Flip-Flow: erster Klick dreht die Karte um, zweiter Klick öffnet den Bestätigungs-Dialog. Das ist intransparent und bietet keinen Abbrechen-Button nach dem ersten Klick. Stattdessen soll beim Peek direkt der Portal-Dialog geöffnet werden — der die neue Karte und alle Portal-Slots zeigt (leer wenn unbelegt) — mit immer verfügbarem Abbrechen.

## What Changes

- `game-web/src/components/CanvasGameBoard.tsx`: `faceDown`-Berechnung korrigieren: `!hasPreviewAbility` → `peekedCard === null`
- `game-web/src/components/CanvasGameBoard.tsx`: Peek-Flow umbauen — statt zweistufig (peek → Take-Dialog) direkt Portal-Dialog öffnen
- `game-web/src/components/CharacterReplacementDialog.tsx`: Leere Portal-Slots als auswählbare Optionen darstellen (wenn Portal nicht voll)

## Capabilities

### New Capabilities

### Modified Capabilities
- `take-character-card-dialog`: Peek-Szenario (previewCharacter, vor erster Aktion) zeigt jetzt Portal-Dialog statt separaten Vorschau-Dialog; leere Slots werden dargestellt; Abbrechen immer möglich

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — Click-Handler für `deck-character`
- `game-web/src/components/CharacterReplacementDialog.tsx` — leere Slots darstellen
- `game-web/src/contexts/DialogContext.tsx` — ggf. `canCancel` für Peek-Pfad setzen

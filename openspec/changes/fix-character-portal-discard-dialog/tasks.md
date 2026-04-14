## 1. Reproduktion & Root-Cause

- [ ] 1.1 Bug reproduzieren: Charakterkarte aus Auslage holen (Portal voll) → "Verwerfen" klicken → prüfen ob Dialog offen bleibt
- [ ] 1.2 Bug reproduzieren: Charakterkarte aus Auslage holen (Portal hat Platz) → Bestätigen → prüfen ob `pendingTakeCardFromDisplay` korrekt auf null gesetzt wird
- [ ] 1.3 Root Cause identifizieren: Ist es ein fehlender `closeDialog()`-Aufruf, ein stale `characterIndex`, oder ein useEffect der Dialog wieder öffnet?

## 2. Fix — Stabiler Slot-Index im ReplacementDialog

- [ ] 2.1 `game-web/src/contexts/DialogContext.tsx`: `replacement`-Dialogtyp um optionales Feld `slotIndex?: number` erweitern
- [ ] 2.2 `game-web/src/components/CanvasGameBoard.tsx`: `openReplacementDialog`-Aufruf für Auslage-Karten (auslage-card, id < 2) den `slotIndex` (= `id`) mitgeben
- [ ] 2.3 `game-web/src/components/CanvasGameBoard.tsx`: `openReplacementDialog`-Aufruf für Deck-Karten (`deck-character`-Pfad) mit `slotIndex: -1` versehen
- [ ] 2.4 `game-web/src/components/CanvasGameBoard.tsx`: `onDiscard`-Callback: `characterIndex` aus `dialog.dialog.slotIndex` nehmen (nicht per `findIndex` aus `G.characterSlots`) 
- [ ] 2.5 `game-web/src/components/CanvasGameBoard.tsx`: `onSelect`-Callback: analog `slotIndex` aus `dialog.dialog.slotIndex` verwenden

## 3. Fix — Dialog-Close sicherstellen

- [ ] 3.1 Sicherstellen dass in allen Pfaden (onConfirm, onDiscard, onSelect, onCancel) `dialog.closeDialog()` oder `setPendingTakeCardFromDisplay(null)` zuverlässig aufgerufen wird (Code-Review aller Callbacks)
- [ ] 3.2 Falls ein useEffect den Dialog re-öffnet: Bedingung so anpassen dass der Dialog nach explizitem Schließen nicht erneut erscheint (type-guard in useEffect)

## 4. Verifikation

- [ ] 4.1 Auslage-Karte nehmen (Portal hat Platz) → Bestätigen → Dialog schließt sich ✓
- [ ] 4.2 Auslage-Karte nehmen (Portal voll) → Karte ersetzen → Dialog schließt sich ✓
- [ ] 4.3 Auslage-Karte nehmen (Portal voll) → Verwerfen → Dialog schließt sich ✓
- [ ] 4.4 Abbrechen → Dialog schließt sich, kein Move ausgeführt ✓
- [ ] 4.5 Schnell mehrfach klicken → Dialog öffnet/schließt korrekt, kein ungewolltes Doppel-Öffnen ✓

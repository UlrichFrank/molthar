## 1. Bug-Fix — faceDown-Berechnung

- [ ] 1.1 `game-web/src/components/CanvasGameBoard.tsx`: `faceDown: !hasPreviewAbility` ersetzen durch `faceDown: peekedCard === null` im `setPendingTakeCardFromDeck`-Aufruf

## 2. Type-Anpassung — leere Portal-Slots

- [ ] 2.1 `game-web/src/contexts/DialogContext.tsx`: `portalCharacters: CharacterCard[]` → `portalCharacters: (CharacterCard | null)[]` im `replacement`-DialogState
- [ ] 2.2 `game-web/src/components/CharacterReplacementDialog.tsx`: Props-Typ `portalCards: CharacterCard[]` → `portalCards: (CharacterCard | null)[]`
- [ ] 2.3 `game-web/src/components/CharacterReplacementDialog.tsx`: Null-Einträge als leere Slot-Platzhalter rendern (gestrichelter Rahmen, gleiche Größe, klickbar → `onSelect(idx)`)

## 3. Peek-Flow — Portal-Dialog beim ersten Klick

- [ ] 3.1 `game-web/src/components/CanvasGameBoard.tsx`: Im `deck-character`-Click-Handler den Peek-Pfad (`hasPreviewAbility && actionCount===0`) umbauen: nach `moves.peekCharacterDeck()` sofort `dialog.openReplacementDialog(topCard, portalSlots, true, true)` aufrufen statt auf zweiten Klick zu warten
- [ ] 3.2 `game-web/src/components/CanvasGameBoard.tsx`: `portalSlots` für den Aufruf berechnen: `[me.portal[0]?.card ?? null, me.portal[1]?.card ?? null]`
- [ ] 3.3 `game-web/src/components/CanvasGameBoard.tsx`: Im `onSelect`-Callback des Peek-Dialogs: `me.portal.length < 2` → `moves.takeCharacterCard(-1)` (kein replacedSlotIndex); `me.portal.length >= 2` → `moves.takeCharacterCard(-1, idx)`
- [ ] 3.4 `game-web/src/components/CanvasGameBoard.tsx`: Den nun obsoleten zweiten Peek-Pfad (`else if (hasPreviewAbility && peekedCard) → takeCharCard()`) entfernen

## 4. Verifikation

- [ ] 4.1 Manuelle Prüfung: Spieler mit previewCharacter klickt Stapel (vor erster Aktion) → Portal-Dialog öffnet sofort mit Karte offen + leeren Slots sichtbar + Abbrechen-Button aktiv
- [ ] 4.2 Manuelle Prüfung: Abbrechen → kein Move, Spieler kann andere Aktion ausführen
- [ ] 4.3 Manuelle Prüfung: Spieler mit previewCharacter klickt Stapel mitten im Zug → Karte verdeckt im Dialog (nicht offen)
- [ ] 4.4 Manuelle Prüfung: Portal mit 1 Karte → Dialog zeigt 1 Karte + 1 leerer Slot; Klick auf leeren Slot legt Karte dort ab
- [ ] 4.5 Manuelle Prüfung: Portal voll (2 Karten) → Dialog zeigt beide Karten; Klick auf eine ersetzt sie

## 0. Backend: Verwerfen-Move

- [x] 0.1 Neuen Move `discardPickedCharacterCard(slotIndex: number)` in `shared/src/game/index.ts` anlegen — nimmt die Karte aus `characterSlots[slotIndex]` (oder bei `slotIndex === -1` vom `characterDeck`) und legt sie auf `characterDiscardPile`; erhöht `actionCount`; gibt `INVALID_MOVE` zurück wenn `actionCount >= maxActions` oder Karte nicht vorhanden

## 1. Neue Dialog-Komponente: CharacterTakePreviewDialog

- [x] 1.1 `game-web/src/components/CharacterTakePreviewDialog.tsx` anlegen — Dialog mit Kartenanzeige (Vorder- oder Rückseite via `faceDown`-Prop), Bestätigen- und Abbrechen-Button; verwendet `GameDialog`/`GameDialogTitle` als Wrapper
- [x] 1.2 Kartenrückseite rendern: wenn `faceDown={true}`, statt `<img src=card.imageName>` das Rückseitenbild (`/assets/card-back.png` o. Ä.) anzeigen
- [x] 1.3 Props-Interface definieren: `{ card: CharacterCard; faceDown?: boolean; onConfirm: () => void; onCancel: () => void }`

## 2. CharacterReplacementDialog um Verwerfen-Option erweitern

- [x] 2.1 `onDiscard: () => void`-Prop zum Interface hinzufügen — wird aufgerufen wenn der Spieler die neue Karte verwirft
- [x] 2.2 `canDiscard?: boolean`-Prop (default `true`) hinzufügen — steuert ob der Verwerfen-Button aktiv ist
- [x] 2.3 Bisherigen Cancel-Button durch einen „Verwerfen"-Button ersetzen, der `onDiscard` aufruft; bei `canDiscard={false}` deaktivieren (`disabled`-Attribut + visuelles Feedback)

## 3. CanvasGameBoard — Auslage-Karte: Dialog-Zwischenschritt

- [x] 3.1 Lokalen State für den Vorschau-Dialog anlegen: `pendingTakeCardFromDisplay: { card: CharacterCard; slotIndex: number } | null`
- [x] 3.2 Im `auslage-card`-Case von `handleRegionClick`: wenn Portal nicht voll, statt `moves.takeCharacterCard(id)` den Vorschau-State setzen
- [x] 3.3 `<CharacterTakePreviewDialog>` im JSX rendern wenn `pendingTakeCardFromDisplay !== null`; `onConfirm` ruft `moves.takeCharacterCard(slotIndex)` auf und schließt den Dialog; `onCancel` schließt nur

## 4. CanvasGameBoard — Charakterstapel: Dialog-Zwischenschritt

- [x] 4.1 Lokalen State für den Stapel-Vorschau-Dialog anlegen: `pendingTakeCardFromDeck: { card: CharacterCard; faceDown: boolean } | null`
- [x] 4.2 Im `deck-character`-Case: wenn Portal nicht voll, statt `moves.takeCharacterCard(-1)` den Stapel-Vorschau-State setzen; `faceDown = !hasPreviewAbility`
- [x] 4.3 `<CharacterTakePreviewDialog>` mit korrekter `faceDown`-Prop rendern; `onConfirm` ruft `moves.takeCharacterCard(-1)` auf

## 5. CanvasGameBoard — Austauschdialog: Verwerfen-Callbacks verdrahten

- [x] 5.1 Im `auslage-card`-Case: `openReplacementDialog`-Aufruf (Portal voll) um den Kartenindex erweitern, sodass der `onDiscard`-Callback `moves.discardPickedCharacterCard(characterIndex)` aufruft
- [x] 5.2 Im `deck-character`-Case: `openReplacementDialog`-Aufruf (Portal voll) um `canDiscard={false}` ergänzen wenn kein previewCharacter-Fähigkeit vorhanden (Blind-Pflichtaustausch); `onDiscard` bleibt verdrahtet aber Button ist deaktiviert
- [x] 5.3 `<CharacterReplacementDialog>` im JSX mit `onDiscard`- und `canDiscard`-Props rendern

## 6. Qualitätssicherung

- [x] 6.1 Manuelle Smoke-Tests: Auslage-Karte nehmen (Portal leer → Vorschau → Bestätigen / Abbrechen), Stapel nehmen ohne Fähigkeit (Rückseite), Stapel nehmen mit `previewCharacter` (Vorderseite), Portal voll + Auslage (Austauschdialog mit aktivem Verwerfen-Button), Portal voll + Stapel blind (Austauschdialog, Verwerfen deaktiviert)
- [x] 6.2 TypeScript-Typen prüfen: `cd game-web && pnpm run type-check` ohne Fehler

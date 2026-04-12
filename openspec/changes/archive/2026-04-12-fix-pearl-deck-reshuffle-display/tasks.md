## 1. Backend: Proaktiver Reshuffle in takePearlCard

- [x] 1.1 In `shared/src/game/index.ts`, im `slotIndex === -1`-Zweig von `takePearlCard`: nach `G.pearlDeck.pop()` prüfen ob `G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0`; falls ja, Ablagestapel in Nachziehstapel verschieben, `shuffleArray` aufrufen und `G.isReshufflingPearlDeck = true` setzen

## 2. Backend: Reshuffle-Flags in turn.onBegin zurücksetzen

- [x] 2.1 In `shared/src/game/index.ts`, in `turn.onBegin`: `G.isReshufflingPearlDeck = false` und `G.isReshufflingCharacterDeck = false` am Anfang des Hooks hinzufügen (vor der bestehenden Logik)

## 3. Frontend: acknowledgeReshuffle nur für aktiven Spieler

- [x] 3.1 In `game-web/src/components/CanvasGameBoard.tsx`, bei beiden `DeckReshuffleAnimation`-Instanzen: `onDone` auf `isActive ? () => moves.acknowledgeReshuffle?.('pearl') : () => {}` bzw. `'character'` ändern

## 4. Verifikation

- [ ] 4.1 Manuell: Letzten Perlendeckstein direkt vom Stapel nehmen (wenn Auslage voll) → Reshuffle-Animation erscheint sofort
- [ ] 4.2 Manuell: Animation erscheint und verschwindet automatisch nach ca. 1,5 s (ohne weiteren Klick)
- [ ] 4.3 Manuell: Bei Zugwechsel vor Ablauf der Animation verschwindet die Animation beim nächsten Zugbeginn

## 1. Frontend: Rendering — drawDeckStack erweitern

- [ ] 1.1 `drawDeckStack` in `game-web/src/lib/gameRender.ts` um optionalen Parameter `peekedCard?: CharacterCard` erweitern
- [ ] 1.2 Im Loop: wenn `peekedCard` gesetzt und `i === visibleCards - 1` (oberste Karte), das Kartenbild der aufgedeckten Karte statt der Rückseite zeichnen (`drawImageOrFallback` mit Karten-Bild-ID)
- [ ] 1.3 Hinweistext "Klick zum Nehmen" als Canvas-Text neben/unter dem Charakter-Deck zeichnen, wenn `peekedCard` gesetzt ist (nur für aktiven Spieler)

## 2. Frontend: Rendering — drawDeckStack-Aufruf anpassen

- [ ] 2.1 In `game-web/src/lib/gameRender.ts` bzw. `CanvasGameBoard.tsx`: `peekedCard` des aktuellen Spielers (`me.peekedCard`) an den `drawDeckStack`-Aufruf für den Charakter-Stapel übergeben

## 3. Frontend: Klick-Logik in CanvasGameBoard

- [ ] 3.1 Im `case 'deck-character'`-Handler in `CanvasGameBoard.tsx`: `hasPreviewAbility` aus `me.activeAbilities` ableiten
- [ ] 3.2 Dreiteilige Kondition implementieren:
  - `hasPreviewAbility && actionCount === 0 && !me.peekedCard` → `moves.peekCharacterDeck()`
  - `hasPreviewAbility && me.peekedCard` → Karte nehmen (Replacement-Dialog oder `takeCharacterCard(-1)`)
  - Sonst → Karte nehmen (bisheriges Verhalten unverändert)

## 4. Verifikation

- [ ] 4.1 Manuell: Karte mit `previewCharacter` aktivieren, auf Charakter-Deck klicken vor erster Aktion → Karte dreht sich um, kein Zug
- [ ] 4.2 Manuell: Zweiter Klick → Karte wird genommen
- [ ] 4.3 Manuell: Eine Aktion ausführen, dann auf Deck klicken → direkt ziehen, kein Preview
- [ ] 4.4 Manuell: Ohne Ability auf Deck klicken → unverändertes Verhalten

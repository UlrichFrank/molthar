## Context

Das Spiel verwendet zwei Nachziehstapel: Perlenkarten (`pearlDeck`) und Charakterkarten (`characterDeck`), jeweils mit einem Ablagestapel. Die Hilfsfunktion `drawCard()` in `shared/src/game/index.ts` mischt den Ablagestapel proaktiv in den Nachziehstapel, **bevor** sie zieht — aber nur, wenn das Deck beim Aufruf bereits leer ist.

**Pearl-Bug:** `takePearlCard` mit `slotIndex = -1` ruft `drawCard()` korrekt auf. Ist die letzte Karte noch im Deck, zieht `drawCard` sie ohne Reshuffle. Anschließend ruft `refillSlots` die Auslage nach — aber wenn die Auslage bereits voll (4 Slots) ist, werden keine weiteren Karten gezogen und kein Reshuffle ausgelöst. Das Deck bleibt leer, obwohl der Ablagestapel Karten enthält.

**Charakter-Bug:** `takeCharacterCard` und `discardPickedCharacterCard` verwenden für `slotIndex = -1` direkt `G.characterDeck.pop()`. Ist das Deck leer, gibt `.pop()` `undefined` zurück und der Move gibt `INVALID_MOVE` zurück — obwohl der Ablagestapel einen sofortigen Reshuffle ermöglichen würde.

## Goals / Non-Goals

**Goals:**
- Direktes Ziehen von der leeren Deckoberseite löst immer einen Reshuffle aus, wenn der Ablagestapel Karten enthält
- Beide Decks (Perlenkarten und Charakterkarten) verhalten sich konsistent
- Reshuffle-Flags (`isReshufflingPearlDeck`, `isReshufflingCharacterDeck`) werden korrekt gesetzt

**Non-Goals:**
- Änderungen am Frontend oder an Animationen (Reshuffle-Flags existieren bereits)
- Änderungen an `refillSlots` oder `drawCard` selbst
- Reshuffle-Verhalten beim Auffüllen der Auslage (funktioniert bereits korrekt)

## Decisions

**Decision: Pearl-Reshuffle nach letzter Deck-Karte**

Nach dem `drawCard`-Aufruf in `takePearlCard` (slotIndex = -1): Wenn das Deck danach leer ist (`G.pearlDeck.length === 0`), der Ablagestapel Karten hat (`G.pearlDiscardPile.length > 0`) und die Auslage voll ist (`G.pearlSlots.length >= 4`), wird sofort ein Reshuffle ausgelöst.

Warum dieser Ansatz statt Änderung von `drawCard`: `drawCard` reshuffle vor dem Ziehen (lazy). Der neue Fall ist ein proaktiver Reshuffle *nach* dem Ziehen. Die Logik ist explizit in `takePearlCard` besser lesbar als eine Erweiterung der generischen Hilfsfunktion.

**Decision: Character-Deck — `.pop()` durch `drawCard()` ersetzen**

`takeCharacterCard` und `discardPickedCharacterCard` ersetzen `G.characterDeck.pop()` durch `drawCard(G.characterDeck, G.characterDiscardPile, () => { G.isReshufflingCharacterDeck = true; })`. Damit ist das Verhalten identisch zu `takePearlCard`.

## Risks / Trade-offs

- **Doppel-Reshuffle bei Pearl:** Wenn die Auslage nicht voll ist, löst `refillSlots` den Reshuffle aus. Der neue proaktive Reshuffle greift nur wenn `pearlSlots.length >= 4`, d.h. kein Doppel-Reshuffle möglich.
- **isReshufflingCharacterDeck bei discardPickedCharacterCard:** Bisher kein Flag-Setzen beim direkten Discard. Mit `drawCard` wird das Flag gesetzt, wenn ein Reshuffle stattfindet — semantisch korrekt, da eine Animation sinnvoll ist.

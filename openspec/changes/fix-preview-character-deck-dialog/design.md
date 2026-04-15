## Context

`CanvasGameBoard.tsx` hat im Click-Handler für `deck-character` drei Pfade:

```
if (hasPreviewAbility && actionCount===0 && !peekedCard)  → moves.peekCharacterDeck()
else if (hasPreviewAbility && peekedCard)                 → takeCharCard() [faceDown=false]
else                                                       → takeCharCard() [faceDown=false ← BUG]
```

Das `faceDown`-Flag in `takeCharCard()` lautet `!hasPreviewAbility` — immer `false` wenn die
Fähigkeit existiert, unabhängig ob tatsächlich gepeekt wurde. Außerdem ist der Peek-Flow
zweistufig (erster Klick = Peek, zweiter Klick = Dialog) und ohne Cancel-Möglichkeit nach
dem ersten Klick.

`CharacterReplacementDialog` erwartet `portalCards: CharacterCard[]` und kann leere Slots
nicht darstellen.

## Goals / Non-Goals

**Goals:**
- Bug fixen: mid-turn Deck-Klick mit previewCharacter zeigt Karte verdeckt
- Peek-Flow: ein einziger Klick öffnet direkt den Portal-Dialog (statt zwei Klicks)
- Portal-Dialog zeigt immer beide Slots — leer wenn unbelegt
- Abbrechen immer möglich beim Peek

**Non-Goals:**
- Veränderung des Peek-Flows für Auslage-Karten
- Veränderung des mid-turn Deck-Klick-Flows (ohne Peek)
- Änderung der `peekCharacterDeck`-Server-Logik

## Decisions

### 1. faceDown-Fix: eine Zeile

```typescript
// Alt (buggy):
setPendingTakeCardFromDeck({ card: topCard, faceDown: !hasPreviewAbility });

// Neu:
setPendingTakeCardFromDeck({ card: topCard, faceDown: peekedCard === null });
```

`peekedCard` ist null nach der ersten Aktion (cleared in `onMove`) und null wenn nie gepeekt
— in beiden Fällen soll die Karte verdeckt sein.

### 2. Peek-Flow: sofort Portal-Dialog statt zweiter Klick

```
VORHER:
Klick 1 → moves.peekCharacterDeck()   [Karte dreht sich auf dem Stapel um]
Klick 2 → CharacterTakePreviewDialog  [Karte offen, Bestätigen/Abbrechen]

NACHHER:
Klick 1 → moves.peekCharacterDeck()   [Karte dreht sich auf dem Stapel um]
         + openReplacementDialog(      [Portal-Dialog öffnet sofort]
             topCard,
             portalSlots,              ← [null, null] / [card, null] / [card, card]
             canDiscard=true,
             canCancel=true
           )
```

`G.characterDeck` ist im Client-State sichtbar — der Top-of-Deck kann direkt als
`G.characterDeck[G.characterDeck.length - 1]` gelesen werden, ohne auf den Server-Move
zu warten. Falls `peekedCard` bereits gesetzt (User hat abgebrochen und nochmal geklickt),
wird der Move nicht nochmals aufgerufen.

`portalSlots` wird als `(CharacterCard | null)[]` mit immer genau 2 Einträgen übergeben:
```typescript
const portalSlots: (CharacterCard | null)[] = [
  me.portal[0]?.card ?? null,
  me.portal[1]?.card ?? null,
];
```

### 3. CharacterReplacementDialog — leere Slots

`portalCards` wird von `CharacterCard[]` auf `(CharacterCard | null)[]` erweitert.
Null-Einträge rendern als leeres Slot-Placeholder-Element (gestrichelter Rahmen,
gleiche Größe wie Karte), klickbar → `onSelect(idx)`.

```typescript
// DialogContext.tsx — portalCharacters type update
portalCharacters: (CharacterCard | null)[]
```

### 4. onSelect-Handler im Peek-Pfad

```typescript
onSelect={(idx) => {
  // Portal hat Platz (leere Slots) → kein replacedSlotIndex nötig
  // Portal voll → replacedSlotIndex = idx
  if (me.portal.length < 2) {
    moves.takeCharacterCard(-1);
  } else {
    moves.takeCharacterCard(-1, idx);
  }
  dialog.closeDialog();
}}
```

## Risks / Trade-offs

- **`portalCharacters` Type-Änderung**: `DialogContext` und alle Aufrufer von
  `openReplacementDialog` müssen geprüft werden — bisher kommen nur reale Karten rein.
  Der einzige neue Aufrufer (Peek-Pfad) übergibt `null`. Bestehende Aufrufer übergeben
  weiterhin `CharacterCard[]` (TypeScript-kompatibel mit `(CharacterCard | null)[]`).
- **peekCharacterDeck + sofortiger Dialog**: Der Move ist async (server round-trip),
  der Dialog öffnet sich aber sofort mit dem Deck-Top aus Client-State. Falls der Move
  fehlschlägt (Kantenfälle), ist der Dialog trotzdem offen. Akzeptabel da peekCharacterDeck
  keine Spielzustandsänderung hat die scheitern könnte (außer Fähigkeit fehlt — dann
  ist der Button sowieso nicht im Peek-Pfad).

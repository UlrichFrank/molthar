## Context

In `toggleHandCard` (`CharacterActivationDialog.tsx:105`):

```typescript
const toggleHandCard = (idx: number) => {
  const next = new Map(handSelections);
  if (next.has(idx)) {
    next.delete(idx);
  } else {
    const card = hand[idx]!;
    let initialValue = card.value;
    let abilityType: CharacterAbility['type'] | undefined;
    // Auto-apply onesCanBeEights          ← BUG
    if (hasOnesCanBeEights && card.value === 1) {
      initialValue = 8;
      abilityType = 'onesCanBeEights';
    }
    next.set(idx, { handCardIndex: idx, value: initialValue, abilityType });
  }
};
```

Der per-Karte-Badge (Section 1) für `onesCanBeEights` hat bereits vollständige Toggle-Logik:
- Klick bei `abilityType === 'onesCanBeEights'` → `resetHandCard` (deaktiviert)
- Klick sonst → `setHandCardValue(idx, 8, 'onesCanBeEights')` (aktiviert)

Das Pattern ist identisch zu `decreaseWithPearl`, das **kein** Auto-Apply hat. `onesCanBeEights` sollte sich genauso verhalten.

## Goals / Non-Goals

**Goals:**
- 1-Perlenkarten starten beim Auswählen im Normalzustand (value=1, kein abilityType)
- Spieler aktiviert `1→8` manuell per Badge-Klick — identisches Verhalten wie `decreaseWithPearl`
- Badge zeigt gedimmt (inaktiv) beim ersten Erscheinen

**Non-Goals:**
- Keine Layout-Änderungen
- Keine Änderungen an `setHandCardValue`, `resetHandCard` oder den Badge-Render-Pfaden
- Keine Backend-Änderungen

## Decisions

**Einfaches Entfernen des Auto-Apply-Blocks**

Die 3-zeilige `if (hasOnesCanBeEights && card.value === 1)`-Bedingung wird entfernt. Kein Ersatz nötig — die Badge-Klick-Logik übernimmt die Aktivierung.

## Risks / Trade-offs

- Minimales Risiko: rein UI-seitig, keine Game-State-Änderung.
- Spieler, die bisher auf die Auto-Aktivierung vertraut haben, müssen nun einmal klicken. Das ist das korrekte Verhalten.

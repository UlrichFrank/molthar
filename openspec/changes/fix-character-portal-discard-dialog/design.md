## Context

Es gibt zwei Dialog-Flows, die beim Holen einer offenen Charakterkarte relevant sind:

**Flow A — Portal hat Platz:** `CharacterTakePreviewDialog` öffnet sich. Bei Bestätigung: `moves.takeCharacterCard(slotIndex)` + `setPendingTakeCardFromDisplay(null)`. Dialog schließt über React-State (konditionelles Rendern `{pendingTakeCardFromDisplay && ...}`).

**Flow B — Portal voll:** `CharacterReplacementDialog` öffnet sich. Bei "Verwerfen": `moves.discardPickedCharacterCard(characterIndex)` + `dialog.closeDialog()`. Bei Karten-Auswahl (Ersetzen): `moves.takeCharacterCard(characterIndex, replacedSlotIndex)` + `dialog.closeDialog()`.

Der Bug "Dialog schließt sich nicht" tritt in einem dieser Flows auf. Wahrscheinlichste Kandidaten:

1. **Stale `characterIndex`**: In Flow B sucht `onDiscard` die Karte in `G.characterSlots` zum Zeitpunkt des Klicks. Ist die boardgame.io-State-Update bereits eingegangen (z. B. durch Optimistic Update), ist die Karte nicht mehr im Slot → `characterIndex = -1` → Move schlägt fehl oder tut Unerwartetes. `dialog.closeDialog()` wird trotzdem aufgerufen, Dialog schließt sich scheinbar — aber die Karte ist noch im Display und der Spieler klickt wieder.

2. **Missing `closeDialog` in einem Code-Pfad**: Der CharacterTakePreviewDialog (Flow A) schließt nicht über `closeDialog()` sondern über `setPendingTakeCardFromDisplay(null)`. Wenn dieser Aufruf ausbleibt oder der State nicht sofort aktualisiert wird, bleibt der Dialog sichtbar.

3. **Re-Open durch boardgame.io-State-Update**: Nach `dialog.closeDialog()` kommt ein neuer `G`-State, der `pendingDiscardOpponentCharacter` oder ähnliches setzt und per useEffect einen anderen Dialog öffnet — visuell sieht es aus wie "schließt sich nicht".

## Goals / Non-Goals

**Goals:**
- Identifizieren in welchem Flow der Bug liegt (durch Code-Analyse + Reproduktion)
- Sicherstellen dass in allen Pfaden Dialog sicher schließt: close-Aufruf atomar mit Move
- Robuste `characterIndex`-Ermittlung: Karte über stabiles ID-Lookup, nicht über `G.characterSlots` zum Callback-Zeitpunkt

**Non-Goals:**
- Redesign der Dialog-Architektur (DialogContext bleibt)
- Änderungen am Backend (Moves bleiben semantisch gleich)

## Decisions

### 1. characterIndex über gespeicherte Slot-ID, nicht über G.characterSlots-Lookup zur Laufzeit

```typescript
// Alt (fehleranfällig wenn G.characterSlots sich ändert):
const characterIndex = G.characterSlots.findIndex(c => c?.id === dialog.dialog.newCharacter.id);

// Neu: slotIndex beim Öffnen des Dialogs speichern:
dialog.openReplacementDialog(newCharacter, portalCharacters, slotIndex, true, true);
// Im Dialog-State: slotIndex als extra Feld mitführen
```

Der `openReplacementDialog`-Aufruf bekommt den `slotIndex` (0 oder 1) direkt übergeben, sodass die `onDiscard`/`onSelect`-Callbacks nicht mehr `G.characterSlots.findIndex` aufrufen müssen.

### 2. Deduplizierung des Close-Aufrufs

Alle Dialog-Close-Aufrufe (`dialog.closeDialog()`) und State-Resets (`setPendingTakeCardFromDisplay(null)`) werden direkt nach dem Move aufgerufen — kein bedingtes Schließen.

### 3. Reproduktions-Test zuerst

Vor der Fix-Implementierung: minimale Reproduktion im Frontend (Browser-DevTools, React-State-Inspector), um Flow A vs. Flow B zu identifizieren. Der Fix richtet sich nach dem tatsächlichen Pfad.

## Risks / Trade-offs

- **slotIndex-Erweiterung von DialogState**: `replacement`-State bekommt ein neues optionales Feld `slotIndex?: number`. Bestehende Aufrufe ohne slotIndex bleiben kompatibel (für Deck-Karten).
- **Timing boardgame.io**: Optimistic Updates können `G` sofort ändern. Close-Aufrufe müssen unabhängig vom Move-Ergebnis ausgeführt werden.

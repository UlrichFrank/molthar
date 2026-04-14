## Context

`G.pearlSlots` ist aktuell ein dichtes `PearlCard[]`. Wenn Slot X entnommen wird, entfernt `splice(slotIndex, 1)` den Eintrag und `refillSlots` schiebt eine neue Karte ans Ende. Das verschiebt alle Positionen dahinter — optisch "rücken die Karten auf". Canvas-Klick-Handling verwendet `slotIndex` (0–3) als direkte Array-Position; nach dem Shift zeigt derselbe Index auf eine andere Karte.

Betroffen sind:
- `shared/src/game/types.ts` — Typdefinition
- `shared/src/game/index.ts` — `setup`, `takePearlCard`, `replacePearlSlots`, `applyPearlRefreshIfNeeded`
- `game-web/src/lib/canvasRegions.ts` — `pearlSlots[i]` in Region-Aufbau
- `game-web/src/lib/gameRender.ts` — `pearlSlots[pearlIdx]` bei Kartenzeichnung
- `game-web/src/components/CanvasGameBoard.tsx` — `pearlSlots[pearlIdx]` in Click-Handler
- Tests: `abilities.test.ts`, `pearlRefresh.test.ts`, `reshuffle.test.ts`

## Goals / Non-Goals

**Goals:**
- Slot X nach Entnahme erhält sofort die Nachziehkarte (In-Place-Ersatz)
- Positionen 0–3 bleiben stabil; kein Shift benachbarter Karten
- Leere Slots (Deck leer) werden als `null` dargestellt, nicht als verkürzte Liste

**Non-Goals:**
- Änderungen am Charakter-Auslage-System (analog aufgebaut, separates Thema)
- Visuelle Animation des Nachziehens (eigenes Change-Proposal)
- Änderungen am Deck-Slot (Slot -1, Ziehen vom Nachziehstapel)

## Decisions

### 1. `pearlSlots: (PearlCard | null)[]` — immer 4 Elemente

**Gewählt:** Festes 4-Element-Array, `null` für leere Positionen.

```typescript
// Alt:
pearlSlots: PearlCard[]        // [A, B, C, D] → splice(1) → [A, C, D] → push(E) → [A, C, D, E]

// Neu:
pearlSlots: (PearlCard | null)[]   // [A, B, C, D] → [A, null, C, D] → [A, E, C, D]
```

**Alternative verworfen:** Slot-ID-Map `{ [slotId: string]: PearlCard | null }` — unnötige Komplexität; geordnetes Array mit fester Länge ist einfacher für boardgame.io-Serialisierung und Canvas-Iteration.

### 2. In-Place-Ersatz in `takePearlCard`

```typescript
// Neu:
G.pearlSlots[slotIndex] = null;
const newCard = drawCard(G.pearlDeck, G.pearlDiscardPile, () => { G.isReshufflingPearlDeck = true; });
if (newCard) G.pearlSlots[slotIndex] = newCard;
// Proactiver Reshuffle bleibt unverändert
```

`refillSlots` wird für Pearl-Slots nicht mehr aufgerufen. Für `replacePearlSlots` (alle 4 Slots gleichzeitig ersetzen) wird eine neue Hilfsfunktion `refillFixedSlots` geschrieben.

### 3. `refillFixedSlots` — neue Hilfsfunktion

```typescript
function refillFixedSlots(
  slots: (PearlCard | null)[],
  deck: PearlCard[],
  discardPile: PearlCard[],
  onReshuffle?: () => void
): void {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === null) {
      const card = drawCard(deck, discardPile, onReshuffle);
      slots[i] = card ?? null;
    }
  }
}
```

`replacePearlSlots` leert alle Slots auf `null` und ruft dann `refillFixedSlots` auf.

### 4. `applyPearlRefreshIfNeeded` — Filter auf non-null

```typescript
// Neu:
const newCards = G.pearlSlots.filter((c): c is PearlCard => c !== null && !slotIdsBefore.includes(c.id));
```

### 5. Null-Checks in Canvas und Regions

`canvasRegions.ts` prüft bereits `if (pearlSlots[i])` — das deckt `null` ab. `gameRender.ts` verwendet `pearlSlots[pearlIdx] ?? null` — ebenfalls kompatibel. `CanvasGameBoard.tsx` Click-Handler: `if (!pearlSlots[pearlIdx]) break` — ebenfalls kompatibel. Typ-Annotation muss angepasst werden (`PearlCard[]` → `(PearlCard | null)[]`).

### 6. Setup — initiales Auffüllen

```typescript
// Neu:
const pearlSlots: (PearlCard | null)[] = [null, null, null, null];
for (let i = 0; i < 4; i++) {
  const card = drawCard(pearlDeck, [], () => {});
  pearlSlots[i] = card ?? null;
}
```

## Risks / Trade-offs

- **boardgame.io-Serialisierung**: `null`-Werte in Arrays sind JSON-serialisierbar — kein Problem.
- **Laufende Spiele bei Deployment**: Alte Spielzustände haben `pearlSlots: PearlCard[]` (dichte Liste). Beim Laden könnte das Array kürzer als 4 sein. Mitigation: Frontend und Backend mit `pearlSlots[i] ?? null` defensiv lesen — bestehende Spiele funktionieren weiter, neue Spiele nutzen das feste Format.
- **Test-Fixtures**: Tests setzen `G.pearlSlots = [...]` direkt — müssen auf 4-Element-Arrays (mit `null`) angepasst werden.

## Open Questions

_(keine)_

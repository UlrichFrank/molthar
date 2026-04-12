## Context

boardgame.io startet jeden Zug beim Spieler an Position `ctx.playOrderPos`. Ohne explizite `order`-Konfiguration im `turn`-Block ist die Default-`first`-Funktion `() => 0`, d.h. immer Index 0 = der erste Spieler in `ctx.playOrder` (der Ersteller der Partie). `G.startingPlayer` wird zwar korrekt zufällig gesetzt und für das Portal-Bild verwendet, hat aber keinen Einfluss auf den ersten Zug.

## Goals / Non-Goals

**Goals:**
- `G.startingPlayer` bestimmt den ersten Zug
- Kein Spieler startet mit Perlenkarten auf der Hand

**Non-Goals:**
- Änderungen an `G.startingPlayer`-Berechnung oder Portal-Darstellung
- Änderungen an der weiteren Zugreihenfolge (bleibt `playOrder`-Ring)

## Decisions

### turn.order.first

```typescript
turn: {
  order: {
    first: ({ G, ctx }: any) => {
      const idx = ctx.playOrder.indexOf(G.startingPlayer);
      return idx >= 0 ? idx : 0;
    },
    next: ({ G, ctx }: any) => (ctx.playOrderPos + 1) % ctx.playOrder.length,
  },
  onBegin: ...
}
```

`first` wird von boardgame.io einmalig beim Spielstart aufgerufen und gibt den Index zurück, bei dem der erste Zug beginnt. `next` entspricht dem bisherigen Default-Verhalten (reihum).

### Initiale Handkarten entfernen

Den Block `// Deal initial pearl cards to players (3 cards each)` aus `setup` entfernen. Die Karten verbleiben im Deck.

### Tests

Tests die einen nicht-leeren initialen Handkartenstand voraussetzen sind anzupassen (Hand auf `[]` setzen, oder Karten explizit vor dem Test hinzufügen).

## Risks / Trade-offs

- `first` wird von boardgame.io auch beim Phasenwechsel aufgerufen. Da das Spiel nur eine Phase hat, tritt das nicht auf. Zur Sicherheit: Index-Fallback auf `0` wenn `G.startingPlayer` nicht in `ctx.playOrder` gefunden wird.

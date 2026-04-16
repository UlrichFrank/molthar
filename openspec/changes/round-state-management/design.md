## Context

boardgame.io verwaltet Züge über `ctx.turn` (globaler Zähler) und `ctx.playOrderPos` (Position im Spielerkreis). Eine "Runde" im Spielsinne — alle Spieler einmal, beginnend mit dem Startspieler — ist im Framework nicht nativ modelliert. Sie wird explizit im `GameState` abgebildet.

## Goals / Non-Goals

**Goals:**
- `roundNumber` im GameState als 1-basierter Rundenzähler
- `finalRoundNumber` als Ersatz für `finalRoundTriggerTurn` + `finalRoundStartingPlayer`
- `finalRound` erst ab Beginn der tatsächlich letzten Runde `true`
- `endIf` ohne Turn-Arithmetik

**Non-Goals:**
- Änderung der Spielreihenfolge oder des Startspieler-Mechanismus
- Anzeige der Rundennummer im UI (kein Scope dieser Änderung)

## Decisions

**Rundenzähler-Increment in `turn.onEnd` (nicht `turn.onBegin`)**

`roundNumber` wird am Ende des letzten Spielerzugs einer Runde erhöht — genau dann wenn der nächste Spieler der Startspieler wäre:

```typescript
// turn.onEnd
const nextPos = (ctx.playOrderPos + 1) % ctx.playOrder.length;
const nextPlayer = ctx.playOrder[nextPos];
if (nextPlayer === G.startingPlayer) {
  G.roundNumber++;
}
```

Warum `onEnd` statt `onBegin`: boardgame.io ruft `endIf` nach `turn.onEnd` auf (zwischen Zügen), aber nicht nach `turn.onBegin`. Würde `roundNumber` in `onBegin` des Startspielers erhöht, feuert `endIf` erst nach dem ersten Move des Startspielers — dieser könnte also noch Aktionen ausführen bevor das Spiel endet.

Mit `onEnd`-Increment gilt: nach dem letzten Zug von Runde N wird `roundNumber = N+1` gesetzt, `endIf` feuert sofort → Startspieler der nächsten Runde kommt nie an die Reihe. Korrekt.

**`finalRound`-Flag**

Bleibt im GameState. Wird in `turn.onBegin` des Startspielers gesetzt, wenn `roundNumber === finalRoundNumber`:

```typescript
// turn.onBegin
if (ctx.currentPlayer === G.startingPlayer) {
  if (G.finalRoundNumber !== null && G.roundNumber === G.finalRoundNumber) {
    G.finalRound = true;
  }
}
```

Das Flag dient dem Frontend zur Anzeige ("letzte Runde läuft") und bleibt semantisch korrekt: es ist erst ab dem Beginn der tatsächlichen letzten Runde gesetzt.

**Trigger (≥12 Punkte)**

```typescript
if (player.powerPoints >= 12 && !G.finalRoundNumber) {
  G.finalRoundNumber = G.roundNumber + 1;
}
```

Der Check `!G.finalRoundNumber` (statt `!G.finalRound`) stellt sicher, dass ein zweiter Spieler, der ebenfalls ≥12 Punkte erreicht, `finalRoundNumber` nicht überschreibt.

**`endIf`**

```typescript
if (G.finalRoundNumber !== null && G.roundNumber > G.finalRoundNumber) {
  // Ranking + Ende
}
```

Feuert nach `turn.onEnd` des letzten Spielers der finalen Runde (wenn `roundNumber` auf `finalRoundNumber + 1` erhöht wurde).

**Entfernte Felder**

`finalRoundTriggerTurn: number | null` und `finalRoundStartingPlayer: string | null` werden entfernt. Alle Informationen sind in `finalRoundNumber` und `roundNumber` enthalten.

## Risks / Trade-offs

- [Spielstand-Kompatibilität] Laufende Spiele im alten Format werden ungültig. Kein Migration-Pfad nötig (Entwicklungsstand, kein Produktiv-Deploy mit persistierten Spielen).
- [boardgame.io Timing] Das `onEnd`-Increment verlässt sich darauf, dass `endIf` nach `turn.onEnd` gefeuert wird. Dies ist boardgame.io-Standard-Verhalten und in der Codebase bereits durch den Kommentar `// endIf fires between turns` dokumentiert.

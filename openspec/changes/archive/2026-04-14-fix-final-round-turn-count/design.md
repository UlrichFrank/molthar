## Context

`endIf` in `shared/src/game/index.ts` berechnet, wann das Spiel nach dem Auslösen der Schlussrunde endet. Die Variable `startingPlayerIdx` (Index des auslösenden Spielers in `G.playerOrder`) wird bereits korrekt berechnet, aber nie verwendet:

```typescript
// Aktuell:
const startingPlayerIdx = G.playerOrder.indexOf(G.finalRoundStartingPlayer || '');
const turnsNeeded = N;   // ← startingPlayerIdx wird ignoriert

if (ctx.turn > triggerTurn + turnsNeeded) { ... }
```

`ctx.turn` ist in boardgame.io beim Aufruf von `endIf` bereits die Nummer des *nächsten* Zuges (der Zähler wird beim Zugwechsel erhöht, bevor `endIf` prüft).

**Beabsichtigte Spielregel:** Aktuelle Runde fertigspielen (verbleibende Spieler nach dem Auslöser), dann genau eine weitere vollständige Runde (alle N Spieler in Reihenfolge).

**Konsequenz:** Die Anzahl der Züge nach dem Auslösen ist positionsabhängig:
- Verbleibende aktuelle Runde: `N - 1 - startingPlayerIdx`
- Vollständige Schlussrunde: `N`
- Gesamt: `2N - 1 - startingPlayerIdx`

## Goals / Non-Goals

**Goals:**
- Korrekte Anzahl Züge nach Auslösung (alle Spieler spielen aktuelle Runde + eine vollständige Schlussrunde)
- Der Startspieler (idx=0) ist in keinem Fall der letzte Spieler der Schlussrunde

**Non-Goals:**
- Änderung der Auslösebedingung (≥12 Punkte bleibt unverändert)
- Änderung der Ranking-Logik in `endIf`
- Änderung des `G.finalRoundStartingPlayer`-Feldes oder seiner Semantik

## Decisions

### 1. Ein-Zeilen-Fix in `endIf`

```typescript
// Alt:
const turnsNeeded = N;

// Neu:
const turnsNeeded = 2 * N - 1 - startingPlayerIdx;
```

`startingPlayerIdx` ist bereits berechnet und korrekt — es wird lediglich in die Formel eingesetzt.

**Verification mit N=3:**

| Auslöser (idx) | turnsNeeded | Sequenz nach Trigger | Letzte Spieler |
|---|---|---|---|
| P0 (0) | 5 | P1, P2 · P0, P1, P2 | P2 ✓ |
| P1 (1) | 4 | P2 · P0, P1, P2 | P2 ✓ |
| P2 (2) | 3 | P0, P1, P2 | P2 ✓ |

### 2. Kein Änderungsbedarf an `G.finalRoundStartingPlayer`

Der Name ist leicht irreführend (klingt nach "Startspieler der Runde"), meint aber "den Spieler, der die Schlussrunde ausgelöst hat". Die Semantik ist korrekt und wird in der neuen Formel korrekt verwendet.

## Risks / Trade-offs

- **Bestehende Tests**: Falls Tests die alte (falsche) `endIf`-Logik prüfen, müssen sie korrigiert werden — das ist erwünscht.
- **Laufende Spiele**: Bei Spielen, die beim Update bereits in der Schlussrunde sind, würde sich das Spielende verschieben. Da es sich um ein lokales Dev-Spiel handelt, ist das akzeptabel.

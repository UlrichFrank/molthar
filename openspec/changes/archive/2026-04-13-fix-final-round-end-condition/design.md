## Context

`endIf` in `shared/src/game/index.ts` (~L805) prüft nach jedem Zug ob das Spiel enden soll. boardgame.io inkrementiert `ctx.turn` bereits vor dem `endIf`-Aufruf, sodass `ctx.turn` beim Check bereits den nächsten Zug anzeigt.

**Aktuelle Formel (fehlerhaft):**
```typescript
const turnsNeeded = (N - 1 - startingPlayerIdx) + N;
if (ctx.turn > triggerTurn + turnsNeeded) { … }
```

**Beispiel** — 4 Spieler `[0,1,2,3]`, Spieler[2] löst bei Zug T aus:
- `turnsNeeded = (4-1-2) + 4 = 5`
- Endet nach Zug T+5 → Spieler[3] spielt zweimal (T+1 und T+5)

Korrekte Zugreihenfolge nach Auslösung:
| Zug   | Spieler | Anmerkung              |
|-------|---------|------------------------|
| T     | [2]     | Auslösung              |
| T+1   | [3]     | Rest der aktuellen Runde |
| T+2   | [0]     | letzte Runde           |
| T+3   | [1]     | letzte Runde           |
| T+4   | [2]     | ← Spielende hier       |

Das ergibt immer genau **N = 4** Züge nach dem Auslöse-Zug — unabhängig von `startingPlayerIdx`.

**Beweis für alle Fälle:**
- Verbleibende Züge in aktueller Runde: `N - 1 - startingPlayerIdx`
- Züge in letzter Runde bis inkl. Auslöser: `startingPlayerIdx + 1`
- Summe: `(N - 1 - startingPlayerIdx) + (startingPlayerIdx + 1) = N`

## Goals / Non-Goals

**Goals:**
- Spiel endet genau nachdem der auslösende Spieler seinen letzten Zug gespielt hat

**Non-Goals:**
- Keine Änderungen an Scoring, Ranking oder der finalen Rundenanzeige im Frontend

## Decisions

**`turnsNeeded = N` statt komplexe Formel**

Der Ausdruck `(N - 1 - startingPlayerIdx) + N` war mathematisch falsch — der zweite Summand `+ N` sollte `+ (startingPlayerIdx + 1)` sein. Beide vereinfachen sich zu `N`. Die einfache Konstante ist korrekter und lesbarer.

## Risks / Trade-offs

- Keine: Änderung einer einzigen Zeile, rein arithmetisch, kein State-Umbau.
- Bestehende Tests die das falsche Verhalten erwarten müssen angepasst werden.

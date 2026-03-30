## Context

In `canvasRegions.ts` (Zeile 205) steuert ein `if (G.requiresHandDiscard)`-Branch, welcher Button im UI-Panel gerendert wird. Das Flag `requiresHandDiscard` wird im Game-State gesetzt, sobald der Spieler das Handlimit überschreitet — unabhängig vom Aktionszähler.

`actionCount` und `maxActions` sind im selben Scope bereits verfügbar (Zeilen 202–203).

## Goals / Non-Goals

**Goals:**
- "Discard Cards" nur anzeigen wenn keine Aktionen mehr verfügbar sind (`actionCount >= maxActions`) und `requiresHandDiscard` gesetzt ist.

**Non-Goals:**
- Keine Änderung der Game-State-Logik oder wann `requiresHandDiscard` gesetzt wird.
- Keine Änderung des `DiscardCardsDialog` selbst.

## Decisions

### Einzige Entscheidung: Bedingung erweitern

**Änderung:** `if (G.requiresHandDiscard)` → `if (G.requiresHandDiscard && actionCount >= maxActions)`

**Begründung:** Minimalinvasiv, direkt am Ort des Bugs. Keine Architekturänderung nötig.

## Risks / Trade-offs

- Kein nennenswertes Risiko — reine Bedingungserweiterung in einer Render-Funktion.

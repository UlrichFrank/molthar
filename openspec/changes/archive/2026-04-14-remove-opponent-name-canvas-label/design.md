## Context

In `gameRender.ts` rendert `drawOpponentZone` am Ende jeder Gegner-Zone ein Spielername-Label (Zeilen 634–651). Parallel dazu zeigt `CanvasGameBoard.tsx` HTML-`PlayerStatusBadge`-Overlays an denselben vier Positionen, die den Namen ebenfalls enthalten. Das Canvas-Label ist damit vollständig redundant.

## Goals / Non-Goals

**Goals:**
- Canvas-Name-Rendering entfernen
- `name`-Feld aus `OpponentZoneData` entfernen
- Construct-Code in `CanvasGameBoard` bereinigen

**Non-Goals:**
- Keine Änderung an den HTML-Badges
- Keine Layout-Anpassungen an den Gegner-Zonen
- Kein Refactoring der übrigen `drawOpponentZone`-Logik

## Decisions

**Feld `name` komplett aus `OpponentZoneData` entfernen** (nicht nur ungenutzt lassen): Ein Interface-Feld das nie gelesen wird erzeugt Verwirrung über zukünftige Nutzung. Sauberer ist das vollständige Entfernen.

## Risks / Trade-offs

Keine relevanten Risiken — reine Deletion, kein Verhalten ändert sich aus Spielersicht.

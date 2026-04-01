## Context

Der Move `replacePearlSlots` in `shared/src/game/index.ts` ist vollständig implementiert: Er räumt alle 4 Perlenslots ab und zieht 4 neue Karten nach. Er verbraucht eine Aktion und ist durch `actionCount >= maxActions` geschützt.

Das Canvas-Rendering nutzt `drawUIButton` für interaktive Schaltflächen (z.B. End-Turn-Button). Canvas-Regionen werden in `buildCanvasRegions` registriert und per `hitTestRegions` ausgewertet. Der Klick-Handler in `CanvasGameBoard.tsx` dispatcht den passenden Move anhand des Region-Typs.

## Goals / Non-Goals

**Goals:**
- Button neben dem Perlen-Nachziehstapel auf dem Canvas zeichnen.
- Nur sichtbar und klickbar für den aktiven Spieler mit verbleibenden Aktionen.
- Klick ruft `moves.replacePearlSlots()` auf.

**Non-Goals:**
- Keine Änderung am Backend-Move.
- Keine Animation beim Austausch (bestehende Slot-Auffüllung bleibt unverändert).
- Kein Dialog zur Bestätigung.

## Decisions

### 1. Positionierung neben dem Perlenstapel

**Entscheidung:** Der Button wird direkt unterhalb (oder rechts) des Perlen-Nachziehstapels platziert, mit den bestehenden Layout-Konstanten aus `cardLayoutConstants.ts` als Basis.

**Begründung:** Der Perlen-Nachziehstapel ist bereits ein definierter Bereich im Canvas. Proximity zum Stapel macht die UI-Zuordnung intuitiv.

### 2. Nutzung der bestehenden `drawUIButton`-Funktion

**Entscheidung:** Der Button wird per `drawUIButton` gezeichnet, analog zum End-Turn-Button.

**Begründung:** Konsistentes Look & Feel. Keine neue Render-Logik nötig.

### 3. Sichtbarkeit nur für aktiven Spieler mit Aktionen

**Entscheidung:** Der Button wird nur gerendert und als Region registriert, wenn `isMyTurn && G.actionCount < G.maxActions`.

**Begründung:** Verhindert Verwirrung für inaktive Spieler. Entspricht dem Muster des End-Turn-Buttons (der nur für den aktiven Spieler angezeigt wird).

### 4. Region-Typ `replace-pearl-slots`

**Entscheidung:** Neuer Region-Typ `'replace-pearl-slots'` in `CanvasRegion`.

**Begründung:** Ermöglicht saubere Unterscheidung im Hit-Test-Handler.

## Risks / Trade-offs

- **Layout-Überlappung:** Der Button könnte mit anderen Canvas-Elementen kollidieren. → Positionstest auf verschiedenen Viewport-Größen nötig.
- **Manuelle Tests nötig:** Da der Canvas keine automatisierten UI-Tests hat, muss der Button manuell verifiziert werden.

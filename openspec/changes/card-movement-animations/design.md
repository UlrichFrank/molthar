## Context

Das Canvas-Board (`CanvasGameBoard.tsx`) rendert alle Spielelemente in einem `requestAnimationFrame`-Loop. Alle Positionen sind bereits im World-Space bekannt (`buildCanvasRegions`). State-Updates kommen als neue `G`-Props — bisher wird nur `gRef.current = G` gesetzt, kein Vorgänger-State gehalten. Animationen existieren noch nicht; Karten erscheinen/verschwinden abrupt.

## Goals / Non-Goals

**Goals:**
- Karten fliegen von Ursprung zu Ziel (ease-in-out, ~400 ms)
- Abgeworfene/entfernte Karten fliegen zum gegenüberliegenden Bildschirmrand
- Animation läuft für lokalen Spieler und alle Mitspieler
- Rein clientseitig — kein Backend-State, keine boardgame.io-Änderungen

**Non-Goals:**
- Keine Kollisions- oder Stapelauflösung mehrerer gleichzeitiger Karten
- Keine Geräuscheffekte
- Keine Animationen für Drag&Drop (noch nicht implementiert)
- Keine Konfigurationsoption zum Deaktivieren

## Decisions

### 1. State-Diff als Animationsauslöser

`prevGRef` wird neben `gRef` gehalten. Bei jedem neuen `G`-Prop (`useEffect([G])`) wird `diffGameState(prevG, nextG)` aufgerufen, das eine Liste von `CardMoveEvent`-Objekten zurückgibt. Jedes Ereignis enthält Ursprungsposition, Zielposition und Kartentyp.

**Alternativen verworfen:**
- *Move-Callbacks in boardgame.io*: Nur für lokale Moves auslösbar, Mitspieler-Updates würden nie getriggert.
- *Animationen im Backend*: Unnötige Kopplung, serverloser State reicht.

### 2. FlyingCard-Overlay auf Canvas

`FlyingCard`-Objekte werden in einem `useRef<FlyingCard[]>` gespeichert (kein React-State → kein Re-Render). Im rAF-Loop werden sie nach den normalen Spielelementen gezeichnet — dadurch liegen sie immer oben.

```
rAF-Loop:
  1. drawBackground + drawBoard (normal)
  2. drawFlyingCards(flyingCards, elapsedMs)  ← neu
  3. requestAnimationFrame(...)
```

### 3. Zielrichtung für "Hinauswerfen"

Abgeworfene Karten haben kein Canvas-Ziel. Die Auswurfrichtung ist der normalisierte Vektor von der Kartenmitte zum gegenüberliegenden Canvas-Rand (Abstand × 1,5 über den Rand hinaus). Dadurch verlässt die Karte den Bildschirm immer in der "richtigen" Richtung.

### 4. Bewegungstypen und Positionen

| Ereignis | Ursprung | Ziel |
|----------|----------|------|
| Perlkarte nehmen (Hand) | `PEARL_DECK_X/Y` | `getHandCardPosition(idx)` |
| Auslagekarte nehmen (Hand) | `AUSLAGE_START_X + i*gap` | `getHandCardPosition(idx)` |
| Charakterkarte nehmen (Portal) | `CHAR_DECK_X/Y` oder Auslage | `getPortalSlotPosition(slot)` |
| Charakterkarte aktivieren | `getPortalSlotPosition(slot)` | `getActivatedCardPosition(idx)` |
| Handkarte ablegen/nutzen | `getHandCardPosition(idx)` | Auswurf (gegenüberliegend) |
| Portalfeld entfernt | `getPortalSlotPosition(slot)` | Auswurf (gegenüberliegend) |
| Mitspieler: alle obigen | World-Space via `buildCanvasRegions` | analog |

Für Mitspieler werden dieselben Positionsfunktionen mit dem rotierten `playerZone`-Offset aufgerufen (analog zu den bestehenden `opponent-*`-Regionen in `canvasRegions.ts`).

### 5. Easing und Timing

- Dauer: 400 ms pro Karte
- Easing: `easeInOutCubic(t) = t < 0.5 ? 4t³ : 1 − (−2t+2)³/2`
- Jede `FlyingCard` speichert `startTime`, `from`, `to`, `imageName`, `isThrowing`

## Risks / Trade-offs

- **State-Diff-Falsch-Positives**: Wenn boardgame.io `G`-Referenzen für unveränderte Felder neu erstellt, könnte der Diff überschätzen → Mitigation: Array-Längen-Diff statt Referenz-Vergleich.
- **Mehrere Bewegungen gleichzeitig**: Bei z. B. `rehandCards` (alle Handkarten neu) würden N Animationen gleichzeitig starten — visuelle Überlastung. Mitigation: maximal 5 fliegende Karten gleichzeitig; älteste überspringen.
- **Performance auf schwacher Hardware**: Jede FlyingCard fügt einen `drawImage`-Aufruf hinzu. 5 gleichzeitige Karten × 60 fps ist vernachlässigbar.

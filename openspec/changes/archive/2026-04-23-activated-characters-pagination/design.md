## Context

Das aktivierte Charakterkarten-Grid wird vollständig auf einem HTML5-Canvas gerendert (`gameRender.ts`, `canvasRegions.ts`). Die Positionen aller Elemente sind über `cardLayoutConstants.ts` zentralisiert. Klick-Interaktionen laufen über das Region-System in `canvasRegions.ts` — jede interaktive Fläche ist ein typisiertes `Region`-Objekt, das in `CanvasGameBoard.tsx` auf Events gemappt wird.

Gegner-Bereiche werden rotiert in `drawOpponentZone` gezeichnet; ihr Coordinate-System ist ein virtuelles, skaliertes Abbild des Spieler-Bereichs.

Aktuell: `ACTIVATED_GRID_COLS=4`, `ACTIVATED_GRID_ROWS=2`, `ACTIVATED_MAX=8`, `ACTIVATED_CARD_W = round(CARD_W * 0.75)`.

## Goals / Non-Goals

**Goals:**
- 6 Karten pro Seite (3×2), 20% größer als bisher
- Paginierungspfeile (◄ / ►) nativ auf Canvas, links und rechts neben dem Grid
- Pfeile immer sichtbar, ausgegraut wenn nicht verwendbar; Hover-Effekt
- Auto-advance auf Seite 1 wenn neue Karte aktiviert wird und Seite 0 voll ist
- Gegner-Bereiche: identische Logik, skaliert + rotiert

**Non-Goals:**
- Mehr als 2 Seiten (max. 12 Karten reicht aus)
- Animierte Seitenübergänge
- Persistenz der aktuellen Seite über Spielzüge hinaus

## Decisions

### D1: Pfeil-Rendering als Canvas-Region (kein HTML-Overlay)

Pfeile werden als `Region`-Objekte vom Typ `'activated-page-arrow'` registriert und in `gameRender.ts` gezeichnet. Das folgt dem bestehenden Muster für alle anderen interaktiven Canvas-Elemente (Portal-Slots, Hand-Karten, Deck-Buttons). Ein HTML-Button wäre einfacher, würde aber das einheitliche Canvas-Koordinatensystem für Gegner-Rotationen unterlaufen.

Pfeil-Shape: gefülltes Dreieck (▶/◀), Farbe `#aaaaaa` (inaktiv) / `#ffffff` (aktiv) / `#dddddd` (hover).

### D2: Page-State in CanvasGameBoard (nicht im Spielzustand)

Die aktuelle Seite ist rein lokaler UI-State (`useState`) — sie beeinflusst den Spielverlauf nicht und muss nicht über Netz synchronisiert werden. `ownActivatedPage: 0 | 1` und `opponentActivatedPage: Record<playerId, 0 | 1>`.

### D3: Auto-advance via useEffect auf activatedCharacters.length

```
useEffect(() => {
  const count = me?.activatedCharacters.length ?? 0;
  if (count > ACTIVATED_PAGE_SIZE && ownActivatedPage === 0) {
    setOwnActivatedPage(1);
  }
}, [me?.activatedCharacters.length]);
```
Wechselt nur vorwärts (0→1), nie automatisch zurück. Der Spieler kann manuell zurücknavigieren.

### D4: Pfeil-Positionierung

Linker Pfeil: `ACTIVATED_GRID_X - ARROW_MARGIN - ARROW_SIZE` (links vom Grid)  
Rechter Pfeil: `ACTIVATED_GRID_X + 3*(ACTIVATED_CARD_W + ACTIVATED_CARD_GAP) + ARROW_MARGIN` (rechts vom Grid)  
Vertikal zentriert zur Grid-Höhe.

Bei Gegnern: gleiche relative Offsets im virtuellen Coordinate-System, dann durch die bestehende `ctx.rotate`-Transformation transformiert.

### D5: canvasRegions erhält page-Parameter

`buildRegions(G, me, existing, ownActivatedPage, opponentActivatedPages)` — die page-Parameter steuern welche Karten-Indices in Regionen eingetragen werden. Die `id` einer activated-character-Region bleibt der absolute Index (nicht der Page-Index), damit Click-Handler weiterhin direkt auf `activatedCharacters[id]` zugreifen können.

## Risks / Trade-offs

- **Pfeil-Koordinaten bei Gegnern** → Die rotierte Canvas-Transformation übernimmt die Positionierung automatisch, solange die Offsets im virtuellen Coordinate-System korrekt sind. Muss visuell auf allen 4 Positionen (90°/180°/270°) geprüft werden.
- **Ausgegraute Pfeile könnten übersehen werden** → Akzeptierter Trade-off; ein nicht-sichtbarer Pfeil wäre schlechter (kein Hinweis auf die Funktion).
- **Seiten-Reset nach Rundenende** → Wenn `ownActivatedPage` auf 1 steht und der Spieler keine weiteren Karten hat, bleibt ein leeres Grid. Mitigation: Auto-reset auf 0 wenn count ≤ ACTIVATED_PAGE_SIZE.

## Open Questions

- Soll der Page-State beim Spielzug-Wechsel (eigener Zug beginnt) automatisch auf 0 zurückgesetzt werden?

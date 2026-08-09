## Context

Das Board wird heute ausschließlich von `game-web/src/components/CanvasGameBoard.tsx` gerendert: ein fixes Modell-Canvas `BASE_W=1200 × BASE_H=800` (3:2), das per `scale = min(w/1200, h/800)` als Aspect-Fit in den Viewport eingepasst wird. Es gibt **keine** Responsive-Logik (kein `matchMedia`, keine Breakpoints). Im Hochformat schrumpft das Board auf ~260px Höhe (Faktor ~0.33), Karten auf ~29px. Die Statusanzeigen (`PlayerStatusBadge`) sind DOM-Overlays mit fixer rem-Größe an prozentualen Canvas-Ankern und überlagern die Grafik. Die Dialoge (`GameDialog` + `styles/dialogs.css`) sind desktop-dicht und viewport-gedeckelt (`max-height: calc(100vh - 1rem); overflow-y: auto`).

Entscheidend für den Zuschnitt: Die Spiellogik liegt vollständig in `shared/` und den boardgame.io-`moves`. Das Board ist reine View. Datenmodell (bestätigt in `shared/src/game/types.ts`): `hand: PearlCard[]` (Wert 1–8, Joker, Tausch-/Auffüll-Symbol), `pearlSlots` = 4 offene Perlen, `characterSlots` = 2 offene Charaktere, `portal` = max. 2 Charaktere, `activatedCharacters` = beliebig viele (realistisch 8–15; Spielende über 12 Machtpunkte, Mehrzahl der Karten 1 Punkt), `diamondCards`. `maxPlayers: 5` → max. 4 Gegner.

## Goals / Non-Goals

**Goals:**
- Handy gleichwertig spielbar im Hochformat: alle Interaktionen erreichbar, Karten lesbar.
- Eigene native DOM-Ansicht bei `<768px`, die dieselbe Logik/`moves` nutzt.
- Chrome-Probleme (Status-Overlap, Modal-Scroll) unabhängig vom Board lösen.
- Feature-Parität zum Canvas (vollständige Checkliste in `tasks.md`).

**Non-Goals:**
- Keine Änderung an `CanvasGameBoard` (Desktop bleibt bitgleich).
- Keine Änderung an Spiellogik/`moves`/Backend.
- Tablet-Verhalten wird bewusst nicht final entschieden (Phones-first, `<768px`).
- Keine Querformat-Handy-Optimierung in diesem Change.

## Decisions

### D1: DOM-Ansicht statt portrait-Canvas
Eine neue React/DOM-Komponentenfamilie unter `game-web/src/components/mobile/` rendert das Board als reflowende Elemente; Karten sind `<img>` in realer Pixelgröße. **Warum:** Ein portrait-Canvas würde den uniformen Skalierungsfehler nur drehen, nicht beheben; DOM liefert native Lesbarkeit, Touch-Scroll und Wiederverwendung der Karten-Assets. **Alternative verworfen:** zweiter Canvas-Layout-Konstanten-Satz — verdoppelt die Render-/Hit-Test-Engine, bleibt skalierungsanfällig.

### D2: Viewport-Weiche bei 768px
Ein Hook (`useIsMobile`, `matchMedia('(max-width: 767px)')`, live) wählt am Board-Einstiegspunkt zwischen `CanvasGameBoard` und `MobileGameBoard`. Beide erhalten identische Props (`G`, `ctx`, `moves`, `events`, `playerID`, `isActive`, `matchData`). **Warum breite-basiert:** einfach, vorhersagbar, testbar; deckt Phones sicher ab. **Alternative offen gehalten:** `orientation + pointer:coarse` (würde Tablets hochkant einschließen) — bewusst als spätere Frage.

### D3: Hand-Dock-Layout
CSS-Grid/Flex-Spalte: `[fixe Statusleiste] [scroll: Markt + Portal] [fixes Hand-Dock] [fixe Aktionsleiste]`. Die drei fixen Bänder liegen außerhalb des Scrollcontainers. **Warum:** Perlen-Hand ist der Bezahl-Hotpath und bleibt griffbereit; Markt landet oben im Scrollbereich. Nutzt `100dvh` gegen mobile Browser-Chrome-Sprünge.

### D4: Statusleiste „Variante C"
Feste Spielerreihenfolge (eigener Spieler zuerst); genau ein Detail-Chip, Rest Avatare; Tippen verschiebt die Detailbox an die feste Position. Rang wird aus den Machtpunkten aller Spieler berechnet. Goldring = eigener Spieler, grüner Punkt = am Zug (getrennte Marker, gleichzeitig darstellbar). **Warum:** einzeilig (spart die Höhe, die das Hand-Dock kostet), volle Info je Spieler auf einen Tap, stabile Ordnung vermeidet Verspringen. **Alternativen verworfen:** zweizeilig (frisst Höhe), Rangliste (Positionssprünge), reine Scroll-Chips (mehr Info, aber Off-Screen).

### D5: Geteilte responsive Dialog-Shell
`GameDialog`/`.game-dialog` wird um eine mobile Präsentation erweitert: zentriertes Modal ≥768px, an der Unterkante verankertes, content-hohes Bottom-Sheet <768px (nur interner Scroll bei Überlauf). Dialog-Inhalte bleiben unverändert geteilt. Aktivierte-Karten-Raster und Markt/Gegner-Detail nutzen dieselbe Sheet-Shell. **Warum:** löst Modal-Scroll ohne Duplizierung der 10+ Dialoge; kommt Desktop wie Handy zugute.

### D6: Aktivierte Charaktere als Zähler + Raster-Sheet
`aktiviert ×N ▸` am Portal öffnet ein scrollbares Raster (Sheet). **Warum:** 8–15 Karten sind zu viele für festen Platz; das Canvas paginiert heute schon (`ACTIVATED_PAGE_SIZE=6`). Ein Sheet trägt beliebige Anzahl.

## Risks / Trade-offs

- **Zwei Board-Views (Canvas + DOM) doppelter Pflegeaufwand** → Divergenz auf die reine Layout-/Render-Schicht begrenzen; Logik und Dialog-*Inhalte* strikt geteilt lassen; keine mobile-only Spielregeln.
- **Feature-Parität unvollständig → Handy „fast" spielbar** → verbindliche Checkliste in `tasks.md`, jede Canvas-Interaktion 1:1 abhaken (inkl. Irrlicht/`activateSharedCharacter`, `swapPortalCharacter`, `replacePearlSlots`, `tradeForDiamond`, `peekCharacterDeck`, `rehandCards`, Steal/Discard/TakeBack).
- **`768px` schließt Tablets hochkant aus** → bewusst akzeptiert; als offene Frage dokumentiert, Weiche zentral gekapselt (leicht umstellbar).
- **`100vh`-Sprünge in mobilen Browsern** → `100dvh`/`svh` mit Fallback verwenden.
- **Gegner-Interaktionen (stehlen/entfernen) brauchen mobile Auswahl** → laufen über die bereits vorhandenen Dialoge in der neuen Sheet-Shell.

## Migration Plan

1. Additive Einführung: neue mobile Komponenten + Weiche; Desktop-Pfad unberührt → risikoarmes Rollout.
2. Dialog-Shell zuerst responsive machen (Desktop-Regression über bestehende Dialog-Specs prüfen), dann mobile Board-View.
3. Rollback: Weiche auf „immer Canvas" schalten (ein Flag/Return) stellt den Ist-Zustand her.

## Open Questions

- Tablet-Verhalten (hochkant): Mobile-View oder Canvas? (Später; Weiche gekapselt.)
- Braucht das Hand-Dock bei sehr großer Hand eine zusätzliche Sortier-/Gruppierhilfe?
- Sollen Gegner-Details primär über Statusleisten-Tap (Sheet) oder zusätzlich über eine eigene Zone erreichbar sein?

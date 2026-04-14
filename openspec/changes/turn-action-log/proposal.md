## Why

Kartenbewegungen und Aktionen passieren ohne visuelle Rückmeldung — vor allem Gegnerzüge sind für Mitspieler kaum nachvollziehbar, weil boardgame.io State-Updates atomar liefert und Fluganimationen bei mehrfachen gleichzeitigen Aktionen (z.B. `rehandCards`) überfordern. Ein Aktionslog macht Züge lesbar, ohne komplexe State-Diff-Rekonstruktion zu erfordern.

## What Changes

- `GameState` erhält ein `actionLog: ActionLogEntry[]`-Feld, das die letzten N Aktionen (max. 20) pro Zug protokolliert
- Jeder Move-Handler in `index.ts` schreibt einen `ActionLogEntry` in das Log
- Das Frontend zeigt den Log als schmale, scrollbare Leiste am unteren Spielfeldrand
- Geänderte Spielelemente (neue Handkarten, aktivierte Charaktere, PP-Gewinne) werden kurz hervorgehoben (Glow-Effekt, 800ms)
- Das Log wird beim Zugwechsel geleert (nur aktueller Zug + letzter Gegnerzug sichtbar)

## Capabilities

### New Capabilities

- `turn-action-log`: Serverseitiges Aktionslog pro Zug mit Frontend-Anzeige als Leiste am Spielfeldrand
- `highlight-on-state-change`: Kurzes visuelles Hervorheben (Glow) von Canvas-Elementen, die sich seit dem letzten State-Update verändert haben

### Modified Capabilities

- `canvas-ui-rendering`: Canvas-Render-Loop erhält zusätzliche Overlay-Schicht für Highlight-Glows auf geänderten Elementen

## Impact

- `shared/src/game/types.ts` — Neuer Typ `ActionLogEntry`, Erweiterung von `GameState`
- `shared/src/game/index.ts` — Alle Move-Handler schreiben ins `actionLog`
- `game-web/src/components/CanvasGameBoard.tsx` — Log-Leiste rendern, `prevGRef` für Highlight-Diff, Highlight-Zustand verwalten
- `game-web/src/lib/gameRender.ts` — Highlight-Glow-Overlay im rAF-Loop zeichnen
- `game-web/src/i18n/translations.ts` — Übersetzungen für Log-Einträge (DE/EN/FR)

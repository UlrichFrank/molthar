## Why

Die Statusanzeige des eigenen Spielers befindet sich aktuell oben links in der Ecke des Canvas — räumlich weit entfernt vom eigentlichen Spielerportal unten. Gleichzeitig gibt es eine separate `PlayerNameDisplay`-Komponente sowie ein Canvas-gezeichnetes Aktionszähler-Panel (links unten), die zusammen drei verteilte UI-Elemente bilden. Durch Zusammenführung aller dieser Informationen in ein einziges Badge direkt auf dem Spielerportal wird die UI kohärenter und platzsparender.

Zusätzlich sind die Gegner-Badges optisch unvollständig (kein Name), der Detail-Dialog ist zu schmal und zu niedrig verglichen mit den übrigen Dialogen, und Klick auf Gegner-Badge soll denselben `PlayerStatusDialog` öffnen wie beim eigenen Badge — eine einzige Dialog-Komponente für alle Spieler.

## What Changes

- Das `PlayerStatusBadge` des eigenen Spielers wird mittig am oberen Rand der Spielerportal-Zone positioniert (x-Mitte bei 50 %, y ~ 64 % des Canvas).
- Der Spielername wird in das Badge integriert (erste Zeile, mit Ellipsis bei Überlänge).
- Der Aktionszähler (bisher Canvas-Panel links unten) wird in das Badge integriert: nur `X/Y` (z.B. `1/3`), mit Farbcodierung — grün (>1 Aktion übrig), gelb (letzte Aktion), rot (alle Aktionen verbraucht).
- Der „Zug beenden"-Button erscheint als separates HTML-Element **nur** wenn alle Aktionen des aktiven Spielers verbraucht sind; danach verschwindet er wieder.
- `PlayerNameDisplay` wird aus `CanvasGameBoard.tsx` entfernt und die Komponente gelöscht.
- Das Canvas-gezeichnete Aktionszähler-Panel (`drawUIButton`, `drawOpponentActionCounter`, `ui-end-turn`-Region) wird aus dem Canvas entfernt.
- **Gegner-Badges** zeigen ebenfalls den Spielernamen — gleiche Darstellung wie das eigene Badge (Name als erste Zeile).
- **Klick auf jedes Badge** (eigener Spieler wie Gegner) öffnet denselben `PlayerStatusDialog` mit den Daten des jeweiligen Spielers — eine gemeinsame Dialog-Komponente für alle.
- **`PlayerStatusDialog`** wird auf die Standard-Dialoggröße der anderen Dialoge angepasst: `max-width: min(600px, 95vw)`, volle Breite, `padding: 2rem` aus `.game-dialog`-CSS — keine einengenden Inline-Styles mehr.

## Capabilities

### New Capabilities

- `end-turn-button`: Eigenständiger HTML-Button „Zug beenden", der nur erscheint wenn `isActive && actionCount >= maxActions`

### Modified Capabilities

- `player-status-badge`: Badge zeigt Spielernamen und Aktionszähler (`X/Y`) mit Farbcodierung; Gegner-Badges zeigen ebenfalls den Spielernamen
- `player-status-dialog`: Einziger Dialog für alle Spieler (eigener + Gegner); nutzt Standard-Dialoggröße statt einengender Inline-Styles
- `game-web-spec`: Canvas-Overlay-Struktur geändert — `PlayerNameDisplay` entfällt, Canvas-UI-Panel entfällt, eigenes Badge ist neu positioniert, neuer End-Turn-Button als HTML-Overlay; Gegner-Badges mit Spielernamen

## Impact

- `game-web/src/components/PlayerStatusBadge.tsx` — neue Props: `playerName?: string`, `actionCount?: number`, `maxActions?: number` (bereits implementiert in vorherigem Change)
- `game-web/src/components/PlayerStatusDialog.tsx` — Inline-`minWidth`-Override entfernen; Dialog nutzt natürliche `.game-dialog`-Breite
- `game-web/src/components/PlayerNameDisplay.tsx` — wird gelöscht
- `game-web/src/components/CanvasGameBoard.tsx` — Badge-Position geändert, `PlayerNameDisplay`-Import/-Render entfernt, neuer HTML-End-Turn-Button, Canvas-UI-Panel-Zeichnung entfernt; Gegner-Badges erhalten `playerName`-Prop
- `game-web/src/lib/gameRender.ts` — `drawUIButton`-Aufruf im renderFrame entfernen; `drawOpponentActionCounter` prüfen (ggf. anpassen oder entfernen)
- `game-web/src/lib/canvasRegions.ts` — `ui-end-turn`-Region entfernen oder disabled lassen
- Tests für `PlayerStatusBadge`, `PlayerStatusDialog` und neuen End-Turn-Button

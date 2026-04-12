## Why

Im laufenden Spiel fehlt eine kompakte Übersicht über den aktuellen Stand aller Spieler — Punkte, Diamanten und aktive Fähigkeiten sind nur über den Canvas-Spielbereich indirekt sichtbar. Eine dedizierte Statusanzeige schafft schnelle Orientierung ohne das Spielfeld zu verlassen.

## What Changes

- Für den eigenen Spieler und alle aktiven Mitspieler (nicht-teilnehmende/disconnected Spieler ausgenommen) wird eine kompakte Statusanzeige eingeblendet.
- Jede Anzeige zeigt: Kraftpunkte (`powerPoints`), Diamanten (`diamonds`) und Symbole für aktive blaue Fähigkeiten (`activeAbilities`).
- Ein Klick auf die Statusanzeige öffnet einen Detail-Dialog (im Stil der bestehenden `GameDialog`-Komponenten) mit vollständigen Informationen des jeweiligen Spielers.
- Der eigene Status wird im bestehenden HUD-Bereich nahe `PlayerNameDisplay` platziert; Gegner-Status in den jeweiligen Gegner-Zonen des Canvas.

## Capabilities

### New Capabilities

- `player-status-badge`: Kompakte, anklickbare Statusanzeige je Spieler (Punkte, Diamanten, Fähigkeitssymbole)
- `player-status-dialog`: Detail-Dialog, der beim Klick auf die Statusanzeige erscheint und alle Spielerdetails zeigt

### Modified Capabilities

- `game-web-spec`: Die Spielfeld-Ansicht erhält neue HTML-Overlay-Elemente für Spieler-Status (Erweiterung bestehender Canvas-Overlay-Logik)

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — Integration der neuen Statusanzeigen als HTML-Overlays über dem Canvas
- `game-web/src/components/PlayerNameDisplay.tsx` — Ggf. Erweiterung oder Ersatz durch Status-Badge
- Neue Komponenten: `PlayerStatusBadge.tsx`, `PlayerStatusDialog.tsx`
- Keine Änderungen an `shared/` oder `backend/` erforderlich
- Liest `G.players[id].powerPoints`, `G.players[id].diamonds`, `G.players[id].activeAbilities` aus dem bestehenden Spielzustand

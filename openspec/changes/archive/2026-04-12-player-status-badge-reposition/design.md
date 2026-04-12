## Context

Der Canvas ist 1200×800 Modellkoordinaten groß. Die Spielerportal-Zone liegt bei x: 200–1000 (Breite 800), y: 510–800 (Höhe 290). HTML-Overlays werden absolut im inneren Canvas-Container (cssW×cssH) positioniert.

Aktuell gibt es drei separate UI-Elemente für den eigenen Spieler:
1. `PlayerNameDisplay` — absolut oben links, zeigt nur den Namen
2. `PlayerStatusBadge` — absolut oben links darunter, zeigt Punkte/Diamanten/Fähigkeiten
3. Canvas-Panel (`drawUIButton`) — gezeichnet links unten im Canvas, zeigt Aktionszähler + End-Turn-Button

## Goals / Non-Goals

**Goals:**
- Badge zentriert über dem Spielerportal (left: 50%, transform: translateX(-50%), top: ~64.5%)
- Spielername als erste Zeile im Badge (mit Ellipsis bei Überlänge)
- Aktionszähler `X/Y` mit Farbcodierung im Badge
- „Zug beenden"-Button als eigenständiges HTML-Element, nur sichtbar wenn Aktionen erschöpft
- `PlayerNameDisplay` und Canvas-UI-Panel entfernen

**Non-Goals:**
- Gegner-Badge-Positionen bleiben unverändert
- `drawOpponentActionCounter` (blaue Anzeige für Zuschauer des aktiven Spielers) — wird separat bewertet; vorerst im Canvas belassen, da es die Sicht der **nicht-aktiven** Spieler betrifft

## Decisions

### 1. Badge-Position via Prozent

`left: '50%', transform: 'translateX(-50%)', top: '64.5%'`  
(Y = (510 + 8) / 800 ≈ 64.75%, gerundet auf 64.5%)

Skaliert automatisch mit dem Canvas-Container, kein Pixel-Umrechnungsaufwand.

### 2. Aktionszähler-Farbcodierung

Im Badge wird `X/Y` farbig dargestellt — analog zur bisherigen Canvas-Logik in `drawUIButton`:
- `remaining > 1` → grün (`#22c55e`)
- `remaining === 1` → gelb (`#facc15`, Text schwarz)
- `remaining === 0` → rot (`#ef4444`)

Props: `actionCount?: number`, `maxActions?: number`. Nur wenn gesetzt, wird der Zähler angezeigt (Gegner-Badges zeigen keinen Zähler).

### 3. „Zug beenden"-Button als HTML-Overlay

**Position:** Unterhalb des Badges, horizontal zentriert auf dem Spielerportal.  
**Sichtbar wenn:** `isActive && actionCount >= maxActions`  
**Neuer Komponente:** `EndTurnButton.tsx` — erhält Props `onEndTurn: () => void`; rendert `null` wenn nicht sichtbar.

**Alternative:** Button ins Badge integrieren. Problem: Badge wird bei geklicktem Button zum primären Interaktionselement, Klick auf Badge öffnet Dialog — Konfusion. Separate Komponente ist klarer.

### 4. Canvas-UI-Panel entfernen

`drawUIButton` wird aus dem `renderFrame`-Aufruf in `CanvasGameBoard.tsx` entfernt. Die `ui-end-turn`-Region in `canvasRegions.ts` wird ebenfalls entfernt (der Klick-Handler in `CanvasGameBoard.tsx` delegiert zum HTML-Button).

### 5. Spielername-Prop

`playerName?: string` — Gegner-Badges übergeben keinen Namen (Gegner-Namen sind im Canvas gezeichnet). Eigenes Badge bekommt `resolvePlayerName(myPlayerID, me.name)`.

## Risks / Trade-offs

- **Badge-Breite** variiert mit Spielername-Länge → `max-width: 220px, text-overflow: ellipsis`
- **Aktionszähler nur für aktiven Spieler sichtbar?** → Badge zeigt `actionCount/maxActions` wenn `isActive`, sonst nicht (Gegner sehen ihre Aktionszähler im eigenen Badge)
- **`drawOpponentActionCounter` bleibt** — zeigt nicht-aktiven Spielern den Stand des aktiven Spielers im Canvas; vorerst unverändert

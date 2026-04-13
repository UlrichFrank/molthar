## Why

Aktivierte Charakterkarten werden beim lokalen Spieler korrekt um 180° gedreht gerendert (sie liegen „umgekehrt" wie im physischen Spiel). Bei gegnerischen Spielern fehlt diese 180°-Drehung — die Karten werden aufrecht innerhalb der (bereits rotierten) Gegnerzone gezeichnet. Der Fehler liegt in der Render-Funktion `drawOpponentZone` in `gameRender.ts`.

## What Changes

- `drawOpponentZone` rendert jede aktivierte Charakterkarte eines Gegners mit einer zusätzlichen 180°-Drehung um den Kartenmittelpunkt — identisch zum Verhalten in `drawActivatedCharactersGrid` für den lokalen Spieler.
- Der Region-Winkel für `opponent-activated-character`-Regionen in `canvasRegions.ts` wird um `Math.PI` ergänzt (`rot + Math.PI` statt `rot`) — semantische Korrektheit, visuell kein Unterschied (rechteckige Regionen).

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `opponent-activated-card-detail`: Die gegnerischen aktivierten Karten werden korrekt um 180° gedreht dargestellt (Rendering-Fix).

## Impact

- `game-web/src/lib/gameRender.ts`: Loop in `drawOpponentZone` — jede Karte in einem `save/rotate(Math.PI)/restore`-Block zeichnen
- `game-web/src/lib/canvasRegions.ts`: `angle`-Wert der `opponent-activated-character`-Regionen von `rot` auf `rot + Math.PI` anpassen

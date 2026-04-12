## Why

Der Spieler kann im Spiel als Aktion die ausliegenden 4 Perlenkarten abräumen und 4 neue aufdecken (`replacePearlSlots`-Move). Dieser Move ist im Backend bereits vollständig implementiert, aber es gibt keinen UI-Einstiegspunkt — der Spieler hat keine Möglichkeit, die Aktion auszulösen.

## What Changes

- Ein „Tauschen"-Button wird auf dem Canvas neben dem Perlenkartenstapel gezeichnet.
- Bei Klick auf den Button wird der Move `replacePearlSlots` aufgerufen.
- Der Button ist nur sichtbar und klickbar, wenn der lokale Spieler am Zug ist und noch Aktionen übrig hat.

## Capabilities

### New Capabilities

- `replace-pearl-slots-button`: Canvas-Button neben dem Perlenstapel, der `replacePearlSlots` auslöst — sichtbar nur für den aktiven Spieler mit verbleibenden Aktionen.

### Modified Capabilities

- `canvas-ui-rendering`: Ein neues UI-Button-Element für den Perlen-Tauschen-Button wird auf dem Canvas gerendert (analog zu bestehenden `drawUIButton`-Aufrufen).
- `canvas-card-interaction`: Der neue Button-Bereich muss im Hit-Test registriert werden, damit Klicks korrekt erkannt werden.

## Impact

- `game-web/src/lib/gameRender.ts` — Neuer `drawUIButton`-Aufruf für den Tauschen-Button
- `game-web/src/lib/canvasRegions.ts` — Neue Region für den Tauschen-Button im Hit-Test
- `game-web/src/lib/cardLayoutConstants.ts` — Ggf. Positions-Konstante für den Button
- `game-web/src/components/CanvasGameBoard.tsx` — Klick-Handler für den neuen Button

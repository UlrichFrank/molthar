## Why

Die Gegner-Zonen im Canvas rendern den Spielernamen als Text-Label am unteren Rand der rotierten Zone. Diese Information ist redundant: HTML-Overlays (`PlayerStatusBadge`) zeigen den Namen bereits für jede Gegner-Zone. Das Canvas-Label ist visuell störend und hinterlässt toten Code im Interface.

## What Changes

- Entfernung des Name-Render-Blocks (~18 Zeilen) aus `drawOpponentZone` in `gameRender.ts`
- Entfernung des Feldes `name: string` aus dem `OpponentZoneData` Interface
- Entfernung der `name`-Befüllung aus dem Construct-Code in `CanvasGameBoard.tsx`

## Capabilities

### New Capabilities

(keine)

### Modified Capabilities

(keine — reine Entfernung ohne Verhaltensänderung an bestehenden Specs)

## Impact

- `game-web/src/lib/gameRender.ts` — `OpponentZoneData` Interface + `drawOpponentZone` Render-Block
- `game-web/src/components/CanvasGameBoard.tsx` — Construct-Stelle für `OpponentZoneData`

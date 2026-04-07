## Why

Der "Perlenkarte zurückholen"-Dialog zeigt zwar die gespielten Karten, aber ein Klick auf eine Karte hat keine sichtbare Wirkung — die Karte landet nicht in der Hand. Das liegt daran, dass die `resolveReturnPearl`-Move-Guards `undefined` zurückgeben statt `INVALID_MOVE`, wodurch boardgame.io den Pending-State nicht zurücksetzt und der Dialog nach dem Schließen sofort wieder geöffnet wird.

## What Changes

- Alle Guard-`return;`-Statements in `resolveReturnPearl` auf `return INVALID_MOVE` umstellen, damit boardgame.io den Move korrekt als ungültig markiert
- Klick-Verdrahtung im Dialog verifizieren (bereits korrekt verdrahtet — kein UI-Code-Change nötig)

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `retrieve-pearl-card-dialog`: Klick auf eine Karte muss den Move auslösen, die Karte zurück in die Hand legen und den Dialog schließen — ohne sofortiges Wiederöffnen.

## Impact

- `shared/src/game/index.ts` — `resolveReturnPearl` Guard-Returns auf `INVALID_MOVE` umstellen

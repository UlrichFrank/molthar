## 1. Backend: Move guard returns

- [x] 1.1 In `resolveReturnPearl` (shared/src/game/index.ts), alle Guard-`return;`-Statements auf `return INVALID_MOVE` umstellen

## 2. Verifikation

- [x] 2.1 Klick-Verdrahtung im `TakeBackPlayedPearlDialog` und in `CanvasGameBoard` prüfen — kein Code-Change nötig wenn bereits korrekt verdrahtet

## 3. Fix: Dialog-Rendering direkt aus Game-State steuern (Root Cause)

- [x] 3.1 In `CanvasGameBoard.tsx` den `useEffect` der den Take-Back-Dialog auto-öffnet entfernen — Rendering wird stattdessen direkt aus `G.pendingTakeBackPlayedPearl && myPlayerID === activePlayerID` gesteuert
- [x] 3.2 Die Rendering-Bedingung `dialog.dialog.type === 'take-back-played-pearl'` durch `G.pendingTakeBackPlayedPearl && myPlayerID === activePlayerID` ersetzen
- [x] 3.3 `dialog.closeDialog()` aus `onTakeBack`- und `onDismiss`-Callbacks entfernen — Dialog schließt automatisch wenn `G.pendingTakeBackPlayedPearl` auf `false` geht

## Why

The "Perlenkarten Stehlen" (Steal Pearl Card) dialog is broken: in step 2 the user cannot select a card from the opponent's hand. Clicking a card should steal it into the player's hand, but nothing happens.

## What Changes

- Fix card selection in `StealOpponentHandCardDialog` step 2 so clicking a card triggers the steal and closes the dialog
- Fix wrong face-down card image path in step 1 (`Perlenkarte-Rückseite.png` → `Perlenkarte Hinten.png`)
- Ensure `resolveStealOpponentHandCard` in the game move properly returns `INVALID_MOVE` on guard failures

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `steal-opponent-hand-card-dialog`: Card selection in step 2 must work — clicking a card calls the move and closes the dialog. Step 1 face-down image must resolve correctly.

## Impact

- `game-web/src/components/StealOpponentHandCardDialog.tsx` — fix image path and verify click wiring
- `shared/src/game/index.ts` — `resolveStealOpponentHandCard` guard returns (`INVALID_MOVE`)

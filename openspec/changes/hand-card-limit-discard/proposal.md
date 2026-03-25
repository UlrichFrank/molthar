## Why

After a player executes actions (including action abilities from activated cards), they may accumulate cards that exceed their hand limit (5 + bonus cards allowed by active character cards). Currently, there's no way for players to reduce their hand size to comply with the limit. This change introduces a discard mechanism that activates when the hand limit is exceeded, allowing players to manage their hand size before ending their turn.

## What Changes

- Add a **discard button** positioned above the "End Turn" button that activates when hand cards exceed the limit
- Implement **hand card limit enforcement** that checks after all actions are completed
- Create a **card discard dialog** allowing players to select and confirm discard of excess cards
- **Remove** selected cards from hand and add them to the discard pile when confirmed
- Dialog can be closed with "Cancel" without discarding cards

## Capabilities

### New Capabilities

- `hand-card-limit-check`: Post-action validation that checks if hand card count exceeds the limit (5 + character card bonus). Triggers discard flow when limit is exceeded.
- `card-discard-interface`: UI button and dialog for player card selection and discard confirmation. Includes button above "End Turn" and modal dialog with Cancel/Confirm Discard options.

### Modified Capabilities

- `action-counter-display`: Will need to integrate with the hand limit check to trigger discard flow after all actions are completed

## Impact

- **Game Logic**: Core turn flow - need to hook into action completion lifecycle
- **UI Components**: New button component above "End Turn", new/modified dialog component for card selection
- **State Management**: Track when discard is required, manage discard state during selection
- **Game Rules**: Integration with existing character card bonus logic and card management system

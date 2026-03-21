## Why

The game's turn system must clearly communicate to players:
1. **Whose turn it is** - which player is currently active
2. **How many actions remain** - the action counter for the current player
3. **Dynamic action tracking** - actions can increase due to activated character abilities

Currently, this information needs better visibility and must be consistently displayed on the game board to ensure players understand the game state at all times.

## What Changes

- Add/improve turn indicator showing the active player on the game board
- Implement action counter display showing current actions vs. maximum actions for the active player
- Support dynamic action increases from activated character abilities
- Ensure the display is positioned bottom-left on the game board for clear visibility
- Update display in real-time as actions are consumed or increased
- Track both base actions (3 per turn) and bonus actions from card abilities

## Capabilities

### New Capabilities
- `turn-indicator-display`: Shows which player is currently active (includes player order visualization)
- `action-counter-display`: Shows current/maximum actions for active player with visual feedback (e.g., color change when limit reached)
- `action-counter-updates`: Real-time updates to action counter as actions are consumed or increased by abilities

### Modified Capabilities
- `turn-management`: Existing turn system needs to expose action counts for display purposes

## Impact

- **Frontend**: Game board display (bottom-left corner), canvas rendering, game state consumption
- **Game State**: Ensure action count is properly tracked and exposed in GameState
- **Turn System**: End turn button and action validation rely on this information
- **Player Experience**: Clear visibility of remaining actions prevents confusion about turn state

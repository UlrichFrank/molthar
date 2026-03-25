## Why

Currently, the turn indicator provides minimal visual feedback for inactive players. Players cannot easily identify which player's turn it is, and non-active players have no clear visual distinction. This change improves game clarity by adding distinct visual styling and player identification to the turn indicator, making it immediately clear whose turn it is and what position that player occupies in the turn order.

## What Changes

- Turn indicator changes color based on player state: **blue for non-active players**, standard colors for active player
- Player ID is now displayed in the turn indicator text (e.g., "Player 2 1/3" instead of just "1/3")
- The separate "Player X Active" indicator below the turn status is **removed**
- Turn indicator is repositioned downward to occupy the space previously used by the removed "Player X Active" display
- The display now shows which player is being referenced in a single consolidated indicator

## Capabilities

### New Capabilities
- `non-active-player-indicator`: Visual distinction and player ID display for non-active players in the turn indicator

### Modified Capabilities
- `turn-indicator-display`: The existing turn indicator now displays player information and responds to player active state

## Impact

- **Affected Components**: `TurnIndicatorDisplay.tsx` component
- **Styling Changes**: CSS for turn indicator styling with new blue color state
- **Data Changes**: Pass player ID to the display component
- **UI/UX**: Clearer visual feedback about game state and player identification

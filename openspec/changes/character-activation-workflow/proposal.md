## Why

When a player activates a character card from their portal, the card should be moved to the activated characters area and rotated 180 degrees to indicate it has been used. Currently, the card remains in the portal (not removed), creating an inconsistent game state where the same card appears to be in two places. This breaks the model of how activated cards should be tracked in boardgame.io.

## What Changes

- Define the lifecycle of a character card: Market (Auslage) → Portal → Activated Characters area
- Implement removal of the card from the portal when `activatePortalCard` move is executed
- Update GameState to track activated characters separately from portal characters
- Update player's portal state to reflect that the card has been removed after activation
- Ensure the activated card's rotation state (180 degrees) is properly stored and rendered
- Verify the ActivatedCharacter interface correctly models the card, activation status, and rotation state

## Capabilities

### New Capabilities

- `character-lifecycle-modeling`: Model the full lifecycle of character cards (market → portal → activated)
- `portal-card-removal`: Remove character card from portal when activated
- `activated-character-state`: Track activated character state separately from portal cards

### Modified Capabilities

- `character-activation`: Character card removal from portal must be part of the activation move
- `activated-characters-grid`: Display only truly activated (removed from portal) characters in the activated area

## Impact

- **Backend**: `shared/src/game/index.ts` - Update `activatePortalCard` move to remove card from portal
- **Backend**: `shared/src/game/types.ts` - Review ActivatedCharacter interface (may already be correct)
- **GameState Consistency**: Ensure cards are never duplicated across portal and activated areas
- **Frontend**: `game-web/src/lib/gameRender.ts` - May need adjustment if portal rendering expects card in portal array
- **No breaking changes**: This is a bug fix that makes the state model consistent


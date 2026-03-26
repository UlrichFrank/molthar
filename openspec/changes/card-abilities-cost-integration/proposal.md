## Why

The card abilities and cost calculations are currently defined in `cards.json` but are not reflected in the boardgame.io game state. This means the game engine cannot access or use these capabilities during gameplay. Additionally, there are no tests for the cost calculation logic, making it difficult to verify correctness and prevent regressions when balancing changes are made.

## What Changes

- Load card special abilities (red/blue ability types) from `cards.json` into the boardgame.io `GameState`
- Load card cost components and rules from `cards.json` into the boardgame.io `GameState`
- Implement cost calculation logic that accounts for:
  - Fixed sums
  - N-tuples (pairs, triplets, etc.)
  - Sequential runs
  - Diamond modifiers (reduce cost by 1 per diamond)
  - Other cost types defined in the data
- Create comprehensive unit tests for cost validation and calculation
- Ensure cost validation is enforced during the `activatePortalCard` move

## Capabilities

### New Capabilities

- `card-abilities-loading`: Load character card special abilities (red/blue) from cards.json into game state
- `card-cost-loading`: Load character card cost components from cards.json into game state
- `cost-calculation-engine`: Implement deterministic cost calculation for card activation (handles fixed sum, runs, pairs, diamonds, etc.)
- `cost-validation-tests`: Comprehensive unit tests for cost calculation covering all cost types and edge cases

### Modified Capabilities

- `character-activation`: Cost validation must use the new cost calculation engine to verify player can afford card activation

## Impact

- **Backend**: `shared/src/game/index.ts` - Add cost calculation logic and integrate with `activatePortalCard` move
- **Backend**: `shared/src/game/types.ts` - May need to extend types if new cost properties are needed
- **Testing**: `shared/src/game/` - Add comprehensive cost calculation test suite
- **Card Data**: `cards.json` structure may need validation to ensure all required cost properties are present
- **No breaking changes**: This is purely additive - existing game state and moves remain compatible


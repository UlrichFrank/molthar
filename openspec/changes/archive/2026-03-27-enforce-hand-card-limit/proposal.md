## Why

Currently, players can hold unlimited pearl cards in their hand, which breaks game balance. The game requires a hand card limit enforcement mechanism at the end of each turn to prevent excessive accumulation. This also requires a user-friendly interface to choose which cards to discard when the limit is exceeded.

## What Changes

- Add `handLimitModifier` field to PlayerState (Boardgame.io state model) to track cumulative hand limit increases from activated characters
- Update `handLimitModifier` when characters with `handLimitPlusOne` ability are activated (part of character activation move)
- Add validation at end-of-turn to enforce hand card limit (base: 5 cards, + `handLimitModifier` from player state)
- Create a discard dialog that appears when player exceeds hand limit
- Dialog allows player to select which pearl cards to discard to Ablagestapel (discard pile)
- Prevent turn from ending until hand is within limit

## Capabilities

### New Capabilities
- `hand-card-limit-enforcement`: Calculation and validation of maximum hand size based on base limit (5) plus modifiers from activated characters
- `hand-card-discard-dialog`: Dialog UI for selecting which pearl cards to discard when hand exceeds limit at end-of-turn

### Modified Capabilities
- `turn-flow`: End-of-turn flow now includes hand limit validation and discard dialog before allowing turn to complete

## Impact

**Affected Systems:**
- Game state: PlayerState extends with `handLimitModifier` field to track cumulative increases from `handLimitPlusOne` abilities
- Character activation move: Must increment `handLimitModifier` for each activated character with `handLimitPlusOne` ability
- UI: New discard dialog component
- Turn flow: Added end-of-turn validation step
- End-turn move: Checks hand limit and triggers discard if needed

**APIs:**
- PlayerState type definition extends with `handLimitModifier: number` field
- Game move validation for end-turn (reads `player.handLimitModifier` from state)
- Character activation move scans for `handLimitPlusOne` ability and updates modifier
- New dialog presentation/dismissal logic

**Breaking Changes:**
- Turn ending behavior changes - players must resolve hand limit before ending turn

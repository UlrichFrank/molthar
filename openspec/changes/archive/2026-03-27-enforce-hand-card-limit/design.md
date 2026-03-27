## Context

The game currently allows unlimited pearl cards in player hands, breaking game balance. At end-of-turn, players must reduce their hand to the maximum allowed size. The maximum is 5 cards, plus additional cards for each activated character card with the `handLimitPlusOne` ability.

The Boardgame.io game state (GameState/PlayerState) must track the cumulative hand limit modifier from activated characters. This is a persistent game state value that increases when characters with `handLimitPlusOne` are activated.

Current state:
- No hand card limit validation exists
- PlayerState lacks `handLimitModifier` field
- End-turn flow doesn't check hand size
- No discard dialog UI exists
- Character activation move doesn't scan for or update `handLimitPlusOne` modifiers
- Characters with `handLimitPlusOne` ability exist in the card database

## Goals / Non-Goals

**Goals:**
- Enforce hand card limit at end-of-turn with dynamic calculation based on activated characters
- Present user-friendly dialog when hand exceeds limit
- Allow player to select specific cards to discard
- Prevent turn from ending until hand is within limit
- Validate that correct number of cards are discarded

**Non-Goals:**
- Automatic card discard (player must manually select)
- Retroactive enforcement during turn (only at end-of-turn)
- Special rules for discard order or effects
- Detailed character ability UI (assume abilities already visible)

## Decisions

**1. Hand Limit Modifier Storage: Computed vs. Persistent State**
- **Decision**: Store `handLimitModifier` as persistent field in PlayerState
- **Rationale**: Single source of truth in game state, prevents desync between server/client, available for validation at end-turn
- **Alternative Considered**: Compute on-the-fly from activatedCharacters list → More error-prone if activation state changes mid-validation

**2. Hand Limit Calculation Location: Game State vs. Move Validation**
- **Decision**: Calculate in game move validation layer (backend) using `player.handLimitModifier` from state
- **Rationale**: Single source of truth, prevents cheating/desync, logic is game-rule not UI
- **Alternative Considered**: UI-only validation → Vulnerable to manipulation

**2. Discard Dialog Presentation**
- **Decision**: Block normal end-turn flow with modal dialog until resolved
- **Rationale**: Clear UX, prevents accidental over-hand situations
- **Alternative Considered**: Allow turn end and handle discard next turn → Breaks game flow

**3. Identifying Hand-Limit Modifiers**
- **Decision**: Scan activated characters' abilities for specific modifier type (e.g., ability property or character card property)
- **Rationale**: Extensible, no hardcoding of specific cards
- **Alternative Considered**: Hardcoded list of card IDs → Breaks when new cards added

**4. Discard Selection Implementation**
- **Decision**: New dialog component (similar to CharacterActivationDialog, DiscardCardsDialog) with card selection checkboxes
- **Rationale**: Reusable pattern, consistent UX with existing dialogs
- **Alternative Considered**: Drag-and-drop → Overkill for this use case

**5. State Management for Discard**
- **Decision**: Dialog state in React component (selectedCards, hand), no game state mutation until confirmation
- **Rationale**: Dialog is transient UI concern, only persist decision via move call
- **Alternative Considered**: Store in game state → Unnecessary complexity

## Risks / Trade-offs

**[Risk] PlayerState schema change - backward compatibility**
- Scenario: Existing game states lack `handLimitModifier` field
- Mitigation: Initialize `handLimitModifier = 0` for all new games; provide migration for in-progress games if needed

**[Risk] Sync between activatedCharacters with `handLimitPlusOne` and handLimitModifier**
- Scenario: `handLimitModifier` gets out of sync with actual activated characters
- Mitigation: Always update `handLimitModifier` in activation move when `handLimitPlusOne` is detected; validation tests check consistency

**[Risk] Player has no cards to discard but still over limit**
- Scenario: Hand somehow exceeds limit with no valid moves to discard
- Mitigation: This shouldn't happen; validate in move that discard count matches required amount

**[Risk] Network delay with discard confirmation**
- Scenario: Player submits discard, waits for server response, lag occurs
- Mitigation: Add loading state to button during submission

**[Trade-off] Manual selection vs. automatic discard**
- Choosing automatic (best cards by value): Simpler but removes player agency
- Choosing manual (current design): Slightly more UX steps but better gameplay

## Migration Plan

1. **Backend**: Add hand limit calculation utility and validation in endTurn move
2. **Frontend**: Create DiscardCardsDialog component
3. **Game Flow**: Integrate dialog into turn-end sequence
4. **Testing**: Validate limit with various character combinations

Rollback: Disable dialog in conditional flag if issues arise; default to current behavior (no limit).

## Open Questions

- How should `handLimitModifier` be initialized in game setup? (0 for all players is correct per implementation)
- Do character abilities with `handLimitPlusOne` property already exist in the card database, or need to be added?
- Which character activation move exists? How is it structured? Does it already scan ability properties?
- Should discarded cards have any effects (logging, animations) or just removed to discard pile?
- Should the hand limit be visible to the player before reaching end-turn (e.g., "5/7 cards" indicator)?

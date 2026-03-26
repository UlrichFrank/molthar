## Context

Currently, in `activatePortalCard` move:
1. A card is taken from `player.portal[portalSlotIndex]`
2. The card is activated (marked with `entry.activated = true`)
3. Power points and diamonds are granted
4. BUT: The card is **not removed from the portal array**

This means the card exists in both:
- `player.portal` (original location)
- Rendered in the activated characters grid (via the `activated` flag)

The GameState tracks activated characters implicitly via the `activated: boolean` flag, but doesn't enforce removal from the portal array.

The ActivatedCharacter interface already has the structure:
```typescript
interface ActivatedCharacter {
  id: string;
  card: CharacterCard;
  activated: boolean;  // rotation state indicator
}
```

When `activated = true`, the card should be removed from the normal portal display and appear only in the activated area. The current implementation doesn't do this removal.

## Goals / Non-Goals

**Goals:**
- Remove character cards from the portal array when they are activated
- Ensure a card cannot exist in both the portal and activated areas simultaneously
- Update the GameState to reflect the card's new location in the activated characters section
- Keep the activated card data (ActivatedCharacter) consistent with the portal removal
- Maintain the 180-degree rotation state for activated cards

**Non-Goals:**
- Change the ActivatedCharacter interface (it's already correct)
- Modify the rendering logic in game-web (that depends on correct GameState)
- Add new card states or mechanics
- Change character ability triggering logic (separate feature)

## Decisions

**Decision 1: Remove from portal during activation, not during rendering**
- Remove the card from `player.portal` array immediately when `activatePortalCard` move executes
- Don't rely on rendering to hide the card (hide via frontend logic)
- Rationale: GameState should be the source of truth; rendering just displays it
- Alternative considered: Filter cards in frontend during render - would lead to state/view inconsistency

**Decision 2: Maintain ActivatedCharacter with activated flag**
- Keep the `activated: boolean` flag for rotation state tracking
- Use removal from portal + this flag together to indicate a truly activated card
- Rationale: The activated flag still serves the rotation UI purpose
- Alternative considered: Remove the flag entirely - less clear intent in code

**Decision 3: Single source of truth for card location**
- A card is EITHER in `player.portal` (with activated=false) OR removed from portal (with activated=true)
- Never both states simultaneously
- Rationale: Prevents bugs from duplicate card references
- Alternative considered: Keep in portal and use flags - more error-prone

**Decision 4: Splice card from portal array during activation**
- Use `player.portal.splice(portalSlotIndex, 1)` to remove the card
- After removal, the activated card still exists in memory (captured before splice)
- Rationale: Clean, standard array operation; GameState remains consistent
- Alternative considered: Set to null instead of splicing - leaves empty slots, harder to manage

## Risks / Trade-offs

**Risk**: If card is removed from portal but activation fails later, the card is lost
- **Mitigation**: Ensure all validation happens BEFORE removal. Card should only be removed after successful activation.

**Risk**: Frontend code might expect card to still be in portal array
- **Mitigation**: Review game-web rendering code. If it filters by `activated` flag, should work fine. If it expects presence in array, update.

**Risk**: Existing game state saves might have activated cards still in portal
- **Mitigation**: This is a bug fix, not a breaking change. Old saves would load with the bug still present, but new activations will be correct.

**Risk**: Portal has max 2 slots; if card isn't removed, player can't add new cards
- **Mitigation**: This bug is actually preventing players from filling the portal! The fix enables the intended behavior.

## Migration Plan

1. Update `activatePortalCard` move to remove card from portal
2. Add test to verify card is removed
3. Add test to verify card is no longer accessible via portal array after activation
4. Run full game test suite to verify no regressions
5. No player data migration needed - this is a logic fix

## Open Questions

- Should we validate that `portalSlotIndex` is still valid after activation? (Probably yes, as safety check)
- If a player tries to activate a card that's no longer in the portal, should we return an error? (Yes, probably)
- Do we need to track the removal in the game log for replay? (Not for this change, but something to consider)


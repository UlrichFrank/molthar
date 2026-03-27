## Context

The game allows players to execute a fixed number of actions per turn (3 base actions) plus additional actions from ability cards. After actions complete, players may have accumulated cards beyond their hand limit. The hand limit is 5 cards base, plus bonus cards allowed by active character cards.

Currently, there is no mechanism to enforce or manage hand size limits. The system has:
- Action counter display tracking available actions
- Character cards that can grant bonus hand capacity
- A hand card display system
- Card selection and dialog components already in use elsewhere

## Goals / Non-Goals

**Goals:**
- Automatically detect when hand size exceeds limit after all actions complete
- Provide a clear UI button to initiate discard flow
- Allow players to select specific cards from hand to discard
- Execute the discard action and update hand state
- Handle both base limit (5 cards) and character-card bonuses

**Non-Goals:**
- Prevent players from playing with excess cards mid-turn
- Create automatic discard logic (player must manually select)
- Modify the base hand limit system
- Change character card bonus calculation

## Decisions

**1. Hand limit check timing: After all actions complete**
- Rationale: Players may gain cards throughout their action sequence. Checking post-actions prevents interruptions and allows players to strategically use cards gained.
- Alternative: Check after each action (rejected - too many interruptions)

**2. Button placement: Above "End Turn" button**
- Rationale: Positions discard as prerequisite to ending turn, high visibility
- Alternative: Below hand cards (rejected - less visible, harder to target)

**3. Discard button activation: Only show when needed**
- Logic: Button is disabled/hidden until hand exceeds limit after actions
- Rationale: Reduces UI clutter when not needed
- Alternative: Always visible but disabled (rejected - unclear state)

**4. Discard selection mechanism: Modal dialog with checkbox/click selection**
- Reuse existing card selection patterns from card-selection-visual-feedback
- Dialog includes Cancel (discard nothing) and Confirm Discard (remove selected)
- Rationale: Consistent with existing patterns, clear state management
- Alternative: Inline hand modifications (rejected - confusing during action phase)

**5. State management: Game state tracks "requires-discard" flag**
- Set when hand exceeds limit after actions
- Cleared when discard dialog completes or Cancel is clicked
- Rationale: Allows UI to conditionally render button, prevents turn end while requiring discard

**6. Integration point: Hook into action completion event**
- After last action resolves, trigger hand size check
- If exceeded, set requires-discard flag
- Rationale: Minimal coupling, integrates with existing action lifecycle

## Risks / Trade-offs

**[Risk] Large hand sizes make selection difficult**
→ Mitigation: Implement scrolling in dialog if needed, consider card grouping by type (future optimization)

**[Risk] Player accidentally discards wrong cards**
→ Mitigation: Clear button labels, Cancel option always available, visual feedback on selection

**[Risk] State management complexity if turn flow interrupted**
→ Mitigation: Keep discard flag isolated, never proceed past discard if flag set. Consider turn reset behavior.

**[Trade-off] Button visibility vs. screen real estate**
→ Trade: Button takes space above End Turn. Benefit: Clear, discoverable mechanic vs. hidden under menu.

## Migration Plan

1. Implement hand limit check logic
2. Add discard button component (initially hidden)
3. Create card discard dialog component
4. Integrate button visibility logic with requires-discard flag
5. Wire dialog confirm/cancel actions
6. Test with various hand sizes and character card bonus combinations

## Open Questions

- Should the discard button be animated when it first appears?
- Should there be feedback (toast/message) when discard is required?
- How should we handle edge case where player somehow gets hand over limit without discard occurring?

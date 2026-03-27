## Context

The `TurnIndicatorDisplay.tsx` component currently displays turn information as a visual indicator showing which turn position the active player is in (e.g., "1/3"). This information is overlaid on the game board canvas. The component receives `activePlayerIndex` and `totalPlayers` but doesn't display player-specific information or differentiate visual styling based on whether the current player is active.

For non-active players, there is currently no clear visual indication that they are not in control. The indicator remains the same regardless of player state, reducing game clarity.

**Goals:**
- Display player ID (player name/number) alongside turn position in the indicator
- Apply blue color styling to the turn indicator when displaying non-active player information
- Maintain consistent styling with the rest of the UI
- Show format like "Player 2 1/3" (player name/id, then turn position)
- Remove the separate "Player X Active" indicator display
- Reposition the turn indicator downward to consolidate the UI

**Non-Goals:**
- Modify the game state or turn logic
- Add new indicators or separate components
- Change behavior for active players

## Decisions

**Decision 1: Color scheme for non-active players**
- Use blue (`#3B82F6` or similar) for non-active player indicator
- Rationale: Blue is a cool, neutral color that clearly differentiates from active state without implying error or warning

**Decision 2: Text format and data**
- Format: "Player X Y/Z" where X is player number, Y is current turn, Z is total players
- Requires passing `playerID` or `playerName` to the component
- Rationale: Clear hierarchical information (who, what turn, total context)

**Decision 3: Styling approach**
- Modify existing CSS class or add conditional styling based on `isActivePlayer` prop
- Apply color change and text content changes together
- Keep existing structure and layout intact

**Decision 4: Consolidation of player information**
- Remove the separate "Player X Active" indicator component
- Move the turn indicator down to occupy the vertical space previously used by the removed indicator
- Rationale: Consolidates redundant information into a single display, reducing UI clutter

## Risks / Trade-offs

**[Risk] Prop drilling**
- Passing `playerID`/`playerName` from parent components adds a prop dependency
- Mitigation: Keep the props minimal and use the existing context pattern in the codebase

**[Risk] Color accessibility**
- Blue text on dark background needs sufficient contrast
- Mitigation: Test color combinations against WCAG standards; use `#3B82F6` or adjust if needed

**[Trade-off] Text width variation**
- Player names of different lengths may affect layout
- Mitigation: Use fixed-width styling or padding to maintain consistent button placement

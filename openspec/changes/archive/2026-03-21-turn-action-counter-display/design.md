## Context

The game board currently displays basic game state but lacks clear turn and action information. Players need to know:
- **Active player**: Who's currently playing
- **Action budget**: How many actions are available vs. consumed
- **Dynamic actions**: When character abilities grant extra actions

Current implementation has an action counter but it's not prominently displayed. The turn system properly tracks actions in GameState, but the UI doesn't dynamically reflect bonus actions from activated cards.

## Goals / Non-Goals

**Goals:**
- Display active player indicator on game board (bottom-left)
- Display action counter (current/max) with clear visual feedback
- Support dynamic action increases from character abilities
- Ensure counter updates in real-time as actions are consumed or granted
- Make the information accessible to all players

**Non-Goals:**
- Redesign the entire game board layout
- Change the underlying turn system logic
- Implement action undo/rollback features
- Add tooltips or detailed action history

## Decisions

### Decision 1: Display Location (bottom-left)
**Choice**: Position action counter and turn indicator at bottom-left of game board

**Rationale**: Game rules specify this location; keeps important info in consistent, accessible area away from main action zones

**Alternatives Considered**:
- Top-left: Conflicts with phase indicator
- Inline with buttons: Would clutter the UI
- Floating badge: Could obscure game elements

### Decision 2: Action Counter Appearance
**Choice**: Show as "Actions: N/M" with color coding (green normal, red at limit, yellow when increased)

**Rationale**: Numeric display is unambiguous; color provides quick visual feedback about action state

**Alternatives Considered**:
- Progress bar: Less precise for discrete actions
- Icon array: Takes up more space
- Text only: Harder to see at a glance

### Decision 3: Bonus Action Integration
**Choice**: Track bonus actions in GameState; recalculate max actions after each ability activation

**Rationale**: Keeps game logic centralized; UI just renders what engine provides

**Alternatives Considered**:
- Track separately in UI state: Creates sync issues
- Pre-calculate all bonuses at turn start: Misses mid-turn ability activations

### Decision 4: Active Player Indicator
**Choice**: Simple text label "Player X Active" alongside action counter

**Rationale**: Minimal, unambiguous; complements turn order visualization elsewhere

**Alternatives Considered**:
- Highlight opponent portals: Only works when visible
- Animation/pulse: Distracting; less accessible
- Name display: Requires player name data

## Risks / Trade-offs

[Risk: Performance impact from frequent counter updates]
→ Mitigation: Counter updates only when action count changes; batch updates during turn

[Risk: Color-blind players may miss visual feedback]
→ Mitigation: Always include numeric display; consider additional text indicators

[Risk: Bonus actions from multiple sources could overflow display]
→ Mitigation: Action count capped by game rules (typically 3 base + 2-3 bonus max)

## Migration Plan

1. Update GameState to track and expose bonus actions per player
2. Implement `turn-indicator-display` component for active player info
3. Implement `action-counter-display` component with dynamic color coding
4. Wire both to game board's bottom-left area
5. Add real-time update handling when actions are consumed or abilities activate
6. Test with multi-player games to verify counter accuracy
7. Deploy as part of game board update

## Open Questions

- What's the maximum bonus actions a player can have from card abilities?
- Should we show action count for non-active players as well, or only active?
- Any accessibility requirements for color contrast?

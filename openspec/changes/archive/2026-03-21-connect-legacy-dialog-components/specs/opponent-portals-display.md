# Spec: Opponent Portals Display Integration

## Overview
The Opponent Portals display shows all opponent players' portal characters, activation status, and power point progress. This is a persistent board element (not a modal dialog), integrated into the game board layout.

## Placement
- Located on game board (not in a modal)
- Position: Depends on responsive layout
  - **Desktop (1000px+)**: Arranged around canvas (top, bottom, left, right based on player count/positions)
  - **Tablet (600-1000px)**: Stacked vertically above/below canvas
  - **Mobile (<600px)**: Carousel or tab-based (one opponent at a time)

## Visual Layout

### Desktop (4 Players)
```
          ┌──────────────────────────────┐
          │  Opponent 2 (Alice)          │
          │  Power: 8/12 [████░░░░░░░░]  │
          │  Portal: 2 characters        │
          │  ┌──────┐ ┌──────┐           │
          │  │ [Chr]│ │ [Chr]│           │
          │  │ Act✓ │ │ Act  │           │
          │  └──────┘ └──────┘           │
          └──────────────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│ Opponent 1 (Bob)     │    │ Opponent 3 (Carol)   │
│ Power: 5/12 [████░░] │    │ Power: 11/12[███████]│
│ Portal: 1 character  │    │ Portal: 2 characters │
│ ┌──────┐             │    │ ┌──────┐ ┌──────┐   │
│ │ [Chr]│             │    │ │ [Chr]│ │ [Chr]│   │
│ │ Act  │             │    │ │ Act  │ │ Act✓ │   │
│ └──────┘             │    │ └──────┘ └──────┘   │
└──────────────────────┘    └──────────────────────┘

       ┌────────────────────────┐
       │   GAME BOARD (Canvas)  │
       │                        │
       │   [Card Auslage]       │
       │   Your Hand            │
       │                        │
       └────────────────────────┘
       
       ┌──────────────────────┐
       │ You (Me)             │
       │ Power: 3/12 [███░░░] │
       │ Portal: 1 character  │
       │ ┌──────┐             │
       │ │ [Chr]│             │
       │ │ Act  │             │
       │ └──────┘             │
       │ [Interactive Cards]  │
       └──────────────────────┘
```

## Component Displays

### For Each Player (including self)
```
┌─────────────────────────────────┐
│ Player Name                     │
│ Power: 6/12 [██████░░░░░░]      │
│                                 │
│ Portal Characters (0-2 slots):  │
│ ┌──────────────┐  ┌──────────┐ │
│ │ [Image/Icon] │  │[Image/Icon]│
│ │ Slot 1       │  │Slot 2      │
│ │ (Activated)  │  │            │
│ │ [Character   │  │[Character  │
│ │  Name]       │  │ Name]      │
│ │ Power: 3     │  │Power: 5    │
│ │ ✓ Act        │  │ Act        │
│ └──────────────┘  └──────────┘ │
│                                 │
│ Hand Size: 5 cards              │
│ Discard Pile: 2 cards           │
└─────────────────────────────────┘
```

### Visual Elements Per Character Slot
- **Activated Status**: 
  - Green checkmark ✓ or "Activated" label = character already used this turn
  - No mark = character available to activate
- **Power Points**: Display character's power contribution
- **Ability Indicators**: Show red/blue ability icons (if applicable)
- **Character Image**: If available; otherwise colored placeholder
- **Character Name**: Below or overlaid on image

### Power Progress Bar
- Total power accumulated this turn
- Fraction of 12 (end-game threshold)
- Visual fill: e.g., `[██████░░░░░░]` for 6/12
- If >= 12: highlight in gold/different color (final round triggered)

## Component State & Updates

### Real-Time Updates
- **On character activation**: Update activated status immediately
- **On power gain**: Update power bar
- **On new character placed**: Add to portal
- **On character replaced**: Swap slot contents
- **On hand size change**: Update hand count

### Data Requirements
```typescript
interface OpponentPortalDisplay {
  player: {
    name: string;
    position: number; // 0-3 for 4-player game
  };
  powerPoints: number; // current accumulated power (0-12+)
  portal: {
    slots: [Character | null, Character | null]; // 0-2 slots, rest null
    activatedSlots: Set<number>; // indices of activated characters
  };
  hand: {
    cardCount: number; // number of cards in hand
    // Card details usually hidden for opponents
  };
  discardPile: {
    cardCount: number;
  };
  isCurrentPlayer: boolean; // highlighting
}
```

## Behavior & Interactivity

### Non-Interactive Elements
- Opponent portals are **display-only** for other players
- Clicking opponent character does nothing

### For Own Portal (Self)
- Clicking character slot triggers Character Activation Dialog
- Shows own hand and cost information
- See `character-activation-dialog.md` for details

### Updates on Game Actions
- When any player's state changes (takes card, activates character, etc.), update display
- No confirmation needed—just reflect current game state

## Responsive Design

### Desktop (1000px+)
- All 4 players visible simultaneously
- Arranged around canvas
- Full character images and details

### Tablet (600-1000px)
- 3 opponents visible + self
- Stacked layout or side-by-side
- Smaller character images

### Mobile (<600px)
- Only self visible by default
- Opponents available in carousel/tabs
- Compact layout, minimal text

## Performance
- Should update in <50ms on any game action
- No animation jank on power bar transitions
- Efficient re-renders (only affected player component updates)
- No unnecessary full-board redraws

## Testing Requirements
- [TC.1] OpponentPortals displays all players
- [TC.2] Power progress bars show correct values
- [TC.3] Activated characters show activation status
- [TC.4] Portal characters display correctly
- [TC.5] Updates when player activates character
- [TC.6] Updates when player takes new character
- [TC.7] Responsive layout on mobile/tablet/desktop
- [TC.8] No console errors on render
- [TC.9] Clicking own character opens activation dialog
- [TC.10] Clicking opponent character does nothing

## Related Specs
- `character-activation-dialog.md` — Triggered by clicking own portal character
- `character-replacement-dialog.md` — Affects portal display when replacement happens
- `game-state.md` — Source of truth for player data, power, portal state

## Implementation Notes
- Component likely exists in `OpponentPortals.tsx`—verify it accepts structured game state data
- Should be a child component of CanvasGameBoard, not a separate modal
- Consider memoization to prevent unnecessary re-renders
- If handling many players (>4), may need responsive grid layout
- Power bar could use CSS progress bar for better performance than custom SVG

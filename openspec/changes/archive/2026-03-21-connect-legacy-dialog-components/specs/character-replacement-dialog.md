# Spec: Character Replacement Dialog Integration

## Overview
The Character Replacement Dialog allows players to choose which of their portal characters to replace when taking a new character with a full portal (2 slots already occupied).

## Trigger Condition
- Player initiates `takeCharacterCard` move
- Player's portal is full (2 characters already placed)
- New character is successfully drawn from deck
- Dialog must appear before character is actually placed

## User Interface

### What the Player Sees
```
┌─────────────────────────────────────┐
│  Portal Slot Selection              │
├─────────────────────────────────────┤
│                                     │
│  Your portal is full.               │
│  Which character do you want to     │
│  replace?                           │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Slot 1: [Character A]          │ │
│  │ Power: 3 | Ability: Red Icon   │ │
│  │                           Select│ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │ Slot 2: [Character B]          │ │
│  │ Power: 5 | Ability: Blue Icon  │ │
│  │                           Select│ │
│  └────────────────────────────────┘ │
│                                     │
│         [Cancel]                    │
└─────────────────────────────────────┘
```

### Visual Requirements
- Modal overlay with semi-transparent background
- List of current portal characters (2 items)
- Each character shows: name, power points, ability icons
- "Select" button for each option (or click row)
- "Cancel" button to dismiss without action
- Clear visual indication of which option is hoverable

## Behavior

### On Mount
- Receive props:
  - `newCharacterId`: ID of character being taken
  - `portalCharacters`: Array of 2 current characters with metadata
  - `onSelect(slotIndex: number)`: Callback when selection made
  - `onCancel()`: Callback when dialog cancelled

### On Player Action
- **Click "Select" on a slot**:
  - Call `onSelect(slotIndex)` with 0 or 1
  - Dialog closes
  - Game engine updates: removes old character, adds new character to that slot
  
- **Click "Cancel"**:
  - Call `onCancel()`
  - Dialog closes
  - Game state unchanged (character return to deck)

### On Unmount
- Clean up any timers/listeners
- Ensure game state ready for next action

## Props Interface
```typescript
interface CharacterReplacementDialogProps {
  newCharacter: Character;
  portalCharacters: [Character, Character];
  onSelect: (slotIndex: 0 | 1) => void;
  onCancel: () => void;
}
```

## State Requirements
None—this is a pure presentational dialog. State is managed by parent (CanvasGameBoard or DialogProvider).

## Error Handling
- If `onSelect` or `onCancel` throws: log error, allow dialog to be dismissed manually
- If props malformed: show generic error state with "Go Back" button

## Accessibility
- ARIA labels for each slot option
- Keyboard navigation: Tab between options, Enter to select, Esc to cancel
- Focus trap within dialog (tab doesn't escape to board)
- Screen reader announces current selection

## Responsive Design
- Desktop (1000px+): Full dialog with character images
- Tablet (600-1000px): Compact layout, smaller images
- Mobile (<600px): Stacked list, full-width buttons

## Performance
- Should render in <100ms
- No animation jank on selection
- Dialog dismiss should not block other interactions

## Testing Requirements
- [TC.1] Dialog appears when portal full
- [TC.2] Dialog does not appear when portal has <2 characters
- [TC.3] Selecting a slot calls onSelect with correct index
- [TC.4] Cancel button calls onCancel
- [TC.5] Keyboard Esc key calls onCancel
- [TC.6] Character data displays correctly

## Related Specs
- `character-activation-dialog.md` — Similar dialog pattern for cost selection
- `opponent-portals-display.md` — Shows final state after replacement

## Implementation Notes
- Component likely already exists in `CharacterReplacementDialog.tsx`—integrate as-is if compatible
- If component props don't match interface above, refactor component to accept these props
- Modal backdrop should prevent board interaction while dialog open

# Spec: Character Activation Dialog Integration

## Overview
The Character Activation Dialog allows players to select which character in their portal to activate and which cards from their hand to use to pay the character's cost.

## Trigger Condition
- Player clicks/taps on a portal character slot during their turn
- Character is eligible to be activated (not already activated this turn)
- Dialog appears, showing character details and cost options

## User Interface

### What the Player Sees
```
┌──────────────────────────────────────┐
│  Character Activation                │
├──────────────────────────────────────┤
│                                      │
│  ┌───────────────────────────────┐   │
│  │ [Character Image]             │   │
│  │ Name: Sir Galahad             │   │
│  │ Power: 5 | Ability: Blue      │   │
│  └───────────────────────────────┘   │
│                                      │
│  Cost Required:                      │
│  ┌───────────────────────────────┐   │
│  │ [Cost Type] e.g. "Sum = 15"   │   │
│  │ Or "3 Pairs" or "Run 4-5-6"   │   │
│  └───────────────────────────────┘   │
│                                      │
│  Your Hand (Select cards to pay):    │
│  ┌──┬──┬──┬──┬──┐                     │
│  │ 3│ 4│ 7│ 7│ 8│  Selected: None    │
│  └──┴──┴──┴──┴──┘                    │
│  [Validate]                          │
│                                      │
│  Diamonds (Reduce cost by 1 per):    │
│  ○ Diamond (disable cost modifier)   │
│                                      │
│  [Activate] [Cancel]                 │
│  (Activate enabled only if cost valid)
└──────────────────────────────────────┘
```

### Visual Requirements
- Modal dialog, centered on screen
- Character portrait/image (if available)
- Character name and power/ability indicators
- Clear cost requirement display
- Interactive hand card selection (clickable/tappable)
- Selected cards should have visual highlight (e.g., gold outline)
- Diamond toggle (if diamonds present in hand)
- "Activate" button disabled until cost validated
- "Cancel" button always enabled

## Behavior

### On Mount
- Receive props:
  - `character`: Character object with cost requirements
  - `playerHand`: Array of card values in hand
  - `playerDiamonds`: Number of diamonds (or boolean if just 0/1)
  - `onActivate(cardIndices: number[], usedDiamonds: number)`: Call when activation confirmed
  - `onCancel()`: Call when cancelled

### Player Actions

#### 1. Select Cards from Hand
- Click/tap card in hand → toggle selection
- Selected cards show visual highlight
- System validates in real-time: show if cost is valid/invalid

#### 2. Use Diamonds
- If player has diamonds: toggle "Use Diamond" to reduce cost by 1
- System recalculates required cost

#### 3. Click "Activate"
- Only enabled when cost is valid (exact match)
- Call `onActivate(selectedCardIndices, diamondsUsed)`
- Dialog closes
- Game engine:
  - Removes selected cards from hand
  - Marks character as activated
  - Awards power points
  - Moves to next player or next phase

#### 4. Click "Cancel"
- Call `onCancel()`
- Dialog closes
- Game state unchanged (no cards consumed)

## Props Interface
```typescript
interface CharacterActivationDialogProps {
  character: Character; // includes cost, power, name
  playerHand: number[]; // array of card values, e.g. [3, 4, 7, 7, 8]
  playerDiamonds: number; // 0, 1, or more
  onActivate: (cardIndices: number[], diamondsUsed: number) => void;
  onCancel: () => void;
}

interface Character {
  id: string;
  name: string;
  powerPoints: number;
  cost: CostType;
  abilityRed?: string;
  abilityBlue?: string;
  image?: string;
}

type CostType = 
  | { type: 'fixedSum', value: number }
  | { type: 'identicalValues', count: number }
  | { type: 'run', length: number }
  | { type: 'pairs', count: number };
```

## Cost Validation Logic

### Fixed Sum
- Requires exact sum of selected cards = cost value
- Diamonds reduce cost: `requiredSum = cost - diamondsUsed`

### Identical Values
- Requires N cards of same value
- Each card set must be identical (e.g., two 7s for pairs)

### Run
- Requires N consecutive card values (e.g., 3-4-5)
- Cards must be sequential

### Pairs
- Requires N pairs (2 cards of same value per pair)
- E.g., "2 pairs" = {3,3,5,5} or {2,2,8,8}

**Validation must prevent activation unless cost exactly matched.**

## State Requirements
None—dialog is pure presentational. Cost validation is computed in real-time, not stored.

## Error Handling
- If cost cannot be paid with hand: show red "Cannot pay" message
- If `onActivate` or `onCancel` throws: log error, allow manual dismiss
- If character data malformed: show error state

## Accessibility
- ARIA labels for hand cards
- Keyboard: Tab between cards, Space/Enter to select, Esc to cancel
- Focus trap within dialog
- Screen reader announces "Cost valid" / "Cost invalid"

## Responsive Design
- Desktop (1000px+): Hand displayed in horizontal row
- Tablet (600-1000px): Hand in 2 rows if needed
- Mobile (<600px): Hand in vertical stack, larger touch targets

## Performance
- Real-time cost validation (debounced if needed)
- <50ms for validation on each card click
- Dialog should not cause canvas jank

## Testing Requirements
- [TC.1] Dialog appears when character clicked
- [TC.2] Dialog does not appear for already-activated characters
- [TC.3] Selecting cards updates cost validity in real-time
- [TC.4] Activate button enabled only when cost valid
- [TC.5] Selecting cards and clicking Activate calls onActivate with correct indices
- [TC.6] Cancel button calls onCancel
- [TC.7] Keyboard Esc key calls onCancel
- [TC.8] Cost validation works for all cost types (sum, pairs, run, identical)
- [TC.9] Diamond modifier reduces cost correctly
- [TC.10] Hand displays correct card values

## Related Specs
- `cost-payment-dialog.md` — Reusable cost validation component (may be embedded in this)
- `character-replacement-dialog.md` — Similar modal pattern for portal management
- `opponent-portals-display.md` — Shows updated opponent state after activation

## Implementation Notes
- Component likely exists in `CharacterActivationDialog.tsx`—verify it accepts these props
- Cost validation logic should be in game engine or shared utility (not in dialog component)
- Diamond handling may depend on whether character rewards diamonds (check game rules)
- If hand display is complex (100+ cards), consider virtualization/scrolling

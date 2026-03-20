## Why

The current game flow uses a click-to-select model where players click cards to mark them, then click a button to execute the action. This violates the game rules (3 actions per turn, each action should be immediate) and creates a disconnect between user intent and game logic. Cards must be taken directly on click without intermediate selection state.

## What Changes

- **Direct card taking**: Clicking a pearl/character card from the auslage immediately takes the card (no selection state)
- **Immediate action counting**: Taking a card counts as one action immediately; action count reflects true game state
- **Portal replacement flow**: When taking a character with full portal (2 cards), the CharacterReplacementDialog is shown immediately to complete the action
- **Hand visibility**: Remove selection-based highlighting; show only current game state (portal, hand size, action count)
- **Action limit enforcement**: Block card clicks when action count >= 3 (turn must end)
- **Game state consistency**: Every click → immediate move → immediate state update → no pending selections

## Capabilities

### New Capabilities

- `direct-card-taking`: Click pearl/character card → immediate move (take to hand/portal)
- `action-feedback`: Visual feedback for action count and remaining actions
- `portal-taking-with-replacement`: Taking character with full portal immediately shows replacement dialog

### Modified Capabilities

- `character-replacement-dialog`: Now triggered automatically when taking character with full portal
- `character-activation-dialog`: Separate activation flow from card taking (distinct interaction)

## Impact

**Affected Code:**
- `game-web/src/components/CanvasGameBoard.tsx` - Complete refactor of click handlers and selection state
- `game-web/src/lib/gameHitTest.ts` - May need adjustment to hit targets or add action validation
- Game UI - Remove selection highlighting, add action counter display

**APIs:**
- Game moves remain the same (`takeCharacterCard`, `takePearlCard`)
- No breaking changes to game engine

**UI/UX:**
- Selection highlights removed
- Action counter shown prominently
- Cards immediately disappear/move on click
- Dialogs appear immediately when needed

**Breaking Changes:**
- **BREAKING**: Selection state removed from component state (was tracking selectedPearl, selectedCharacter, selectedHandIndices)
- **BREAKING**: No more "Take Card" button - cards taken immediately on click

## Why

The four legacy dialog components (OpponentPortals, CharacterReplacementDialog, CharacterActivationDialog, CostPaymentDialog) are **technologically compatible** with the new canvas-based rendering system, but they are currently **disconnected from the game flow**. These dialogs provide essential UI for game interactions that cannot be handled by canvas overlays alone (multi-step dialogs, complex state management). Rather than removing them, we should integrate them into the game state management system, connecting them to the appropriate game moves and turn phases.

## What Changes

- **Integration Goals**: 
  - Connect dialogs to game state and events
  - Trigger CharacterReplacementDialog when player takes character with full portal
  - Trigger CharacterActivationDialog when player activates a portal slot
  - Trigger CostPaymentDialog as part of character activation flow
  - Display OpponentPortals as a game board element showing opponent progress
  
- **Refactoring**:
  - Modify dialogs to work with boardgame.io event system
  - Add dialog state management to GameState or component level
  - Connect dialog callbacks to game moves (takeCharacterCard, activatePortalCard)
  - Update CanvasGameBoard to render dialogs conditionally based on game state
  
- **No Component Removal**: Keep all components; make them functional and integrated

## Capabilities

### New Capabilities
- `character-replacement-dialog`: When player takes character with full portal, show dialog to choose replacement
- `character-activation-dialog`: Multi-step character activation with cost payment selection
- `cost-payment-dialog`: Detailed cost payment UI for character activation
- `opponent-portal-display`: Show all opponent portal slots and power points

### Modified Capabilities
- `game-flow-dialogs`: Changed from deprecated/removed to fully integrated and active

## Impact

- **Files Affected**: 
  - game-web/src/components/OpponentPortals.tsx (integrate as board display)
  - game-web/src/components/CharacterReplacementDialog.tsx (wire to takeCharacterCard move)
  - game-web/src/components/CharacterActivationDialog.tsx (wire to activatePortalCard move)
  - game-web/src/components/CostPaymentDialog.tsx (used by CharacterActivationDialog)
  - game-web/src/components/CanvasGameBoard.tsx (add dialog rendering/state)
  - game-web/src/styles/characterActivationDialog.css
  - game-web/src/styles/characterReplacementDialog.css
  - game-web/src/styles/costPaymentDialog.css

- **Breaking Changes**: None; this is purely integration, not removal

- **API Changes**: Minimal; dialogs will receive props from game state

- **Game Logic Changes**: None; only UI layer changes

- **Testing**: Verify dialog flows during actual gameplay (character taking, activation, cost payment)

- **Related**: Builds on CanvasGameBoard and responsive layout system

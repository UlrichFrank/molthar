## REMOVED Requirements

### Requirement: OpponentPortals component
**Status**: DEPRECATED and REMOVED  
**Reason**: Replaced by canvas-based opponent rendering in CanvasGameBoard.tsx. Legacy React component is no longer used.  
**Migration**: Use CanvasGameBoard for all opponent display. Responsive layout system provides flexible area sizing for opponent indicators.

#### Scenario: Opponent display in canvas board
- **WHEN** game is displayed on canvas
- **THEN** all opponent information is rendered via canvas (no React dialog needed)
- **AND** opponent indicators are positioned via responsive layout areas
- **AND** all opponent interactions work correctly

### Requirement: CharacterReplacementDialog component
**Status**: DEPRECATED and REMOVED  
**Reason**: Replaced by canvas-based character replacement UI in CanvasGameBoard.tsx. Legacy React dialog is no longer used.  
**Migration**: Use canvas-based UI for character replacement interactions. Dialog interactions now handled through canvas event system.

#### Scenario: Character replacement in canvas
- **WHEN** player triggers character replacement
- **THEN** canvas UI handles the interaction (no React dialog popup)
- **AND** character replacement workflow completes successfully
- **AND** UI state updates correctly

### Requirement: CharacterActivationDialog component
**Status**: DEPRECATED and REMOVED  
**Reason**: Replaced by canvas-based character activation UI in CanvasGameBoard.tsx. Legacy React dialog is no longer used.  
**Migration**: Use canvas-based UI for character activation. All activation interactions now handled through canvas event system.

#### Scenario: Character activation in canvas
- **WHEN** player activates a character
- **THEN** canvas UI handles the interaction (no React dialog popup)
- **AND** character activation workflow completes successfully
- **AND** power points update correctly

### Requirement: CostPaymentDialog component
**Status**: DEPRECATED and REMOVED  
**Reason**: Replaced by canvas-based cost payment UI in CanvasGameBoard.tsx. Legacy React dialog is no longer used.  
**Migration**: Use canvas-based UI for cost payment. Cost validation and payment workflow now handled through canvas event system.

#### Scenario: Cost payment in canvas
- **WHEN** player pays card costs
- **THEN** canvas UI handles cost validation (no React dialog popup)
- **AND** cost payment workflow completes successfully
- **AND** card state updates correctly

## New Capability: No Additional Capabilities

This is a removal-only change. No new capabilities are introduced; all previous functionality is maintained through existing canvas-based rendering.

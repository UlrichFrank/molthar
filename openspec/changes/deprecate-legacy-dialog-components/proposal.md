## Why

The game board was refactored to use a canvas-based rendering system (CanvasGameBoard.tsx), making four legacy dialog components obsolete: OpponentPortals.tsx, CharacterReplacementDialog.tsx, CharacterActivationDialog.tsx, and CostPaymentDialog.tsx. These components are no longer referenced in the codebase, create maintenance burden, and should be formally deprecated and removed to clean up the project.

## What Changes

- Mark OpponentPortals.tsx, CharacterReplacementDialog.tsx, CharacterActivationDialog.tsx, and CostPaymentDialog.tsx as deprecated with deprecation warnings
- Create migration guide for any external code using these components
- Remove all imports and references to these components from the codebase
- Delete the component files and associated CSS modules
- Update documentation to reflect the removal
- **BREAKING**: These components are no longer available; code using them must migrate to canvas-based equivalents

## Capabilities

### Modified Capabilities
- `legacy-dialog-components`: These deprecated dialog components are being removed from the codebase. Updated behavior shows they are no longer available.

### New Capabilities
<!-- No new capabilities are being introduced -->

## Impact

- **Files Affected**: 
  - game-web/src/components/OpponentPortals.tsx
  - game-web/src/components/CharacterReplacementDialog.tsx
  - game-web/src/components/CharacterActivationDialog.tsx
  - game-web/src/components/CostPaymentDialog.tsx
  - game-web/src/styles/characterActivationDialog.css
  - game-web/src/styles/characterReplacementDialog.css
  - game-web/src/styles/costPaymentDialog.css
  - Possibly other CSS/style files referencing these components

- **Breaking Changes**: These components are deprecated and will be removed. Any code importing them must migrate to CanvasGameBoard and responsive layout system.

- **No API Changes**: These are internal UI components; no public APIs are affected.

- **No Game Logic Changes**: The game engine is unaffected; only UI layer changes.

- **Testing**: Update any tests that import these components. Verify game board functionality with canvas renderer.

- **Related**: Builds on responsive-game-board-layout implementation which provides modern UI infrastructure.

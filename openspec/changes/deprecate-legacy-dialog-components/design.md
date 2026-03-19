## Context

The game board previously used React-based dialog components for various UI interactions:
- OpponentPortals.tsx: Displayed opponent player areas
- CharacterReplacementDialog.tsx: Dialog for swapping characters
- CharacterActivationDialog.tsx: Dialog for activating characters
- CostPaymentDialog.tsx: Dialog for paying card costs

With the implementation of CanvasGameBoard and the responsive layout system, all game board rendering (including these dialogs) has been consolidated into canvas-based rendering. The old components are no longer used and create technical debt.

## Goals / Non-Goals

**Goals:**
- Remove unused components safely without breaking functionality
- Provide clear deprecation path and migration guidance
- Clean up codebase and reduce maintenance burden
- Document breaking changes for anyone using these components
- Verify that canvas-based system handles all previous dialog functionality

**Non-Goals:**
- Recreate these components in canvas (already done via CanvasGameBoard)
- Provide backward compatibility layers
- Create wrapper components
- Support alternative UI rendering

## Decisions

**1. Complete Removal, Not Soft-Deprecation**
- **Decision**: Remove components completely rather than keeping them with deprecation warnings
- **Rationale**: Components are completely unused; there's no risk of external consumers (internal-only components). Soft deprecation adds maintenance cost with no benefit.
- **Alternatives considered**:
  - Add deprecation warnings and keep for 1-2 releases → unnecessary maintenance
  - Keep in separate /deprecated folder → same cost, less clean
  
**2. Remove Associated Styles Immediately**
- **Decision**: Delete CSS modules along with components
- **Rationale**: Styles are only used by these components; removing them prevents orphaned CSS
- **Alternatives considered**:
  - Keep styles in case they're reused → no reuse case identified
  - Move to separate file → adds complexity

**3. Search and Remove All References**
- **Decision**: Use grep to find all imports/references and remove them systematically
- **Rationale**: Ensures no dangling references, test failures are caught early
- **Alternatives considered**:
  - Leave removal for later → increases risk of breakage
  - Manual search → error-prone

**4. Run Tests After Removal**
- **Decision**: Execute full test suite to verify no regressions
- **Rationale**: Ensures canvas rendering handles all previous functionality correctly
- **Alternatives considered**:
  - Skip tests → risky for UI changes
  - Manual testing only → won't catch edge cases

## Risks / Trade-offs

**[Risk: Breaking External Code]** → If any external code imports these components, removal breaks their builds
- **Mitigation**: Components are internal-only (not exported from public API). Verify no external dependencies before removal.

**[Risk: Missing References]** → Not all imports/references might be found via grep
- **Mitigation**: Use multiple search patterns; verify with build after removal

**[Risk: Canvas Doesn't Handle All Cases]** → CanvasGameBoard might miss some edge case from old dialogs
- **Mitigation**: Run comprehensive game flow tests; manually play through complete game scenarios

**[Risk: Accidental Re-reference]** → Developers might accidentally re-import deleted components
- **Mitigation**: TypeScript compilation will catch immediately; no risk if build succeeds

## Migration Plan

1. **Pre-removal verification**
   - Search codebase for all references to the four components
   - Verify components are not exported in public API
   - Document any external references if found

2. **Safe removal**
   - Delete component files one by one
   - After each deletion, rebuild and verify compilation succeeds
   - Remove associated CSS files

3. **Reference cleanup**
   - Search for and remove all imports of deleted components
   - Search for component usage (e.g., `<CharacterReplacementDialog />`)
   - Remove CSS imports

4. **Verification**
   - Run full test suite
   - Manual game flow testing on multiple devices
   - Verify canvas board handles all interactions correctly

5. **Documentation**
   - Update any documentation referencing these components
   - Create migration note if external code exists

6. **Rollback strategy**
   - Changes are backward-compatible (removal only)
   - Can easily restore from git history if needed
   - No database migrations or state changes

## Open Questions

1. Are there any external consumers of these components outside the game-web folder?
   - **Proposed**: Verify before deletion; if found, coordinate removal timing

2. Does the canvas board handle all previous dialog interactions correctly?
   - **Proposed**: Run comprehensive game flow tests to verify

3. Should we document the removal in a changelog?
   - **Proposed**: Yes, add entry to CHANGELOG.md if it exists

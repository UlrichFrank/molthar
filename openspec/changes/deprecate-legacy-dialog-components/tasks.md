## 1. Pre-Removal Verification

- [ ] 1.1 Search codebase for all imports of OpponentPortals.tsx
- [ ] 1.2 Search codebase for all imports of CharacterReplacementDialog.tsx
- [ ] 1.3 Search codebase for all imports of CharacterActivationDialog.tsx
- [ ] 1.4 Search codebase for all imports of CostPaymentDialog.tsx
- [ ] 1.5 Verify these components are not exported in public API
- [ ] 1.6 Verify no external code depends on these components
- [ ] 1.7 List all files that import these components for reference during cleanup

## 2. Component File Removal

- [ ] 2.1 Delete game-web/src/components/OpponentPortals.tsx
- [ ] 2.2 Delete game-web/src/components/CharacterReplacementDialog.tsx
- [ ] 2.3 Delete game-web/src/components/CharacterActivationDialog.tsx
- [ ] 2.4 Delete game-web/src/components/CostPaymentDialog.tsx
- [ ] 2.5 Verify deletion with git status

## 3. CSS/Style File Removal

- [ ] 3.1 Delete game-web/src/styles/characterActivationDialog.css (if exists)
- [ ] 3.2 Delete game-web/src/styles/characterReplacementDialog.css (if exists)
- [ ] 3.3 Delete game-web/src/styles/costPaymentDialog.css (if exists)
- [ ] 3.4 Search for any other CSS imports of these components
- [ ] 3.5 Delete orphaned CSS files

## 4. Reference and Import Cleanup

- [ ] 4.1 Remove all `import` statements for OpponentPortals
- [ ] 4.2 Remove all `import` statements for CharacterReplacementDialog
- [ ] 4.3 Remove all `import` statements for CharacterActivationDialog
- [ ] 4.4 Remove all `import` statements for CostPaymentDialog
- [ ] 4.5 Remove all CSS imports for these components' styles
- [ ] 4.6 Remove all component usages (e.g., `<CharacterReplacementDialog />`)
- [ ] 4.7 Remove any state management code specific to these dialogs

## 5. Code Cleanup

- [ ] 5.1 Search for any conditional renders or feature flags related to these components
- [ ] 5.2 Remove dead code that was only used by these components
- [ ] 5.3 Search for any test files that import these components
- [ ] 5.4 Update/delete tests that reference these components
- [ ] 5.5 Search for any type definitions specific to these components
- [ ] 5.6 Remove orphaned type definitions

## 6. Build and Verification

- [ ] 6.1 Build TypeScript to verify no compilation errors
- [ ] 6.2 Build production bundle with vite to verify no build errors
- [ ] 6.3 Run linter to catch any remaining issues
- [ ] 6.4 Run test suite to verify no test failures
- [ ] 6.5 Verify no console warnings about missing components

## 7. Game Flow Testing

- [ ] 7.1 Test game start and player selection flow
- [ ] 7.2 Test game play with character activation (canvas-based)
- [ ] 7.3 Test character replacement workflow (canvas-based)
- [ ] 7.4 Test cost payment workflow (canvas-based)
- [ ] 7.5 Test opponent portal display (canvas-based)
- [ ] 7.6 Test full game flow from start to finish
- [ ] 7.7 Test on mobile (portrait and landscape)
- [ ] 7.8 Test on tablet
- [ ] 7.9 Test on desktop
- [ ] 7.10 Verify no UI regressions or missing features

## 8. Documentation Updates

- [ ] 8.1 Update README.md if it mentions these components
- [ ] 8.2 Update any architecture documentation
- [ ] 8.3 Create migration guide for external developers (if applicable)
- [ ] 8.4 Add entry to CHANGELOG.md documenting removal
- [ ] 8.5 Update component documentation (if exists)
- [ ] 8.6 Remove deprecated components from any API documentation

## 9. Final Verification

- [ ] 9.1 Git diff shows only deletions (no unexpected changes)
- [ ] 9.2 All builds pass (TypeScript, vite, linting)
- [ ] 9.3 All tests pass
- [ ] 9.4 No dangling references remain
- [ ] 9.5 Commit message clearly documents what was removed and why

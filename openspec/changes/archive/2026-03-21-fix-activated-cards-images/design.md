## Context

The game has three main card rendering contexts:
1. **Auslage (face-up display)**: Works correctly, renders character and pearl cards with proper images
2. **Player Portal**: Works correctly, displays character cards that player has placed
3. **Activated Grid**: Currently broken - draws placeholder boxes instead of card images

All card data flows from `game-web/public/cards.json` through the game engine. Character cards in cards.json have an `imageFileName` field (or similar) that specifies which image file to use.

Current issue in `drawActivatedCharactersGrid()`: The function tries to extract image filename by:
1. Regex matching against card name to find numbers
2. Constructing filename like `Charakterkarte{number}.jpeg`

This is fragile because:
- Card names may not always contain numbers in the expected position
- The approach duplicates logic instead of using card data
- Inconsistent with how auslage/portal rendering works

## Goals / Non-Goals

**Goals:**
- Use the `imageFileName` property directly from card data in activated grid rendering
- Ensure consistency between auslage, portal, and activated grid card rendering
- Verify card data structure includes imageFileName throughout game state
- Test that activated cards display with correct artwork

**Non-Goals:**
- Change card data structure in cards.json (use existing structure)
- Refactor all card rendering into a unified component (keep rendering functions separate)
- Modify card loading pipeline (assume cards.json loading is correct)

## Decisions

### 1. Use imageFileName from CardData interface
The `CardData` interface (or `CharacterCard` type) should have an `imageFileName` property. The `drawActivatedCharactersGrid()` function will use this directly instead of regex extraction.

**Rationale**: Consistency with auslage and portal rendering. Card data already has this information; regex extraction is brittle and redundant.

### 2. Verify card data preservation through game state
Check that when cards are added to player portal, the `imageFileName` property is preserved in the `ActivatedCharacter` object's `.card` field.

**Rationale**: Ensure the card data structure maintains all necessary properties from initial load through game state mutations.

### 3. Minimal code changes
Only modify `drawActivatedCharactersGrid()` function to use the imageFileName property. Do not refactor other rendering functions.

**Rationale**: Keep changes surgical and focused. Reduces risk of introducing new bugs.

## Risks / Trade-offs

### Risk 1: imageFileName property missing in some cards
If cards.json doesn't have `imageFileName` for all cards, rendering will fail for those cards.

**Mitigation**: 
- Verify cards.json structure includes imageFileName for all characters
- Add fallback logic if needed (but prefer fixing the data)

### Risk 2: TypeScript type mismatch
If `CardData` interface doesn't include `imageFileName` property, TypeScript compilation will fail.

**Mitigation**:
- Check current type definition
- Add property to interface if missing
- Ensure type is consistent with actual card data

### Risk 3: Card data mutation
If card objects are mutated during game state updates, imageFileName might be lost.

**Mitigation**:
- Verify card objects are copied, not mutated
- Use immutable patterns when creating portal entries

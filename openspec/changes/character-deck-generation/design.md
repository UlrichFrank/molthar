## Context

Currently, `createCharacterDeck()` in `shared/src/game/index.ts` generates placeholder cards (54 cards with synthetic costs). The game needs a real deck built from the authoritative card database (cards.json with 45 unique cards, 50 total with multiplicity).

The card database already exists (cardDatabase.ts) and is used by:
- Game initialization (already calls createCharacterDeck)
- Cost validation tests (validating with real cards)
- Card display in the UI

The deck creation function just needs to be updated to use the real data instead of placeholders.

## Goals / Non-Goals

**Goals:**
- Implement proper `createCharacterDeck()` that loads from cardDatabase
- Return exactly 50 cards with correct multiplicity (45 unique + 5 duplicates)
- Maintain compatibility with existing game flow (shuffling, activation, etc.)
- Use real card data from cards.json as single source of truth

**Non-Goals:**
- Do NOT shuffle the deck (shuffling happens in GameEngine.setup)
- Do NOT add or remove cards (follow cards.json exactly)
- Do NOT modify card properties (just copy them)
- Do NOT change the function signature
- Do NOT implement special card mechanics or abilities (just include the data)

## Decisions

### Decision 1: Use getAllCards() from cardDatabase
**Approach:** Call `getAllCards()` which already handles cardCount multiplicity and returns an array ready to use.

**Rationale:**
- getAllCards() is already tested and working
- It handles the multiplicity logic (expanding count > 1 into multiple entries)
- Avoids duplicate logic
- Ensures consistency between tests and game code

**Alternatives Considered:**
- Manual loop through RAW_CARDS: Would duplicate getAllCards() logic, harder to maintain
- Load JSON directly: Would bypass cardDatabase abstraction, risky if JSON moves

### Decision 2: Return deck without shuffling
**Approach:** Return the cards in database order. Shuffling happens in GameEngine.setup.

**Rationale:**
- Separation of concerns: deck creation ≠ shuffling
- GameEngine already calls shuffleArray() after createCharacterDeck()
- Tests can verify deck content before shuffle affects order
- Matches existing flow

**Alternatives Considered:**
- Shuffle in createCharacterDeck(): Would mix concerns, harder to test
- Allow shuffle parameter: Over-engineered, not needed

### Decision 3: Keep function signature unchanged
**Approach:** `createCharacterDeck(): CharacterCard[]` - no parameters, returns array.

**Rationale:**
- Existing code already calls it this way
- No parameters needed - deck config is in cards.json
- Simple interface

## Risks / Trade-offs

**[Risk]** Cards.json is edited manually and could have incorrect cardCount values
→ **Mitigation:** Tests verify total count = 50 and specific duplicates are Kerberus/Zauberin/etc.

**[Risk]** If cardDatabase.ts changes, deck creation breaks
→ **Mitigation:** cardDatabase is stable, tested, and in same package - low risk

**[Risk]** New players added in future might not have correct multiplicity
→ **Mitigation:** Tests and documentation make the cardCount requirement explicit

## Implementation Notes

Simple implementation:
```typescript
export function createCharacterDeck(): CharacterCard[] {
  return getAllCards();
}
```

That's it! The getAllCards() function already does all the work:
- Loads all 45 cards from RAW_CARDS
- Expands each card by its cardCount
- Returns 50 total cards
- Preserves all properties

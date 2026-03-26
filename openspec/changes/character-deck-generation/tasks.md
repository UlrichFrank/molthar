## 1. Verification & Analysis

- [ ] 1.1 Verify current createCharacterDeck() implementation and confirm it uses placeholder data
- [ ] 1.2 Confirm cardDatabase.getAllCards() returns exactly 50 cards with correct multiplicity
- [ ] 1.3 Document the 5 duplicate cards: Kerberus, Zauberin, Riese, Hänsel und Gretel, Phoenix
- [ ] 1.4 Review GameEngine.setup() to understand how deck is used and shuffled

## 2. Implementation

- [ ] 2.1 Update createCharacterDeck() to call getAllCards() from cardDatabase instead of generating placeholders
- [ ] 2.2 Remove placeholder card generation logic (the for loop creating 54 synthetic cards)
- [ ] 2.3 Ensure function maintains same return type: CharacterCard[]
- [ ] 2.4 Verify imports: getAllCards should be imported from cardDatabase module

## 3. Integration Testing

- [ ] 3.1 Build shared package: `npm run build` in shared/
- [ ] 3.2 Verify GameEngine initializes without errors
- [ ] 3.3 Verify all 131 cost tests still pass (they use real cards)
- [ ] 3.4 Check that game setup creates deck with exactly 50 cards

## 4. Validation

- [ ] 4.1 Write or update test to verify deck has 50 cards total
- [ ] 4.2 Verify deck includes all 45 unique cards
- [ ] 4.3 Verify duplicate cards (count=2) are only: Kerberus, Zauberin, Riese, Hänsel und Gretel, Phoenix
- [ ] 4.4 Verify no placeholder cards remain in output

## 5. Build & Verification

- [ ] 5.1 Rebuild shared: `npm run build`
- [ ] 5.2 Rebuild game-web: `npm run build`
- [ ] 5.3 Verify no TypeScript errors
- [ ] 5.4 Verify no console warnings about deck composition

## 6. Documentation

- [ ] 6.1 Add comment above createCharacterDeck() explaining it loads from cardDatabase
- [ ] 6.2 Document the deck composition: 45 unique + 5 duplicates = 50 total
- [ ] 6.3 Reference cards.json as the source of truth for multiplicity

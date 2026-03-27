## ADDED Requirements

### Requirement: Consume player-selected cards based on cost assignment
The system SHALL consume (remove) player-selected cards from their hand based on the validated cost assignment. Cards are only removed if the assignment is fully valid; partial consumption is not allowed.

#### Scenario: Successful consumption of all selected cards
- **WHEN** player has hand [3, 4, 5] in slots, selects all 3 cards, character costs [number: 12]
- **THEN** system validates assignment finds [3, 4, 5] → component 0, then removes all 3 cards, returning new hand = []

#### Scenario: Consume subset of selected cards
- **WHEN** player has hand [1, 2, 3, 7] in slots, selects cards [1, 2, 3, 7], character costs [number: 6]
- **THEN** system validates assignment finds [1, 2, 3] → component 0 (sum=6), removes those 3 cards, returning new hand with only [7]

#### Scenario: Fail if assignment is invalid
- **WHEN** player selects cards [1, 1] and character costs [nTuple: 3] (needs 3 of same value)
- **THEN** system validates assignment fails, returns null without modifying hand

#### Scenario: Diamond consumption does not remove extra cards
- **WHEN** player has hand [1, 1, 1] (3 diamonds), character costs [number: 3], player uses 2 diamonds
- **THEN** system consumes 2 diamonds and removes the cards needed for sum (3 - 2 = 1 pearl point), returning hand with cards removed, diamonds reduced by 2

### Requirement: Update player diamonds during consumption
If a character card grants diamonds as reward, or if diamonds are used to pay costs, the system SHALL update the player's diamond count accordingly.

#### Scenario: Deduct diamonds for fixed-sum cost
- **WHEN** player has 3 diamonds, character costs [number: 5], and system needs 2 diamonds to reduce cost
- **THEN** system deducts 2 diamonds, resulting in player having 1 diamond remaining

#### Scenario: Grant diamonds from activated character
- **WHEN** character card rewards 2 diamonds and is successfully activated
- **THEN** system adds 2 diamonds to player's total after consumption completes

### Requirement: Atomic consumption - all or nothing
The consumption operation SHALL be atomic: either all cards are consumed and the new state is returned, or the operation fails and nothing is modified.

#### Scenario: Validate before consuming
- **WHEN** player selects 5 cards but only 4 are needed for cost, system validates fully, then removes exactly the 4 needed cards
- **THEN** original hand and diamond state remain untouched during validation, only final state is returned

#### Scenario: No partial consumption on failure
- **WHEN** validation fails (e.g., invalid assignment found during consumption)
- **THEN** system returns null, leaving original hand unmodified (no cards removed)

### Requirement: Preserve card order and identity
After consumption, the remaining cards in the hand SHALL maintain their order relative to each other. Card objects (id, value, hasSwapSymbol) remain unchanged.

#### Scenario: Card order preserved
- **WHEN** hand is [card1: value=5, card2: value=3, card3: value=7], and cards at indices [0, 2] are consumed (5 and 7)
- **THEN** remaining hand is [card2: value=3] with original card object properties intact

### Requirement: Return updated player state
The consumption function SHALL return an object containing the updated hand and updated diamond count. No other fields are modified (e.g., powerPoints, activatedCharacters remain unchanged).

#### Scenario: Return value structure
- **WHEN** consumption succeeds
- **THEN** system returns `{ hand: PearlCard[], diamonds: number }` (or null on failure)

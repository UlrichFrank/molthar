## ADDED Requirements

### Requirement: Calculate cost for fixed sum
The system SHALL calculate the total cost for a card with a fixed sum cost component.

#### Scenario: Simple fixed sum cost
- **WHEN** activating a card with cost { type: "number", value: 5 }
- **THEN** the cost is 5 pearl points

#### Scenario: Cost with diamond reduction
- **WHEN** activating a card with cost { type: "number", value: 5 } and player has 2 diamonds
- **THEN** the cost is 3 pearl points (5 - 2)

#### Scenario: Diamonds reduce cost to zero
- **WHEN** activating a card with cost { type: "number", value: 3 } and player has 5 diamonds
- **THEN** the cost is 0 pearl points (not negative)

### Requirement: Calculate cost for n-tuples
The system SHALL calculate cost for cards requiring n identical-value pearl cards.

#### Scenario: Pair requirement (2 of same value)
- **WHEN** activating a card with cost { type: "nTuple", n: 2, sum: 6 }
- **THEN** cost is satisfied by any 2 cards of the same value (e.g., 3+3, 2+2, 4+4)

#### Scenario: Triplet requirement (3 of same value)
- **WHEN** activating a card with cost { type: "nTuple", n: 3, sum: 9 }
- **THEN** cost is satisfied by any 3 cards of the same value (e.g., 3+3+3)

#### Scenario: N-tuple with insufficient matching cards
- **WHEN** player hand has only 1 card of value 3 but cost requires 2
- **THEN** cost validation fails

### Requirement: Calculate cost for sequential runs
The system SHALL calculate cost for cards requiring sequential values.

#### Scenario: 3-card run
- **WHEN** activating a card with cost { type: "run", length: 3 }
- **THEN** cost is satisfied by any 3 consecutive values (e.g., 3-4-5, 5-6-7)

#### Scenario: 4-card run
- **WHEN** activating a card with cost { type: "run", length: 4 }
- **THEN** cost is satisfied by any 4 consecutive values (e.g., 1-2-3-4)

#### Scenario: Run with gap fails
- **WHEN** player hand has 3,4,6 but cost requires run of length 3
- **THEN** cost validation fails (not a sequence)

### Requirement: Validate total sum for sum-based costs
The system SHALL validate that pearl cards used for sum-based costs total the required value.

#### Scenario: Sum with exact total
- **WHEN** activating a card with cost { type: "sumTuple", n: 2, sum: 10 }
- **THEN** any 2 cards totaling 10 satisfy the cost (e.g., 4+6, 3+7)

#### Scenario: Multiple valid combinations exist
- **WHEN** player has [2,3,5,7] and cost requires sum of 10
- **THEN** cost is satisfied (multiple valid combinations: 3+7 or 5+5 if available)

### Requirement: Handle diamond modifiers in cost calculation
The system SHALL reduce costs by the number of diamonds the player possesses.

#### Scenario: Diamonds apply to any cost type
- **WHEN** any cost type is calculated and player has diamonds
- **THEN** the calculated cost is reduced by 1 per diamond

#### Scenario: Multiple diamonds reduce multiple points
- **WHEN** player has 3 diamonds and a 5-point cost
- **THEN** the effective cost is 2 points

#### Scenario: Diamonds don't create negative costs
- **WHEN** player has 10 diamonds and a 3-point cost
- **THEN** the effective cost is 0 (not -7)

### Requirement: Validate feasibility of cost payment
The system SHALL determine whether a player can afford a card given their current hand and diamonds.

#### Scenario: Affordable card
- **WHEN** player has hand [2,3,4,5] and diamonds 1, activating a cost of "sum of 8"
- **THEN** cost validation returns true (can pay)

#### Scenario: Unaffordable card
- **WHEN** player has hand [1,2] and diamonds 0, activating a cost of "pair of 5s"
- **THEN** cost validation returns false (cannot pay)

#### Scenario: Empty hand with no cost
- **WHEN** player has empty hand and no diamonds, activating a free card
- **THEN** cost validation returns true


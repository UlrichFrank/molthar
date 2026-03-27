## ADDED Requirements

### Requirement: Unit tests for fixed sum costs
The system SHALL have unit tests that validate fixed sum cost calculations.

#### Scenario: Test fixed cost without diamonds
- **WHEN** running unit test for cost { type: "number", value: 5 } with no diamonds
- **THEN** calculated cost is 5

#### Scenario: Test fixed cost with diamonds
- **WHEN** running unit test for cost { type: "number", value: 5 } with 2 diamonds
- **THEN** calculated cost is 3

#### Scenario: Test diamond cap at zero
- **WHEN** running unit test for cost { type: "number", value: 2 } with 10 diamonds
- **THEN** calculated cost is 0 (not negative)

### Requirement: Unit tests for pair/tuple costs
The system SHALL have unit tests that validate n-tuple cost validation.

#### Scenario: Test pair validation passes
- **WHEN** running unit test with hand [3,3,5,7] and cost { type: "nTuple", n: 2, sum: 6 }
- **THEN** validation passes

#### Scenario: Test pair validation fails
- **WHEN** running unit test with hand [2,3,5,7] and cost { type: "nTuple", n: 2, sum: 6 }
- **THEN** validation fails (no matching pair)

#### Scenario: Test triplet validation
- **WHEN** running unit test with hand [4,4,4,5] and cost { type: "nTuple", n: 3, sum: 12 }
- **THEN** validation passes

### Requirement: Unit tests for run/sequence costs
The system SHALL have unit tests that validate sequential run cost validation.

#### Scenario: Test 3-run validation passes
- **WHEN** running unit test with hand [2,3,4,5] and cost { type: "run", length: 3 }
- **THEN** validation passes (multiple valid runs: 2-3-4 or 3-4-5)

#### Scenario: Test 4-run validation passes
- **WHEN** running unit test with hand [1,2,3,4,5] and cost { type: "run", length: 4 }
- **THEN** validation passes (e.g., 1-2-3-4 or 2-3-4-5)

#### Scenario: Test run validation fails with gap
- **WHEN** running unit test with hand [2,3,5,6] and cost { type: "run", length: 3 }
- **THEN** validation fails (gap breaks sequence)

#### Scenario: Test insufficient cards for run
- **WHEN** running unit test with hand [1,5] and cost { type: "run", length: 3 }
- **THEN** validation fails (not enough cards)

### Requirement: Unit tests for sum-based costs
The system SHALL have unit tests that validate sum-based cost calculations.

#### Scenario: Test sum validation with exact match
- **WHEN** running unit test with hand [3,7,8] and cost { type: "sumTuple", n: 2, sum: 10 }
- **THEN** validation passes (3+7=10)

#### Scenario: Test sum validation with multiple options
- **WHEN** running unit test with hand [2,4,6,8] and cost { type: "sumTuple", n: 2, sum: 10 }
- **THEN** validation passes (2+8=10 or 4+6=10)

#### Scenario: Test sum validation fails
- **WHEN** running unit test with hand [1,2,3] and cost { type: "sumTuple", n: 2, sum: 10 }
- **THEN** validation fails (no combination sums to 10)

### Requirement: Unit tests for diamond interactions
The system SHALL have unit tests that verify diamond modifier behavior across all cost types.

#### Scenario: Test diamond reduction with fixed sum
- **WHEN** running unit test for cost { type: "number", value: 5 } with 3 diamonds
- **THEN** cost reduces to 2

#### Scenario: Test diamonds don't affect run validation
- **WHEN** running unit test with hand [2,3,4] cost { type: "run", length: 3 }, 2 diamonds
- **THEN** validation passes (diamonds don't affect run feasibility)

#### Scenario: Test diamonds with sum cost
- **WHEN** running unit test with hand [2,3] cost { type: "sumTuple", n: 2, sum: 8 }, 3 diamonds
- **THEN** cost requirement is 5 pearls (8-3), validatable with 2+3

### Requirement: Integration tests with real card data
The system SHALL have tests using actual card definitions from cards.json.

#### Scenario: Test real card cost calculation
- **WHEN** running integration test with actual character cards from cards.json
- **THEN** all card costs are parseable and valid

#### Scenario: Test all cost types from real cards
- **WHEN** examining cost components across all real cards
- **THEN** all cost types used are covered by unit tests

#### Scenario: Test edge case: free cards
- **WHEN** running test with a card that has no cost or empty cost array
- **THEN** validation passes with any hand (cost = 0)

### Requirement: Edge case tests
The system SHALL have tests for boundary conditions and unusual scenarios.

#### Scenario: Test empty hand with free card
- **WHEN** player hand is empty and card has no cost
- **THEN** activation is allowed

#### Scenario: Test single card hand with exact cost
- **WHEN** player hand has [7] and cost is { type: "number", value: 7 }
- **THEN** validation passes

#### Scenario: Test full hand depletion
- **WHEN** cost requires all cards in player's hand
- **THEN** validation passes and all cards are used


## ADDED Requirements

### Requirement: Test all character cards with cost validation
The system SHALL test that each of the 45 character cards from cards.json can be evaluated correctly by the cost validation system. For each card, the system SHALL generate one positive test case (valid payment) and one negative test case (insufficient payment).

#### Scenario: Card with valid payment passes validation
- **WHEN** a character card is tested with a hand that satisfies all its cost requirements
- **THEN** the `validateCostPayment()` function SHALL return `true`

#### Scenario: Card with insufficient payment fails validation
- **WHEN** a character card is tested with a hand that does not satisfy its cost requirements
- **THEN** the `validateCostPayment()` function SHALL return `false`

#### Scenario: Test covers all cost types
- **WHEN** cards with different cost types (number, nTuple, run, sumTuple, sumAnyTuple, evenTuple, oddTuple) are tested
- **THEN** each cost type SHALL be validated correctly according to the cost validation rules

### Requirement: Tests use actual card database
The system SHALL use real card data from `cardDatabase.ts` (which loads from cards.json) rather than mock data. Tests SHALL validate that real card definitions are compatible with the cost validation system.

#### Scenario: Test generates valid hand for card
- **WHEN** a test is created for a card with specific cost requirements
- **THEN** the test SHALL generate a hand that exactly satisfies those requirements

#### Scenario: Test generates insufficient hand for card
- **WHEN** a test creates a negative case for a card
- **THEN** the test SHALL generate a hand with insufficient value or wrong structure to fail validation

## MODIFIED Requirements

### Requirement: Cost validation for character activation
The `validateCostPayment()` function SHALL validate that a player's hand can pay for a character card's cost. The function SHALL support 7 cost types and apply diamond modifiers where applicable.

#### Scenario: Function validates fixed sum costs
- **WHEN** a card requires a fixed sum (type: 'number', value: 10) and the player has cards totaling that value
- **THEN** the function SHALL return `true`

#### Scenario: Function validates tuple costs
- **WHEN** a card requires N identical cards (type: 'nTuple', n: 2) and the player has that many cards of the same value
- **THEN** the function SHALL return `true`

#### Scenario: Function validates run costs
- **WHEN** a card requires a sequence of cards (type: 'run', length: 3) and the player has consecutive values
- **THEN** the function SHALL return `true`

#### Scenario: Function applies diamond modifiers
- **WHEN** a card requires a fixed sum and the player has diamonds available
- **THEN** the required sum SHALL be reduced by 1 per diamond (minimum 0)

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

#### Scenario: Function validates sum tuple costs
- **WHEN** a card requires N cards with a specific combined sum (type: 'sumTuple' or 'sumAnyTuple', n: 2, sum: 10)
- **THEN** the function SHALL return `true` if exactly N cards sum to the required value

#### Scenario: Function validates even/odd tuple costs
- **WHEN** a card requires N cards with even values (type: 'evenTuple') or odd values (type: 'oddTuple')
- **THEN** the function SHALL return `true` if N cards match the parity requirement

#### Scenario: Function applies diamond modifiers correctly
- **WHEN** a card requires a fixed sum and the player has diamonds available
- **THEN** the required sum SHALL be reduced by 1 per diamond (minimum 0)

#### Scenario: Function rejects invalid payments
- **WHEN** a player's hand does not satisfy the card's cost requirements
- **THEN** the function SHALL return `false` for insufficient value, wrong structure, or missing diamonds

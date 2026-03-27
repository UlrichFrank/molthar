## ADDED Requirements

### Requirement: Load card cost components from cards.json
The system SHALL load cost component definitions from each character card in `cards.json` and make them accessible during cost validation.

#### Scenario: Cost components are loaded on card creation
- **WHEN** a character card is loaded from cards.json
- **THEN** the card's cost array is preserved in the card data accessible to the game engine

#### Scenario: Multiple cost components are handled
- **WHEN** a card has multiple cost components (e.g., ["3 sum", "then 1 diamond"])
- **THEN** all cost components are loaded and available for validation

#### Scenario: Cost type is preserved
- **WHEN** a cost component is loaded
- **THEN** its type field (e.g., "number", "run", "pair") is preserved exactly

#### Scenario: Empty cost is handled
- **WHEN** a card has no cost or an empty cost array
- **THEN** the card is treated as free to activate (cost = 0)

### Requirement: Cost component properties are accessible
The system SHALL provide access to all cost properties needed for calculation (value, n, sum, length, etc.).

#### Scenario: Fixed sum cost properties
- **WHEN** a cost component has type "number"
- **THEN** the value property is accessible and represents the exact cost

#### Scenario: Tuple cost properties
- **WHEN** a cost component has type "nTuple" or "sumTuple"
- **THEN** the n property (count) and sum property are accessible

#### Scenario: Run cost properties
- **WHEN** a cost component has type "run"
- **THEN** the length property (e.g., 3 for "3-4-5") is accessible


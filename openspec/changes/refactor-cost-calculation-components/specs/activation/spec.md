## MODIFIED Requirements

### Requirement: Cost-Based Character Activation
The system SHALL only activate a portal character when the selected pearl cards satisfy the character's full cost. The system SHALL automatically assign selected cards to cost components with intelligent prioritization.

#### Scenario: Activate with a valid payment
- **GIVEN** a player has an inactive character on the portal
- **AND** the player selects pearl cards from hand that satisfy every required cost component
- **WHEN** the player activates the character
- **THEN** the system auto-assigns selected cards to cost components (prioritizing fixed-sum costs first)
- **AND** the selected pearl cards are consumed as payment
- **AND** the character becomes activated

#### Scenario: Reject an invalid payment
- **GIVEN** a player has selected pearl cards that do not satisfy the character cost
- **WHEN** the player attempts activation
- **THEN** the system MUST reject the activation
- **AND** the player's hand, portal, and score remain unchanged

### Requirement: Composite Cost Components with Auto-Assignment
The system SHALL support component-based character costs that are automatically assigned to selected cards. Fixed-sum components receive priority during assignment.

#### Scenario: Validate combined requirements with prioritized assignment
- **GIVEN** a character requires multiple cost components (e.g., fixed-sum + n-tuple)
- **WHEN** a player submits payment for activation
- **THEN** the system auto-assigns selected cards to components, prioritizing fixed-sum first
- **AND** the activation succeeds only if every component is satisfied
- **AND** no card is assigned to multiple components

#### Scenario: Assign fixed-cost before tuple-based costs
- **GIVEN** a character costs [number: 6, nTuple: 2]
- **AND** a player selects cards [1, 1, 1, 3, 3]
- **WHEN** the player activates the character
- **THEN** the system assigns [1, 1, 1, 3] to the fixed-sum component (sum=6) and [1, 3, 3] is remaining but only [3, 3] satisfies the pair requirement
- **OR** the system finds an alternative assignment if the above fails, always prioritizing fixed costs first

## UNCHANGED Requirements (from base activation spec)

These requirements remain unchanged and are included here for context:

### Requirement: Activation Rewards
The system SHALL grant the activated character's rewards immediately after a valid activation.

#### Scenario: Gain power points and diamonds
- **GIVEN** a player successfully activates a character
- **WHEN** the activation resolves
- **THEN** the player gains that character's power points immediately
- **AND** the player gains that character's diamond reward immediately
- **AND** the game checks whether the final round should begin

### Requirement: Diamond-Assisted Payment
The system SHALL treat diamonds as optional payment modifiers under the Molthar rules.

#### Scenario: Use diamonds to reduce a fixed-sum cost
- **GIVEN** a player lacks an exact pearl value for a legal activation
- **AND** the character cost is a fixed-sum type that allows reduction by diamonds
- **WHEN** the player has available diamonds
- **THEN** each diamond reduces the required sum by 1 (minimum 0)
- **AND** the assignment algorithm accounts for diamond reduction when validating the fixed-sum cost

#### Scenario: Reject invalid diamond use for non-fixed costs
- **GIVEN** a character has a non-fixed-sum cost (e.g., nTuple, run, sumTuple)
- **WHEN** the player attempts to use diamonds to satisfy that cost
- **THEN** the system MUST reject the activation (diamonds only reduce fixed-sum costs)

### Requirement: Character Ability Resolution
The system SHALL preserve character abilities as part of activation outcomes and later turn options.

#### Scenario: Resolve an instant red ability
- **GIVEN** a newly activated character has a one-time red ability
- **WHEN** the activation completes
- **THEN** the system applies the red effect immediately as part of that activation result

#### Scenario: Expose a persistent blue ability
- **GIVEN** a player has activated a character with a persistent blue ability
- **WHEN** later turns are evaluated
- **THEN** the affected player keeps the modified option, limit, or bonus described by that ability for as long as the game state allows

### Requirement: Irrlicht Special Case
The system SHOULD support the special Irrlicht rule where adjacent players may activate the same portal character.

#### Scenario: Neighbor activates Irrlicht
- **GIVEN** a player has placed Irrlicht on the portal
- **WHEN** one of that player's adjacent players activates Irrlicht during the neighbor's own turn
- **THEN** the activating neighbor receives the activation reward
- **AND** the card is treated as activated for that neighbor's result area

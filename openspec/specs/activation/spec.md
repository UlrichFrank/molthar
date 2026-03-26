# Activation Specification

## Purpose
Character activation, pearl cost validation, diamond-assisted payment, and character ability resolution for the Molthar ruleset.

## Requirements

### Requirement: Cost-Based Character Activation
The system SHALL only activate a portal character when the selected pearl cards satisfy the character's full cost.

#### Scenario: Activate with a valid payment
- GIVEN a player has an inactive character on the portal
- AND the player selects pearl cards from hand that satisfy every required cost component
- WHEN the player activates the character
- THEN the selected pearl cards are consumed as payment
- AND the character becomes activated

#### Scenario: Reject an invalid payment
- GIVEN a player has selected pearl cards that do not satisfy the character cost
- WHEN the player attempts activation
- THEN the system MUST reject the activation
- AND the player's hand, portal, and score remain unchanged

### Requirement: Composite Cost Components
The system SHALL support component-based character costs that can be combined as one activation contract.

#### Scenario: Validate combined requirements
- GIVEN a character requires multiple cost components
- WHEN a player submits payment for activation
- THEN the system evaluates all components together
- AND the activation succeeds only if every component is satisfied

### Requirement: Activation Rewards
The system SHALL grant the activated character's rewards immediately after a valid activation.

#### Scenario: Gain power points and diamonds
- GIVEN a player successfully activates a character
- WHEN the activation resolves
- THEN the player gains that character's power points immediately
- AND the player gains that character's diamond reward immediately
- AND the game checks whether the final round should begin

### Requirement: Diamond-Assisted Payment
The system SHALL treat diamonds as optional payment modifiers under the Molthar rules.

#### Scenario: Use diamonds to increase a pearl value
- GIVEN a player lacks an exact pearl value for a legal activation
- AND the character cost allows the missing value to be reached by increasing a selected pearl card by one
- WHEN the player spends a diamond for that pearl card
- THEN the modified pearl card counts as one value higher for that activation
- AND no single pearl card is increased by more than one diamond

#### Scenario: Reject invalid diamond use
- GIVEN a diamond adjustment would create an illegal pearl value
- WHEN the player attempts the activation
- THEN the system MUST reject that diamond-assisted payment

### Requirement: Character Ability Resolution
The system SHALL preserve character abilities as part of activation outcomes and later turn options.

#### Scenario: Resolve an instant red ability
- GIVEN a newly activated character has a one-time red ability
- WHEN the activation completes
- THEN the system applies the red effect immediately as part of that activation result

#### Scenario: Expose a persistent blue ability
- GIVEN a player has activated a character with a persistent blue ability
- WHEN later turns are evaluated
- THEN the affected player keeps the modified option, limit, or bonus described by that ability for as long as the game state allows

### Requirement: Irrlicht Special Case
The system SHOULD support the special Irrlicht rule where adjacent players may activate the same portal character.

#### Scenario: Neighbor activates Irrlicht
- GIVEN a player has placed Irrlicht on the portal
- WHEN one of that player's adjacent players activates Irrlicht during the neighbor's own turn
- THEN the activating neighbor receives the activation reward
- AND the card is treated as activated for that neighbor's result area

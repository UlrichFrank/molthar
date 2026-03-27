## ADDED Requirements

### Requirement: Find optimal card-to-component assignment
The system SHALL analyze player-selected cards and automatically assign them to cost components with intelligent prioritization. The assignment algorithm MUST consider all valid combinations and prefer fixed-cost components first.

#### Scenario: Simple fixed-sum assignment
- **WHEN** player selects 3 cards [3, 4, 5] and character costs a single `number` component with value 10
- **THEN** system returns assignment mapping component 0 → card indices [0, 1, 2] (sum = 12, not exact; should fail) OR returns null if no exact combination exists

#### Scenario: Exact sum required for fixed cost
- **WHEN** player selects cards [2, 3, 5] and character costs a single `number` component with value 10
- **THEN** system returns assignment mapping component 0 → card indices [0, 1, 2] (sum = 2+3+5 = 10, exact match)

#### Scenario: Multiple components with prioritization
- **WHEN** player selects cards [1, 2, 3, 4, 5] and character costs [number: 5, nTuple: 2] (fixed cost first, then pair)
- **THEN** system assigns component 0 (fixed sum=5) to cards summing exactly 5, then assigns component 1 (pair) to remaining cards, ensuring the pair exists in leftover cards

#### Scenario: No valid assignment found
- **WHEN** player selects cards [1, 2] and character costs [nTuple: 3] (needs 3 cards of same value)
- **THEN** system returns null (no valid assignment possible)

### Requirement: Fixed-cost components have highest priority
When multiple valid assignments exist, the system MUST assign cards to fixed-sum cost components (`type: 'number'`) before other cost types. Within fixed-cost components, components are processed in order.

#### Scenario: Prioritize number over nTuple
- **WHEN** player selects cards [1, 1, 1, 9] and character costs [number: 10, nTuple: 3]
- **THEN** system prefers assigning [1, 9] to fixed-sum cost (sum=10) and [1, 1, 1] to pair cost, rather than other valid combinations

#### Scenario: Process components in declaration order
- **WHEN** player selects cards [2, 3, 5, 7] and character costs [number: 5, number: 7]
- **THEN** system assigns component 0 (first `number: 5`) before component 1 (second `number: 7`), ensuring deterministic behavior

### Requirement: Handle diamond reduction for fixed costs
When assigning cards to fixed-sum components, the system SHALL account for available diamonds. Diamonds reduce the required sum by 1 per diamond, with a minimum of 0.

#### Scenario: Diamond reduces required sum
- **WHEN** player selects cards [1, 2, 3] with 2 diamonds available, and character costs [number: 8]
- **THEN** system calculates required sum as 8 - 2 = 6, then finds cards summing to exactly 6 (e.g., [1, 2, 3] fails; needs exact 6)

#### Scenario: Diamond count exceeds cost
- **WHEN** player selects cards [2, 2] with 3 diamonds available, and character costs [number: 3]
- **THEN** system calculates required sum as max(0, 3 - 3) = 0 (free), and any card set satisfies it

### Requirement: Return clear assignment structure
The assignment result SHALL return a map indicating which card indices (from the player's selected set) satisfy each cost component.

#### Scenario: Assignment structure for multi-component cost
- **WHEN** calling assignment function with 3 cards and 2 cost components
- **THEN** system returns `{ 0: [0, 2], 1: [1] }` OR similar structure showing component index → array of card indices, ensuring no card index appears twice across all components

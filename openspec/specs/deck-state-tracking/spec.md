## ADDED Requirements

### Requirement: Deck card count synchronization
The system SHALL display the character and pearl deck visual stacks with card counts that match the game engine's internal deck state. The displayed card count SHALL update immediately when cards are drawn.

#### Scenario: Display reflects character deck count
- **WHEN** the game board is rendered
- **THEN** the character deck visual stack displays a number of cards equal to the character deck length from game state

#### Scenario: Display reflects pearl deck count
- **WHEN** the game board is rendered
- **THEN** the pearl deck visual stack displays a number of cards equal to the pearl deck length from game state

#### Scenario: Card count decreases on draw
- **WHEN** a character or pearl card is drawn from the deck
- **THEN** the next render shows one fewer card in the corresponding deck stack

### Requirement: Deck visual diminishing effect
As cards are drawn from the deck, the visual stack SHALL decrease in height and card count to create a realistic "pile shrinking" effect. The system SHALL display between 0 and 7 visible card backs in the stack based on remaining deck size.

#### Scenario: Full deck shows maximum cards
- **WHEN** the deck has more than 7 cards remaining
- **THEN** the deck stack displays 7 overlapping card backs with full height

#### Scenario: Partial deck shows proportional cards
- **WHEN** the deck has between 1 and 7 cards remaining
- **THEN** the deck stack displays N overlapping card backs, where N equals the remaining card count

#### Scenario: Empty deck disappears
- **WHEN** the last card is drawn from the deck
- **THEN** the deck is no longer displayed (0 visible cards means invisible stack)

### Requirement: No game state mutations for display
The visual deck display SHALL only read from existing game state (`pearlDeck` and `characterDeck` arrays) and SHALL NOT introduce new state variables for deck tracking. Display logic SHALL be pure rendering based on deck array length.

#### Scenario: Display uses engine deck state
- **WHEN** the canvas renders a frame
- **THEN** deck visual is calculated solely from game engine's `pearlDeck.length` and `characterDeck.length` values

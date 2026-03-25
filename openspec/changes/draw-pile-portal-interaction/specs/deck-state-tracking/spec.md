## MODIFIED Requirements

### Requirement: Deck card count synchronization
The system SHALL display the character deck visual stack with a card count that matches the game engine's internal deck state. The displayed card count SHALL update immediately when cards are drawn, whether from face-up selection or blind deck draw.

#### Scenario: Display reflects character deck count
- **WHEN** the game board is rendered
- **THEN** the character deck visual stack displays a number of cards equal to the character deck length from game state (`characterDeck.length`)

#### Scenario: Card count decreases on draw
- **WHEN** a character card is drawn from the deck (either from face-up selection or blind deck draw)
- **THEN** the next render shows one fewer card in the deck stack

### Requirement: Deck visual diminishing effect with proportional mapping
As cards are drawn from the deck, the visual stack SHALL decrease in height and card count to create a realistic "pile shrinking" effect. The system SHALL display between 1 and 7 visible card backs in the stack based on remaining deck size using proportional mapping. As long as at least one card remains in the deck, at least one card SHALL be visually displayed. The visual display is purely calculated from game state, not stored separately.

#### Scenario: Proportional card display calculation
- **WHEN** the deck is rendered with N cards remaining out of an initial deck size of M cards
- **THEN** the number of visible cards displayed is calculated as: `Math.ceil(N / M * 7)`, which maps the remaining card count proportionally to 1-7 visible cards

#### Scenario: Full deck shows maximum cards
- **WHEN** the deck has more than 85% of its original cards remaining (N >= 0.86 * M)
- **THEN** the deck stack displays 7 overlapping card backs with full height

#### Scenario: Partial deck shows proportional cards
- **WHEN** the deck has between 1 and 85% of its original cards remaining (1 <= N < 0.86 * M)
- **THEN** the deck stack displays K overlapping card backs, where K is calculated proportionally using the formula above

#### Scenario: Last card remains visible
- **WHEN** the last card is about to be drawn from the deck (N = 1)
- **THEN** the deck stack displays exactly 1 overlapping card back before the card is taken

#### Scenario: Empty deck disappears
- **WHEN** the last card is taken from the deck and removed from game state (N = 0)
- **THEN** the deck is no longer displayed (0 visible cards means invisible stack)

### Requirement: No game state mutations for display
The visual deck display SHALL only read from existing game state (`characterDeck` array) and SHALL NOT introduce new state variables for deck tracking. Display logic SHALL be pure rendering based on deck array length. This applies regardless of whether cards are drawn blindly or from face-up cards.

#### Scenario: Display uses engine deck state
- **WHEN** the canvas renders a frame
- **THEN** deck visual is calculated solely from game engine's `characterDeck.length` value

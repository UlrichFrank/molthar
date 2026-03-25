## MODIFIED Requirements

### Requirement: Character deck visual rendering
The system SHALL render the character draw pile as a stacked card pile positioned below the two face-up character cards in the auslage. The deck SHALL be rotated 90° clockwise and SHALL display multiple overlapping card backs to create a realistic stacking effect. The number of visible cards SHALL decrease proportionally as cards are drawn from the deck.

#### Scenario: Deck rendered with cards remaining
- **WHEN** the game board is displayed with character cards remaining in the deck
- **THEN** the character deck is visible below the left character card, rotated 90°, showing overlapping card backs with visual offset between cards to create a stack illusion

#### Scenario: Deck shows proportional card count
- **WHEN** the character deck has N cards remaining out of an initial deck size of M cards
- **THEN** the deck stack displays K overlapping card backs, where K = Math.ceil(N / M * 7) (proportional mapping ensuring 1-7 visible cards)

#### Scenario: Deck shows maximum cards when full
- **WHEN** the character deck has more than 85% of original cards remaining
- **THEN** the deck stack displays 7 overlapping card backs (visual cap)

#### Scenario: Deck size decreases visually as cards are drawn
- **WHEN** a character card is drawn from the deck
- **THEN** the number of visible cards in the deck stack decreases by one (visual count in stack reduces by one card)

#### Scenario: No deck shown when empty
- **WHEN** all character cards have been drawn from the deck
- **THEN** no character deck is displayed

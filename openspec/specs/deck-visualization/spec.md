## ADDED Requirements

### Requirement: Character deck visual rendering
The system SHALL render the character draw pile as a stacked card pile positioned below the two face-up character cards in the auslage. The deck SHALL be rotated 90° clockwise and SHALL display multiple overlapping card backs to create a realistic stacking effect.

#### Scenario: Deck rendered with cards remaining
- **WHEN** the game board is displayed with character cards remaining in the deck
- **THEN** the character deck is visible below the left character card, rotated 90°, showing 5-7 overlapping card backs with visual offset between cards to create a stack illusion

#### Scenario: Deck size decreases visually as cards are drawn
- **WHEN** a character card is drawn from the deck
- **THEN** the number of visible cards in the deck stack decreases by one (visual count in stack reduces by one card)

#### Scenario: No deck shown when empty
- **WHEN** all character cards have been drawn from the deck
- **THEN** no character deck is displayed

### Requirement: Pearl deck visual rendering
The system SHALL render the pearl draw pile as a stacked card pile positioned below the four face-up pearl cards in the auslage. The deck SHALL be rotated 90° clockwise and SHALL display multiple overlapping card backs to create a realistic stacking effect.

#### Scenario: Deck rendered with cards remaining
- **WHEN** the game board is displayed with pearl cards remaining in the deck
- **THEN** the pearl deck is visible below the right pearl card, rotated 90°, showing 5-7 overlapping card backs with visual offset between cards to create a stack illusion

#### Scenario: Deck size decreases visually as cards are drawn
- **WHEN** a pearl card is drawn from the deck
- **THEN** the number of visible cards in the deck stack decreases by one (visual count in stack reduces by one card)

#### Scenario: No deck shown when empty
- **WHEN** all pearl cards have been drawn from the deck
- **THEN** no pearl deck is displayed

### Requirement: Deck card positioning
Character and pearl decks SHALL be positioned below their respective card groups with specific alignment. Character deck SHALL be left-aligned with the leftmost character card. Pearl deck SHALL be right-aligned with the rightmost pearl card.

#### Scenario: Character deck left-alignment
- **WHEN** the game board is displayed
- **THEN** the character deck x-position aligns with the left edge of the first character card in the auslage

#### Scenario: Pearl deck right-alignment
- **WHEN** the game board is displayed
- **THEN** the pearl deck x-position aligns with the right edge of the fourth pearl card in the auslage

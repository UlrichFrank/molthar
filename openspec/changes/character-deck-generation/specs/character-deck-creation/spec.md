## ADDED Requirements

### Requirement: Create character card deck from database
The `createCharacterDeck()` function SHALL load all character cards from the card database and return a complete deck with the correct number of copies for each card.

#### Scenario: Deck contains correct number of cards
- **WHEN** `createCharacterDeck()` is called
- **THEN** the returned array SHALL contain exactly 50 character cards (45 unique + 5 duplicates)

#### Scenario: Deck respects card count multiplicity
- **WHEN** a card has `cardCount: 2` (Kerberus, Zauberin, Riese, Hänsel und Gretel, Phoenix)
- **THEN** the deck SHALL include 2 copies of that card

#### Scenario: Deck includes all unique cards
- **WHEN** the deck is generated
- **THEN** all 45 unique cards from cards.json SHALL be present (either 1 or 2 copies each)

#### Scenario: Each card maintains its properties
- **WHEN** cards are added to the deck
- **THEN** each card SHALL retain its original properties: id, name, cost, powerPoints, diamonds, abilities

### Requirement: Card database integration
The deck creation function SHALL use the card database (cardDatabase.ts) as its data source, not placeholder or mock data.

#### Scenario: Function uses getAllCards from database
- **WHEN** `createCharacterDeck()` is executed
- **THEN** it SHALL call `getAllCards()` from cardDatabase.ts
- **THEN** all card properties SHALL come from the actual card definitions

#### Scenario: Cards are consistent between tests and deck
- **WHEN** cards are loaded in both cost validation tests and deck creation
- **THEN** both SHALL use the same card database source
- **THEN** card properties (costs, powers, etc.) SHALL be identical

### Requirement: Deck composition matches design
The deck SHALL have exactly the composition specified in cards.json: 45 unique cards with specific multiplicity.

#### Scenario: Total deck size
- **WHEN** all cards with their `cardCount` are summed
- **THEN** the total SHALL equal 50 cards

#### Scenario: Duplicate cards are specified in design
- **WHEN** a card has `cardCount: 2`
- **THEN** the card name SHALL be one of: Kerberus, Zauberin, Riese, Hänsel und Gretel, Phoenix
- **THEN** exactly 2 copies SHALL appear in the deck

#### Scenario: Single-count cards appear once
- **WHEN** a card has `cardCount: 1` (default or explicit)
- **THEN** the card SHALL appear exactly once in the deck

## ADDED Requirements

### Requirement: Board liest Reshuffle-Flags aus Game-State
Die Board-Komponente oder ein zugehöriger Hook SHALL die Flags `isReshufflingPearlDeck` und `isReshufflingCharacterDeck` aus dem boardgame.io Game-State lesen und die `DeckReshuffleAnimation`-Komponente entsprechend rendern.

#### Scenario: Reshuffle-Animation wird gerendert
- **WHEN** `G.isReshufflingPearlDeck === true` im Game-State vorliegt
- **THEN** rendert das Board die `DeckReshuffleAnimation`-Komponente für den Perlen-Deck-Bereich

#### Scenario: Keine Animation ohne Flag
- **WHEN** `G.isReshufflingPearlDeck === false` und `G.isReshufflingCharacterDeck === false`
- **THEN** wird keine Shuffle-Animation gerendert

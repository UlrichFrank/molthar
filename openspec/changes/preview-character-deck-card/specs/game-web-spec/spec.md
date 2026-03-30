## MODIFIED Requirements

### Requirement: Charakter-Deck Klick-Verhalten
Ein Klick auf den Charakter-Nachziehstapel SHALL kontextabhängig reagieren, basierend auf der aktiven `previewCharacter`-Ability, dem Aktionszähler und dem aktuellen `peekedCard`-Zustand des Spielers.

#### Scenario: Preview-Klick (erster Klick, keine Aktion, Ability aktiv)
- **WHEN** Spieler hat `previewCharacter` aktiv, `actionCount === 0`, `peekedCard === null` und klickt auf Charakter-Deck
- **THEN** wird `peekCharacterDeck` aufgerufen; keine Karte wird sofort gezogen

#### Scenario: Nehmen-Klick (zweiter Klick nach Preview)
- **WHEN** `peekedCard` ist gesetzt und Spieler klickt auf Charakter-Deck
- **THEN** wird Karte genommen (Replacement-Dialog oder `takeCharacterCard`)

#### Scenario: Direktzug (keine Ability oder Aktionen bereits verbraucht)
- **WHEN** `previewCharacter` nicht aktiv ODER `actionCount > 0`
- **THEN** wird Karte sofort gezogen (unverändertes Verhalten)

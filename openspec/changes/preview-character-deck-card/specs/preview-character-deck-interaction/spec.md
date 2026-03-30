## ADDED Requirements

### Requirement: Erster Klick auf Charakter-Deck löst Preview aus
Wenn der Spieler die `previewCharacter`-Ability aktiv hat, `actionCount === 0` und `peekedCard` noch nicht gesetzt ist, SHALL ein Klick auf den Charakter-Nachziehstapel den Move `peekCharacterDeck` aufrufen anstatt die Karte direkt zu ziehen.

#### Scenario: Preview-Move bei erstem Klick ohne vorherige Aktion
- **WHEN** Spieler hat `previewCharacter` in `activeAbilities`, `G.actionCount === 0`, `me.peekedCard` ist `null`/`undefined`, und Spieler klickt auf den Charakter-Nachziehstapel
- **THEN** wird `moves.peekCharacterDeck()` aufgerufen, keine Karte wird direkt gezogen

#### Scenario: Zweiter Klick nimmt die aufgedeckte Karte
- **WHEN** `me.peekedCard` ist gesetzt (Karte bereits aufgedeckt) und Spieler klickt erneut auf den Charakter-Nachziehstapel
- **THEN** wird die Karte genommen: bei vollem Portal öffnet sich der Replacement-Dialog, sonst `takeCharacterCard(-1)`

#### Scenario: Direktes Ziehen wenn Aktionen bereits durchgeführt
- **WHEN** Spieler hat `previewCharacter` in `activeAbilities`, aber `G.actionCount > 0`, und klickt auf den Charakter-Nachziehstapel
- **THEN** wird die Karte direkt gezogen (kein Preview, Verhalten wie ohne Ability)

#### Scenario: Direktes Ziehen ohne previewCharacter-Ability
- **WHEN** Spieler hat `previewCharacter` NICHT in `activeAbilities` und klickt auf den Charakter-Nachziehstapel
- **THEN** wird die Karte direkt gezogen (unverändertes bisheriges Verhalten)

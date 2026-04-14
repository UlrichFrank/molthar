## ADDED Requirements

### Requirement: Diamanten werden als Charakterkarten-Rückseiten im Canvas dargestellt
Das System SHALL im Player-Portal-Bereich die Diamanten des Spielers als kleine Charakterkarten-Rückseiten (Bild `Charakterkarte Hinten.png`) darstellen statt als Symbol-Icons. Die Anzahl der dargestellten Karten entspricht `player.diamondCards.length`.

#### Scenario: Diamanten werden als Kartenrückseiten gerendert
- **WHEN** ein Spieler 3 Diamanten besitzt (`diamondCards.length === 3`)
- **THEN** werden im Portal-Bereich 3 kleine Charakterkarten-Rückseiten nebeneinander angezeigt
- **AND** es werden keine Emoji-Icons oder anderen Symbole für Diamanten verwendet

#### Scenario: Kein Diamant — keine Karten sichtbar
- **WHEN** ein Spieler 0 Diamanten besitzt
- **THEN** werden keine Diamant-Karten im Portal-Bereich gerendert

#### Scenario: Viele Diamanten passen in den Portal-Bereich
- **WHEN** ein Spieler 6 oder mehr Diamanten besitzt
- **THEN** werden alle Diamanten sichtbar dargestellt (überlappend falls nötig, um in den verfügbaren Bereich zu passen)

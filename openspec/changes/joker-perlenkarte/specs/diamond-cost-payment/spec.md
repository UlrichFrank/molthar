## MODIFIED Requirements

### Requirement: Validierung prüft ausreichende Diamantanzahl
`validateDiamondCost` SHALL prüfen, ob der Spieler mindestens so viele Diamanten hat wie gefordert (`>=`), nicht exakt gleich viele. Die Gesamtanzahl benötigter Diamanten ergibt sich aus `diamond`-Kostenelementen der Karte **plus** je 1 Diamant pro eingesetzter Joker-Perlenkarte.

#### Scenario: Spieler hat genau die benötigte Anzahl
- **WHEN** der Spieler genau 1 Diamant hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `true` zurück

#### Scenario: Spieler hat mehr als die benötigte Anzahl
- **WHEN** der Spieler 3 Diamanten hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `true` zurück

#### Scenario: Spieler hat zu wenig Diamanten
- **WHEN** der Spieler 0 Diamanten hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `false` zurück

#### Scenario: Joker erhöht den Diamantbedarf
- **WHEN** der Spieler 1 Diamant hat, die Karte keinen `diamond`-Kostenbestandteil hat, aber 1 Joker-Karte eingesetzt wird
- **THEN** ist der Diamantbedarf 1 (für den Joker) — Move ist gültig

#### Scenario: Joker + Diamantkosten zusammen überschreiten Vorrat
- **WHEN** der Spieler 1 Diamant hat, die Karte 1 `diamond`-Kosten hat und zusätzlich 1 Joker eingesetzt wird
- **THEN** ist der Diamantbedarf 2 — Move ist ungültig (`INVALID_MOVE`)

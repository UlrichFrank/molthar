## ADDED Requirements

### Requirement: Bots tauschen schwache Portal-Karten gegen bessere Display-Karten
Wenn das Portal voll ist (2 Karten), SHALL der Bot eine Portal-Karte gegen eine Display-Karte tauschen, wenn die Display-Karte einen deutlich höheren `effectiveCardValue` hat.

#### Scenario: Tauschen wenn Display-Karte deutlich besser
- **WHEN** Portal hat 2 Karten UND `effectiveCardValue(beste Display-Karte) > threshold × effectiveCardValue(schlechteste Portal-Karte)`
- **THEN** gibt der Bot `takeCharacterCard(displaySlot, portalSlot)` zurück

#### Scenario: Kein Tausch wenn Wertunterschied zu gering
- **WHEN** die beste Display-Karte weniger als `threshold`-fachen Wert der schlechtesten Portal-Karte hat
- **THEN** wird kein Portal-Tausch durchgeführt

#### Scenario: Tausch-Schwelle ist strategie-spezifisch
- **WHEN** `strategy === 'tempo'`
- **THEN** ist die Schwelle 1.2× (aggressiver Tausch)

#### Scenario: Effizienz-Strategie tauscht konservativ
- **WHEN** `strategy === 'efficient'`
- **THEN** ist die Schwelle 1.6× (tauscht nur bei klarem Vorteil)

#### Scenario: Deck-Peek beeinflusst Portal-Tausch
- **WHEN** `characterDeck.at(-1)` einen höheren `effectiveCardValue` hat als alle Display-Karten
- **THEN** wird der Deck-Top als Kandidat für den Portal-Tausch berücksichtigt (blind draw mit `takeCharacterCard(-1, portalSlot)`)

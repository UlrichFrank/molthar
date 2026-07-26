## MODIFIED Requirements

### Requirement: Strategie-spezifische Gewichtungen
Das System SHALL pro `NpcStrategy` feste Gewichtungen für die drei Signale definieren. Zusätzlich SHALL für die `diamond`-Strategie ein **Frühphasen-Bonus** von `+3 * card.diamonds` in `scoreCardForStrategy(card, 'diamond', effort)` addiert werden, wenn `G.pearlDeck.length > 15`. Dadurch werden Diamant-Karten in der frühen Spielphase auch bei niedrigen Punkten bevorzugt.

Die Bewertungsfunktion MUST die Deckgröße als zusätzlichen Parameter erhalten (`scoreCardForStrategy(card, strategy, effort, deckSize?)`); wenn nicht übergeben, wird der Frühphasen-Bonus nicht angewendet (Backward-Compat für existierende Aufrufer).

#### Scenario: Greedy-Gewichtung
- **WHEN** `strategy === 'greedy'`
- **THEN** gilt `w_help > w_urgency > w_contest` (Helpfulness dominiert, Contestedness niedrig)

#### Scenario: Aggressive-Gewichtung
- **WHEN** `strategy === 'aggressive'`
- **THEN** gilt `w_contest` am höchsten aller Strategien (RalfBot spielt defensiv/blockierend)

#### Scenario: Efficient-Gewichtung
- **WHEN** `strategy === 'efficient'`
- **THEN** gilt `w_urgency` am höchsten aller Strategien (WendelinBot plant vorausschauend)

#### Scenario: Diamond-Frühphasen-Bonus aktiv
- **WHEN** EdelsteinBot in Frühphase (deckSize > 15) eine Karte mit `diamonds >= 2` bewertet
- **THEN** enthält der Score einen Zusatzbonus von `3 * card.diamonds`, der die Karte auch gegen höherpunktige Nicht-Diamant-Karten kompetitiv macht

#### Scenario: Diamond-Bonus in Spätphase inaktiv
- **WHEN** EdelsteinBot in Spätphase (deckSize <= 15) eine Karte bewertet
- **THEN** wird kein Frühphasen-Bonus angewendet — reine Standard-Diamond-Formel

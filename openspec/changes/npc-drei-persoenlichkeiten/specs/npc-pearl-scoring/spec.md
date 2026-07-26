## MODIFIED Requirements

### Requirement: Pearl Scoring mit drei Signalen
Das System SHALL eine Funktion `scorePearlSlot(pearlValue, targetCard, G, myPlayerID, weights)` bereitstellen, die für einen gegebenen Perlenwert einen numerischen Score berechnet. Der Score kombiniert drei Signale (Helpfulness, Urgency, Contestedness) in einer nicht-subtraktiven Formel:

```
own_value  = help * helpfulness + urgency * urgency_signal
opp_value  = contest * contestedness
final      = own_value + max(0, opp_value - own_value * denyThreshold)
```

Der `denyThreshold` ist strategie-spezifisch und wird von `getStrategyWeights()` mit ausgegeben.

#### Scenario: Perle hilft Zielkarte
- **WHEN** eine Perle den `estimateEffort` der Zielkarte um ≥1 reduziert
- **THEN** hat `helpfulness > 0` und der Gesamtscore steigt proportional zu `w_help`

#### Scenario: Perle hilft Zielkarte nicht
- **WHEN** der `estimateEffort` mit und ohne die Perle identisch ist
- **THEN** ist `helpfulness = 0`, der Score basiert nur auf Urgency und Contestedness

#### Scenario: Knapper Perlenwert im Deck
- **WHEN** weniger als 20% des verbleibenden Decks aus dem gesuchten Wert bestehen
- **THEN** ist `urgency > 0.8` und erhöht den Score entsprechend `w_urgency`

#### Scenario: Deck kurz vor Reshuffle
- **WHEN** `pearlDeck.length < 4`
- **THEN** wird der Urgency-Beitrag um 50% gedämpft (da ein Reshuffle alle Werte zurückbringt)

#### Scenario: Anderer Spieler profitiert, eigener Bedarf hoch
- **WHEN** eine Perle mir helpfulness=3 bringt und dem Gegner helpfulness=1, `denyThreshold=1.0`
- **THEN** wird der Contest-Beitrag nicht abgezogen — die Perle behält vollen `own_value`

#### Scenario: Anderer Spieler profitiert, eigener Bedarf niedrig
- **WHEN** eine Perle mir helpfulness=0 bringt und dem Gegner helpfulness=2, `denyThreshold=0`
- **THEN** wird der Contest-Beitrag voll auf den Score addiert (der Bot bevorzugt sie explizit als Block-Zug)

#### Scenario: Nächster Spieler hat höhere Contestedness-Gewichtung
- **WHEN** mehrere Spieler von einem Perlenwert profitieren, aber der nächste Spieler (im Zug-Order-Sinne) am meisten
- **THEN** wird sein Beitrag doppelt gewichtet (`proximityWeight = 2`)

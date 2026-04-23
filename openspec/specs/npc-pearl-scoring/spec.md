# npc-pearl-scoring Specification

## Purpose
TBD - created by archiving change npc-pearl-selection. Update Purpose after archive.
## Requirements
### Requirement: Pearl Scoring mit drei Signalen
Das System SHALL eine Funktion `scorePearlSlot(pearlValue, targetCard, G, myPlayerID, weights)` bereitstellen, die für einen gegebenen Perlenwert einen numerischen Score berechnet. Der Score setzt sich aus drei gewichteten Signalen zusammen: Helpfulness (Effort-Reduktion für Zielkarte), Urgency (Knappheit im Deck) und Contestedness (Bedarf anderer Spieler).

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

#### Scenario: Anderer Spieler profitiert
- **WHEN** ein anderer Spieler durch diese Perle seinen Effort für seine Zielkarte reduziert
- **THEN** steigt `contestedness` und senkt den Gesamtscore proportional zu `w_contest`

#### Scenario: Nächster Spieler hat höhere Contestedness-Gewichtung
- **WHEN** mehrere Spieler von einem Perlenwert profitieren
- **THEN** wird der nächste Spieler in der Zugreihenfolge doppelt gewichtet

### Requirement: Strategie-spezifische Gewichtungen
Das System SHALL pro `NpcStrategy` feste Gewichtungen für die drei Signale definieren.

#### Scenario: Greedy-Gewichtung
- **WHEN** `strategy === 'greedy'`
- **THEN** gilt `w_help > w_urgency > w_contest` (Helpfulness dominiert, Contestedness niedrig)

#### Scenario: Aggressive-Gewichtung
- **WHEN** `strategy === 'aggressive'`
- **THEN** gilt `w_contest` am höchsten aller Strategien (RalfBot spielt defensiv/blockierend)

#### Scenario: Efficient-Gewichtung
- **WHEN** `strategy === 'efficient'`
- **THEN** gilt `w_urgency` am höchsten aller Strategien (WendelinBot plant vorausschauend)

### Requirement: Zielkarten-Extraktion
Das System SHALL eine Funktion `pickTargetCard(G, playerID, strategy)` bereitstellen, die die strategisch relevanteste Karte eines Bots zurückgibt — priorisiert aus dem Portal, dann aus `characterSlots`.

#### Scenario: Portal hat aktivierbare Karte
- **WHEN** mind. eine Portalzielkarte mit `canPayCard = true` existiert
- **THEN** wird die aktivierbarste Karte zurückgegeben (strategie-abhängige Sortierung)

#### Scenario: Kein Portal, kein Display
- **WHEN** Portal leer und `characterSlots` leer
- **THEN** gibt `pickTargetCard` `null` zurück; Scorer verwendet nur Urgency und Contestedness

### Requirement: Bot-Integration — Pearl-Auswahl
Alle Bots außer IrrnisBot SHALL `scorePearlSlot()` für die Pearl-Auswahl verwenden anstelle von `bestPearlSlotIndex()`, `neededPearlValues()` oder `findPearlForTarget()`.

#### Scenario: GierBot wählt Perle
- **WHEN** GierBot eine Perlaktion ausführt
- **THEN** wählt er den Slot mit dem höchsten `scorePearlSlot`-Score (greedy weights), nicht den höchsten Wert

#### Scenario: RalfBot blockiert Gegner
- **WHEN** eine Perle einem anderen Spieler stark helfen würde (hohe Contestedness)
- **THEN** wählt RalfBot diese Perle auch dann, wenn sie ihm selbst wenig nützt

#### Scenario: IrrnisBot bleibt zufällig
- **WHEN** IrrnisBot eine Perlaktion ausführt
- **THEN** bleibt die Auswahl zufällig unter allen validen Moves (keine Änderung)


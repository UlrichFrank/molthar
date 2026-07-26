## MODIFIED Requirements

### Requirement: Timing-aware Aktivierungsreihenfolge
Das System SHALL in allen produktiven Bots (WendelinBot, RalfBot, EdelsteinBot) bei der Sortierung aktivierbarer Portalslots den `powerPoints`-Wert mit dem Timing-Multiplikator multiplizieren.

Der Multiplikator wird einmal pro Bot-Entscheidung berechnet und für die Aktivierungssortierung verwendet. Perlenauswahl und Charakterkartenauswahl bleiben unverändert.

Zusätzlich SHALL nach einer erfolgreichen Aktivierung ein Chaining-Check erfolgen (`tryChainActivation`), der bis zu einer zweiten Aktivierung im selben Zug erlaubt, wenn dadurch eine weitere Portal-Karte zahlbar geworden ist. Maximum: zwei Aktivierungen pro Zug (Portal-Kapazität).

#### Scenario: Endgame priorisiert Punkte stärker
- **WHEN** ein Bot in der Endphase (eigene Punkte ≥ 9) zwischen zwei aktivierbaren Karten (3 Punkte vs. 2 Punkte) wählt
- **THEN** wird die 3-Punkte-Karte mit deutlich höherer Wahrscheinlichkeit aktiviert als in der Normalphase

#### Scenario: Chaining nach Diamant-Erwerb
- **WHEN** ein Bot Karte A aktiviert und dadurch einen Diamanten erhält, der Karte B im Portal zahlbar macht
- **THEN** wird Karte B im selben Zug automatisch aktiviert

#### Scenario: Chaining-Limit greift
- **WHEN** ein Zug bereits zwei Aktivierungen enthält
- **THEN** wird keine dritte Aktivierung ausgelöst (Portal-Kapazität)

#### Scenario: IrrnisBot ist entfernt aus Produktion
- **WHEN** in der Lobby die Bot-Auswahl angezeigt wird
- **THEN** ist `random` (IrrnisBot) nicht wählbar — nur die drei Persönlichkeiten

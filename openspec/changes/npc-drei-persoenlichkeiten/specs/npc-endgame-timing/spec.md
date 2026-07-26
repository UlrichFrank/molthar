## MODIFIED Requirements

### Requirement: Timing-Multiplikator-Utility
Das System SHALL ein Utility-Modul `backend/src/bots/timing.ts` bereitstellen mit der Funktion `getTimingMultiplier(G: GameState, playerID: string): number`.

Die Funktion SHALL einen **kontinuierlichen** Multiplikator im Bereich `[1.0, ~3.0]` zurückgeben, der aus drei additiven Druck-Signalen zusammengesetzt ist:

```
mult = 1.0
      + max(0, (own_pts    - 6) / 6) * URGENCY_OWN    // eigene Punkte ab 6
      + max(0, (leader_pts - 6) / 6) * URGENCY_OPP    // führender Gegner ab 6
      + max(0, (30 - deck_size) / 30) * URGENCY_DECK  // spätes Deck erhöht Druck
```

Standardwerte: `URGENCY_OWN=0.9`, `URGENCY_OPP=0.5`, `URGENCY_DECK=0.3`.

Höherer Wert = Punkte werden stärker gewichtet.

#### Scenario: Frühphase ohne Druck
- **WHEN** `getTimingMultiplier` aufgerufen wird und eigene/Gegner-Punkte = 0, Deck > 25
- **THEN** ist der Multiplikator ≤ 1.05

#### Scenario: Endspurt bei 11 Punkten
- **WHEN** eigene Punkte = 11 (Sieg 1 Aktivierung entfernt)
- **THEN** ist der Multiplikator ≥ 1.7 und höher als bei eigene Punkte = 9

#### Scenario: Gegner führt bei 10, eigene bei 4
- **WHEN** ein Gegner hat 10 Punkte und der aktuelle Spieler hat 4 Punkte
- **THEN** ist der Multiplikator merklich > 1.0 (Gegner-Druck aktiv)

#### Scenario: Leeres Deck erhöht Druck
- **WHEN** Deck-Größe = 0
- **THEN** trägt `URGENCY_DECK * 1.0` zum Multiplikator bei (~1.3)

### Requirement: Timing-aware Aktivierungsreihenfolge
Das System SHALL in allen produktiven Bots (WendelinBot, RalfBot, EdelsteinBot) bei der Sortierung aktivierbarer Portalslots den `powerPoints`-Wert mit dem Timing-Multiplikator multiplizieren.

Der Multiplikator wird einmal pro Bot-Entscheidung berechnet und für die Aktivierungssortierung verwendet. Perlenauswahl und Charakterkartenauswahl bleiben unverändert.

#### Scenario: Endgame priorisiert Punkte stärker
- **WHEN** ein Bot in der Endphase (eigene Punkte ≥ 9) zwischen zwei aktivierbaren Karten (3 Punkte vs. 2 Punkte) wählt
- **THEN** wird die 3-Punkte-Karte mit deutlich höherer Wahrscheinlichkeit aktiviert als in der Normalphase

#### Scenario: IrrnisBot ist entfernt aus Produktion
- **WHEN** in der Lobby die Bot-Auswahl angezeigt wird
- **THEN** ist `random` (IrrnisBot) nicht mehr wählbar — nur die drei Persönlichkeiten

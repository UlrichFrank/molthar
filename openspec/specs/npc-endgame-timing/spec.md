# npc-endgame-timing Specification

## Purpose
TBD - created by archiving change npc-menschlichkeit. Update Purpose after archive.
## Requirements
### Requirement: Timing-Multiplikator-Utility
Das System SHALL ein Utility-Modul `backend/src/bots/timing.ts` bereitstellen mit der Funktion `getTimingMultiplier(G: GameState, playerID: string): number`.

Rückgabewerte:
- `1.8` wenn eigene Punkte ≥ 9 (Endspurt)
- `1.4` wenn max. Gegner-Punkte ≥ 9 und eigene Punkte < 9 (Gegner vorn)
- `1.0` in allen anderen Fällen (normal)

Wenn beide Bedingungen zutreffen (eigene ≥ 9 UND Gegner ≥ 9), hat `1.8` Vorrang.

#### Scenario: Endspurt erkannt
- **WHEN** `getTimingMultiplier` aufgerufen wird und der aktuelle Spieler 9 oder mehr Punkte hat
- **THEN** gibt die Funktion 1.8 zurück

#### Scenario: Gegner führt
- **WHEN** `getTimingMultiplier` aufgerufen wird, der aktuelle Spieler hat <9 Punkte, aber mindestens ein Gegner hat ≥9 Punkte
- **THEN** gibt die Funktion 1.4 zurück

#### Scenario: Normale Spielphase
- **WHEN** `getTimingMultiplier` aufgerufen wird und alle Spieler <9 Punkte haben
- **THEN** gibt die Funktion 1.0 zurück

### Requirement: Timing-aware Aktivierungsreihenfolge
Das System SHALL in allen Bots bei der Sortierung aktivierbarer Portalslots den `powerPoints`-Wert mit dem Timing-Multiplikator multiplizieren.

Der Multiplikator wird einmal pro Bot-Entscheidung berechnet und für die Aktivierungssortierung verwendet. Perlenauswahl und Charakterkartenauswahl bleiben unverändert.

#### Scenario: Endgame priorisiert Punkte stärker
- **WHEN** ein Bot in der Endphase (eigene Punkte ≥ 9) zwischen zwei aktivierbaren Karten (3 Punkte vs. 2 Punkte) wählt
- **THEN** wird die 3-Punkte-Karte mit deutlich höherer Wahrscheinlichkeit aktiviert als in der Normalphase

#### Scenario: IrrnisBot reagiert schwach auf Timing
- **WHEN** IrrnisBot in der Endphase entscheidet
- **THEN** wählt er trotz Timing-Multiplikator durch seine hohe Temperatur / Gleichverteilung weiterhin oft suboptimal


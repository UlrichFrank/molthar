## ADDED Requirements

### Requirement: Portal-Tausch-Evaluator
Das System SHALL einen Helper `evaluatePortalSwap(G, playerID, candidateCard, strategy)` im Modul `shared/src/game/botPortalSwap.ts` bereitstellen.

Rückgabewert: `{ swap: boolean, portalSlot?: 0 | 1, delta: number }`.

`swap` ist `true`, wenn (a) das Portal des Spielers zwei Karten enthält und (b) die Kandidatenkarte unter der strategie-spezifischen Bewertungsfunktion einen strikt größeren Score hat als mindestens eine Portal-Karte. `portalSlot` verweist auf die schwächere der beiden Portal-Karten.

#### Scenario: Leeres Portal
- **WHEN** `evaluatePortalSwap` mit leerem Portal aufgerufen wird
- **THEN** liefert die Funktion `{ swap: false, delta: 0 }`

#### Scenario: Portal voll, Display-Karte deutlich besser
- **WHEN** Portal enthält zwei Karten mit Score 3 und 5, Kandidat hat Score 8
- **THEN** liefert die Funktion `{ swap: true, portalSlot: <index-of-3-card>, delta: 5 }`

#### Scenario: Portal voll, Display-Karte schwächer als beide
- **WHEN** Portal enthält Karten mit Score 6 und 7, Kandidat hat Score 4
- **THEN** liefert die Funktion `{ swap: false, delta: <0 }`

### Requirement: Kontinuierlicher Timing-Multiplikator
Das System SHALL `getTimingMultiplier(G, playerID)` als kontinuierliche Funktion implementieren, die drei additive Druck-Signale kombiniert: eigene Punkte, Führender-Gegner-Punkte, verbleibende Deckgröße.

Der Multiplikator SHALL im Bereich `[1.0, ~3.0]` liegen und monoton wachsen sobald eines der Signale den Schwellenwert überschreitet.

#### Scenario: Frühphase ohne Druck
- **WHEN** eigene Punkte = 0, Gegner-Punkte = 0, Deck > 25
- **THEN** ist der Multiplikator ≈ 1.0

#### Scenario: Endspurt bei 11 Punkten
- **WHEN** eigene Punkte = 11 (Sieg 1 Aktivierung entfernt)
- **THEN** ist der Multiplikator ≥ 1.7 und höher als bei eigene Punkte = 9

#### Scenario: Leeres Deck erhöht Druck
- **WHEN** Deck-Größe = 0 und eigene/Gegner-Punkte moderat
- **THEN** ist der Multiplikator merklich > 1.0

### Requirement: Contest-Score respektiert eigenen Bedarf
Das System SHALL in `scorePearlSlot()` den Contest-Beitrag nur dann als Score-Abzug wirksam werden lassen, wenn der Bot die Perle selbst weniger dringend braucht.

Formel: `final = own_value + max(0, opp_value - own_value * denyThreshold)` mit `own_value = help * helpfulness + urgency * urgency_signal` und `opp_value = contest * contestedness`.

`denyThreshold` ist strategie-spezifisch: `efficient=1.0`, `aggressive=0.0`, `diamond=0.7`.

#### Scenario: Eigener Bedarf höher als Gegner-Nutzen
- **WHEN** ein Bot mit `denyThreshold ≥ 0.5` eine Perle bewertet, die ihm helpfulness=3 bringt und dem Gegner nur helpfulness=1
- **THEN** wird der Score nicht abgezogen — der Bot nimmt sie mit voller Priorität

#### Scenario: Raubritter blockiert immer
- **WHEN** RalfBot (`denyThreshold=0`) eine Perle bewertet, die dem Gegner viel bringt
- **THEN** wird der Contest-Beitrag voll addiert (der Bot bevorzugt die Perle explizit)

### Requirement: Blaue Fähigkeiten werden aktiv genutzt
Das System SHALL im Modul `backend/src/bots/blueAbilities.ts` einen Handler `pickBlueAbilityAction(G, playerID, strategy)` bereitstellen, der vor dem normalen Aktionsfluss geprüft wird.

Der Handler SHALL folgende Moves berücksichtigen: `peekCharacterDeck`, `swapPortalCharacter`, `rehandCards`, `tradeForDiamond`. Für jeden Move MUST geprüft werden, dass die zugehörige Ability aktiv ist und in diesem Zug noch nicht genutzt wurde.

#### Scenario: Preview am Turn-Anfang
- **WHEN** Spieler hat `previewCharacter`-Ability aktiv und in diesem Zug noch nicht genutzt, Aktion 1 von N steht an
- **THEN** liefert der Handler die `peekCharacterDeck`-Aktion

#### Scenario: Ability nicht aktiv → skip
- **WHEN** Ability ist nicht in `activeAbilities`
- **THEN** liefert der Handler `null` für diesen Move und geht zum nächsten

#### Scenario: Trade nur bei sinnvoller Ausgangslage
- **WHEN** EdelsteinBot hat 2er-Perle in Hand, `tradeTwoForDiamond` aktiv, aber Portal-Karte ist bereits zahlbar
- **THEN** überspringt der Handler den Trade (Aktivierung ist wichtiger)

### Requirement: Drei Persönlichkeiten mit klaren Deltas
Das System SHALL genau drei Bot-Persönlichkeiten für produktiven Spielbetrieb bereitstellen: Stratege (`WendelinBot`), Raubritter (`RalfBot`), Sammler (`EdelsteinBot`).

Jede Persönlichkeit MUST auf demselben Smart Core aufbauen und sich nur in ihrer Score-Formel, `denyThreshold`, Softmax-Temperatur und Blaue-Fähigkeiten-Priorisierung unterscheiden.

#### Scenario: Stratege wählt pts/effort-optimal
- **WHEN** WendelinBot vor der Wahl zwischen einer 5pts-Karte mit effort=2 und einer 4pts-Karte mit effort=0 steht
- **THEN** wählt er die 4pts-Karte (Ratio 4.0 > 5/3=1.67)

#### Scenario: Sammler bevorzugt Diamant-Karten früh
- **WHEN** EdelsteinBot in Frühphase (deck > 15) zwischen einer 3pts/2◆-Karte und einer 5pts/0◆-Karte wählt
- **THEN** wählt er die Diamant-Karte

#### Scenario: Raubritter greift Führenden an
- **WHEN** RalfBot eine `stealOpponentHandCard`-Fähigkeit auslöst und mehrere Gegner haben Karten
- **THEN** zielt er auf den Gegner mit den meisten Punkten

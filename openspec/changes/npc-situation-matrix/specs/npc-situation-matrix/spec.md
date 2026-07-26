## ADDED Requirements

### Requirement: Szenario-Definition als Mock-GameState

Das System SHALL für jedes der 32 Szenarien (A1–E6) einen vollständigen Mock-GameState erzeugen, der alle Felder enthält, die Bot-Funktionen lesen. Der Mock MUSS deterministisch sein (kein Math.random, kein Datenbankzugriff).

#### Scenario: Mock beinhaltet alle Bot-relevanten Felder

- **WHEN** ein Szenario-Objekt übergeben wird
- **THEN** enthält der resultierende GameState: `players[id].hand`, `.portal`, `.powerPoints`, `.diamondCards`, `.handLimitModifier`, `.activeAbilities`; sowie `pearlSlots`, `pearlDeck`, `characterSlots`, `characterDeck`, `playerOrder`, `roundNumber`, `actionCount`, `maxActions`, `requiresHandDiscard=false` und alle pending-Flags auf `false`

#### Scenario: Mock ist deterministisch

- **WHEN** dasselbe Szenario-Objekt zweimal übergeben wird
- **THEN** liefern beide Mock-States identische Objekte (kein Zufall, keine Seiteneffekte)

---

### Requirement: Bot-Aufruf pro Szenario

Das System SHALL für jedes Szenario alle 4 nicht-zufälligen Bots (greedy, efficient, diamond, aggressive) mit dem Mock-GameState aufrufen und die zurückgegebene BotAction erfassen.

#### Scenario: Bot-Entscheidung wird aufgezeichnet

- **WHEN** ein Szenario ausgeführt wird
- **THEN** enthält das Ergebnis für jede Strategie: den Aktionstyp (`move` oder `event`), den ersten Argument-Wert (z.B. Slot-Index), und ob die Aktion mit `ideal_action` übereinstimmt

#### Scenario: Bot-Fehler werden abgefangen

- **WHEN** eine Bot-Funktion einen Fehler wirft oder `null` zurückgibt
- **THEN** wird `"ERROR"` als Aktionswert eingetragen und die Ausführung der restlichen Szenarien fortgesetzt

---

### Requirement: CSV-Report-Ausgabe

Das System SHALL alle Szenario-Ergebnisse als CSV-Datei in den konfigurierten Output-Ordner schreiben. Der Dateiname lautet `situation_matrix_DATUM.csv`.

#### Scenario: CSV enthält alle Pflicht-Spalten

- **WHEN** die Matrix ausgeführt wird
- **THEN** enthält die CSV die Spalten: `id, category, name, description, hand_values, portal_1_pts, portal_1_effort, portal_1_payable, portal_2_pts, portal_2_effort, portal_2_payable, diamonds, own_pts, pts_gap, game_phase, deck_size, timing_mult, useful_slots, pearl_slots, char_display_best_pts, greedy_action, efficient_action, diamond_action, aggressive_action, ideal_action, ideal_reason, greedy_ok, efficient_ok, diamond_ok, aggressive_ok, notes`

#### Scenario: Korrektheit wird bewertet

- **WHEN** eine Bot-Aktion mit `ideal_action` verglichen wird
- **THEN** ist `*_ok` = `TRUE` wenn die Aktionstyp-Zeichenkette mit `ideal_action` übereinstimmt, `FALSE` wenn nicht, `PARTIAL` wenn manuell so gesetzt

---

### Requirement: HTML-Übersicht

Das System SHALL eine selbst-enthaltene HTML-Datei `situation_matrix_DATUM.html` erzeugen mit einer farbkodierten Tabelle der Bot-Entscheidungen.

#### Scenario: Farbkodierung nach Korrektheit

- **WHEN** die HTML-Datei gerendert wird
- **THEN** sind korrekte Zellen grün (`#16a34a`), partielle gelb (`#d97706`), falsche rot (`#dc2626`) hinterlegt

#### Scenario: Tooltip zeigt Begründung

- **WHEN** der Benutzer mit der Maus über eine Zelle fährt
- **THEN** wird `ideal_reason` als Tooltip angezeigt

---

### Requirement: CLI-Aufruf

Das System SHALL über `pnpm tsx src/simulation/situationMatrix.ts [--output <dir>]` aufrufbar sein.

#### Scenario: Standardaufruf erzeugt beide Dateien

- **WHEN** `pnpm tsx src/simulation/situationMatrix.ts` ohne Argumente ausgeführt wird
- **THEN** werden CSV und HTML in `./simulation-results/` erstellt und die Pfade auf stdout ausgegeben

#### Scenario: Ausgabeverzeichnis konfigurierbar

- **WHEN** `--output ./my-results` übergeben wird
- **THEN** werden beide Dateien in `./my-results/` erstellt (Verzeichnis wird ggf. angelegt)

## ADDED Requirements

### Requirement: Chaining-Aktivierung im gleichen Zug
Das System SHALL nach einer erfolgreichen `activatePortalCard`-Aktion prüfen, ob eine zweite Portal-Karte JETZT zahlbar geworden ist, und diese im selben Zug automatisch aktivieren. Maximal zwei Aktivierungen pro Zug (Portal-Kapazität).

Die Chaining-Logik MUST als separater Helper `backend/src/bots/chaining.ts` mit der Funktion `tryChainActivation(G, playerID, strategy): BotAction | null` gekapselt sein.

#### Scenario: Zweite Karte durch Diamant-Erwerb zahlbar
- **WHEN** ein Bot Karte A aktiviert, dabei einen Diamanten erhält, und Karte B im Portal jetzt eine Diamant-Kosten deckt
- **THEN** aktiviert der Bot Karte B im selben Zug

#### Scenario: Keine zweite Aktivierung möglich
- **WHEN** nach einer Aktivierung keine weitere Portal-Karte zahlbar ist
- **THEN** liefert `tryChainActivation` `null` und der Bot beendet den Zug regulär

#### Scenario: Kein Endlos-Chain
- **WHEN** ein Zug bereits zwei Aktivierungen enthält
- **THEN** liefert `tryChainActivation` `null` (Portal-Kapazität-Limit)

### Requirement: preEndTurn-Hook für Bot-Turn-Ende
Das System SHALL Bots vor der automatischen `endTurn`-Auslösung eine Chance geben, `rehandCards` (oder andere `onlyEndOfTurn`-Moves) auszuführen.

Die Engine (`backend/src/simulation/engine.ts`) und der `bot-runner.ts` MUST bei `actionCount >= maxActions` erst `pickBlueAbilityAction(G, playerID, strategy, { onlyEndOfTurn: true })` aufrufen. Nur wenn diese Funktion `null` zurückgibt, wird `endTurn` getriggert.

#### Scenario: Rehand wird genutzt bei ungünstiger Hand
- **WHEN** ein Bot mit aktiver `changeHandActions`-Fähigkeit den letzten Aktionszug abgeschlossen hat und die Hand nicht die nächste Aktivierung deckt
- **THEN** wird `rehandCards` aufgerufen bevor der Zug endet

#### Scenario: Rehand wird übersprungen bei guter Hand
- **WHEN** die aktuelle Hand bereits eine Portal-Karte im nächsten Zug decken würde
- **THEN** wird `rehandCards` nicht aufgerufen

### Requirement: Deadlock-Diagnose-Modus
Das System SHALL im Turnier-CLI (`backend/src/simulation/run.ts`) ein Argument `--diagnose-deadlock` bereitstellen. Bei aktiviertem Modus MUST bei jedem abgebrochenen Spiel die letzten 30 Züge in einem strukturierten Log-Format ausgegeben werden (JSON-Zeilen mit playerID, move, hand, portal, actionCount).

#### Scenario: Deadlock-Modus aktiv, Spiel bricht ab
- **WHEN** ein Spiel abbricht und `--diagnose-deadlock` aktiv ist
- **THEN** werden die letzten 30 Züge als JSON auf stdout ausgegeben, prefixiert mit `[DEADLOCK gameId=<id>]`

#### Scenario: Normales Turnier ohne Diagnose
- **WHEN** `--diagnose-deadlock` nicht gesetzt ist
- **THEN** verhält sich das Turnier wie bisher (nur aggregierte Statistiken)

### Requirement: Persönlichkeitstests pro Bot
Das System SHALL für jede der drei Bot-Persönlichkeiten (WendelinBot, RalfBot, EdelsteinBot) eine dedizierte Test-Datei bereitstellen mit mindestens drei Szenarien, die charakteristische Verhaltensweisen dieses Bots verifizieren.

#### Scenario: WendelinBot-Test läuft grün
- **WHEN** `pnpm vitest run WendelinBot.test.ts` ausgeführt wird
- **THEN** sind alle Persönlichkeitstests grün (pts/effort-Wahl, Portal-Tausch, Chaining)

#### Scenario: RalfBot-Test läuft grün
- **WHEN** `pnpm vitest run RalfBot.test.ts` ausgeführt wird
- **THEN** sind alle Persönlichkeitstests grün (Contest-Blocker, Steal-Priorität, rote Fähigkeit bevorzugt)

#### Scenario: EdelsteinBot-Test läuft grün
- **WHEN** `pnpm vitest run EdelsteinBot.test.ts` ausgeführt wird
- **THEN** sind alle Persönlichkeitstests grün (Diamant-Frühphase, tradeForDiamond, blauer Modifikator)

### Requirement: Kontroll-Turnier gegen Legacy-Diamond-Bot
Das System SHALL einen Legacy-Diamond-Bot unter `backend/src/bots/testBots/LegacyDiamondBot.ts` bereitstellen (1:1 aus dem Zustand vor `npc-drei-persoenlichkeiten`). Das Turnier-CLI MUST das Argument `--legacy-diamond` unterstützen, das den Legacy-Bot in einen der Slots einsetzt.

#### Scenario: Kontroll-Turnier gegen Legacy-Bot
- **WHEN** `pnpm tsx src/simulation/run.ts --games 50 --legacy-diamond` ausgeführt wird
- **THEN** spielen die drei Personas jeweils gegen den Legacy-Diamond-Bot und das Ergebnis wird aggregiert ausgegeben

#### Scenario: Legacy-Bot nicht mehr in Produktion
- **WHEN** in der Lobby die Bot-Auswahl angezeigt wird
- **THEN** ist der Legacy-Bot NICHT wählbar (nur in `testBots/`)

### Requirement: Automatisches Erfolgskriterien-Check-Skript
Das System SHALL ein Skript `backend/src/simulation/verify.ts` bereitstellen, das ein 300-Spiel-Turnier (Default) fährt und die drei Erfolgskriterien automatisch prüft: Abbruchrate < 5%, ⌀ Rundenzahl < 20, jede Persona > 55% gegen Legacy-Diamond-Bot.

Bei allen bestandenen Kriterien MUST der Exit-Code 0 sein, sonst 1. Die Konsolen-Ausgabe MUST für jedes Kriterium den Ist- und Soll-Wert enthalten.

#### Scenario: Alle Kriterien erfüllt
- **WHEN** `pnpm tsx src/simulation/verify.ts` läuft und alle drei Metriken innerhalb der Schwellen liegen
- **THEN** ist der Exit-Code 0 und die Ausgabe zeigt `PASS` für jede Metrik

#### Scenario: Ein Kriterium versagt
- **WHEN** die Abbruchrate auf 6% steigt
- **THEN** ist der Exit-Code 1 und die Ausgabe zeigt `FAIL: aborted 6.0% > 5.0%`

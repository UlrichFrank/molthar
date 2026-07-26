## 1. Mock-State-Builder

- [ ] 1.1 `backend/src/simulation/mockState.ts` anlegen: `buildMockState(scenario)` Funktion, die einen minimalen aber vollständigen `GameState` erzeugt
- [ ] 1.2 Mock-Spieler-Builder: `mockPlayer(id, { hand, portal, powerPoints, diamonds, handLimitModifier })` — erzeugt vollständiges `PlayerState`-Objekt mit sinnvollen Defaults (activeAbilities=[], handLimitModifier=0, etc.)
- [ ] 1.3 Mock-PearlCard-Builder: `mockPearl(value, id?)` — minimale PearlCard mit id, value, hasSwapSymbol=false, hasRefreshSymbol=false
- [ ] 1.4 Mock-CharacterCard-Builder: `mockChar({ name, powerPoints, diamonds, cost, abilities? })` — minimale CharacterCard mit allen Pflichtfeldern
- [ ] 1.5 Mock-Opponent-Builder: `mockOpponent(id, { powerPoints, portal, hand })` für Contest-Szenarien mit Gegner-Zustand
- [ ] 1.6 Verify: `buildMockState` produziert deterministisch identische Objekte für gleiche Eingabe (simpler Gleichheitstest)

## 2. Szenario-Definitionen (Kategorie A + P)

- [ ] 2.1 Szenario-Interface definieren: `{ id, category, name, description, state: MockStateInput, ideal_action: string, ideal_reason: string, notes?: string }`
- [ ] 2.2 A1–A6: Aktivierungs-Szenarien implementieren (6 Stück; A3 mit Gegner bei 10pts, A5 mit Display-Karte die Portal-Slot-Freimachen motiviert)
- [ ] 2.3 P1–P8: Perlen-Szenarien implementieren (8 Stück; P5 mit Contest-Problem, P8 mit variierenden actionCount-Werten)

## 3. Szenario-Definitionen (Kategorie C + E)

- [ ] 3.1 C1–C6: Charakterkarten-Szenarien implementieren (6 Stück; C3 explizit mit portal.length===2 und starker Display-Karte — belegt Lücke)
- [ ] 3.2 E1–E6: Endgame-Szenarien implementieren (6 Stück; E1 mit pts_gap=-1 und zahlbarer Karte die Sieg bringt)
- [ ] 3.3 Alle 26 Szenarien in `SCENARIOS`-Array exportieren

## 4. Matrix-Runner

- [ ] 4.1 `backend/src/simulation/situationMatrix.ts` anlegen: importiert alle Bot-Funktionen (GierBot, WendelinBot, EdelsteinBot, RalfBot) + alle Szenarien
- [ ] 4.2 `runMatrix()`: für jedes Szenario alle 4 Bots aufrufen, BotAction erfassen, Fehler abfangen → `MatrixRow[]`
- [ ] 4.3 `formatAction(action: BotAction): string`: normalisiert BotAction zu lesbarem String (`"activatePortalCard(0)"`, `"takePearlCard(2)"`, `"replacePearlSlots"`, `"endTurn"`)
- [ ] 4.4 `isCorrect(botAction: string, ideal: string): 'TRUE' | 'FALSE' | 'PARTIAL'`: String-Präfix-Vergleich (z.B. `"activatePortalCard"` matcht `"activatePortalCard(0)"`)
- [ ] 4.5 `timingMultFromState(G, playerID)`: liest `getTimingMultiplier()` aus dem Mock-State (für CSV-Spalte)

## 5. CSV-Ausgabe

- [ ] 5.1 `generateMatrixCsv(rows: MatrixRow[], outputDir: string): string` — schreibt `situation_matrix_DATUM.csv` mit allen Pflicht-Spalten aus dem Spec
- [ ] 5.2 Alle Felder korrekt escapen (Komma in `description` und `notes` durch Anführungszeichen schützen)
- [ ] 5.3 Verify: CSV öffnet sich in Numbers/Excel ohne Zeichensatz-Probleme (UTF-8 mit BOM für Excel-Kompatibilität)

## 6. HTML-Ausgabe

- [ ] 6.1 `generateMatrixHtml(rows: MatrixRow[], outputDir: string): string` — schreibt `situation_matrix_DATUM.html`
- [ ] 6.2 Farbkodierte Tabelle: grün=TRUE, gelb=PARTIAL, rot=FALSE, grau=ERROR
- [ ] 6.3 Tooltip (`title`-Attribut) auf jeder Zelle mit `ideal_reason` Text
- [ ] 6.4 Zusammenfassung am Kopf: "X/26 Szenarien: greedy Y%, efficient Y%, diamond Y%, aggressive Y% korrekt"
- [ ] 6.5 Selbst-enthalten: alle Styles inline, kein CDN nötig

## 7. CLI-Einstiegspunkt & Integration

- [ ] 7.1 CLI-Argument `--output <dir>` parsen, Default: `./simulation-results/`
- [ ] 7.2 Output-Verzeichnis anlegen falls nicht vorhanden
- [ ] 7.3 Nach Ausführung: Dateipfade auf stdout, Kurzübersicht (Korrektquote pro Strategie)
- [ ] 7.4 Smoke-Test: `pnpm tsx src/simulation/situationMatrix.ts` läuft durch, erzeugt CSV + HTML ohne Fehler
- [ ] 7.5 TypeScript: `pnpm run type-check` im backend ohne Fehler nach Implementierung

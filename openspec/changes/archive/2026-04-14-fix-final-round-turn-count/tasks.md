## 1. Fix — endIf Formel

- [x] 1.1 `shared/src/game/index.ts`: In `endIf` die Zeile `const turnsNeeded = N;` ersetzen durch `const turnsNeeded = 2 * N - 1 - startingPlayerIdx;`

## 2. Tests

- [x] 2.1 `shared/src/game/` nach bestehenden Tests zur `endIf`-Logik suchen und prüfen ob sie die alte (falsche) Anzahl Züge erwarten
- [x] 2.2 Neue Tests schreiben: Auslöser = erster Spieler (idx=0) bei N=3 → 5 weitere Züge, Spielende nach vollständiger Schlussrunde
- [x] 2.3 Neue Tests schreiben: Auslöser = letzter Spieler (idx=N-1) bei N=3 → N weitere Züge, Spielende nach vollständiger Schlussrunde

## 3. Verifikation

- [ ] 3.1 Manuelle Prüfung: 2-Spieler-Spiel, P0 löst 12 Punkte aus → P1 spielt, dann P0+P1 Schlussrunde → Spiel endet (3 Züge nach Auslösung)
- [ ] 3.2 Manuelle Prüfung: 2-Spieler-Spiel, P1 löst aus → P0+P1 Schlussrunde → Spiel endet (2 Züge nach Auslösung)
- [ ] 3.3 Manuelle Prüfung: Startspieler-Marker-Spieler ist nie der letzte der Schlussrunde

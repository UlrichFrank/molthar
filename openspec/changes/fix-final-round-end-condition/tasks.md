## 1. Game Logic — endIf-Formel korrigieren

- [x] 1.1 In `shared/src/game/index.ts` (~Zeile 820): `const turnsNeeded = (N - 1 - startingPlayerIdx) + N;` ersetzen durch `const turnsNeeded = N;`
- [x] 1.2 Kommentar oberhalb der Formel aktualisieren: korrekte Erklärung `(N-1-idx) + (idx+1) = N`

## 2. Tests — Grenzwerte aktualisieren

- [x] 2.1 `endgameRanking.test.ts`, Test "N=2, Spieler 0 triggert": Beschreibung und Boundary-Werte anpassen: `T+3 → undefined` wird `T+2 → undefined`; `T+4 → defined` wird `T+3 → defined`; Kommentar korrigieren
- [x] 2.2 `endgameRanking.test.ts`, Test "N=4, Spieler 2 triggert": `T+5 → undefined` wird `T+4 → undefined`; `T+6 → defined` wird `T+5 → defined`; Kommentar korrigieren
- [x] 2.3 `endgameRanking.test.ts`, Ranking-Test 2.4: Kommentar zum `turnsNeeded`-Wert korrigieren (`turnsNeeded=4` statt `7`, End-Bedingung `turn > 5` statt `> 8`); der verwendete Zug-Wert `9` bleibt gültig

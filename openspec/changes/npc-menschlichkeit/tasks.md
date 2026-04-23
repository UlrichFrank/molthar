## 1. Softmax-Utility-Modul

- [x] 1.1 `backend/src/bots/softmax.ts` erstellen mit `softmaxPick<T>()` und `STRATEGY_TEMPERATURES`
- [x] 1.2 Score-Normalisierung (Shift auf Minimum=0) in `softmaxPick` implementieren

## 2. Endgame-Timing-Utility-Modul

- [x] 2.1 `backend/src/bots/timing.ts` erstellen mit `getTimingMultiplier(G, playerID)`

## 3. Shared: scoredPearlSlots API-Erweiterung

- [x] 3.1 `scoredPearlSlots(G, playerID, strategy)` in `shared/src/game/botPearlScorer.ts` hinzufügen
- [x] 3.2 Neue Funktion aus `shared` exportieren (package exports prüfen)
- [x] 3.3 `bestPearlSlotByScore` intern auf `scoredPearlSlots` umstellen (kein Behavior-Change)

## 4. Bot-Anpassungen

- [ ] 4.1 `GierBot` — Softmax für Perlen-, Charakter- und Aktivierungsauswahl + Timing
- [ ] 4.2 `EdelsteinBot` — Softmax für Perlen-, Charakter- und Aktivierungsauswahl + Timing
- [ ] 4.3 `WendelinBot` — Softmax für Perlen-, Charakter- und Aktivierungsauswahl + Timing
- [ ] 4.4 `RalfBot` — Softmax für Perlen-, Charakter- und Aktivierungsauswahl + Timing
- [ ] 4.5 `IrrnisBot` — nur Timing-Multiplikator (kein Softmax, bleibt zufällig)

## 5. Tests

- [ ] 5.1 Unit-Tests für `softmaxPick` (hohe/niedrige Temperatur, negative Scores)
- [ ] 5.2 Unit-Tests für `getTimingMultiplier` (alle 3 Fälle)
- [ ] 5.3 Unit-Tests für `scoredPearlSlots` (Score-Array korrekt befüllt)

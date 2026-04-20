## 1. Shared Utility: botPearlScorer

- [ ] 1.1 `shared/src/game/botPearlScorer.ts` anlegen mit `estimateEffort()` (aus WendelinBot übernehmen und generalisieren)
- [ ] 1.2 `scorePearlSlot(pearlValue, targetCard, G, myPlayerID, weights)` implementieren — Signal 1: Helpfulness
- [ ] 1.3 Signal 2 implementieren: Urgency (remaining/deck_size, Dämpfung bei deck.length < 4)
- [ ] 1.4 Signal 3 implementieren: Contestedness (andere Spieler-Portale auswerten, next-player doppelt gewichten)
- [ ] 1.5 `PearlWeights`-Typ und `STRATEGY_WEIGHTS`-Konstante für alle 5 Strategien definieren
- [ ] 1.6 `pickTargetCard(G, playerID, strategy)` implementieren — Portal-first, dann characterSlots, dann null
- [ ] 1.7 Alle neuen Funktionen aus `shared/src/index.ts` exportieren

## 2. Bot-Integration

- [ ] 2.1 `GierBot.ts`: `bestPearlSlotIndex()` durch `scorePearlSlot()` mit greedy weights ersetzen; Zielkarte via `pickTargetCard()` ermitteln
- [ ] 2.2 `RalfBot.ts`: `bestPearlSlotIndex()` durch `scorePearlSlot()` mit aggressive weights ersetzen; Zielkarte via `pickTargetCard()` ermitteln
- [ ] 2.3 `EdelsteinBot.ts`: `neededPearlValues()`/`findMatchingPearlSlot()` durch `scorePearlSlot()` mit diamond weights ersetzen; Zielkarte via `pickTargetCard()` ermitteln
- [ ] 2.4 `WendelinBot.ts`: `findPearlForTarget()`/lokales `estimateEffort()` durch `scorePearlSlot()` mit efficient weights ersetzen

## 3. Aufräumen

- [ ] 3.1 Lokales `estimateEffort()` aus `WendelinBot.ts` entfernen (jetzt in shared)
- [ ] 3.2 `bestPearlSlotIndex()` aus GierBot und RalfBot entfernen wenn nicht mehr gebraucht
- [ ] 3.3 `neededPearlValues()`, `findMatchingPearlSlot()` aus EdelsteinBot entfernen

## 4. Tests

- [ ] 4.1 Unit-Tests für `scorePearlSlot()`: Helpfulness-Signal (hilft / hilft nicht)
- [ ] 4.2 Unit-Tests für Urgency-Signal (hohe/niedrige Verfügbarkeit, Reshuffle-Dämpfung)
- [ ] 4.3 Unit-Tests für Contestedness-Signal (andere Spieler profitieren, next-player-Gewichtung)
- [ ] 4.4 Unit-Tests für `pickTargetCard()`: Portal-first, Display-Fallback, null-Fall

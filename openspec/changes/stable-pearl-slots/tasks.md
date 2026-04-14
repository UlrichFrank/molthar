## 1. Typdefinition

- [x] 1.1 `shared/src/game/types.ts`: `pearlSlots: PearlCard[]` → `pearlSlots: (PearlCard | null)[]`

## 2. Backend — Game-Logik

- [x] 2.1 `shared/src/game/index.ts`: Neue Hilfsfunktion `refillFixedSlots(slots, deck, discardPile, onReshuffle)` anlegen — füllt `null`-Einträge in einem Fixed-Size-Array einzeln in-place auf
- [x] 2.2 `shared/src/game/index.ts`: `setup()` — `pearlSlots` als `[null, null, null, null]` initialisieren und mit `refillFixedSlots` befüllen (statt Push-Loop)
- [x] 2.3 `shared/src/game/index.ts`: `takePearlCard` — `G.pearlSlots.splice(slotIndex, 1)` ersetzen durch `G.pearlSlots[slotIndex] = null`, dann In-Place-Ersatz mit der nächsten Deckskarte (kein `refillSlots`-Aufruf mehr für Pearl-Slots)
- [x] 2.4 `shared/src/game/index.ts`: `replacePearlSlots` — alle Slots auf `null` setzen, dann `refillFixedSlots` aufrufen (statt `splice(0)` + `refillSlots`)
- [x] 2.5 `shared/src/game/index.ts`: `applyPearlRefreshIfNeeded` — `.filter(card => ...)` auf `.filter((c): c is PearlCard => c !== null && ...)` anpassen
- [x] 2.6 `shared/src/game/index.ts`: Proaktiver Reshuffle-Check in `takePearlCard` — `G.pearlSlots.length >= 4` durch `G.pearlSlots.filter(c => c !== null).length >= 4` ersetzen (oder: Länge ist immer 4, Check bleibt)

## 3. Test-Fixtures anpassen

- [x] 3.1 `shared/src/game/abilities.test.ts`: `pearlSlots: []` → `pearlSlots: [null, null, null, null]`
- [x] 3.2 `shared/src/game/pearlRefresh.test.ts`: Alle `G.pearlSlots = [card, card, ...]`-Zuweisungen auf 4-Element-Arrays mit ggf. `null`-Füllwerten anpassen; Test-Logik auf positionsstabile Assertions prüfen
- [x] 3.3 `shared/src/game/reshuffle.test.ts`: Alle `G.pearlSlots = [...]`-Zuweisungen auf 4-Element-Format anpassen
- [x] 3.4 Neue Tests für das positionsstabile Verhalten in `pearlRefresh.test.ts` oder eigenem `stablePearlSlots.test.ts`: Slot X nehmen → Slot X bekommt Nachziehkarte, andere Slots unverändert

## 4. Frontend — Typ-Annotationen

- [x] 4.1 `game-web/src/lib/canvasRegions.ts`: Typ-Annotation `pearlSlots: PearlCard[]` (falls vorhanden) → `(PearlCard | null)[]`; bestehende `if (pearlSlots[i])`-Checks decken `null` bereits ab
- [x] 4.2 `game-web/src/lib/gameRender.ts`: Typ-Annotation der `pearlSlots`-Parameter auf `(PearlCard | null)[]` anpassen; `pearlSlots[pearlIdx] ?? null` ist bereits kompatibel
- [x] 4.3 `game-web/src/components/CanvasGameBoard.tsx`: Typ-Annotationen anpassen; `if (!pearlSlots[pearlIdx]) break` deckt `null` ab — prüfen ob weitere Stellen angepasst werden müssen

## 5. Verifikation

- [x] 5.1 `make test-shared` — alle Tests grün (279/279)
- [ ] 5.2 Perlkarte an Slot 1 nehmen → Slot 1 erhält Nachziehkarte, Slots 0/2/3 bleiben an Position
- [ ] 5.3 Perlkarten schnell hintereinander nehmen → kein ungewollter Positionsshift; Klicks treffen die erwarteten Karten
- [ ] 5.4 Deck leer machen bis Slot leer bleibt → andere Slots unverändert
- [ ] 5.5 `replacePearlSlots` — alle 4 Slots erhalten neue Karten an festen Positionen

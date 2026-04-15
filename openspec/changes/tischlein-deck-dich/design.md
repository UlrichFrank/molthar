## Context

Der existierende Move `replacePearlSlots` kostet eine Aktion (`actionCount++`). Die neue Fähigkeit der Karte „Tischlein deck dich" erlaubt denselben Effekt einmalig gratis vor der ersten Aktion. Das Muster existiert bereits für `swapPortalCharacter` (`changeCharacterActions`) und `peekCharacterDeck` (`previewCharacter`): beide prüfen `actionCount === 0` und haben keine Aktionskosten.

Der Move-Logik des regulären `replacePearlSlots` wird unverändert gelassen. Ein separater Move `replacePearlSlotsAbility` kapselt die Gratis-Variante.

## Goals / Non-Goals

**Goals:**
- Neuer Move `replacePearlSlotsAbility` mit identischer Perltausch-Logik wie `replacePearlSlots`, aber ohne `actionCount++` und mit Nutzungssperre via `G.replacePearlSlotsAbilityUsed`
- Gratis-Button im Canvas vor der ersten Aktion sichtbar (wenn Fähigkeit aktiv + nicht verbraucht)
- Normaler Tauschen-Button bleibt unverändert verfügbar als Aktion

**Non-Goals:**
- Änderung des bestehenden `replacePearlSlots`-Moves
- Mehrfache Gratis-Nutzung pro Zug
- KI-Unterstützung für die neue Fähigkeit

## Decisions

**Separater Move statt Flag-Parameter**
`replacePearlSlotsAbility` als eigener Move (kein `isFree: boolean`-Parameter an `replacePearlSlots`). Konsistenz mit `swapPortalCharacter`/`peekCharacterDeck`.

**`G.replacePearlSlotsAbilityUsed` im GameState**
Da die Fähigkeit gratis ist, bleibt `actionCount === 0` nach Nutzung. Ein eigenes Flag ist nötig, damit die Fähigkeit nicht zweimal genutzt werden kann. Reset in `turn.onBegin` (analog zu `usedPaymentAbilityTypes`).

**Canvas-Button-Platzierung**
Gleiche Position wie der normale Tausch-Button, aber nur sichtbar wenn `actionCount === 0 && hasAbility && !replacePearlSlotsAbilityUsed`. Sobald die erste Aktion ausgeführt wird, verschwindet dieser Button; der normale Tausch-Button erscheint.

**Perltausch-Logik duplizieren oder extrahieren**
Die Tauschlogik (discard all slots → refill) in eine Hilfsfunktion `doReplacePearlSlots(G)` extrahieren, die beide Moves aufrufen. Vermeidet Duplizierung.

## Risks / Trade-offs

- [Gleichzeitige Nutzung Gratis + Normal] → Kein Konflikt: Gratis-Button vor Aktion 1, danach nur noch Normal-Button. Logik disjunkt.
- [Gratis-Button nach `previewCharacter`-Nutzung] → Beide prüfen `actionCount === 0`. Spieler kann beides vor Aktion 1 nutzen. Kein Problem, korrekt laut Regeln.
- [`replacePearlSlotsAbilityUsed` bei mehreren Zügen] → Flag wird in `turn.onBegin` zurückgesetzt. Kein Leckage zwischen Zügen.

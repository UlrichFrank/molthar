## Context

**Aktueller Stand Backend:**
- `lastPlayedPearlId: string | null` ist im `GameState` definiert, wird aber nirgends gesetzt (nur initialisiert und am Zugende auf `null` zurückgesetzt) — die Ability ist de facto funktionslos.
- Echte Perlenkarten werden in `activatePortalCard` (Zeile 281) und `activateSharedCharacter` (Zeile 476) via `consumedCards.forEach(card => G.pearlDiscardPile.push(card))` auf den Ablagestapel gelegt.
- Virtuelle Karten (`virtual-*` IDs) gehen niemals auf den Ablagestapel — nur echte Handkarten.

**Aktueller Stand Frontend:**
- `peekedCard` / Pending-Flag-Pattern bereits etabliert.
- `DialogContext` hat typisierte Dialog-States.

## Goals / Non-Goals

**Goals:**
- Alle echten Perlenkarten des aktuellen Zuges nachverfolgen.
- Dialog mit Auswahl der zurückzuholenden Karte, mit Leerstate für den Fall "nur virtuelle".
- Neues Tracking ersetzt `lastPlayedPearlId` vollständig.

**Non-Goals:**
- Keine Mehrfachauswahl — der Spieler wählt genau eine Karte.
- Kein Tracking von Perlenkarten anderer Spieler.
- Keine Änderung der Aktivierungs-Logik selbst.

## Decisions

### 1. `playedRealPearlIds` statt `lastPlayedPearlId`

**Entscheidung:** `playedRealPearlIds: string[]` akkumuliert alle IDs echte Perlenkarten, die in diesem Zug konsumiert wurden. Wird am Zugende geleert.

**Begründung:** Der User will alle Karten des Zuges sehen, nicht nur die letzte. Das Array-Log ist die direkteste Lösung.

**Alternatives verworfen:**
- *`lastPlayedPearlIds` (Plural, nur letzter Move)*: Würde Karten aus früheren Moves im selben Zug verlieren.

### 2. Dialog immer öffnen, auch bei leerem Log

**Entscheidung:** `pendingTakeBackPlayedPearl` wird immer gesetzt, auch wenn `playedRealPearlIds` leer ist. Der Dialog zeigt dann einen Informationstext.

**Begründung:** Der Spieler aktiviert explizit die Ability und erwartet eine Reaktion. Stille wäre verwirrend. Der Text "Nur virtuelle Perlenkarten wurden gespielt" gibt klares Feedback.

**Alternativen verworfen:**
- *Dialog nicht öffnen wenn leer*: Spieler weiß nicht ob die Ability gewirkt hat oder ignoriert wurde.

### 3. Zwei Resolve-Moves: `resolveReturnPearl` und `dismissReturnPearlDialog`

**Entscheidung:** Separater Move für den Dismiss-Fall (keine echten Karten), um die Semantik klar zu halten.

**Begründung:** `resolveReturnPearl(pearlId)` ohne gültige `pearlId` als No-Op zu behandeln wäre unsauber. Ein expliziter `dismissReturnPearlDialog`-Move ist klarer.

### 4. Lookup der Karten über `playedRealPearlIds` → `pearlDiscardPile`

**Entscheidung:** Das Frontend filtert `G.pearlDiscardPile` nach `playedRealPearlIds` um die anzuzeigenden Karten zu ermitteln.

**Begründung:** Die Karten liegen physisch im `pearlDiscardPile`. Wir übertragen keine Kartenobjekte in `playedRealPearlIds`, nur IDs — das spart Duplizierung im State.

**Risiko:** Eine Karte aus `playedRealPearlIds` könnte nicht mehr im `pearlDiscardPile` sein (z.B. nach Reshuffle). → `resolveReturnPearl` validiert im Backend, dass die Karte tatsächlich im `pearlDiscardPile` liegt. Im Frontend: Karten die nicht gefunden werden, werden nicht angezeigt.

### 5. Idempotenter `resolveReturnPearl`-Move

**Entscheidung:** Move prüft: `pendingTakeBackPlayedPearl === true`, `pearlId` existiert in `pearlDiscardPile` und in `playedRealPearlIds`, sonst no-op.

## Risks / Trade-offs

- **Reshuffle-Interaktion:** Wenn der Ablagestapel während des Zuges gemischt wird (anderer Feature-Change), könnten Karten-IDs im Log sein aber nicht mehr im Discard. → Backend-Validierung fängt das ab.
- **BREAKING:** `lastPlayedPearlId` wird entfernt. Alle Tests, die dieses Feld nutzen, müssen angepasst werden.

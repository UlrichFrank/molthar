## Context

Perlenkarten haben bereits das Boolean-Flag `hasSwapSymbol` für eine existierende Mechanik. Der Typ `PearlCard` in `shared/src/game/types.ts` wird um ein weiteres Flag erweitert. Die `pearlSlots` (4 offene Perlenkarten) werden über `refillSlots()` nachgefüllt, wenn ein Spieler eine Karte nimmt (`takePearlCard`). Das Symbol soll laut Spielregel ausgelöst werden, sobald die Karte aufgedeckt wird — also wenn sie in `pearlSlots` eintrifft.

Das `characterSlots`-Array enthält die aktuell ausliegenden Charakterkarten, aus denen Spieler wählen können. Dieses wird analog zu `pearlSlots` über einen Deck/Discard-Mechanismus nachgefüllt.

## Goals / Non-Goals

**Goals:**
- Neue Spielmechanik: wenn eine markierte Perlenkarte in `pearlSlots` aufgedeckt wird, werden alle aktuellen Charakterkarten aus `characterSlots` auf den Ablagestapel gelegt und genau 2 neue nachgezogen
- Frontend-Darstellung des Symbols auf der Perlenkarte
- Spieler erhalten eine visuelle Rückmeldung wenn der Refresh ausgelöst wurde

**Non-Goals:**
- Keine Änderung an der `hasSwapSymbol`-Mechanik
- Kein Einfluss auf Charakterkarten in Spielerhand oder Portal (nur `characterSlots`)
- Keine Unterbrechung des laufenden Zuges — der Refresh passiert sofort/automatisch

## Decisions

**1. Neues Flag `hasRefreshSymbol` auf `PearlCard`**
- Analog zu `hasSwapSymbol` — einfach, konsistent mit bestehendem Muster
- Alternative: enum `symbolType` — würde weitere Symbole vereinfachen, aber Over-Engineering für jetzt

**2. Trigger im Move `takePearlCard` nach `refillSlots`**
- Nach dem Nachfüllen der Slots wird geprüft, ob eine der neu hinzugekommenen Karten `hasRefreshSymbol` hat
- Alternative: in `refillSlots()` selbst — aber diese Funktion ist ein reines Util-Helper ohne Zugriff auf den vollen `G`-State; der Move ist der richtige Ort
- Analog: `replacePearls`-Move muss ebenfalls nach dem Refill prüfen

**3. Refresh-Logik: alle `characterSlots` → Discard, dann 2 neue ziehen**
- "Zwei neue" entspricht der Spielregel; das Array hat danach 2 Karten statt normalerweise 4+
- Die übliche `refillSlots`-Logik würde auf volle Anzahl auffüllen — stattdessen: explizit 2 ziehen
- Zustand `isPearlRefreshTriggered: boolean` (ähnlich `isReshufflingPearlDeck`) für Frontend-Feedback

**4. Welche Moves müssen prüfen?**
- `takePearlCard`: nach `refillSlots` — neue Karten könnten das Symbol haben
- `replacePearls`: nach dem Neuauflegen — neue Slots könnten das Symbol haben
- Alle anderen Moves legen keine neuen Perlenkarten auf → keine Prüfung nötig

## Risks / Trade-offs

- [Gleichzeitig mehrere Refresh-Karten aufgedeckt] → Logik läuft sequenziell für jede, Effekte stapeln sich (jeder Refresh zieht 2 neue Karten) — akzeptabel, weil sehr selten
- [Charakterdeck leer während Refresh] → bestehende `drawCard`-Logik mit Discard-Reshuffle greift, kein neuer Edge Case
- [Frontend-Cache] → `isPearlRefreshTriggered` im GameState reicht für eine einmalige Benachrichtigung; wird am Zugende oder nach Anzeige zurückgesetzt

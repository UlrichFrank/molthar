## ADDED Requirements

### Requirement: PearlCard hat optionales Refresh-Symbol
`PearlCard` in `shared/src/game/types.ts` SHALL ein Boolean-Flag `hasRefreshSymbol: boolean` besitzen, das anzeigt, ob diese Karte beim Aufdecken einen Charakterkarten-Refresh auslöst.

#### Scenario: Flag ist auf markierten Karten gesetzt
- **WHEN** die Perlenkarte mit dem Refresh-Symbol in der Kartendatenbank (`createPearlDeck`) angelegt wird
- **THEN** hat diese Karte `hasRefreshSymbol: true`

#### Scenario: Alle anderen Karten haben das Flag auf false
- **WHEN** eine normale Perlenkarte ohne Symbol erstellt wird
- **THEN** hat diese Karte `hasRefreshSymbol: false`

---

### Requirement: Aufdecken einer Refresh-Karte löst Charakterkarten-Reset aus
Wenn eine Perlenkarte mit `hasRefreshSymbol: true` in `pearlSlots` aufgedeckt wird (nach `takePearlCard` oder `replacePearls`), SHALL das Spiel alle aktuellen Karten aus `characterSlots` auf den Ablagestapel legen und genau 2 neue Charakterkarten nachziehen.

#### Scenario: Refresh nach takePearlCard
- **WHEN** ein Spieler eine Perlenkarte nimmt und eine neue Karte mit `hasRefreshSymbol: true` in `pearlSlots` nachgefüllt wird
- **THEN** werden alle Karten aus `characterSlots` in `characterDiscardPile` verschoben
- **THEN** werden genau 2 neue Charakterkarten aus dem Deck in `characterSlots` gezogen
- **THEN** wird `isPearlRefreshTriggered` im GameState auf `true` gesetzt

#### Scenario: Refresh nach replacePearls
- **WHEN** ein Spieler Perlenkarten austauscht und eine neue Karte mit `hasRefreshSymbol: true` nachgefüllt wird
- **THEN** gelten dieselben Effekte wie bei takePearlCard

#### Scenario: Kein Refresh bei normalen Karten
- **WHEN** eine normale Perlenkarte (ohne `hasRefreshSymbol`) aufgedeckt wird
- **THEN** bleibt `characterSlots` unverändert

#### Scenario: Charakterdeck ist leer beim Refresh
- **WHEN** der Refresh ausgelöst wird und `characterDeck` leer ist
- **THEN** wird `characterDiscardPile` gemischt und als neues Deck verwendet, bevor 2 Karten gezogen werden

---

### Requirement: Spielzustand signalisiert ausgelösten Refresh
`GameState` SHALL ein Boolean-Flag `isPearlRefreshTriggered` besitzen, das am Ende jedes Zuges (`onEnd`) zurückgesetzt wird.

#### Scenario: Flag wird gesetzt
- **WHEN** ein Refresh ausgelöst wird
- **THEN** ist `isPearlRefreshTriggered === true` im aktuellen GameState

#### Scenario: Flag wird am Zugende zurückgesetzt
- **WHEN** der aktuelle Zug endet (`turn.onEnd`)
- **THEN** ist `isPearlRefreshTriggered === false`

---

### Requirement: Frontend zeigt das Refresh-Symbol auf der Perlenkarte an
Perlenkarten mit `hasRefreshSymbol: true` SHALL im Frontend visuell gekennzeichnet sein.

#### Scenario: Symbol sichtbar
- **WHEN** eine Perlenkarte mit `hasRefreshSymbol: true` in der Pearl-Slot-Anzeige gerendert wird
- **THEN** ist ein Symbol (Icon oder Badge) auf der Karte sichtbar, das den Refresh anzeigt

#### Scenario: Keine Kennzeichnung ohne Symbol
- **WHEN** eine normale Perlenkarte ohne `hasRefreshSymbol` gerendert wird
- **THEN** ist kein Refresh-Symbol sichtbar

---

### Requirement: Frontend informiert Spieler über ausgelösten Refresh
Wenn `isPearlRefreshTriggered === true` im GameState, SHALL das Frontend eine kurze Benachrichtigung oder visuelle Hervorhebung im Spiellog oder als Toast anzeigen.

#### Scenario: Benachrichtigung bei Refresh
- **WHEN** `isPearlRefreshTriggered` wechselt von `false` auf `true`
- **THEN** erscheint eine Meldung die anzeigt, dass Charakterkarten zurückgelegt und neue gezogen wurden

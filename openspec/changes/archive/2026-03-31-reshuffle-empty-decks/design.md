## Context

Das Spiel hat zwei Nachziehstapel: `pearlDeck` (56 Karten, Werte 1–8 je 7×) und `characterDeck`. Beide haben zugehörige Ablagestapel (`pearlDiscardPile`, `characterDiscardPile`). Die Funktion `refillSlots` führt das Mischen bereits intern durch, setzt aber kein Signal für das Frontend. In einzelnen Moves (`rehandCards`) gibt es ebenfalls inline-Reshuffle-Code — ebenfalls ohne Benachrichtigung.

Das Frontend zeigt Stapel als Canvas-Elemente. Aktuell gibt es keine Möglichkeit, transiente Spielereignisse (z.B. "ein Reshuffle hat stattgefunden") ans Frontend zu melden.

## Goals / Non-Goals

**Goals:**
- Beim Mischen des Perlen-Ablagestapels → Nachziehstapel wird ein Flag im Game-State gesetzt.
- Beim Mischen des Charakter-Ablagestapels → Nachziehstapel wird ein Flag im Game-State gesetzt.
- Das Frontend erkennt das Flag und zeigt eine kurze (1–2 Sek.) Animation.
- Nach der Animation wird das Flag via boardgame.io-Move zurückgesetzt, damit eine erneute Animation möglich ist.
- Alle Clients sehen die Animation synchron (via boardgame.io State Sync).

**Non-Goals:**
- Keine Änderung der Misch-Logik selbst (`shuffleArray` bleibt unverändert).
- Keine Unterbrechung des Spielflusses — das Mischen passiert automatisch.
- Keine persistente Animations-Historie.

## Decisions

### 1. Flag-Ansatz im Game-State statt Events

**Entscheidung:** Zwei boolesche Flags im Game-State: `isReshufflingPearlDeck: boolean` und `isReshufflingCharacterDeck: boolean`.

**Begründung:** boardgame.io synchronisiert den vollen Game-State an alle Clients. Events/Callbacks gibt es in boardgame.io nicht als Teil der State-Synchronization. Flags sind der idiomatische Weg, transiente Zustände zu signalisieren.

**Alternativen verworfen:**
- *Zähler (reshuffleCount)*: Würde funktionieren, aber semantisch weniger klar als ein explizites Flag.
- *Nur clientseitig animieren*: Frontend müsste selbst erkennen, wann `pearlDeck` von leer auf gefüllt springt — fragil und fehleranfällig bei Race Conditions.

### 2. Flag-Rücksetzung via separatem Move

**Entscheidung:** Ein `acknowledgeReshuffle(deckType)` Move setzt das Flag zurück. Dieser wird clientseitig nach Ende der Animation aufgerufen.

**Begründung:** Die Animation läuft auf jedem Client asynchron. Da boardgame.io Moves serialisiert, ist ein expliziter Acknowledge-Move der sauberste Weg, den State wieder sauber zu machen — ohne dass ein Client alleine bestimmt, wann es vorbei ist.

**Alternativen verworfen:**
- *Auto-clear beim nächsten Turn-Begin*: Würde das Flag erst löschen, wenn der nächste Spieler seinen Zug beginnt — die Animation könnte also dauerhaft sichtbar bleiben, wenn kein Zug folgt.
- *Timeout auf Server-Seite*: boardgame.io unterstützt keine serverseitigen Timer in Game-Logic.

### 3. Zentralisierung der Reshuffle-Logik

**Entscheidung:** Eine neue interne Hilfsfunktion `reshuffleIfEmpty(deck, discardPile, onReshuffle)` kapselt das Mischen und den Callback. `refillSlots` und alle Inline-Reshuffle-Stellen werden darauf umgestellt.

**Begründung:** Aktuell gibt es 3 Stellen mit Reshuffle-Logik. Eine Zentralisierung verhindert, dass künftig eine Stelle vergessen wird, das Flag zu setzen.

### 4. Animation im Frontend

**Entscheidung:** Eine neue React-Komponente (oder Canvas-Overlay) `DeckReshuffleAnimation` zeigt für 1.5 Sekunden eine visuelle Darstellung (z.B. Karten, die vom Ablagestapel zum Deck fliegen, oder ein Shuffle-Icon mit Pulsieren). Nach Ablauf wird `acknowledgeReshuffle` aufgerufen.

**Begründung:** Eine eigenständige Komponente ist testbar und wiederverwendbar für beide Deck-Typen.

## Risks / Trade-offs

- **Race Condition bei mehreren Clients:** Jeder Client ruft `acknowledgeReshuffle` nach seiner Animation auf. Da boardgame.io idempotente Moves nicht explizit unterstützt, könnte der Move mehrfach ankommen. → Mitigation: Der Move prüft, ob das Flag überhaupt gesetzt ist, bevor er es löscht (no-op sonst).
- **Animation-Dauer nicht synchron:** Clients mit langsameren Verbindungen starten die Animation später. → Akzeptabel — die Animation ist rein informativ und blockiert den Spielfluss nicht.
- **Reshuffle während der Animationsphase:** Theoretisch könnte ein zweites Reshuffle stattfinden, bevor das erste acknowledged wurde. → Mitigation: Flag bleibt gesetzt; Animation wird erneut getriggert (durch State-Change-Detection im Frontend).

## Migration Plan

1. Shared-Package: Types erweitern, Hilfsfunktion einführen, `refillSlots` und Inline-Code migrieren.
2. Shared-Package Tests aktualisieren (neues Flag in erwarteten States).
3. Frontend: `DeckReshuffleAnimation`-Komponente implementieren, in Board integrieren.
4. Kein Datenbankschema-Änderungen, kein Deployment-Sonderweg nötig.

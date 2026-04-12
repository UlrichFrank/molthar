## Context

**Bestehende Endrundenlogik:**
- `G.finalRound = true` wird gesetzt, sobald ein Spieler ≥ 12 Punkte erreicht
- `G.finalRoundStartingPlayer` speichert, wer die Endrunde ausgelöst hat
- `endIf` gibt aktuell `{ winner: { [playerID: string]: boolean } }` zurück — ohne Diamanten-Tiebreaker
- Bei Spielende erhält das Board `ctx.gameover` mit diesem Wert; es gibt noch keine UI dafür
- `handleLeaveGame()` in `LobbyScreen` setzt `view → 'lobby'` — die Rückkehr-Logik existiert bereits

**boardgame.io-Verhalten:**
- `ctx.gameover` wird gesetzt, sobald `endIf` einen Wert zurückgibt (nicht `undefined`)
- Das Board bleibt sichtbar und empfängt weiterhin Props — boardgame.io rendert das Board auch im Gameover-State
- Custom Props, die an `PortaleClient` übergeben werden, werden an das Board weitergeleitet

## Goals / Non-Goals

**Goals:**
- Eindeutiger Gewinner: Diamanten als Tiebreaker bei Punktgleichstand
- Abschluss-Dialog mit vollständigem Ranking (alle Spieler, sortiert)
- Automatische Rückkehr zur Lobby nach Countdown

**Non-Goals:**
- Kein Rematch-Feature
- Keine persistente Highscore-Speicherung
- Kein Ändern der Endrundenauslöse-Logik (≥12 Punkte bleibt korrekt)

## Decisions

### 1. Neues Gameover-Format: `ranking`-Array

**Entscheidung:** `endIf` gibt `{ ranking: Array<{ playerId: string; powerPoints: number; diamonds: number }> }` zurück. Das Array ist absteigend nach `powerPoints` sortiert, bei Gleichstand nach `diamonds`. `ranking[0]` ist der Gewinner (oder einer von mehreren bei echtem Unentschieden).

**Begründung:** Das Frontend bekommt direkt ein sortiertes Ranking ohne eigene Berechnungslogik. Der Tiebreaker ist klar im Datensatz kodiert (verglichene Werte direkt vergleichbar). Echtes Unentschieden (gleiche Punkte UND gleiche Diamanten) ist explizit erkennbar: `ranking[0].powerPoints === ranking[1].powerPoints && ranking[0].diamonds === ranking[1].diamonds`.

**Alternativen verworfen:**
- *`{ winner: { [id]: bool } }` behalten + Tiebreaker im Frontend*: Split zwischen Backend- und Frontend-Validierungslogik — Backend muss kanonisch sein
- *Separates `winners`-Feld für echtes Unentschieden*: Unnötige Komplexität; das Ranking-Array ist selbsterklärend

### 2. Spielernamen im Ranking

**Entscheidung:** `endIf` liest `G.players[pId].name` — der Name ist im `PlayerState` gespeichert und direkt verfügbar. Das `ranking`-Array enthält auch `name: string`.

**Begründung:** Der Dialog zeigt Namen an. `G.players` ist in `endIf` zugänglich.

### 3. `onLeaveGame`-Prop an `CanvasGameBoard`

**Entscheidung:** `CanvasGameBoardProps` erhält ein optionales `onLeaveGame?: () => void`. In `LobbyScreen` wird `onLeaveGame={handleLeaveGame}` an `PortaleClient` übergeben (boardgame.io leitet Custom-Props durch). Der Dialog ruft diesen Callback auf wenn der Countdown abgelaufen ist oder der Spieler manuell zurückgeht.

**Alternativen verworfen:**
- *Globaler Zustand (Zustand-Store)*: Overkill für einen einzigen Callback; unnötige Kopplung

### 4. Countdown-Timer im Dialog: 30 Sekunden

**Entscheidung:** Der Dialog zeigt einen Countdown von 30 Sekunden. Nach Ablauf wird `onLeaveGame()` automatisch aufgerufen. Ein "Zurück zur Lobby"-Button erlaubt vorzeitiges Beenden.

**Begründung:** 30 Sekunden sind lang genug, um das Ranking zu lesen; kurz genug, um nicht ewig zu warten. Der Dialog kann nicht geschlossen werden (kein Cancel) — das Spiel ist beendet.

### 5. `ctx.gameover` erkennen im Board

**Entscheidung:** In `CanvasGameBoardContent` wird `(ctx as any).gameover` geprüft. Wenn gesetzt, wird `GameResultsDialog` gerendert (anstelle oder über dem normalen Board).

**Begründung:** `ctx` ist als `{ phase?: string } & Record<string, unknown>` typisiert — Zugriff via Cast ist sicher und explizit.

## Risks / Trade-offs

- **`endIf` liest `G.players`**: boardgame.io garantiert, dass `G` im `endIf`-Callback aktuell ist. Kein Risiko.
- **Namensänderung des Gameover-Formats**: Falls andere Code-Stellen das alte `{ winner: {...} }`-Format erwarten (z.B. Tests), müssen diese angepasst werden. → Mitigation: Vor Implementierung `grep` auf `gameover`/`winner`-Nutzung im Frontend und Tests.
- **boardgame.io Custom-Props-Durchleitung**: Custom Props an `PortaleClient` (den generierten boardgame.io-Client) werden gemäß boardgame.io-Docs an das Board weitergeleitet. → Mitigation: Nach Implementierung manuell verifizieren (Task 6.1).

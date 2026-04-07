## Context

boardgame.io verwendet aktuell In-Memory-Speicher (Standard). Spielzustände gehen verloren, sobald der Server neu gestartet oder der Browser geschlossen wird. Die Lobby zeigt nur Spiele mit freien Plätzen an und kennt kein Konzept zum Wiedereinsteigen. Credentials (benötigt zum Re-Join) werden nur im React-Komponentenzustand gehalten und sind nach einem Seitenneuladen verloren.

**Aktuelle Architektur:**
- `backend/src/server-bgio.ts` — boardgame.io `Server()` ohne StorageAPI → In-Memory
- `game-web/src/lobby/LobbyScreen.tsx` — matchID + credentials nur im State, kein LocalStorage
- Lobby-Filter: zeigt nur Matches mit freien Plätzen (`p.name === undefined`)

## Goals / Non-Goals

**Goals:**
- Spielzustände überleben Server-Neustarts (persistente Storage-Schicht)
- Spieler können eine laufende Partie wiederbetreten wenn ihre Credentials im Browser gespeichert sind
- Ersteller (playerID `"0"`) kann ein Spiel aktiv beenden → Spielzustand wird gelöscht
- Lobby zeigt "Wiedereinsteigen"-Option für Matches, bei denen der Nutzer bereits Teilnehmer ist

**Non-Goals:**
- Account-System oder serverseiteige Nutzer-Authentifizierung
- Persistenz über mehrere Geräte hinweg (kein Sync via Cloud)
- Automatisches Aufräumen verlassener Spiele (Spiele bleiben bis zur expliziten Beendigung)

## Decisions

### 1. Storage-Adapter: Flatfile (boardgame.io/storage)

boardgame.io bietet mehrere Adapter: `FlatFile` (JSON-Dateien auf Disk), `PostgreSQL`, `MongoDB`.

**Wahl: `FlatFile`** für diese Phase.

- Keine zusätzliche Datenbank-Infrastruktur nötig
- Ausreichend für die erwartete Nutzerzahl (kleines Freundeskreis-Spiel)
- Einfacher Rollback: Dateien löschen genügt
- Upgrade-Pfad zu PostgreSQL bleibt offen (gleiche StorageAPI-Schnittstelle)

```ts
import { FlatFile } from 'boardgame.io/storage';
const server = Server({
  games: [PortaleVonMolthar],
  db: new FlatFile({ dir: './data' }),
});
```

Alternativen: PostgreSQL wäre produktionsreifer aber unnötig komplex für diesen Use-Case.

### 2. Credentials im Browser (LocalStorage)

boardgame.io vergibt beim Join einmalig `playerCredentials`. Um wieder beizutreten, braucht der Spieler diese Credentials.

**Wahl:** Credentials + matchID + playerID werden im `localStorage` gespeichert (Key: `pvm_session`).

- Einfach, kein Backend-Aufwand
- Automatisches Wiedereinsteigen beim Öffnen der App wenn ein aktives Spiel gefunden wird
- Sicherheitsüberlegung: Credentials sind kein Passwort-Ersatz, sondern nur anti-spoofing; LocalStorage ist für diesen Kontext ausreichend

### 3. Game-Termination durch Ersteller

boardgame.io kennt kein "Ersteller"-Konzept. Spielende wird über eine neue **Game-Endphase** oder einen dedizierten **Move** ausgelöst.

**Wahl:** Neuer Move `terminateGame` in `shared/src/game/index.ts`, nur für playerID `"0"` erlaubt.

```ts
terminateGame: (G, ctx) => {
  if (ctx.currentPlayer !== '0' && ctx.playerID !== '0') return INVALID_MOVE;
  ctx.events.endGame({ reason: 'terminated' });
}
```

Nach `endGame()` setzt boardgame.io den Match-Status auf `gameover`. Der Server-Event-Handler löscht das Match anschließend via `StorageAPI.wipeout()`.

Alternative: Eigener REST-Endpoint `DELETE /games/:name/:matchID` — komplexer, da Authentifizierung separat geprüft werden müsste.

### 4. Lobby: Laufende Spiele anzeigen

Die LobbyScreen-Komponente filtert aktuell Spiele mit freien Plätzen. Zusätzlich wird eine zweite Liste "Meine laufenden Spiele" eingeblendet, die alle Matches zeigt, bei denen `localStorage`-Session auf eine Teilnahme hinweist.

boardgame.io `listMatches` liefert auch laufende Matches. Die Filterlogik:
- **Offene Spiele:** Matches mit freiem Slot (`p.name === undefined`)
- **Meine Spiele:** Matches deren `matchID` in der lokalen Session gespeichert ist

## Risks / Trade-offs

| Risiko | Mitigation |
|--------|-----------|
| FlatFile bei gleichzeitigen Schreibzugriffen nicht transaktionssicher | Akzeptabel für kleine Nutzerzahl; bei Skalierung → PostgreSQL |
| localStorage kann vom Nutzer gelöscht werden → Rejoin nicht mehr möglich | UI-Hinweis "Verlauf nicht löschen wenn Spiel aktiv"; kein serverseitiger Fix ohne Auth |
| `terminateGame`-Move prüft nur playerID, nicht Credentials | boardgame.io validiert Credentials serverseitig bereits vor Move-Ausführung |
| Alte/vergessene Spiele akkumulieren sich auf Disk | Spätere Aufräum-Logik (z.B. nach 7 Tagen Inaktivität) als Follow-up |

## Migration Plan

1. `./data/`-Verzeichnis auf dem Server anlegen (gitignore eintragen)
2. Backend neu deployen mit FlatFile-Storage
3. Laufende In-Memory-Spiele gehen bei diesem Deployment verloren (kommunizieren)
4. Rollback: `FlatFile` entfernen → Server fällt zurück auf In-Memory

## Open Questions

- Soll der "Spiel beenden"-Button nur zwischen den Zügen erscheinen oder jederzeit? → Empfehlung: jederzeit, da Ersteller die Autorität hat
- Soll nach `terminateGame` eine Zusammenfassung (Punkte) angezeigt werden, oder direkt zurück zur Lobby?

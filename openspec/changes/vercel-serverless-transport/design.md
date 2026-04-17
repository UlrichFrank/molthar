## Context

Das Spiel nutzt boardgame.io als Framework für Spiellogik + Transport. boardgame.io's Server-Komponente benötigt Socket.IO — eine persistente TCP-Verbindung — und ist damit inkompatibel mit Vercel's stateless Serverless Functions.

**Aktueller Stand:**
- `backend/src/server-bgio.ts` startet einen boardgame.io-Server mit Socket.IO + FlatFile-Persistenz
- `game-web/src/lobby/useLobbyClient.ts` exportiert `LobbyClient` (HTTP) und `PortaleClient` (boardgame.io `Client()` mit `SocketIO`-Multiplayer)
- `LobbyScreen.tsx` und `WaitingRoom.tsx` importieren direkt aus `useLobbyClient.ts`
- `CanvasGameBoard.tsx` ist vollständig entkoppelt — empfängt `G`, `ctx`, `moves` als Props

**Schlüsseleinsicht:** Die Grenze zwischen Transport und Spiellogik ist bereits sauber. `CanvasGameBoard` weiß nichts vom Transport. Nur zwei Dateien (`LobbyScreen`, `WaitingRoom`) und ein Export-Modul (`useLobbyClient`) müssen abstrahiert werden.

## Goals / Non-Goals

**Goals:**
- Vercel-Deployment ohne externen Server via `VITE_TRANSPORT=vercel`
- Socket.IO-Modus (`VITE_TRANSPORT=socket`) funktioniert unverändert weiter
- `shared/`, `CanvasGameBoard` und alle Dialog-Komponenten bleiben unberührt
- Kein Code wird dupliziert; gemeinsame Typen in `transport/types.ts`
- Vercel Hobby Plan ausreichend (kein kostenpflichtiger Plan erforderlich)

**Non-Goals:**
- Echtzeit-WebSocket für Vercel-Modus (500 ms Polling ist ausreichend für ein Kartenspiel)
- Migration bestehender FlatFile-Daten nach Vercel KV
- Unterstützung weiterer Transporte (z.B. Firebase, Supabase)
- Änderungen an Spiellogik, Karten oder Regeln

## Decisions

### 1. Vite-Alias als Selektionsmechanismus

**Entscheidung:** `vite.config.ts` liest `process.env.VITE_TRANSPORT` und setzt einen Alias `@transport → src/transport/<mode>/`.

**Alternativen:**
- *Conditional imports zur Laufzeit*: Benötigt dynamische `import()`, verhindert Tree-Shaking, bundelt beide Transporte
- *Separate Vite-Configs*: Umständlich, Duplizierung der Config
- *Two separate packages*: Zu viel Overhead für diesen Umfang

**Warum Alias:** Statische Analyse, perfektes Tree-Shaking (Socket.IO-Code nie im Vercel-Bundle), keine Runtime-Kosten.

### 2. `createGameReducer` aus `boardgame.io/internal`

**Entscheidung:** Die Vercel API Route `move.ts` verwendet `createGameReducer` aus `boardgame.io/internal`, um Moves serverseitig anzuwenden.

**Alternativen:**
- *Moves als pure functions extrahieren*: Hoher Aufwand, Risiko der Divergenz zwischen zwei Implementierungen
- *Eigener State-Reducer*: Reimplementierung der boardgame.io-Semantik (Phasen, Züge, `INVALID_MOVE`) — sehr fehleranfällig

**Warum internal:** Das Projekt ist auf boardgame.io 0.50.2 gepinnt. `createGameReducer` ist in dieser Version stabil und dokumentiert (intern). Beim nächsten Major-Upgrade müsste dies überprüft werden.

### 3. Vercel KV für State-Persistenz

**Entscheidung:** `@vercel/kv` (Upstash Redis) als Key-Value Store für Match-State und Metadaten.

**Alternativen:**
- *Vercel Blob*: Für binäre Objekte, nicht für häufige Lese-/Schreiboperationen optimiert
- *Vercel Postgres*: Overkill für JSON-State, höhere Latenz, komplexeres Schema
- *Ephemeres Filesystem*: Geht bei Redeployment verloren, kein Fan-Out zwischen Function-Instanzen möglich

**Warum KV:** Atomic reads/writes, niedrige Latenz, Vercel-native Integration, Hobby-Plan ausreichend (256 MB, 30 K req/Tag).

### 4. 500 ms Polling statt WebSockets

**Entscheidung:** Der Vercel-Spielclient pollt `GET /api/matches/[id]` alle 500 ms.

**Alternativen:**
- *Server-Sent Events (SSE)*: Würde auf Vercel Hobby laufen, aber KV bietet kein natives Pub/Sub ohne Drittanbieter; SSE-Verbindungen sind auf 10s (Hobby) limitiert
- *Pusher/Ably*: Echte WebSockets, aber zusätzliche Plattformabhängigkeit und Kosten

**Warum Polling:** Ein Kartenspiel hat niedrige Move-Frequenz. 500 ms Lag ist für Spieler nicht wahrnehmbar. Keine zusätzliche Infrastruktur nötig. Einfach zu debuggen.

### 5. API Routes in `game-web/api/`

**Entscheidung:** Serverless Functions in `game-web/api/` mit Vercel Root Directory = `game-web`.

**Alternativen:**
- *`api/` im Repo-Root*: Würde Vercel Root Directory auf Repo-Root setzen; kompliziert den Monorepo-Build (shared → backend/frontend separation geht verloren)

**Warum `game-web/api/`:** Alles in einem Vercel-Projekt, klare Separation, Build-Reihenfolge (shared first) einfach konfigurierbar in `game-web/vercel.json`.

## Risks / Trade-offs

| Risiko | Mitigation |
|--------|------------|
| `boardgame.io/internal` Export bricht bei Upgrade | Projekt ist auf 0.50.2 gepinnt; bei Upgrade testen |
| Vercel KV Latenz erhöht Move-Roundtrip auf >500 ms | KV-Reads typisch <10 ms; unkritisch |
| 500 ms Polling erzeugt 120 req/min pro Spieler | Bei 2 Spielern: 240 req/min; Hobby-Limit 30K/Tag → ~2h Spielzeit täglich problemlos |
| Vercel KV Daten gehen bei Account-Deletion verloren | Kein Backup-Modus geplant — akzeptiert für Hobby-Deployment |
| Socket-Modus und Vercel-Modus können Verhalten divergieren | Gemeinsamer `createGameReducer` verhindert Logik-Divergenz; nur Transport-Code ist unterschiedlich |

## Migration Plan

1. Feature-Branch `vercel-serverless-transport` anlegen
2. Transport-Abstraction einführen (socket-Modus zuerst, als Refactoring ohne Verhaltensänderung)
3. Tests für socket-Modus grün halten
4. Vercel-Transport + API Routes implementieren
5. `vercel dev` lokal testen (benötigt Vercel KV dev credentials)
6. Vercel-Projekt anlegen: Root Directory = `game-web`, Env `VITE_TRANSPORT=vercel`, KV-Datenbank verknüpfen
7. Deployment testen, dann PR mergen

**Rollback:** `VITE_TRANSPORT=socket` oder Revert des PRs; das Backend läuft weiterhin unverändert.

## Open Questions

- Soll `vercel dev` in die `Makefile` aufgenommen werden (`make dev-vercel`)?
- Credentials-Validierung in API Routes: Reicht ein einfacher String-Vergleich (wie boardgame.io), oder soll gehasht werden?
- Soll der `backend/`-Ordner nach erfolgreichem Vercel-Deployment entfernt werden, oder bleibt er als optionaler Socket-Modus erhalten?

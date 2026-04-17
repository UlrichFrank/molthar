## Why

Das Spiel läuft aktuell nur mit einem persistenten Node.js-Backend (boardgame.io + Socket.IO), das nicht auf Vercel deploybar ist. Um das Spiel ohne eigene Serverinfrastruktur betreiben zu können, wird ein austauschbarer Transport-Layer eingeführt, der zur Build-Zeit zwischen Socket.IO (bisheriges Backend) und einem serverless REST+Polling-Modus (Vercel) wählt.

## What Changes

- **Neuer Transport-Abstraktions-Layer** in `game-web/src/transport/`: gemeinsames Interface + zwei Implementierungen (`socket/`, `vercel/`)
- **Vite-Alias `@transport`** in `vite.config.ts`: wählt zur Build-Zeit per `VITE_TRANSPORT=socket|vercel` die korrekte Implementierung; nur der gewählte Transport landet im Bundle
- **Verschiebung** von `game-web/src/lobby/useLobbyClient.ts` nach `game-web/src/transport/socket/index.ts` (kein inhaltlicher Umbau)
- **Neuer Vercel-Transport** (`transport/vercel/index.ts`): Lobby via `fetch()`, Spielclient als polling Hook (500 ms, pollt `/api/matches/[id]`)
- **Neue Vercel API Routes** (`game-web/api/`): 6 serverlose Funktionen übernehmen Lobby-Management und Move-Execution; verwenden `createGameReducer` aus `boardgame.io/internal` und `@vercel/kv` für State-Persistenz
- **`game-web/vercel.json`**: Vercel-Config mit Build-Reihenfolge (`shared` → `game-web`) und `VITE_TRANSPORT=vercel`
- `LobbyScreen.tsx` und `WaitingRoom.tsx`: Import-Pfad von `./useLobbyClient` → `@transport`

## Capabilities

### New Capabilities

- `vercel-transport`: Serverloser Spieltransport via REST-Polling — Lobby-API und Move-Execution ohne Socket.IO, deploybar auf Vercel Hobby
- `transport-abstraction`: Build-Zeit-Auswahl des Transports via `VITE_TRANSPORT`; definiert das gemeinsame Interface für Lobby und Spielclient

### Modified Capabilities

*(keine bestehenden Spec-Anforderungen ändern sich — CanvasGameBoard-Interface, Spiellogik und alle Dialog-Komponenten bleiben unverändert)*

## Impact

- **`game-web/src/lobby/useLobbyClient.ts`** — wird verschoben, nicht geändert
- **`game-web/src/lobby/LobbyScreen.tsx`**, **`WaitingRoom.tsx`** — je 1 Zeile Import-Pfad
- **`game-web/vite.config.ts`** — + alias-Block (~5 Zeilen)
- **`game-web/package.json`** — neue dev-Dependency `@vercel/kv`
- **`shared/`** — keine Änderungen
- **`backend/`** — keine Änderungen; Socket-Modus (`make dev`) funktioniert unverändert weiter
- Neue Dependency in den API Routes: `boardgame.io/internal` (interner Export, stabil auf 0.50.2)
- Vercel KV (Upstash Redis) — Hobby Plan: 256 MB, 30 K requests/Tag

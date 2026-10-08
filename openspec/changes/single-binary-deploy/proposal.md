# Proposal

## Why

Molthar läuft auf dem vServer als zwei Docker-Container (Node-Backend, nginx-Frontend), deren Images über ghcr.io verteilt werden. Image-Builds per QEMU, Registry-Login, Build-Cache und `docker system prune` kosten Zeit und Platz auf einem vServer mit 850 MB RAM und 3,4 GB freier Platte. Ausgebremst ist bereits erfolgreich auf ein einzelnes Bun-Binary unter systemd umgestellt (Ausgebremst-PR #41); Molthar soll denselben, einfacheren Weg gehen: ein Artefakt, per `scp` übertragen, per systemd betrieben, per Dateitausch zurückrollbar.

## What Changes

- Backend und Frontend werden mit `bun build --compile` zu **einem** Linux-Binary (`molthar`) gebaut. Der Vite-Build wird eingebettet und vom Binary selbst ausgeliefert (gleicher Origin für Spielseite, Lobby-API und Socket.IO).
- Eingebettet werden nur die Dateien, die das Spiel tatsächlich lädt: Vite-Bundle, Kartenbilder und `cards.json`. Rohdaten (`assets/raw/`, `*.af`, `Anleitung.jpg`, Markdown/Text) gehören nicht ins Binary.
- `cards.json` wird für die Spiellogik im Binary statisch eingebettet, statt zur Laufzeit per `fs` neben dem Arbeitsverzeichnis gesucht zu werden.
- Der Server läuft im Binary unter Bun. Der WebSocket-Fix für engine.io 4 unter Bun wird aus Ausgebremst übernommen (Patch auf `ws`), damit Browser und NPC-Bots per WebSocket statt Long-Polling verbunden sind.
- `HOST` wird tatsächlich als Bind-Adresse verwendet (heute nur im Log). Der NPC-BotRunner verbindet sich mit derselben Adresse, auf der der Server lauscht.
- Spielstände (`MATCHES_DIR`, bisher fest `./data`) und NPC-Zugangsdaten (`NPC_DATA_DIR`) liegen außerhalb des Binaries und sind per Umgebungsvariable konfigurierbar.
- Das Frontend verbindet sich standardmäßig mit dem eigenen Origin; `VITE_SERVER_URL` bleibt als Override für die Entwicklung (Vite 5173 → Backend 3001).
- Betrieb auf dem vServer als **systemd-Dienst** (eigener Systembenutzer, `Restart=always`, Daten unter `/var/lib/molthar`, Logs im journald), gebunden an `172.18.0.1:3002` (3001 belegt Ausgebremst).
- **Traefik und das Wildcard-Zertifikat `*.apps.diefranks.eu` bleiben unverändert.** Das Repo zieht den auf dem Server bereits aktiven File-Provider (`providers.file`, Mount `./dynamic`) in `deploy/traefik/` nach. Eine Routing-Datei leitet `molthar.apps.diefranks.eu` und übergangsweise `molthar-api.apps.diefranks.eu` auf das Binary.
- `make deploy` baut, überträgt und startet neu; `make deploy-rollback` schaltet auf das vorherige Binary zurück; dazu `deploy-status`, `deploy-logs`.
- Bestehende Spielstände (`~/deploy/molthar/data`) **und** NPC-Zugangsdaten (`~/deploy/molthar/data-npc`) werden übernommen.
- **BREAKING** (Betrieb): Der Docker-Deploy von Molthar entfällt — `Dockerfile`, `Dockerfile.frontend`, `docker-compose.yml`, `deploy/molthar/docker-compose.yml`, die `docker-*`-Targets und die ghcr.io-Images `molthar-backend`/`molthar-frontend` werden entfernt; die Container auf dem vServer werden gestoppt. Der Traefik-Stack selbst bleibt ein Docker-Stack.

## Capabilities

### New Capabilities
- `single-binary-deploy`: Bau des eingebetteten Single Binary, Auslieferung der Spielseite durch den Server, Konfiguration und Spielstände außerhalb des Binaries, NPC-Betrieb im Binary, Betrieb per systemd hinter Traefik (File-Provider), Deploy und Rollback.

### Modified Capabilities
<!-- keine: Persistenz-Anforderungen (game-persistence) bleiben inhaltlich gleich, nur der Speicherort wird konfigurierbar -->

## Impact

- **Code**: `backend/src/server-bgio.ts` (Bind-Adresse, statische Auslieferung, WS-Patch, Shutdown), `backend/src/matchStore.ts`-Aufruf (`MATCHES_DIR`), `backend/src/bot-runner.ts` (Server-URL, `NPC_DATA_DIR`), `shared/src/game/cardDatabaseLoader.js` (eingebettete Karten), `game-web/src/lobby/useLobbyClient.ts` (eigener Origin), neue Dateien `backend/src/wsTextFrames.ts`, `backend/src/staticFiles.ts`, `backend/src/embedded/*`, `backend/scripts/gen-assets.ts`.
- **Build/Tooling**: Makefile (`binary`, `binary-local`, `deploy`, `deploy-rollback`, `deploy-status`, `deploy-logs`; Docker-Targets entfallen), Bun (≥ 1.3) als Build-Werkzeug; Entwicklung (`make dev`) läuft weiter mit Node.
- **Server (vServer)**: systemd-Unit `molthar.service`, Systembenutzer `molthar`, `/opt/molthar`, `/var/lib/molthar/{data,data-npc}`, Routing-Datei `~/deploy/traefik/dynamic/molthar.yml`; Abbau von `molthar-backend-1`/`molthar-frontend-1`. Kein Traefik-Neustart nötig (Provider ist bereits aktiv, `watch: true`).
- **Abhängigkeiten**: keine neuen Laufzeit-Abhängigkeiten; `node-persist` (FlatFile) muss im Binary enthalten sein.
- **Nutzer**: Spielseite und API unter `molthar.apps.diefranks.eu`; laufende Partien inkl. NPC-Partien bleiben erhalten.

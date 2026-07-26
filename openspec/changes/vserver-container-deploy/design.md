## Context

Aktuelles Setup:
- `Dockerfile` (backend, Node 20, bgio-Server auf Port 3001)
- `Dockerfile.frontend` (multi-stage: Vite-Build → nginx auf Port 80)
- `docker-compose.yml` — lokal builden & laufen
- `docker-compose.prod.yml` — pullt `ghcr.io/ulrichfrank/molthar-{backend,frontend}:latest` und published direkt auf `:80`/`:3001`
- Makefile-Targets `docker-build`, `docker-push`, `docker-run`, `docker-run-prod` — arbeiten alle gegen den lokalen Docker-Daemon
- SSH-Alias `vServer` → `root@217.160.118.39` (Netcup)

Der Sprung ist: gleiche Images, aber auf einem entfernten Host betrieben, mit Traefik davor für TLS und Host-Routing.

## Goals / Non-Goals

**Goals:**
- `make deploy` baut, pusht, deployt in einem Kommando
- HTTPS mit gültigem Zertifikat, ohne bei jeder neuen App die Cert-Config anfassen zu müssen
- Rollback möglich (Git-SHA-Tag zusätzlich zu `latest`)
- Lokaler Docker-Workflow bleibt vollständig erhalten
- Deploy-Setup soll für weitere Apps unter `*.apps.<domain>` wiederverwendbar sein
- Makefile-Struktur ist CI-tauglich (Env-Vars statt interaktiver Prompts)

**Non-Goals:**
- Kein Zero-Downtime-Deploy (Downtime beim `up -d` ist akzeptabel)
- Kein Persistenz-Adapter für bgio in dieser Change (Volume vorbereitet, aber Storage-Code separat)
- Keine GitHub-Actions-Pipeline in dieser Change
- Keine Container-Registry-Alternative (ghcr.io steht bereits, wird beibehalten)

## Architektur

```
                                LOKAL (Mac ARM)
   ┌─────────────────────────────────────────────────────────────┐
   │  make deploy                                                │
   │     │                                                       │
   │     ├─ pnpm install (falls nötig)                           │
   │     ├─ docker buildx build --platform linux/amd64           │
   │     │     ├─ backend  → ghcr.io/…/molthar-backend           │
   │     │     └─ frontend → ghcr.io/…/molthar-frontend          │
   │     │        (mit VITE_SERVER_URL=https://molthar-api.…)    │
   │     ├─ docker push  (Tags: latest + git-<sha>)              │
   │     └─ ssh vServer 'cd ~/deploy/molthar &&                  │
   │                     docker compose pull &&                  │
   │                     docker compose up -d'                   │
   └─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          NETCUP vServer (217.160.118.39)
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │  ~/deploy/traefik/                                          │
   │    ├─ docker-compose.yml     (traefik container)            │
   │    ├─ traefik.yml            (static config, ACME)          │
   │    ├─ .env                   (netcup api key, domain)       │
   │    └─ acme.json              (0600, LE cert storage)        │
   │                                                             │
   │  ~/deploy/molthar/                                          │
   │    ├─ docker-compose.yml     (backend + frontend)           │
   │    └─ .env                   (image tag, extra origins)     │
   │                                                             │
   │  docker network "web" (external, verbindet alles)           │
   │                                                             │
   │  Ports offen: 80, 443, 22                                   │
   └─────────────────────────────────────────────────────────────┘

           Runtime auf dem vServer:

   Internet ──80──▶ Traefik ──80/HTTP──▶ frontend (nginx)
   Internet ──443─▶ Traefik ──80/HTTP──▶ frontend (nginx)   Host: molthar.apps.…
                        │
                        └───────80/HTTP──▶ backend (node)   Host: molthar-api.apps.…
```

## Decisions

### D1: Zwei Subdomains statt Path-Routing

`molthar.apps.<domain>` (Frontend) + `molthar-api.apps.<domain>` (Backend).

**Warum:** bgio nutzt socket.io mit eigenem Namespace. Path-Routing (`/socket.io` → Backend) funktioniert, aber (a) muss Traefik `PathPrefix` mit dem im bgio-Client konfigurierten Path exakt matchen, (b) verschmiert die Grenze zwischen zwei Diensten, (c) macht das Backend nicht direkt erreichbar (z.B. für Healthchecks).

**Kosten:** CORS-Konfiguration am Backend nötig (`EXTRA_ORIGINS=https://molthar.apps.<domain>`).

### D2: Wildcard-Zertifikat via Netcup DNS-01

Ein Cert `*.apps.<domain>` deckt alle künftigen App-Subdomains ab. Erneuerung per Netcup CCP API.

**Warum:** Bei HTTP-01 pro Host müsste jede neue App warten, bis Traefik eine Challenge auslöst — und jede App muss auf `:80` erreichbar sein. Mit Wildcard: DNS-Record anlegen, Traefik-Labels dranhängen, fertig.

**Kosten:**
- Netcup CCP API-Zugang aktivieren (einmalig)
- Env-Vars in Traefik-Container: `NETCUP_CUSTOMER_NUMBER`, `NETCUP_API_KEY`, `NETCUP_API_PASSWORD`
- ACME-Konfig muss `dnsChallenge.provider: netcup` mit `delayBeforeCheck` setzen (Netcup ist bei DNS-Propagation langsam, ~120s empfohlen)

### D3: ghcr.io als Registry, `make deploy` pusht + triggert

Bestehender Registry-Setup wird beibehalten. Kein `docker save | ssh docker load`, kein Build auf dem vServer.

**Warum:** Registry existiert schon, Push ist schnell, Server-CPU bleibt frei, Rollback via Tag ist einfach.

**Kosten:** vServer braucht `docker login ghcr.io` (einmalig, mit PAT `read:packages`).

### D4: Doppel-Tagging (`latest` + `git-<sha>`)

Jeder `make deploy` pusht beide Tags. `docker-compose.yml` auf vServer nutzt `${IMAGE_TAG:-latest}`. Rollback: `IMAGE_TAG=git-<sha> docker compose pull && up -d`.

**Warum:** `latest` ist bequem für den Normalfall, `git-<sha>` erlaubt reproduzierbares Rollback und ist CI-freundlich (dort setzt der Workflow den Tag).

**Kosten:** minimal — zwei `docker push`-Calls, doppelter Registry-Storage (vernachlässigbar).

### D5: `VITE_SERVER_URL` bleibt Build-Zeit-Konfiguration

Pro Umgebung (lokal / vServer) wird ein eigenes Frontend-Image gebaut. Prod-Image trägt `https://molthar-api.apps.<domain>` fest eingebrannt.

**Warum:** Runtime-Config (`/config.json`, das nginx erzeugt) wäre umgebungsagnostisch, aber ein größerer Umbau. Für Start reicht Build-Zeit. Wenn später staging + prod parallel gebraucht werden, wird umgestellt.

**Kosten:** Prod-Image ist nicht 1:1 lokal ausführbar (falsche Backend-URL). Lokal wird über `make docker-build-frontend` mit lokalem `SERVER_URL` gebaut → beide Welten getrennt.

### D6: Zwei Compose-Stacks (Traefik separat von App)

`deploy/traefik/docker-compose.yml` und `deploy/molthar/docker-compose.yml` sind getrennt. Verbunden über externes Docker-Netzwerk `web`.

**Warum:** Traefik-Restart soll App nicht neustarten (und umgekehrt). Neue Apps hängen sich an dasselbe `web`-Netzwerk und dieselbe Traefik-Instanz. Standard-Pattern.

**Kosten:** Zwei `docker compose`-Kommandos, ein manuell erstelltes `docker network create web`.

### D7: `docker-compose.prod.yml` entfernen

Wird durch `deploy/molthar/docker-compose.yml` ersetzt. Der neue File hat Traefik-Labels statt Port-Publishing, sonst inhaltlich sehr ähnlich.

**Warum:** Ein Ort für die Prod-Config, keine Verwirrung zwischen "prod" (lokal) und "prod" (vServer).

**Kosten:** `make docker-run-prod`-Target muss angepasst oder entfernt werden. Wir entfernen es — für lokales Testen der Prod-Images gibt es ohnehin keinen sauberen Use-Case (Prod-Image hat Prod-Domain eingebrannt).

### D8: Kein Health-/Readiness-Check in dieser Change

Traefik nutzt Docker-Provider und default-Loadbalancing. Kein `HEALTHCHECK` im Dockerfile, kein Traefik `healthcheck`-Label.

**Warum:** Hobby-Traffic, Downtime akzeptabel. Wenn später doch nötig: separate Change, `HEALTHCHECK` in Dockerfile + Traefik-Label.

### D9: Traefik Dashboard komplett aus

`--api=false` in `traefik.yml`. Kein Dashboard-Router, kein Basic-Auth-Middleware nötig.

**Warum:** Angriffsfläche minimieren. Debugging über `docker logs` reicht für den Anfang.

## Risks / Trade-offs

**R1: Netcup-DNS-Propagation** — DNS-01 Challenge kann fehlschlagen wenn Netcup-DNS zu langsam propagiert. Mitigation: `delayBeforeCheck: 120` in Traefik ACME-Config, initial nur eine Testdomain zum Warmlaufen.

**R2: `acme.json` Verlust** — bei Server-Neuaufsetzung sind Certs weg → LE-Rate-Limit droht bei zu vielen Neuausstellungen. Mitigation: Backup-Notiz in `deploy/README.md`, Datei liegt in Volume/Bind-Mount.

**R3: GHCR-Token auf vServer läuft aus** — PATs haben Ablaufdatum. Silent-Failure-Risiko: Deploy schlägt fehl, aber App läuft weiter mit alter Version. Mitigation: `make deploy-status` zeigt aktuelle Image-Digests; Ablauf notieren.

**R4: ARM/AMD64-Mismatch** — Mac baut default ARM, vServer ist AMD64. Mitigation: `docker buildx build --platform linux/amd64` ist im Deploy-Target Pflicht, nicht optional.

**R5: Downtime beim Deploy** — akzeptiert per Entscheidung, aber wenn's mal stört: kann später mit Traefik-Loadbalancer + zwei Backend-Instanzen gelöst werden.

**R6: CORS-Fehlkonfiguration** — wenn `EXTRA_ORIGINS` nicht die exakte Prod-Frontend-URL enthält (inkl. https-Scheme), verbindet der Client nicht. Mitigation: `.env.example` mit Kommentar, Smoke-Test-Schritt in Playbook.

## Migration Plan

1. **DNS vorbereiten** (kann sofort passieren, keine Auswirkung)
2. **vServer bootstrappen**: Docker installieren, Ordner anlegen, Netzwerk erstellen, `docker login ghcr.io`
3. **Traefik-Stack deployen**: `deploy/traefik/` per SCP übertragen, `.env` befüllen, `docker compose up -d`
4. **Test-Cert prüfen**: kurz `curl -v https://traefik.apps.<domain>` (nur DNS-Check, keine echte Route) — sollte 404 mit gültigem Cert liefern
5. **App-Stack deployen**: `make deploy` von lokal → SSH-Trigger
6. **Smoke-Test**: `https://molthar.apps.<domain>` öffnen, Spiel starten, WebSocket-Verbindung im Netzwerk-Tab prüfen
7. **Alten `docker-compose.prod.yml` entfernen** (nachdem neue Prod läuft)

## Open Questions

*(Keine — für offene Punkte siehe Non-Goals)*

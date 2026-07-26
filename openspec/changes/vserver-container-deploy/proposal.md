## Why

Die App läuft bisher nur lokal (`make dev`) oder in lokalen Docker-Containern (`make docker-run`). Für den produktiven Betrieb soll sie auf einem Netcup vServer laufen — erreichbar über HTTPS unter `molthar.apps.<domain>` (Frontend) und `molthar-api.apps.<domain>` (Backend). Es fehlt:

- Ein Reverse-Proxy mit automatischem TLS (Let's Encrypt) vor den Containern
- Ein Deployment-Workflow, der Images baut, in die Registry pusht und den vServer per SSH zum Pullen bringt
- Versionierte Image-Tags für Rollback (aktuell nur `latest`)
- Eine Basis-Struktur, die später mehrere Apps unter `*.apps.<domain>` aufnehmen kann

Ziel ist ein einfacher, wiederholbarer Deploy-Flow (`make deploy`), der ohne CI funktioniert und später 1:1 in eine GitHub-Actions-Pipeline umziehen kann.

## What Changes

**Infrastruktur auf dem vServer:**
- Zentraler Traefik-Stack (`deploy/traefik/docker-compose.yml`) mit:
  - Wildcard-Zertifikat für `*.apps.<domain>` via Netcup DNS-01 (ACME)
  - Dashboard deaktiviert (`--api=false`)
  - Externes Docker-Netzwerk `web` für App-Container
- App-Stack auf dem vServer (`deploy/molthar/docker-compose.yml`):
  - Pullt `ghcr.io/ulrichfrank/molthar-{backend,frontend}:<tag>`
  - Traefik-Labels für Host-Routing auf `molthar.apps.<domain>` bzw. `molthar-api.apps.<domain>`
  - Kein direktes Port-Publishing mehr (Traefik terminiert TLS)
  - Optional: `data`-Volume für zukünftigen persistenten bgio-Storage

**Frontend-Anpassung:**
- `VITE_SERVER_URL` wird zum Build-Zeitpunkt auf die Prod-Backend-URL gesetzt
- Prod-Image trägt bewusst die Prod-Domain in den Bundle (lokales Testen weiter über eigenes Image)

**Lokaler Build & Test:**
- Bestehende `make docker-*`-Targets bleiben unverändert (lokaler Build, lokale Ports)
- Neuer Docker-Compose-File `docker-compose.local.yml` als expliziter Alias — inhaltlich = aktueller `docker-compose.yml`
- README-Klarstellung: `make docker-run` = lokal, `make deploy` = vServer

**Neue Make-Targets:**
- `make deploy` — Build (linux/amd64 via buildx) → Push (mit `latest` und `git-<sha>` Tags) → SSH `docker compose pull && up -d`
- `make deploy TAG=<sha>` — Rollback auf spezifische Version
- `make deploy-logs` / `make deploy-status` / `make deploy-restart` — SSH-Wrapper
- `make deploy-init` — einmalige Bootstrap-Anleitung (nicht destruktiv; zeigt Schritte, prüft Voraussetzungen)

**DNS (manuell):**
- `apps.<domain>` A-Record → vServer-IP
- `*.apps.<domain>` A-Record → vServer-IP (Wildcard)

## Capabilities

### New Capabilities

- `vserver-container-deploy`: Deployment-Infrastruktur, die die App als Container auf einem vServer betreibt, mit Traefik als HTTPS-Reverse-Proxy, ghcr.io als Image-Registry, und `make deploy` als Client-Kommando.

### Modified Capabilities

*(keine — die Spiellogik bleibt unverändert)*

## Impact

**Neue Dateien:**
- `deploy/traefik/docker-compose.yml` — Traefik-Stack
- `deploy/traefik/traefik.yml` — Traefik-Konfiguration (ACME, providers)
- `deploy/traefik/.env.example` — Netcup-API-Credentials, ACME-Email, Domain-Vars
- `deploy/molthar/docker-compose.yml` — App-Stack für vServer (ersetzt inhaltlich `docker-compose.prod.yml`)
- `deploy/molthar/.env.example` — Domain-Vars, `EXTRA_ORIGINS`, Image-Tag
- `deploy/README.md` — Bootstrap-Anleitung, DNS-Setup, Betriebs-Playbook
- `docker-compose.local.yml` — expliziter Alias für lokales Bauen/Testen (Inhalt = aktueller `docker-compose.yml`)

**Geänderte Dateien:**
- `Makefile` — neue `deploy-*`-Targets; `docker-*`-Targets bleiben
- `docker-compose.prod.yml` — entfernen (durch `deploy/molthar/docker-compose.yml` ersetzt)
- `Dockerfile` — unverändert
- `Dockerfile.frontend` — unverändert (VITE_SERVER_URL wird über Compose-Build-Arg übergeben)
- `README.md` — Deployment-Sektion ergänzen
- `.env.example` — ergänzt um vServer-relevante Variablen (Domain, GHCR_USER)

**Manuelle Schritte (einmalig, dokumentiert):**
- DNS-Records in Netcup CCP anlegen (`apps` und `*.apps`)
- Netcup CCP API-Zugang aktivieren + Customer-Nr./API-Key/Passwort abrufen
- Docker + Compose auf vServer installieren
- `deploy/traefik/` und `deploy/molthar/` per SCP auf vServer legen, `.env` befüllen
- `docker network create web` auf vServer
- `docker login ghcr.io` auf vServer (Personal Access Token mit `read:packages`)

**Was NICHT im Scope ist:**
- CI-Pipeline (GitHub Actions) — Makefile wird so gebaut, dass CI-Umzug später trivial ist
- Persistenter bgio-Storage — Volume-Mount wird vorbereitet, aber Storage-Adapter kommt separat
- Monitoring/Logging-Aggregation
- Backup-Automatik für Traefik-`acme.json`
- Zero-Downtime-Deploys (Blue/Green) — kurze Downtime beim `up -d` ist okay

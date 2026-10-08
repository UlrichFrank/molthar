# Deployment: vServer mit Traefik

Molthar läuft auf dem vServer (Netcup, SSH-Alias `vServer`, Ubuntu 24.04 x86-64) als **ein einzelnes Binary** unter systemd. Davor steht der zentrale Traefik-Stack (Docker) mit dem Wildcard-Zertifikat `*.apps.diefranks.eu` (Let's Encrypt, DNS-01 über Netcup). Ausgebremst läuft nach demselben Muster daneben.

```
deploy/
├── traefik/                  # Zentraler Reverse-Proxy (Docker, einmal für alle Apps)
│   ├── docker-compose.yml    # mountet ./dynamic für den File-Provider
│   ├── traefik.yml           # Docker-Provider + File-Provider (/etc/traefik/dynamic)
│   ├── dynamic/              # auf dem Server: eine Routen-Datei pro App (molthar.yml, ausgebremst.yml)
│   └── .env.example
└── molthar/
    ├── molthar.service       # systemd-Unit → /etc/systemd/system/molthar.service
    └── traefik-molthar.yml   # Route → ~/deploy/traefik/dynamic/molthar.yml
```

| Was | Wo auf dem Server |
|-----|-------------------|
| Binary (+ `.prev` für Rollback) | `/opt/molthar/molthar` |
| Spielstände | `/var/lib/molthar/data` |
| NPC-Sitzplatz-Zugangsdaten | `/var/lib/molthar/data-npc` |
| Bind-Adresse | `172.18.0.1:3002` (Gateway des Docker-Netzes `web`; Port 3001 gehört Ausgebremst) |
| Logs | journald (`make deploy-logs`) |
| Domains | `molthar.apps.diefranks.eu`, übergangsweise `molthar-api.apps.diefranks.eu` |

Die Bind-Adresse ist nur für Traefik (im Netz `web`) erreichbar, nicht aus dem Internet.

## Alltag

```bash
make deploy              # Binary bauen (linux-x64) → hochladen → Neustart → Health-Check
make deploy-rollback     # vorheriges Binary (.prev) wieder aktivieren
make deploy-status       # systemctl status, Prüfsummen, Traefik-Container
make deploy-logs         # journalctl -fu molthar
make deploy-restart      # Dienst neu starten
make smoke URL=https://molthar.apps.diefranks.eu   # echte Lobby-/NPC-Partien gegen Produktion
```

`make deploy` prüft zuerst, ob das Gateway des Docker-Netzes `web` noch `172.18.0.1` ist, überträgt Binary, Unit und Route, behält das laufende Binary als `molthar.prev` und startet den Dienst neu. Spielstände und NPC-Zugangsdaten bleiben unberührt. Die Route lädt Traefik per `watch` ohne Neustart.

Voraussetzung lokal: Bun ≥ 1.3 und pnpm (`make binary` cross-kompiliert vom Mac).

## Erstinstallation

### 1. DNS und Netcup-API (einmalig)

- A-Records `apps.<domain>` und `*.apps.<domain>` → vServer-IP
- Netcup CCP → Stammdaten → Webservice/API aktivieren (Customer-Nr., API-Key, API-Passwort für die DNS-01-Challenge)

### 2. Docker und Traefik (nur noch für Traefik)

```bash
ssh vServer 'docker --version || curl -fsSL https://get.docker.com | sh'
ssh vServer 'docker network create web; mkdir -p ~/deploy/traefik/dynamic'
scp -r deploy/traefik vServer:~/deploy/
ssh vServer 'cd ~/deploy/traefik && cp .env.example .env && vi .env'   # Netcup-Zugangsdaten
ssh vServer 'cd ~/deploy/traefik && touch acme.json && chmod 600 acme.json && docker compose up -d'
```

**Achtung bei einem bereits laufenden Traefik:** `deploy/traefik/` nur übertragen, wenn es mit dem Server übereinstimmt (`diff` vorher) — sonst gehen Routen anderer Apps verloren. Vor **jedem** Traefik-Neustart `acme.json` prüfen (siehe Backup).

### 3. Molthar-Dienst

```bash
ssh vServer 'useradd --system --no-create-home --shell /usr/sbin/nologin molthar; mkdir -p /opt/molthar'
make deploy-init         # alle Häkchen grün?
make deploy              # installiert Unit + Route, startet den Dienst
```

`StateDirectory=molthar` legt `/var/lib/molthar` mit Eigentümer `molthar` an.

## Umstellung von Docker (einmalig, 2026-10)

Bis Oktober 2026 lief Molthar als Container `molthar-backend-1`/`molthar-frontend-1` aus `~/deploy/molthar`. Docker-Labels und File-Route für dieselbe Domain dürfen **nicht** gleichzeitig aktiv sein, daher diese Reihenfolge:

```bash
# 1. Binary + Unit hochladen, aber noch nicht starten
make binary
scp dist/molthar-linux-x64 vServer:/opt/molthar/molthar && ssh vServer 'chmod 755 /opt/molthar/molthar'
scp deploy/molthar/molthar.service vServer:/etc/systemd/system/ && ssh vServer 'systemctl daemon-reload'

# 2. Container stoppen, Daten übernehmen (data UND data-npc!), Dienst starten
ssh vServer 'cd ~/deploy/molthar && docker compose down'
ssh vServer 'mkdir -p /var/lib/molthar && cp -a ~/deploy/molthar/data ~/deploy/molthar/data-npc /var/lib/molthar/ && chown -R molthar:molthar /var/lib/molthar'
ssh vServer 'systemctl enable --now molthar && curl -s http://172.18.0.1:3002/games/portale-von-molthar'

# 3. Route aktivieren (kein Traefik-Neustart nötig)
scp deploy/molthar/traefik-molthar.yml vServer:~/deploy/traefik/dynamic/molthar.yml
```

Rollback der Umstellung: `systemctl disable --now molthar`, `~/deploy/traefik/dynamic/molthar.yml` löschen, `cd ~/deploy/molthar && docker compose up -d` (die alten Daten liegen dort unverändert).

## Betriebs-Playbook

**Seite nicht erreichbar:**
```bash
make deploy-status       # läuft molthar? läuft Traefik?
make deploy-logs
ssh vServer 'curl -s -o /dev/null -w "%{http_code}\n" http://172.18.0.1:3002/games'   # direkt, ohne Traefik
```
Antwortet der Dienst direkt, aber nicht über HTTPS, liegt es an Traefik: `ssh vServer 'cd ~/deploy/traefik && docker compose ps && docker compose logs --tail=100'`.

**Dienst startet nach einem Server-Neustart nicht:** Die Bind-Adresse existiert erst, wenn Docker das Netz `web` angelegt hat. Die Unit startet nach `docker.service` und versucht es mit `Restart=always` weiter — `journalctl -u molthar` zeigt dann kurz `EADDRNOTAVAIL`, danach läuft der Dienst.

**"Offene Spiele" bleibt leer / NPCs treten nicht bei / Warteraum hängt:** Fast immer antwortet `GET /games/portale-von-molthar` mit 500. Der Endpoint versorgt Spieleliste und NPC-BotRunner. Der MatchStore schreibt atomar und räumt beschädigte Dateien beim Start selbst weg — `make deploy-restart` genügt meist. NPC-Partien hängen dauerhaft, wenn `/var/lib/molthar/data-npc/credentials.json` fehlt.

**"CORS error" im Browser:** `EXTRA_ORIGINS` in `molthar.service` muss exakt `https://molthar.apps.diefranks.eu` enthalten (Socket.IO prüft den Origin auch bei gleicher Domain).

**Speicher:** `MemoryMax=400M` in der Unit; aktueller Verbrauch steht in `make deploy-status`.

**ACME-Challenge / Zertifikat:**
- Netcup-Zugangsdaten in `~/deploy/traefik/.env` prüfen; `delayBeforeCheck: 120` in `traefik.yml`
- Let's Encrypt erlaubt 5 Fehlversuche pro Stunde; zum Debuggen Staging-CA verwenden

## Backup

Regelmäßig sichern:
- `/var/lib/molthar/data/` und `/var/lib/molthar/data-npc/` — Partien und NPC-Zugangsdaten
- `~/deploy/traefik/acme.json` — Zertifikate. **Vor jedem Traefik-Neustart** prüfen, dass die Datei gültiges JSON ist (`ssh vServer 'python3 -m json.tool ~/deploy/traefik/acme.json >/dev/null && echo ok'`). Sie war von 23.09. bis 08.10.2026 unbemerkt abgeschnitten; Traefik hielt das Zertifikat nur im Speicher, und der nächste Neustart ließ alle `*.apps`-Seiten minutenlang ohne Zertifikat.
- `~/deploy/traefik/.env` — Netcup-Zugangsdaten

## Weitere App unter `*.apps.<domain>`

Als Binary/Dienst auf dem Host: auf einer freien Adresse/Port von `172.18.0.1` lauschen und eine Routen-Datei nach `~/deploy/traefik/dynamic/<app>.yml` legen (Vorlage: `molthar/traefik-molthar.yml`). Als Container: Netz `web` und Traefik-Labels. Das Wildcard-Zertifikat deckt neue Subdomains ab; `deploy/traefik/` muss nicht geändert werden.

## ADDED Requirements

### Requirement: Reverse-Proxy mit automatischem TLS

Das System SHALL einen Traefik-Container auf dem vServer betreiben, der eingehende HTTPS-Verbindungen auf `:443` entgegennimmt, TLS terminiert und anhand des `Host`-Headers an die passenden App-Container weiterroutet. Zertifikate MÜSSEN automatisch von Let's Encrypt via DNS-01 Challenge (Netcup-Provider) bezogen und erneuert werden. Ein Wildcard-Zertifikat `*.apps.<domain>` SHALL alle App-Subdomains abdecken.

#### Scenario: Frontend erreichbar via HTTPS

- **WHEN** ein Client `https://molthar.apps.<domain>` aufruft
- **THEN** liefert Traefik die Antwort des `frontend`-Containers mit gültigem Let's Encrypt-Zertifikat und Status `200`

#### Scenario: Backend erreichbar via HTTPS

- **WHEN** ein Client `https://molthar-api.apps.<domain>` aufruft
- **THEN** liefert Traefik die Antwort des `backend`-Containers mit gültigem Let's Encrypt-Zertifikat

#### Scenario: HTTP wird auf HTTPS umgeleitet

- **WHEN** ein Client `http://molthar.apps.<domain>` aufruft
- **THEN** antwortet Traefik mit HTTP 301/308 Redirect auf `https://molthar.apps.<domain>`

#### Scenario: Traefik-Dashboard nicht erreichbar

- **WHEN** ein Client versucht das Traefik-Dashboard aufzurufen (auf keinem Port, keinem Hostnamen)
- **THEN** liefert Traefik keine Dashboard-UI (weder auf `:8080`, noch unter irgendeinem Hostnamen)

### Requirement: Image-Deployment über GHCR

Die App-Container SHALL als vorgefertigte Images von `ghcr.io/ulrichfrank/molthar-{backend,frontend}` bezogen werden. Der vServer baut KEINE Images selbst. Jeder Deploy-Vorgang MUSS zwei Tags pushen: `latest` und `git-<short-sha>`.

#### Scenario: Deploy pusht beide Tags

- **WHEN** `make deploy` erfolgreich durchläuft
- **THEN** existieren auf ghcr.io für backend und frontend jeweils die Tags `latest` und `git-<current-sha>`

#### Scenario: vServer pullt spezifische Version

- **WHEN** `IMAGE_TAG=git-abc123 docker compose up -d` auf dem vServer ausgeführt wird
- **THEN** laufen backend und frontend mit dem Image-Digest von `git-abc123`

#### Scenario: Rollback über bekannten SHA

- **WHEN** `make deploy-rollback TAG=git-abc123` ausgeführt wird
- **THEN** laufen die Container auf dem vServer mit der Version `git-abc123`, ohne dass neu gebaut oder gepusht wird

### Requirement: Linux/AMD64-Kompatible Images vom Mac-Build

Das Deploy-System SHALL auch dann korrekte Images auf den vServer bringen, wenn der Build-Host eine andere Architektur hat (z.B. Apple Silicon, arm64). Alle deploy-relevanten Builds MÜSSEN explizit für `linux/amd64` gebaut werden.

#### Scenario: Build auf Apple Silicon

- **WHEN** `make deploy` auf einem Mac mit arm64-Chip ausgeführt wird
- **THEN** enthält das gepushte Image im Manifest `linux/amd64`, und der vServer kann es ohne "exec format error" starten

### Requirement: `make deploy` als Ein-Kommando-Deployment

Das System SHALL das Kommando `make deploy` bereitstellen, das ohne interaktive Eingabe (build → push → SSH-triggered pull → up) einen Deploy durchführt. Alle Konfiguration MUSS über Env-Vars oder Makefile-Variablen erfolgen (CI-tauglich).

#### Scenario: Deploy ohne Prompts

- **WHEN** `make deploy` in einer nicht-interaktiven Shell ausgeführt wird (z.B. CI)
- **THEN** läuft der komplette Deploy durch, ohne auf stdin zu warten

#### Scenario: Deploy respektiert Env-Overrides

- **WHEN** `DEPLOY_HOST=other-server make deploy` ausgeführt wird
- **THEN** wird der SSH-Trigger gegen `other-server` statt `vServer` ausgeführt

### Requirement: Lokaler Docker-Workflow bleibt erhalten

Das System SHALL weiterhin lokales Bauen und Ausführen der App in Containern erlauben. Die bestehenden `make docker-build`, `make docker-run`, `make docker-stop`, `make docker-logs` Targets MÜSSEN unverändert funktionieren und den lokalen Docker-Daemon nutzen.

#### Scenario: Lokaler Container-Betrieb

- **WHEN** `make docker-build && make docker-run` auf dem Entwicklungs-Mac ausgeführt wird
- **THEN** laufen backend und frontend als lokale Container und sind auf `http://localhost:3001` bzw. `http://localhost` erreichbar
- **AND** kein SSH-Zugriff auf einen entfernten Host findet statt

### Requirement: CORS-Erlaubnis für Frontend-Domain

Der Backend-Container SHALL Cross-Origin-Requests von der konfigurierten Frontend-Domain akzeptieren. Die erlaubten Origins MÜSSEN über die Env-Variable `EXTRA_ORIGINS` konfigurierbar sein (Komma-separierte Liste vollständiger URLs inkl. Scheme).

#### Scenario: Frontend darf Backend kontaktieren

- **WHEN** das Frontend unter `https://molthar.apps.<domain>` einen WebSocket zu `https://molthar-api.apps.<domain>` öffnet
- **AND** `EXTRA_ORIGINS=https://molthar.apps.<domain>` im backend-Container gesetzt ist
- **THEN** wird die Verbindung akzeptiert (kein CORS-Fehler)

### Requirement: Mehrere Apps unter `*.apps.<domain>` möglich

Die Deploy-Infrastruktur SHALL so aufgebaut sein, dass weitere Apps ohne Umbau von Traefik hinzukommen können. Jede neue App braucht nur einen eigenen Compose-Stack mit Traefik-Labels und Anschluss an das externe Docker-Netzwerk `web`.

#### Scenario: Neue App ohne Traefik-Änderung

- **WHEN** ein neuer Compose-Stack (`deploy/otherapp/docker-compose.yml`) mit Traefik-Labels für `otherapp.apps.<domain>` deployt wird
- **AND** dieser Stack am Netzwerk `web` teilnimmt
- **THEN** ist die App unter `https://otherapp.apps.<domain>` erreichbar, ohne dass `deploy/traefik/` angefasst wurde
- **AND** das Wildcard-Zertifikat deckt die neue Subdomain ab (kein neuer Cert-Bezug nötig)

# single-binary-deploy Specification

## Purpose
Molthar wird als ein einzelnes ausführbares Binary ohne Container betrieben: es liefert Spielseite, Lobby-API, Echtzeitverbindung und NPC-Gegner selbst aus und läuft auf dem vServer als systemd-Dienst hinter dem bestehenden Traefik mit Wildcard-Zertifikat.

## Requirements

### Requirement: Ein Binary für Spielseite, Server und NPCs
Der Build SHALL ein einzelnes ausführbares Linux-Binary (x86-64) erzeugen, das ohne installierte Bun-, Node- oder Docker-Laufzeit und ohne Dateien neben dem Binary startet. Es SHALL den boardgame.io-Server (Lobby-API und Socket.IO), die NPC-Gegner, die Kartendaten und die fertig gebaute Spielseite enthalten.

#### Scenario: Start ohne Laufzeitumgebung
- **WHEN** das Binary in einem leeren Verzeichnis auf einem Linux-x86-64-System ohne Bun, Node und Docker mit `PORT=3002` gestartet wird
- **THEN** antwortet `GET /games` mit HTTP 200 und `["portale-von-molthar"]`, und das Log meldet alle Charakterkarten als geladen

#### Scenario: Spielseite aus dem Binary
- **WHEN** `GET /` an das laufende Binary gesendet wird
- **THEN** antwortet es mit HTTP 200 und der HTML-Seite des Spiels, und alle von der Seite geladenen Skripte, Styles, Kartenbilder und `/assets/cards.json` werden ebenfalls mit HTTP 200 ausgeliefert

#### Scenario: Keine Rohdaten im Binary
- **WHEN** eine Datei aus `assets/raw/`, eine `.af`-Datei oder `Anleitung.jpg` angefordert wird
- **THEN** liefert das Binary sie nicht aus

#### Scenario: Unbekannter Seitenpfad
- **WHEN** ein `GET` auf einen Pfad ohne Dateiendung gesendet wird, der weder eine Datei der Spielseite noch eine API-Route ist (z. B. `/lobby/abc`)
- **THEN** antwortet das Binary mit der HTML-Seite des Spiels (HTTP 200)

#### Scenario: Fehlende Datei
- **WHEN** ein `GET` auf einen nicht vorhandenen Pfad mit Dateiendung gesendet wird (z. B. `/assets/gibtsnicht.png`)
- **THEN** antwortet das Binary mit HTTP 404 und nicht mit der HTML-Seite

#### Scenario: API-Routen haben Vorrang
- **WHEN** `GET /games/portale-von-molthar/<unbekannte-id>` gesendet wird
- **THEN** antwortet das Binary unverändert mit HTTP 404 und nicht mit der HTML-Seite

### Requirement: Spielseite und API unter einem Origin
Die ausgelieferte Spielseite SHALL Lobby-API und Socket.IO standardmäßig unter dem Origin ansprechen, von dem sie geladen wurde. Eine zur Build-Zeit gesetzte Server-URL SHALL diesen Standard überschreiben.

#### Scenario: Produktion unter einer Domain
- **WHEN** die Seite unter `https://molthar.apps.diefranks.eu` geladen und ein Spiel erstellt wird
- **THEN** gehen alle Lobby-Anfragen und die Socket.IO-Verbindung an `https://molthar.apps.diefranks.eu`

#### Scenario: Entwicklung mit getrennten Ports
- **WHEN** das Frontend im Vite-Dev-Server mit gesetzter Server-URL `http://localhost:3001` läuft
- **THEN** verbindet es sich mit dem Backend auf Port 3001

### Requirement: Echtzeitverbindung über WebSocket
Das Binary SHALL Socket.IO-Verbindungen per WebSocket annehmen, ohne dass Clients auf HTTP-Long-Polling ausweichen müssen.

#### Scenario: WebSocket-Upgrade
- **WHEN** ein Client die Socket.IO-Verbindung mit Transport `websocket` aufbaut und dem Namespace `/portale-von-molthar` beitritt
- **THEN** bleibt die Verbindung offen und der Client erhält auf `sync` den Spielstand

#### Scenario: Komplettes Spiel mit NPCs
- **WHEN** ein Spiel mit menschlichen Clients und NPC-Plätzen gegen das Binary gestartet wird
- **THEN** treten die NPCs ihren Plätzen bei, spielen ihre Züge, und das Spiel läuft ohne Verbindungsabbruch bis zum Spielende

### Requirement: Konfiguration und persistente Daten
Das Binary SHALL über Umgebungsvariablen konfiguriert werden: `PORT` (Port), `HOST` (Bind-Adresse), `MATCHES_DIR` (Verzeichnis der Spielstände), `NPC_DATA_DIR` (Verzeichnis der NPC-Zugangsdaten), `MATCH_TTL_DAYS` und `EXTRA_ORIGINS`. Ist `HOST` gesetzt, SHALL der Server ausschließlich auf dieser Adresse lauschen. Spielstände und NPC-Zugangsdaten SHALL außerhalb des Binaries liegen und einen Neustart sowie den Austausch des Binaries überstehen.

#### Scenario: Bind-Adresse
- **WHEN** das Binary mit `HOST=127.0.0.1` gestartet wird
- **THEN** lauscht es nur auf 127.0.0.1, und die NPCs verbinden sich erfolgreich mit dem Server

#### Scenario: Neustart mit laufender NPC-Partie
- **WHEN** während einer laufenden Partie mit NPC das Binary durch eine neue Version ersetzt und neu gestartet wird
- **THEN** kann die Partie nach dem Neuladen der Seite mit unverändertem Spielstand fortgesetzt werden, und der NPC macht seinen nächsten Zug

#### Scenario: Übernahme bestehender Daten
- **WHEN** das Binary mit den Spielständen und NPC-Zugangsdaten aus dem bisherigen Container-Betrieb startet
- **THEN** sind die darin enthaltenen Partien über die Lobby-API abrufbar, und NPCs in diesen Partien spielen weiter

### Requirement: Betrieb als Systemdienst hinter Traefik
Auf dem vServer SHALL das Binary als systemd-Dienst unter einem eigenen Systembenutzer laufen, nach einem Absturz oder Server-Neustart automatisch neu starten und nur für Traefik erreichbar sein. Der bestehende Traefik-Reverse-Proxy und das Wildcard-Zertifikat `*.apps.diefranks.eu` SHALL unverändert weiterverwendet werden; der parallel laufende Ausgebremst-Dienst SHALL unbeeinträchtigt bleiben.

#### Scenario: HTTPS über das Wildcard-Zertifikat
- **WHEN** `https://molthar.apps.diefranks.eu/` aufgerufen wird
- **THEN** antwortet der Dienst über Traefik mit HTTP 200 und einem Zertifikat für `*.apps.diefranks.eu`

#### Scenario: Übergangs-Domain der API
- **WHEN** ein noch geöffneter alter Client `https://molthar-api.apps.diefranks.eu/games` aufruft
- **THEN** antwortet der Dienst mit HTTP 200

#### Scenario: Nicht direkt aus dem Internet erreichbar
- **WHEN** der Port des Dienstes direkt über die öffentliche IP des vServers angesprochen wird
- **THEN** kommt keine Verbindung zustande

#### Scenario: Automatischer Neustart
- **WHEN** der Prozess des Dienstes unerwartet beendet wird
- **THEN** läuft der Dienst innerhalb weniger Sekunden wieder und die Spielseite ist erreichbar

#### Scenario: Ausgebremst unbeeinträchtigt
- **WHEN** Molthar auf den Systemdienst umgestellt ist
- **THEN** ist `https://ausgebremst.apps.diefranks.eu` weiterhin mit HTTP 200 erreichbar

### Requirement: Deploy und Rollback
Das Projekt SHALL einen Befehl bereitstellen, der das Binary baut, auf den vServer überträgt und den Dienst neu startet, sowie einen Befehl, der auf das zuvor laufende Binary zurückschaltet. Beide SHALL Spielstände und NPC-Zugangsdaten unverändert lassen.

#### Scenario: Deploy
- **WHEN** `make deploy` ausgeführt wird
- **THEN** läuft auf dem vServer anschließend das neu gebaute Binary und die Spielseite ist unter `https://molthar.apps.diefranks.eu` erreichbar

#### Scenario: Rollback
- **WHEN** nach einem Deploy `make deploy-rollback` ausgeführt wird
- **THEN** läuft wieder das vorherige Binary mit unveränderten Spielständen

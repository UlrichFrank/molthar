# Deployment: vServer mit Traefik

Molthar läuft auf dem vServer (Netcup, SSH-Alias `vServer`, Ubuntu 24.04 x86-64) als **ein einzelnes Binary** unter systemd. Davor steht der gemeinsame Traefik (ebenfalls systemd, ohne Docker) mit dem Wildcard-Zertifikat `*.apps.diefranks.eu` (Let's Encrypt, DNS-01 über Netcup). Traefik, Swap und Systembenutzer richtet `make server-setup` im Spielothek-Repo ein; Ausgebremst, Doppelkopf und die Spielothek laufen nach demselben Muster daneben.

```
deploy/molthar/
├── molthar.service       # systemd-Unit → /etc/systemd/system/molthar.service
└── traefik-molthar.yml   # Route → /etc/traefik/dynamic/molthar.yml
```

| Was | Wo auf dem Server |
|-----|-------------------|
| Binary (+ `.prev` für Rollback) | `/opt/molthar/molthar` |
| Spielstände | `/var/lib/molthar/data` |
| NPC-Sitzplatz-Zugangsdaten | `/var/lib/molthar/data-npc` |
| Bind-Adresse | `127.0.0.1:3002` (3001 Ausgebremst, 3003 Doppelkopf, 3004 Spielothek) |
| Logs | journald (`make deploy-logs`) |
| Domains | `molthar.apps.diefranks.eu`, übergangsweise `molthar-api.apps.diefranks.eu` |

Die Bind-Adresse ist nur für Traefik auf demselben Host erreichbar, nicht aus dem Internet.

## Alltag

```bash
make deploy              # Binary bauen (linux-x64) → hochladen → Neustart → Health-Check
make deploy-rollback     # vorheriges Binary (.prev) wieder aktivieren
make deploy-status       # systemctl status, Prüfsummen, läuft Traefik?
make deploy-logs         # journalctl -fu molthar
make deploy-restart      # Dienst neu starten
make smoke URL=https://molthar.apps.diefranks.eu   # echte Lobby-/NPC-Partien gegen Produktion
```

`make deploy` prüft zuerst, ob Traefik läuft, überträgt Binary, Unit und Route, behält das laufende Binary als `molthar.prev` und startet den Dienst neu. Spielstände und NPC-Zugangsdaten bleiben unberührt. Die Route lädt Traefik per `watch` ohne Neustart.

Voraussetzung lokal: Bun ≥ 1.3 und pnpm (`make binary` cross-kompiliert vom Mac).

## Erstinstallation

1. DNS: A-Records `apps.<domain>` und `*.apps.<domain>` → vServer-IP. Netcup CCP → Stammdaten → Webservice/API aktivieren (Zugangsdaten für die DNS-01-Challenge, SOPS-verschlüsselt im Spielothek-Repo).
2. Im Spielothek-Repo `make server-setup` (Swap, Traefik, Systembenutzer, `/opt/<app>`).
3. Hier:
   ```bash
   make deploy-init         # alle Häkchen grün?
   make deploy              # installiert Unit + Route, startet den Dienst
   ```

`StateDirectory=molthar` legt `/var/lib/molthar` mit Eigentümer `molthar` an.

## Betriebs-Playbook

**Seite nicht erreichbar:**
```bash
make deploy-status       # läuft molthar? läuft Traefik?
make deploy-logs
ssh vServer 'curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3002/games'   # direkt, ohne Traefik
```
Antwortet der Dienst direkt, aber nicht über HTTPS, liegt es an Traefik: `ssh vServer 'systemctl status traefik; journalctl -u traefik -n 100'`.

**"Offene Spiele" bleibt leer / NPCs treten nicht bei / Warteraum hängt:** Fast immer antwortet `GET /games/portale-von-molthar` mit 500. Der Endpoint versorgt Spieleliste und NPC-BotRunner. Der MatchStore schreibt atomar und räumt beschädigte Dateien beim Start selbst weg — `make deploy-restart` genügt meist. NPC-Partien hängen dauerhaft, wenn `/var/lib/molthar/data-npc/credentials.json` fehlt.

**"CORS error" im Browser:** `EXTRA_ORIGINS` in `molthar.service` muss exakt `https://molthar.apps.diefranks.eu` enthalten (Socket.IO prüft den Origin auch bei gleicher Domain).

**Speicher:** `MemoryMax=250M` in der Unit (der vServer hat 833 MiB RAM plus 2 GB Swap); aktueller Verbrauch steht in `make deploy-status`.

**ACME-Challenge / Zertifikat:**
- Netcup-Zugangsdaten in `/etc/traefik/netcup.env` prüfen; `delayBeforeCheck: 120` in `/etc/traefik/traefik.yml`
- Let's Encrypt erlaubt 5 Fehlversuche pro Stunde; zum Debuggen Staging-CA verwenden

## Backup

Regelmäßig sichern:
- `/var/lib/molthar/data/` und `/var/lib/molthar/data-npc/` — Partien und NPC-Zugangsdaten
- `/var/lib/traefik/acme.json` — Zertifikate. **Vor jedem Traefik-Neustart** prüfen, dass die Datei gültiges JSON ist (`ssh vServer 'python3 -m json.tool /var/lib/traefik/acme.json >/dev/null && echo ok'`). Sie war von 23.09. bis 08.10.2026 unbemerkt abgeschnitten; Traefik hielt das Zertifikat nur im Speicher, und der nächste Neustart ließ alle `*.apps`-Seiten minutenlang ohne Zertifikat.
- Netcup-Zugangsdaten: SOPS-verschlüsselt im Spielothek-Repo (`deploy/traefik/netcup.sops.env`)

## Weitere App unter `*.apps.<domain>`

Als Binary/Dienst auf dem Host: auf einem freien Port von `127.0.0.1` lauschen und eine Routen-Datei nach `/etc/traefik/dynamic/<app>.yml` legen (Vorlage: `molthar/traefik-molthar.yml`). Das Wildcard-Zertifikat deckt neue Subdomains ab; die Traefik-Konfiguration muss nicht geändert werden.

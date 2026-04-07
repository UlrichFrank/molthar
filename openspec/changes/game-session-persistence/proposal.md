## Why

Wenn Spieler eine Verbindung verlieren oder das Browserfenster schließen, gehen aktive Spielsitzungen verloren und müssen von vorne gestartet werden. Eine automatische Persistenz des Spielstands ermöglicht es, jederzeit nahtlos weiterzuspielen.

## What Changes

- Spielzustände werden automatisch und kontinuierlich in der Datenbank persistiert
- Spieler können über ihre eindeutige Player-ID eine laufende Partie jederzeit wieder betreten
- Spiele werden **nicht** automatisch gelöscht – nur der Ersteller kann ein Spiel aktiv beenden
- Die Lobby zeigt laufende Spiele an, bei denen man bereits Teilnehmer ist (Rejoin-Option)
- Neues "Spiel beenden"-Feature für den Ersteller (Spieler 0)

## Capabilities

### New Capabilities
- `game-persistence`: Automatische Persistenz des Spielzustands in boardgame.io-kompatibler Datenbank; Spiele überleben Server-Neustarts und Browser-Schließen
- `game-rejoin`: Spieler können einer laufenden Partie anhand ihrer Player-ID wieder beitreten, ohne die Partie neu starten zu müssen
- `game-termination`: Ersteller kann eine laufende Partie aktiv beenden; erst dann wird der Spielzustand gelöscht

### Modified Capabilities
<!-- keine bestehenden Specs betroffen -->

## Impact

- **Backend:** boardgame.io `StorageAPI` konfigurieren (z. B. `flatfile` oder SQLite/Postgres statt In-Memory); Server-Konfiguration anpassen
- **Frontend:** Lobby-Komponente erweitern um Rejoin-Button für laufende Spiele; "Spiel beenden"-Button für Ersteller
- **Shared:** Neue Move/Event-Typen für Spielende durch Ersteller
- **Neue Abhängigkeit:** Persistenz-Adapter (z. B. `boardgame.io/storage` flatfile oder `@boardgame.io/postgres`)

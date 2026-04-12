## ADDED Requirements

### Requirement: Dialog bei Verbindungsverlust eines Spielers
Das System SHALL einen modalen Dialog anzeigen wenn `matchData` einen Spieler mit `isConnected === false` enthält und dieser Spieler nicht der lokale Spieler ist.

#### Scenario: Dialog erscheint bei Disconnect
- **WHEN** `matchData` einen Eintrag mit `isConnected === false` enthält (für einen anderen Spieler)
- **THEN** wird der Disconnect-Dialog nach spätestens 2 Sekunden angezeigt

#### Scenario: Dialog zeigt Spielernamen
- **WHEN** der Disconnect-Dialog sichtbar ist
- **THEN** zeigt er den Namen des nicht verbundenen Spielers (aus `matchData[i].name`)

#### Scenario: Dialog blockiert das Spielfeld
- **WHEN** der Disconnect-Dialog sichtbar ist
- **THEN** ist keine Interaktion mit dem Canvas oder anderen Dialogen möglich (Dialog liegt über allem)

#### Scenario: Dialog verschwindet bei Reconnect
- **WHEN** der getrennte Spieler sich wieder verbindet (`isConnected` wird `true`)
- **THEN** schließt sich der Dialog automatisch ohne Nutzerinteraktion

#### Scenario: Kein Dialog für den eigenen Spieler
- **WHEN** der lokale Spieler selbst offline ist
- **THEN** wird kein Dialog angezeigt (der Spieler sieht ohnehin nichts)

### Requirement: Sanduhr-Animation im Dialog
Das System SHALL im Disconnect-Dialog eine sichtbare Warteanimation (rotierende Sanduhr oder Spinner) anzeigen um zu kommunizieren dass das Spiel aktiv wartet.

#### Scenario: Animation läuft kontinuierlich
- **WHEN** der Disconnect-Dialog sichtbar ist
- **THEN** rotiert die Sanduhr-Animation kontinuierlich (CSS-Keyframe-Loop)

### Requirement: Debounce bei kurzem Verbindungsunterbruch
Das System SHALL den Dialog erst anzeigen wenn der Verbindungsverlust mindestens 2 Sekunden andauert, um kurze Ladeflicker beim Seitenstart zu ignorieren.

#### Scenario: Kurzer Flicker wird ignoriert
- **WHEN** `isConnected` für einen Spieler kürzer als 2 Sekunden `false` ist
- **THEN** erscheint kein Disconnect-Dialog

#### Scenario: Anhaltender Disconnect löst Dialog aus
- **WHEN** `isConnected` für einen Spieler länger als 2 Sekunden `false` bleibt
- **THEN** wird der Dialog angezeigt

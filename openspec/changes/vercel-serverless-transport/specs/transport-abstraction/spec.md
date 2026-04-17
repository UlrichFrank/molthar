## ADDED Requirements

### Requirement: Transport wird zur Build-Zeit per Env-Variable gewählt
Das System SHALL einen gemeinsamen `@transport`-Alias bereitstellen, der zur Build-Zeit via `VITE_TRANSPORT=socket|vercel` auf die korrekte Implementierung zeigt. Wird `VITE_TRANSPORT` nicht gesetzt, SHALL `socket` als Default gelten.

#### Scenario: Default-Modus ist socket
- **WHEN** `VITE_TRANSPORT` nicht gesetzt ist
- **THEN** zeigt `@transport` auf `src/transport/socket/index.ts`

#### Scenario: Vercel-Modus aktiviert
- **WHEN** `VITE_TRANSPORT=vercel` gesetzt ist
- **THEN** zeigt `@transport` auf `src/transport/vercel/index.ts`

#### Scenario: Bundle enthält nur den gewählten Transport
- **WHEN** mit `VITE_TRANSPORT=vercel` gebaut wird
- **THEN** enthält das Bundle keinen Socket.IO-Client-Code

#### Scenario: Bundle enthält nur den gewählten Transport (socket)
- **WHEN** mit `VITE_TRANSPORT=socket` gebaut wird
- **THEN** enthält das Bundle keinen Polling-Hook-Code für Vercel

### Requirement: Gemeinsames Transport-Interface
Das System SHALL ein TypeScript-Interface in `src/transport/types.ts` definieren, das beide Transporte implementieren müssen. Das Interface SHALL `lobbyClient` und `GameClientComponent` umfassen.

#### Scenario: LobbyScreen importiert nur aus @transport
- **WHEN** `LobbyScreen.tsx` kompiliert wird
- **THEN** enthält es keinen direkten Import von `useLobbyClient` oder boardgame.io

#### Scenario: WaitingRoom importiert nur aus @transport
- **WHEN** `WaitingRoom.tsx` kompiliert wird
- **THEN** enthält es keinen direkten Import von `useLobbyClient` oder boardgame.io

### Requirement: Socket-Transport entspricht bisherigem Verhalten
Der socket-Transport SHALL das bisherige Verhalten von `useLobbyClient.ts` vollständig abbilden. Es SHALL keine inhaltlichen Änderungen am socket-Transport geben — nur eine Verschiebung des Dateipfads.

#### Scenario: Bisherige Tests bleiben grün
- **WHEN** `VITE_TRANSPORT=socket` und alle bestehenden Tests laufen
- **THEN** sind alle Tests grün (kein Regressionstest schlägt fehl)

## MODIFIED Requirements

### Requirement: Vollständige Textualisierung aller UI-Strings
Alle user-sichtbaren Strings in `game-web/src` SHALL aus den Komponenten in die zentrale Übersetzungsdatei ausgelagert sein. Kein hardcodierter Text SHALL in JSX, Canvas-`fillText`-Aufrufen oder Lib-Dateien verbleiben. Dies schließt explizit ein: Komponenten-Dialoge, Canvas-Labels, Fähigkeiten-Texte in `abilityDisplayMap.ts` und Session-Info-Texte in LobbyScreen.

#### Scenario: Strings in Lobby
- **WHEN** die Lobby in einer unterstützten Sprache angezeigt wird
- **THEN** sind alle Labels, Buttons, Platzhalter, Fehlermeldungen und Session-Info-Texte in der gewählten Sprache

#### Scenario: Strings in Dialogen
- **WHEN** ein Dialog (Charakterkarte nehmen, Aktivierung, Auswechslung, Charaktertausch, Perlkarte zurückholen, Endscreen) angezeigt wird
- **THEN** sind alle Titel, Beschriftungen und Button-Labels in der gewählten Sprache

#### Scenario: Strings auf dem Spielfeld
- **WHEN** das Spielfeld aktiv ist
- **THEN** sind alle Spielfeld-Labels, Canvas-Buttons, Fähigkeiten-Texte, Status-Anzeigen und Steuerelemente in der gewählten Sprache

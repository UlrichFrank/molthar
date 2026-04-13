## ADDED Requirements

### Requirement: Sprachauswahl in der Lobby
Die Anwendung SHALL eine Möglichkeit zur Sprachauswahl in der Lobby-UI bereitstellen. Die unterstützten Sprachen sind Deutsch (`de`), Englisch – Britisch (`en-GB`) und Französisch (`fr`).

#### Scenario: Sprache auswählen
- **WHEN** der Nutzer einen Sprach-Button (DE / EN / FR) in der Lobby-UI anklickt
- **THEN** wechselt die gesamte UI sofort in die gewählte Sprache

#### Scenario: Sprachauswahl hervorgehoben
- **WHEN** eine Sprache aktiv ist
- **THEN** ist der zugehörige Button visuell als aktiv markiert

---

### Requirement: Sprachpersistenz
Die gewählte Sprache SHALL in `localStorage` unter dem Schlüssel `pvm-language` gespeichert werden.

#### Scenario: Sprache nach Reload wiederhergestellt
- **WHEN** der Nutzer die Seite neu lädt
- **THEN** wird die zuletzt gewählte Sprache wiederhergestellt

#### Scenario: Kein gespeicherter Wert — Fallback auf Deutsch
- **WHEN** kein Wert in `localStorage` vorhanden ist oder der Wert ungültig ist
- **THEN** wird `de` (Deutsch) als Standardsprache verwendet

---

### Requirement: Vollständige Textualisierung aller UI-Strings
Alle user-sichtbaren Strings in `game-web/src` SHALL aus den Komponenten in die zentrale Übersetzungsdatei ausgelagert sein. Kein hardcodierter Text SHALL in JSX verbleiben.

#### Scenario: Strings in Lobby
- **WHEN** die Lobby in einer unterstützten Sprache angezeigt wird
- **THEN** sind alle Labels, Buttons, Platzhalter und Fehlermeldungen in der gewählten Sprache

#### Scenario: Strings in Dialogen
- **WHEN** ein Dialog (Charakterkarte nehmen, Aktivierung, Auswechslung, Endscreen) angezeigt wird
- **THEN** sind alle Titel, Beschriftungen und Button-Labels in der gewählten Sprache

#### Scenario: Strings auf dem Spielfeld
- **WHEN** das Spielfeld aktiv ist
- **THEN** sind alle Spielfeld-Labels, Status-Anzeigen und Steuerelemente in der gewählten Sprache

---

### Requirement: Typsichere Übersetzungsschlüssel
Das System SHALL TypeScript-kompilierte Schlüssel (`TranslationKey`) verwenden, sodass ungültige Schlüssel zur Kompilierzeit als Fehler erkannt werden.

#### Scenario: Ungültiger Schlüssel schlägt fehl
- **WHEN** ein Entwickler `t('nicht.vorhanden')` aufruft
- **THEN** meldet TypeScript einen Kompilierfehler

#### Scenario: Fehlender Schlüssel in einer Locale
- **WHEN** alle drei Locale-Objekte denselben `TranslationKey`-Typ implementieren müssen
- **THEN** meldet TypeScript einen Fehler wenn ein Schlüssel in einer Locale fehlt

---

### Requirement: LanguageProvider am App-Wurzel-Level
Ein `LanguageProvider` SHALL die gesamte Anwendung umschließen, damit alle Komponenten (Lobby, Spielfeld, Dialoge) Zugriff auf `t` und `setLanguage` haben.

#### Scenario: Sprachkontext überall verfügbar
- **WHEN** eine beliebige Komponente `useTranslation()` aufruft
- **THEN** erhält sie `{ t, language, setLanguage }` ohne direkte Prop-Weitergabe

## Why

Die UI ist ein Mix aus Deutschen und Englischen Strings (z. B. „Abbrechen" neben „Power Points", „Leave Game" neben „Spiel beenden"). Eine einheitliche, wählbare Anzeigesprache verbessert die Zugänglichkeit und ermöglicht internationalen Spielern die Nutzung ohne Sprachbarriere.

## What Changes

- Alle hardcodierten Texte in `game-web/src` werden in Übersetzungsdateien ausgelagert
- Drei Sprachen werden vollständig unterstützt: Deutsch (de), English – British (en-GB), Français (fr)
- In der Lobby erscheint ein Sprachwahlfeld (Dropdown oder Flaggen-Buttons)
- Die gewählte Sprache wird in `localStorage` gespeichert und beim nächsten Besuch wiederhergestellt
- Kein externer i18n-Framework — schlanke eigene Lösung mit einem `useTranslation`-Hook und typisierten Schlüsseln

## Capabilities

### New Capabilities

- `i18n-language-selection`: Sprachauswahl in der Lobby und vollständige Textualisierung aller UI-Strings in de / en-GB / fr

### Modified Capabilities

_(keine)_

## Impact

- `game-web/src/i18n/`: neue Dateien — `translations.ts` (alle Strings), `useTranslation.ts` (Hook), `LanguageContext.tsx` (Provider)
- `game-web/src/lobby/LobbyScreen.tsx`: Sprachauswahl-UI + `LanguageProvider`-Wrapper
- `game-web/src/App.tsx`: `LanguageProvider` am Wurzel-Level
- Alle Komponenten unter `game-web/src/components/` und `game-web/src/lobby/`: Strings durch `t('key')`-Aufrufe ersetzen
- Keine Backend-Änderungen

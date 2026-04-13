## Why

Die i18n-Infrastruktur (translations.ts, useTranslation, LanguageProvider) ist seit dem i18n-Language-Selection-Feature vorhanden und deckt die meisten Dialoge ab — jedoch wurden mehrere Komponenten und Lib-Dateien nie auf das System umgestellt. Ca. 35 sichtbare UI-Strings sind hardcoded, teils Deutsch, teils Englisch (inkonsistent), und werden beim Sprachwechsel nicht übersetzt.

## What Changes

- **Neue TranslationKeys** in `translations.ts` für alle fehlenden Strings (ca. 25 neue Keys), mit Übersetzungen in DE / EN-GB / FR
- **Komponenten umstellen** auf `useTranslation`: ErrorBoundary, CharacterSwapDialog, TakeBackPlayedPearlDialog, EndTurnButton, PlayerStatusDialog, DeckReshuffleAnimation, LobbyScreen (Reste)
- **Canvas-Strings externalisieren**: `canvasRegions.ts` und `gameRender.ts` sind reine Lib-Funktionen ohne React-Kontext; die Labels werden als Parameter von `CanvasGameBoard` (das `useTranslation` bereits nutzt) übergeben
- **abilityDisplayMap externalisieren**: Die 13 Fähigkeiten-Namen und -Beschreibungen (derzeit hardcoded Deutsch) werden entweder als TranslationKeys erfasst oder die Lookup-Funktion gibt Keys zurück, die in den Komponenten übersetzt werden

## Capabilities

### New Capabilities

- `i18n-complete-externalization`: Vollständige Externalisierung aller verbleibenden UI-Strings in das bestehende i18n-System; kein sichtbarer UI-String darf mehr hardcoded sein

### Modified Capabilities

- `i18n-language-selection`: Das bestehende i18n-System wird um ~25 neue TranslationKeys erweitert (kein Verhaltensbruch, nur Erweiterung)

## Impact

- `game-web/src/i18n/translations.ts` — neue Keys + Übersetzungen
- `game-web/src/components/ErrorBoundary.tsx`
- `game-web/src/components/CharacterSwapDialog.tsx`
- `game-web/src/components/TakeBackPlayedPearlDialog.tsx`
- `game-web/src/components/EndTurnButton.tsx`
- `game-web/src/components/PlayerStatusDialog.tsx`
- `game-web/src/components/DeckReshuffleAnimation.tsx`
- `game-web/src/components/CanvasGameBoard.tsx` (Canvas-Labels übergeben)
- `game-web/src/lib/canvasRegions.ts` (Labels als Parameter)
- `game-web/src/lib/gameRender.ts` (Canvas-Text als Parameter)
- `game-web/src/lib/abilityDisplayMap.ts` (Keys statt Strings)
- `game-web/src/lobby/LobbyScreen.tsx` (Reste)
- Keine Breaking Changes an der API, kein Backend betroffen

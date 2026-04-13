## 1. i18n-Infrastruktur anlegen

- [x] 1.1 `game-web/src/i18n/translations.ts` erstellen — `TranslationKey`-Typ (Union aller ~60 Schlüssel) und `translations: Record<Locale, Record<TranslationKey, string>>` mit allen de / en-GB / fr Strings
- [x] 1.2 `game-web/src/i18n/LanguageContext.tsx` erstellen — `LanguageContext`, `LanguageProvider` (liest/schreibt `localStorage` unter `pvm-language`, Default `'de'`)
- [x] 1.3 `game-web/src/i18n/useTranslation.ts` erstellen — Hook der `{ t, language, setLanguage }` zurückgibt

## 2. Provider in App integrieren

- [x] 2.1 `LanguageProvider` in `game-web/src/App.tsx` als Wurzel-Wrapper hinzufügen

## 3. Lobby-Strings externalisieren

- [x] 3.1 `LobbyScreen.tsx`: alle hardcodierten Strings durch `t('...')`-Aufrufe ersetzen
- [x] 3.2 Sprachauswahl-UI in `LobbyScreen.tsx` einbauen — drei Buttons DE / EN / FR, aktive Sprache visuell hervorgehoben, rufen `setLanguage` auf

## 4. Dialog-Strings externalisieren

- [x] 4.1 `CharacterTakePreviewDialog.tsx`: Titel, Button-Labels durch `t()`
- [x] 4.2 `CharacterReplacementDialog.tsx`: Titel, Beschreibung, Button-Labels durch `t()`
- [x] 4.3 `CharacterActivationDialog.tsx`: Titel, Abschnittsnamen, Button-Labels durch `t()`
- [x] 4.4 `ActivatedCharacterDetailView.tsx`: Abschnitts-Überschriften, Labels durch `t()`
- [x] 4.5 `GameDialog.tsx` / `GameDialogActions.tsx` (falls hardcodierte Strings vorhanden): durch `t()` ersetzen

## 5. Spielfeld-Strings externalisieren

- [x] 5.1 `CanvasGameBoard.tsx`: alle Buttons, Status-Labels, Fehlermeldungen durch `t()`
- [x] 5.2 `PlayerStatusBadge.tsx` (falls vorhanden): Labels durch `t()`
- [x] 5.3 Endscreen-Komponente (Rangliste): „Rang", „Spieler", „Punkte", „(Du)" durch `t()`

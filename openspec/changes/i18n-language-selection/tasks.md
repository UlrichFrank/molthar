## 1. i18n-Infrastruktur anlegen

- [ ] 1.1 `game-web/src/i18n/translations.ts` erstellen — `TranslationKey`-Typ (Union aller ~60 Schlüssel) und `translations: Record<Locale, Record<TranslationKey, string>>` mit allen de / en-GB / fr Strings
- [ ] 1.2 `game-web/src/i18n/LanguageContext.tsx` erstellen — `LanguageContext`, `LanguageProvider` (liest/schreibt `localStorage` unter `pvm-language`, Default `'de'`)
- [ ] 1.3 `game-web/src/i18n/useTranslation.ts` erstellen — Hook der `{ t, language, setLanguage }` zurückgibt

## 2. Provider in App integrieren

- [ ] 2.1 `LanguageProvider` in `game-web/src/App.tsx` als Wurzel-Wrapper hinzufügen

## 3. Lobby-Strings externalisieren

- [ ] 3.1 `LobbyScreen.tsx`: alle hardcodierten Strings durch `t('...')`-Aufrufe ersetzen
- [ ] 3.2 Sprachauswahl-UI in `LobbyScreen.tsx` einbauen — drei Buttons DE / EN / FR, aktive Sprache visuell hervorgehoben, rufen `setLanguage` auf

## 4. Dialog-Strings externalisieren

- [ ] 4.1 `CharacterTakePreviewDialog.tsx`: Titel, Button-Labels durch `t()`
- [ ] 4.2 `CharacterReplacementDialog.tsx`: Titel, Beschreibung, Button-Labels durch `t()`
- [ ] 4.3 `CharacterActivationDialog.tsx`: Titel, Abschnittsnamen, Button-Labels durch `t()`
- [ ] 4.4 `ActivatedCharacterDetailView.tsx`: Abschnitts-Überschriften, Labels durch `t()`
- [ ] 4.5 `GameDialog.tsx` / `GameDialogActions.tsx` (falls hardcodierte Strings vorhanden): durch `t()` ersetzen

## 5. Spielfeld-Strings externalisieren

- [ ] 5.1 `CanvasGameBoard.tsx`: alle Buttons, Status-Labels, Fehlermeldungen durch `t()`
- [ ] 5.2 `PlayerStatusBadge.tsx` (falls vorhanden): Labels durch `t()`
- [ ] 5.3 Endscreen-Komponente (Rangliste): „Rang", „Spieler", „Punkte", „(Du)" durch `t()`

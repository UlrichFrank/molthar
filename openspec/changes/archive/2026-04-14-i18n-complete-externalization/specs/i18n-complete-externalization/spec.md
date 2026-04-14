## ADDED Requirements

### Requirement: Alle Komponenten-Dialoge sind i18n-konform
Die Komponenten CharacterSwapDialog, TakeBackPlayedPearlDialog, EndTurnButton, PlayerStatusDialog und DeckReshuffleAnimation SHALL `useTranslation` nutzen und ihre UI-Strings ausschließlich über `t(key)` ausgeben.

#### Scenario: CharacterSwapDialog in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und der Tausch-Dialog öffnet
- **THEN** sind Titel, Beschreibungstext und Abbrechen-Button in der gewählten Sprache

#### Scenario: EndTurnButton in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und der Zug-beenden-Button sichtbar ist
- **THEN** zeigt der Button den übersetzten Text

#### Scenario: PlayerStatusDialog in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und den Status-Dialog öffnet
- **THEN** sind alle Labels (Punkte, Diamanten, Aktive Fähigkeiten, Leer-Zustand) übersetzt

#### Scenario: DeckReshuffleAnimation in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und ein Deck gemischt wird
- **THEN** zeigt die Animation den übersetzten Misch-Text

---

### Requirement: Canvas-Labels sind i18n-konform
Die in `canvasRegions.ts` und `gameRender.ts` verwendeten Labels ('Tauschen', 'Discard Cards', '← Klick zum Nehmen') SHALL von `CanvasGameBoard` als übersetzte Strings übergeben werden. Canvas-Lib-Dateien dürfen keine hardcodierten Strings enthalten.

#### Scenario: Canvas-Button-Labels in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat
- **THEN** zeigen der Perlreihen-Tauschen-Button und der Abwerfen-Button übersetzten Text im Canvas

#### Scenario: Deck-Hover-Hinweis in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und mit der Maus über den Charakterstapel fährt
- **THEN** zeigt der Canvas-Tooltip den übersetzten Klick-Hinweis

---

### Requirement: Fähigkeiten-Texte sind i18n-konform
Die Namen und Beschreibungen aller 13 Charakter-Fähigkeiten in `abilityDisplayMap.ts` SHALL als TranslationKeys strukturiert sein. Komponenten, die Fähigkeiten anzeigen (PlayerStatusDialog, ActivatedCharacterDetailView), SHALL die Keys mit `t()` übersetzen.

#### Scenario: Fähigkeitsname in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und den PlayerStatus-Dialog öffnet
- **THEN** werden alle aktiven Fähigkeiten in der gewählten Sprache angezeigt

#### Scenario: Fähigkeitsbeschreibung in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und den Charakterdetail-View öffnet
- **THEN** werden die Fähigkeitsbeschreibungen (rot/blau) in der gewählten Sprache angezeigt

---

### Requirement: LobbyScreen Session-Info ist i18n-konform
Der Text zur Anzeige einer gespeicherten Session ("Spiel {id} als {name}") und der Fallback-Spielername ("Spieler {n}") in `LobbyScreen.tsx` SHALL TranslationKeys mit Interpolation verwenden.

#### Scenario: Session-Info in nicht-deutscher Sprache
- **WHEN** der Nutzer auf EN oder FR umgestellt hat und eine gespeicherte Session angezeigt wird
- **THEN** ist der Session-Info-Text in der gewählten Sprache

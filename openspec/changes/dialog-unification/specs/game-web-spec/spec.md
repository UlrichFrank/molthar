## ADDED Requirements

### Requirement: Einheitliche Dialog-Abstraktion für Spiel-Dialoge
Das System SHALL eine gemeinsame `GameDialog`-Komponente und `dialogs.css` bereitstellen, die das visuelle Fundament und die Struktur aller Spiel-Dialoge definieren.

#### Scenario: Alle Spiel-Dialoge teilen dasselbe visuelle Thema
- **WHEN** ein Spiel-Dialog gerendert wird (CharacterActivation, CharacterReplacement, DiscardCards, ActivatedCharacterDetailView)
- **THEN** verwendet er `.game-dialog-overlay` als Hintergrund und `.game-dialog` als Modal-Container mit einheitlichem Spielthema (dunkler Hintergrund #1a1a2e, grüner Akzent #16c784)

#### Scenario: GameDialog kapselt Overlay- und Modal-Struktur
- **WHEN** `<GameDialog>` gerendert wird
- **THEN** erzeugt es automatisch den fixed Overlay-Hintergrund und den zentrierten Modal-Container — keine Duplikation dieser Struktur in den konsumierenden Komponenten

#### Scenario: CardPicker kapselt Karten-Auswahl
- **WHEN** ein Dialog Karten zur Auswahl anzeigt (CharacterActivation, DiscardCards)
- **THEN** verwendet er `<CardPicker>` mit `cards`, `selected: Set<number>`, `onToggle`, `getImageSrc`, `getAlt` Props
- **AND** ausgewählte Karten haben einen grünen halbtransparenten Overlay

#### Scenario: GameDialogActions erzwingt konsistentes Button-Layout
- **WHEN** ein Dialog Bestätigen/Abbrechen-Buttons hat
- **THEN** verwendet er `<GameDialogActions>` mit `confirmLabel`, `confirmDisabled`, `onConfirm`, `onCancel` Props
- **AND** der Bestätigen-Button ist grün (deaktiviert: grau), der Abbrechen-Button ist rot

---

### Requirement: dialogs.css als einzige Style-Quelle für Spiel-Dialoge
Das System SHALL eine `game-web/src/styles/dialogs.css` mit semantischen `game-dialog-*` Klassen bereitstellen. Kein Dialog SHALL inline-Tailwind für das visuelle Grundmuster verwenden.

#### Scenario: dialogs.css wird zentral importiert
- **WHEN** `CanvasGameBoard.tsx` geladen wird
- **THEN** ist `dialogs.css` dort importiert — ein einziger Import-Punkt für alle Spiel-Dialog-Styles

#### Scenario: Keine Inline-Tailwind-Duplikation für Overlay und Modal
- **WHEN** der Code von CharacterActivationDialog, CharacterReplacementDialog, DiscardCardsDialog oder ActivatedCharacterDetailView gelesen wird
- **THEN** enthält der JSX keine inline `className`-Strings für Overlay (`fixed inset-0 ...`) oder Modal-Container

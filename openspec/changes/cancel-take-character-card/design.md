## Context

`CharacterReplacementDialog` wird geöffnet wenn das Portal voll ist. Aktuell hat er nur einen „Verwerfen"-Button (`canDiscard`) — kein Abbrechen. Der Dialog kennt seine Quelle (Auslage vs. Stapel) nicht; die Information liegt im `CanvasGameBoard` beim Öffnen des Dialogs.

Der Dialog-State in `DialogContext` enthält `{ type: 'replacement', newCharacter, portalCharacters, canDiscard }`. Das `canDiscard`-Flag steuert bereits ob Verwerfen erlaubt ist — dasselbe Muster eignet sich für `canCancel`.

## Goals / Non-Goals

**Goals:**
- Abbrechen-Button im Austauschdialog, wenn die Quelle eine offen ausliegende Karte ist
- Kein Abbrechen bei blind gezogener Stapelkarte

**Non-Goals:**
- Änderungen am Spielzustand oder an Moves (rein Frontend)
- Änderungen am Vorschau-Dialog `CharacterTakePreviewDialog`

## Decisions

**`canCancel`-Flag im Dialog-State**

`DialogState` erhält ein optionales `canCancel?: boolean` im `replacement`-Typ. `openReplacementDialog` bekommt ein drittes/viertes optionales Argument. Beim Auslage-Klick (Slot ≥ 0) wird `canCancel: true` übergeben; beim Stapel-Klick kein Argument (Default `false`).

Warum nicht einfach `onCancel` direkt: Die Dialog-Logik ist bereits in `DialogContext` zentralisiert; das Flag passt in dieses Muster. `closeDialog` ist bereits vorhanden und kann als `onCancel`-Handler direkt verwendet werden.

**Kein zweistufiger Flow für Auslage + volles Portal**

Alternativ könnte man für Auslagekarten + volles Portal erst den Vorschau-Dialog zeigen und danach den Austauschdialog — das wäre ein Abbrechen schon im Vorschau-Schritt. Das ist aufwendiger und ändert bestehenden Flow stärker. Einfacher: Cancel direkt im Austauschdialog.

## Risks / Trade-offs

- **Bestehende Spec `take-character-card-dialog`** spricht vom „Direkt-Austauschdialog bei belegtem Portal" ohne Vorschau-Schritt. Diese Anforderung bleibt unverändert — nur der Inhalt des Dialogs wird erweitert.
- Kein Risiko für den Spielzustand: Bei Abbrechen wird kein Move gesendet.

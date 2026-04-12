## 1. DialogContext — canCancel-Flag ergänzen

- [x] 1.1 In `DialogContext.tsx`: `replacement`-DialogState um `canCancel?: boolean` erweitern
- [x] 1.2 In `openReplacementDialog`: optionalen `canCancel`-Parameter (Default `false`) entgegennehmen und im State speichern

## 2. CharacterReplacementDialog — Abbrechen-Button

- [x] 2.1 `CharacterReplacementDialog.tsx`: optionale Props `canCancel?: boolean` und `onCancel?: () => void` hinzufügen
- [x] 2.2 Abbrechen-Button rendern wenn `canCancel === true` (analog zum Verwerfen-Button)

## 3. CanvasGameBoard — Aufruf anpassen

- [x] 3.1 Beim Auslage-Klick mit vollem Portal: `openReplacementDialog(newCharacter, portalCharacters, canDiscard, canCancel=true)` übergeben
- [x] 3.2 Beim Stapel-Klick mit vollem Portal: kein `canCancel` übergeben (bleibt `false`)
- [x] 3.3 Im `CharacterReplacementDialog`-Render: `canCancel={dialog.dialog.canCancel}` und `onCancel={dialog.closeDialog}` verdrahten

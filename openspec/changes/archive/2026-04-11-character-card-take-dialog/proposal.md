## Why

Beim Nehmen einer Charakterkarte aus der Auslage oder vom Stapel fehlt bisher eine Bestätigungsvorschau — der Spieler sieht die Karte nicht, bevor sie in seinem Portal landet. Das soll durch einen einheitlichen Dialog behoben werden, der bereits für andere Karteninteraktionen verwendet wird.

## What Changes

- Bevor eine Charakterkarte aus der **Auslage** genommen wird, erscheint ein Vorschau-Dialog, der die Karte vollständig anzeigt (wie in allen anderen Karteninteraktionsdialogen). Der Spieler kann dann bestätigen oder abbrechen.
- Beim Nehmen vom **Stapel** wird im Dialog die Kartenrückseite angezeigt (blind ziehen), außer der Spieler hat die Sonderfähigkeit `previewCharacter`, dann wird die Vorderseite gezeigt.
- Ist das Portal bereits belegt, wird **nur** der Austauschdialog angezeigt (kein separater Vorschau-Schritt). Der Spieler kann dort entweder einen Portal-Slot ersetzen **oder die neue Karte verwerfen** — sie landet dann auf dem Ablagestapel und die Aktion ist beendet.
- **Sonderfall „Blind ziehen + Austauschen":** Muss der Spieler blind eine Karte ziehen und das Portal ist belegt, wird die gezogene Karte im Austauschdialog **offen** dargestellt — der Button zum Verwerfen/Abbrechen ist jedoch deaktiviert (Zwangsaustausch, kein Verwerfen möglich).

## Capabilities

### New Capabilities

- `take-character-card-dialog`: Vorschau- und Bestätigungsdialog beim Nehmen einer Charakterkarte — aus der Auslage (Vorderseite) oder vom Stapel (Rückseite/Vorderseite je nach Fähigkeit), inklusive Verwerfen-Option bei belegtem Portal und Sonderfall Blind-Pflichtaustausch.

### Modified Capabilities

- `canvas-card-interaction`: Der Klick-Flow für das Nehmen einer Charakterkarte ändert sich — es wird nun ein Dialog zwischengeschaltet, bevor der Move ausgelöst wird.

## Impact

- `game-web/src/components/` — Neuer oder erweiterter Dialog für die Charakterkartenauswahl
- `game-web/src/hooks/` — Klick-Handler für „Charakterkarte nehmen" muss den Dialog öffnen statt direkt den Move zu triggern
- Bestehende Dialog-Komponenten (z. B. für Aktivierungsdialoge) als Vorlage/Wiederverwendung
- `shared/src/game/` — Neuer Move oder Erweiterung eines bestehenden Moves zum Verwerfen einer gezogenen Charakterkarte auf den Ablagestapel
- Bestehende Dialog-Komponenten (z. B. für Aktivierungsdialoge) als Vorlage/Wiederverwendung

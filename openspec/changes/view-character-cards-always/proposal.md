## Why

Die eigenen Portalkarten und die offene Charakterauslage sind nur anklickbar, wenn der Spieler am Zug ist und noch Aktionen hat — außerhalb dieser Bedingung passiert beim Klick nichts. Zudem sind gegnerische Portalkarten nur für **direkte Nachbarn** (links/rechts) anklickbar; Spieler in den oberen Zonen (oben-links, oben-rechts) haben keine klickbaren Portalkarten. Spieler können so weder ihre eigenen Portalkarten noch alle gegnerischen Portalkarten oder die Auslagekarten jederzeit anschauen, was unnötig einschränkend ist.

## What Changes

- **Eigene Portalkarten**: Klick öffnet immer eine Detailansicht. Wenn aktiv und Aktionen verbleibend → Aktivierungsdialog (bisheriges Verhalten). Sonst → read-only `ActivatedCharacterDetailView`.
- **Charakterkarten in der Auslage**: Klick öffnet immer eine Vorschau. Wenn aktiv und Aktionen verbleibend → bisheriges Verhalten (Nehmen-Dialog / Austausch). Sonst → read-only Kartenvorschau (`CharacterTakePreviewDialog` ohne Bestätigungs-Button).
- **Gegnerische Portalkarten (alle Zonen)**: `opponent-portal-card`-Regionen werden für ALLE vier Gegnerzonen erstellt, nicht nur für direkte Nachbarn. Irrlicht-Aktivierung bleibt auf direkte Nachbarn beschränkt. Klick auf nicht-Nachbarn → immer read-only Detailansicht.
- Eigene aktivierte Karten sowie gegnerische aktivierte Karten sind bereits immer sichtbar — **keine Änderung** dort erforderlich.

## Capabilities

### New Capabilities

_(keine)_

### Modified Capabilities

- `take-character-card-dialog`: Auslage-Charakterkarten sind auch außerhalb des eigenen Zugs / bei ausgeschöpften Aktionen anklickbar und zeigen eine read-only Vorschau.
- `opponent-portal-interaction`: Eigene Portalkarten verhalten sich analog zu gegnerischen Portalkarten — immer klickbar, read-only Detailansicht wenn keine Aktionen verfügbar.

## Impact

- `game-web/src/lib/canvasRegions.ts`: `buildCanvasRegions` erhält alle Gegner-Portaldaten (nicht nur direkte Nachbarn) und erstellt `opponent-portal-card`-Regionen für alle vier Zonen.
- `game-web/src/components/CanvasGameBoard.tsx`: Click-Handler — `portal-slot` und `auslage-card` (Charakter) aus dem `isActive`-Guard herauslösen; Bedingungslogik aktiv/inaktiv ergänzen.
- `game-web/src/components/CharacterTakePreviewDialog.tsx`: `onConfirm` optional machen; wenn nicht übergeben, wird kein „Nehmen"-Button gezeigt (read-only Modus).
- Kein Backend, keine Spiellogik, keine neuen Komponenten nötig.

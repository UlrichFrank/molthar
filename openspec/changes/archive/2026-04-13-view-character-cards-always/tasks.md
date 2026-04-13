## 1. CharacterTakePreviewDialog — read-only Modus

- [x] 1.1 `onConfirm`-Prop in `CharacterTakePreviewDialogProps` optional machen (`onConfirm?: () => void`)
- [x] 1.2 „Nehmen"-Button nur rendern wenn `onConfirm` definiert; anderenfalls nur „Schließen"-Button anzeigen

## 2. CanvasGameBoard — eigene Portalkarte read-only

- [x] 2.1 State `activeOwnPortalSlot: number | null` hinzufügen (analog zu `activeCharacterIndex`)
- [x] 2.2 Click-Handler: `portal-slot`-Handling aus dem `isActive`-Guard herauslösen — direkt im Haupt-Dispatch vor dem `else if (isActive)`-Zweig behandeln
- [x] 2.3 Bedingung: wenn `isActive && actionCount < maxActions` → `dialog.openActivationDialog` (bisheriges Verhalten); sonst → `setActiveOwnPortalSlot(slotIndex)`
- [x] 2.4 `ActivatedCharacterDetailView` für eigene Portalkarte rendern: `character={me?.portal[activeOwnPortalSlot] ?? null}` mit `rotated={false}`; `onClose={() => setActiveOwnPortalSlot(null)}`
- [x] 2.5 ESC-Key-Handler: `activeOwnPortalSlot` ebenfalls auf `null` setzen wenn Escape gedrückt

## 3. CanvasGameBoard — Auslagekarte read-only

- [x] 3.1 State `previewAuslageCard: CharacterCard | null` hinzufügen
- [x] 3.2 Click-Handler: `auslage-card` (id < 2) — vor dem bestehenden `if (isActive && actionCount < maxActions)`-Zweig prüfen: wenn diese Bedingung NICHT gilt → `setPreviewAuslageCard(characterSlots[id])`; andernfalls bisheriges Verhalten
- [x] 3.3 `CharacterTakePreviewDialog` ohne `onConfirm` rendern wenn `previewAuslageCard !== null`: `card={previewAuslageCard}`, `onCancel={() => setPreviewAuslageCard(null)}`
- [x] 3.4 ESC-Key-Handler: `previewAuslageCard` ebenfalls auf `null` setzen

## 4. canvasRegions / CanvasGameBoard — Portalkarten aller Gegner klickbar (Bugfix)

- [x] 4.1 `buildCanvasRegions` so anpassen, dass `opponent-portal-card`-Regionen für ALLE vier Gegnerzonen erzeugt werden — nicht nur für direkte Nachbarn. Datenquelle: `buildOpponentsArray(G, myPlayerID, ...)` (bereits vorhanden) liefert alle vier Einträge; daraus Portal-Regionen für alle belegten Slots erstellen.
- [x] 4.2 `CanvasGameBoard.tsx`: `buildCanvasRegions`-Aufruf anpassen — alle Opponent-Portal-Daten übergeben (nicht nur `neighborOpponents`). Irrlicht-Aktivierungslogik im Click-Handler bleibt auf direkte Nachbarn (zoneIndex 0 und 3) beschränkt.

## 1. CharacterTakePreviewDialog — read-only Modus

- [ ] 1.1 `onConfirm`-Prop in `CharacterTakePreviewDialogProps` optional machen (`onConfirm?: () => void`)
- [ ] 1.2 „Nehmen"-Button nur rendern wenn `onConfirm` definiert; anderenfalls nur „Schließen"-Button anzeigen

## 2. CanvasGameBoard — eigene Portalkarte read-only

- [ ] 2.1 State `activeOwnPortalSlot: number | null` hinzufügen (analog zu `activeCharacterIndex`)
- [ ] 2.2 Click-Handler: `portal-slot`-Handling aus dem `isActive`-Guard herauslösen — direkt im Haupt-Dispatch vor dem `else if (isActive)`-Zweig behandeln
- [ ] 2.3 Bedingung: wenn `isActive && actionCount < maxActions` → `dialog.openActivationDialog` (bisheriges Verhalten); sonst → `setActiveOwnPortalSlot(slotIndex)`
- [ ] 2.4 `ActivatedCharacterDetailView` für eigene Portalkarte rendern: `character={me?.portal[activeOwnPortalSlot] ?? null}` mit `rotated={false}`; `onClose={() => setActiveOwnPortalSlot(null)}`
- [ ] 2.5 ESC-Key-Handler: `activeOwnPortalSlot` ebenfalls auf `null` setzen wenn Escape gedrückt

## 3. CanvasGameBoard — Auslagekarte read-only

- [ ] 3.1 State `previewAuslageCard: CharacterCard | null` hinzufügen
- [ ] 3.2 Click-Handler: `auslage-card` (id < 2) — vor dem bestehenden `if (isActive && actionCount < maxActions)`-Zweig prüfen: wenn diese Bedingung NICHT gilt → `setPreviewAuslageCard(characterSlots[id])`; andernfalls bisheriges Verhalten
- [ ] 3.3 `CharacterTakePreviewDialog` ohne `onConfirm` rendern wenn `previewAuslageCard !== null`: `card={previewAuslageCard}`, `onCancel={() => setPreviewAuslageCard(null)}`
- [ ] 3.4 ESC-Key-Handler: `previewAuslageCard` ebenfalls auf `null` setzen

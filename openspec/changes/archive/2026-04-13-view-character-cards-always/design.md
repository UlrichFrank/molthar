## Context

In `CanvasGameBoard.tsx` werden Klick-Events auf Regionen dispatcht. Alle nicht-UI-Regionen ausser `activated-character`, `opponent-activated-character` und `opponent-portal-card` landen in `handleCardClick`, der hinter dem `isActive`-Guard steht (Zeile ~442: `} else if (isActive) { handleCardClick(region); }`).

`portal-slot`- und `auslage-card`-Regionen werden **immer** in `canvasRegions.ts` erzeugt — unabhängig von `isActive`. Sie sind hitbar, aber ihre Klicks werden ignoriert wenn `!isActive`.

Bereits implementierte read-only Views:
- `ActivatedCharacterDetailView`: zeigt `ActivatedCharacter` (Karte + Fähigkeiten + Stats). Wird für eigene und gegnerische aktivierte Karten sowie gegnerische Portalkarten genutzt.
- `CharacterTakePreviewDialog`: zeigt Karten-Vorderseite / Rückseite mit „Nehmen"- und „Abbrechen"-Button. Wird als Vorschau vor dem Take-Move genutzt.

## Goals / Non-Goals

**Goals:**
- `portal-slot` und `auslage-card` (Charakter) immer klickbar
- Wenn aktiv + Aktionen vorhanden → bisheriges Verhalten unverändert
- Wenn inaktiv oder Aktionen ausgeschöpft → read-only Ansicht
- `opponent-portal-card`-Regionen für ALLE vier Gegnerzonen (nicht nur direkte Nachbarn)

**Non-Goals:**
- Aktivierte Karten (own/opponent) — bereits ok, kein Eingriff
- Perlkarten in der Auslage — kein Vorschau-Bedarf
- Mobile-/Touch-spezifisches Verhalten

## Decisions

**Decision: `portal-slot` read-only → `ActivatedCharacterDetailView`**

Portal-Einträge sind bereits `ActivatedCharacter`-Objekte. Die `ActivatedCharacterDetailView` akzeptiert genau diesen Typ und zeigt dieselbe Detailansicht wie für gegnerische Portalkarten. Kein neues UI nötig.

State: neues `activeOwnPortalCard: number | null` (slotIndex), analog zu `activeCharacterIndex`.

**Decision: `auslage-card` read-only → `CharacterTakePreviewDialog` ohne `onConfirm`**

`CharacterTakePreviewDialog` erhält `onConfirm` als optionales Prop. Wenn nicht übergeben, rendert `GameDialogActions` nur den „Schließen"-Button (kein „Nehmen"). Dadurch keine neue Komponente nötig, und das visuelle Erscheinungsbild bleibt identisch.

**Decision: Bedingung im Click-Handler, nicht in canvasRegions**

Die Regionen existieren bereits immer. Die Logik „aktiv + Aktionen → Aktion, sonst → Vorschau" gehört in den Click-Handler, nicht in die Region-Erzeugung. Dadurch bleibt `canvasRegions.ts` unverändert.

**Decision: `opponent-portal-card` für alle Zonen via separater `allOpponents`-Parameter**

`buildCanvasRegions` erhält zusätzlich zu `neighborOpponents` (für irrlicht-`enabled`-Logik) einen `allOpponentPortals`-Parameter mit Portal-Daten aller vier Zonen. Die Regionen werden für alle belegten Slots erzeugt. Im Click-Handler prüft der bestehende Irrlicht-Guard (`isNeighbor && isIrrlicht && isActive && actionsRemaining`), ob Aktivierung möglich ist; andernfalls öffnet sich immer die read-only Ansicht.

Alternativ: `neighborOpponents` zu `allOpponentPortals: Array<{playerId, portal, zoneIndex} | null>` erweitern (4 Einträge statt 2) — einfacher zu übergeben, `enabled` für irrlicht-Aktivierung wird nur für zoneIndex 0 und 3 gesetzt.

## Risks / Trade-offs

- **`portal-slot` außerhalb von `handleCardClick`**: `portal-slot` wird aus dem `isActive`-Block herausgezogen und direkt im Haupt-Dispatch behandelt — analog zu `opponent-portal-card`. Der `handleCardClick`-Zweig für `portal-slot` bleibt für den aktiven Fall bestehen.
- **`auslage-card` außerhalb von `handleCardClick`**: Nur der Charakter-Slot (id < 2). Perlkarten (id ≥ 2) bleiben in `handleCardClick` (kein read-only Vorschau-Bedarf).
- **`allOpponentPortals` statt nur `neighborOpponents`**: `buildOpponentsArray` (bereits vorhanden) liefert alle 4 Zonen; daraus lassen sich sowohl Portal- als auch Irrlicht-Regionen ableiten. `neighborOpponents` könnte entfallen oder als abgeleitete Subset-Sicht bleiben.

## Why

Diamanten werden aktuell als abstrakter Zähler (`player.diamonds: number`) gespeichert — eine Vereinfachung, die nicht der Originalmechanik entspricht. Im physischen Spiel sind Diamanten verdeckte Charakterkarten vom Nachziehstapel. Diese Änderung korrigiert die Repräsentation und ermöglicht korrekte Spielmechanik, da die Karten den Stapel beeinflussen und bei Ausgabe zurückkehren.

## What Changes

- `shared/src/game/types.ts`: `PlayerState.diamonds: number` → `PlayerState.diamondCards: CharacterCard[]`
- `shared/src/game/index.ts`: Alle Stellen wo Diamanten erworben oder ausgegeben werden, auf die neue Repräsentation umstellen
- Alle UI-Komponenten: `diamonds`-Prop durch `diamondCards.length` ersetzen (Anzeige bleibt numerisch)
- `fix-diamond-cost-payment` (bestehender Change): baut nach diesem Change auf `diamondCards.length` statt `diamonds` auf

**Mechanik-Details:**
- Erwerb (`diamondsReward`): N Karten vom `characterDeck` ziehen → `player.diamondCards[]`
- Ausgabe (`decreaseWithPearl`, `diamond`-Kostenkomponente): Karte aus `player.diamondCards` entfernen → `characterDiscardPile`
- `tradeTwoForDiamond`: 2er-Perle abgeben, 1 Karte vom `characterDeck` ziehen → `player.diamondCards[]`

## Capabilities

### New Capabilities

- `diamonds-as-character-cards`: Diamanten werden als Liste verdeckter Charakterkarten (`CharacterCard[]`) gespeichert und verwaltet — mit korrektem Fluss aus dem und zurück in den Charakterstapel

### Modified Capabilities

- `character-activation-dialog-responsive-sizing`: Dialog übergibt `diamondCards.length` statt `diamonds` (strukturelle Anpassung, kein Anforderungswandel)

## Impact

- `shared/src/game/types.ts` — **BREAKING**: `PlayerState.diamonds` entfernt, `PlayerState.diamondCards` hinzugefügt
- `shared/src/game/index.ts` — Game-Logic für alle Diamond-Operationen
- `game-web/src/components/PlayerStatusBadge.tsx` — Anzeige
- `game-web/src/components/PlayerStatusDialog.tsx` — Anzeige
- `game-web/src/components/CharacterActivationDialog.tsx` — Prop-Übergabe
- `game-web/src/components/EndgameResultsDialog.tsx` — prüfen ob diamonds relevant
- `game-web/src/components/ActivatedCharacterDetailView.tsx` — prüfen ob diamonds relevant
- `openspec/changes/fix-diamond-cost-payment` — Tasks müssen auf neue API aktualisiert werden

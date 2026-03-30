## Why

Die Ability `tradeTwoForDiamond` erlaubt es, eine 2-Perle gegen einen Diamanten zu tauschen. Der bestehende standalone-Move `tradeForDiamond` macht den Tausch dauerhaft und außerhalb des Aktivierungs-Flows. Die gewünschte UX ist eine andere: Der Tausch soll **im** `CharacterActivationDialog` stattfinden — die Charakterkarte mit der Ability ist dort selektierbar und erhöht den im Dialog sichtbaren Diamanten-Count vorübergehend um 1. Dieser virtuelle Diamant kann dann für `decreaseWithPearl` oder zur Deckung von Diamant-Kosten genutzt werden.

## What Changes

- `PaymentSelection` erhält einen neuen Quelltyp `source: 'trade'` mit `characterId` (die Charakterkarte mit `tradeTwoForDiamond`) und `handCardIndex` (die 2-Perle).
- In `activatePortalCard` und `activateSharedCharacter`: Verarbeitung von `source: 'trade'` — die 2-Perle wird konsumiert, die effektiven Diamanten für die Kostenvalidierung werden um 1 erhöht.
- Im `CharacterActivationDialog`: Die Charakterkarte mit `tradeTwoForDiamond` erscheint in der Fähigkeiten-Sektion mit einem Toggle-Button.
  - Toggle ON: erste verfügbare unselektierte 2-Perle aus der Hand wird als "zu tauschen" markiert, `virtualDiamonds += 1`.
  - Toggle OFF: 2-Perle freigegeben, `virtualDiamonds -= 1`.
  - Toggle ist deaktiviert wenn keine 2-Perle in der Hand verfügbar ist.
- `virtualDiamonds` im Dialog-State addiert sich zu `diamonds` für `isValidPayment` und für `decreaseWithPearl`-Verfügbarkeit.
- Beim Absenden der Aktivierung: `{ source: 'trade', characterId, handCardIndex }` wird zu `allSelections` hinzugefügt.

## Capabilities

### New Capabilities

- `trade-two-for-diamond-payment`: Neues `PaymentSelection`-Quellformat `source: 'trade'` — Backend-Validierung und Ausführung des Tauschs innerhalb von `activatePortalCard`.
- `trade-two-for-diamond-dialog-ui`: UI-Integration im `CharacterActivationDialog` — Toggle-Button mit virtueller Diamanten-Anzeige.

### Modified Capabilities

*(keine bestehenden Spec-Capabilities betroffen)*

## Impact

- `shared/src/game/types.ts` — `PaymentSelection.source` um `'trade'` erweitern; Felder dokumentieren
- `shared/src/game/index.ts` — `activatePortalCard` + `activateSharedCharacter`: `source === 'trade'` verarbeiten
- `game-web/src/components/CharacterActivationDialog.tsx` — `tradeTwoForDiamond` in `PAYMENT_ABILITY_TYPES`, Toggle-Button, `virtualDiamonds`-State, Trade-Selection in `allSelections`

## 1. Komponente extrahieren

- [x] 1.1 `game-web/src/components/CharacterAbilityList.tsx` erstellen: Props `card: CharacterCard`, rendert rote/blaue Fähigkeiten analog zu `ActivatedCharacterDetailView`, gibt `null` zurück wenn `abilities.length === 0`
- [x] 1.2 `ActivatedCharacterDetailView.tsx` auf `CharacterAbilityList` umstellen (bestehenden Fähigkeiten-Block durch Komponente ersetzen)

## 2. Dialoge anpassen

- [x] 2.1 `CharacterActivationDialog.tsx` — `CharacterAbilityList` unterhalb des Kartenbilds der zu aktivierenden Karte einfügen
- [x] 2.2 `CharacterReplacementDialog.tsx` — `CharacterAbilityList` für die angezeigte Karte einfügen
- [x] 2.3 `CharacterSwapDialog.tsx` — `CharacterAbilityList` für die Portal-Karte einfügen
- [x] 2.4 `CharacterTakePreviewDialog.tsx` — `CharacterAbilityList` für die Vorschau-Karte einfügen
- [x] 2.5 `DiscardOpponentCharacterDialog.tsx` — `CharacterAbilityList` pro auswählbarer Karte einfügen

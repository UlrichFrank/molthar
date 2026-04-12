## Context

`getAbilityDisplay(type)` gibt `{ symbol, name }` zurück. `ActivatedCharacterDetailView` rendert `ability.description` (immer `''`). Diese beiden Systeme sind nicht verbunden — das Display-Mapping hat kein Freitext-Feld, die Kartendaten haben keinen Inhalt.

Der Test `abilityDisplayMap.test.ts` prüft nur blaue Fähigkeiten; rote Typen (`threeExtraActions`, `nextPlayerOneExtraAction` etc.) sind bewusst ausgelassen und geben den Fallback `{ symbol: '★', name: type }` zurück.

## Goals / Non-Goals

**Goals:**
- Alle 17 Ability-Typen haben einen deutschen Erklärungstext in `abilityDisplayMap`
- `ActivatedCharacterDetailView` zeigt diesen Text statt des leeren `ability.description`

**Non-Goals:**
- Änderung der Kartendatenbank oder des `description`-Felds in `CharacterAbility`
- Andere Dialoge (`CharacterActivationDialog`, `CharacterTakePreviewDialog`) bleiben unverändert

## Decisions

**Mapping statt Datenbankfeld**

Die Fähigkeitstexte werden im Frontend-Mapping gepflegt, nicht in der Kartendatenbank. Gründe: die Datenbank hat kein zentrales Beschreibungsformat, und der Text ist pro Ability-Typ einheitlich (nicht pro Karte individuell). Das Mapping ist einfacher zu warten und typsicher.

**Fallback-Strategie**

`getAbilityDisplay` gibt für unbekannte Typen weiterhin `{ symbol: '★', name: type, description: '' }` zurück. `ActivatedCharacterDetailView` rendert den Description-Text nur wenn er nicht leer ist — kein sichtbarer Regressionsfall für neue Ability-Typen.

## Beschreibungstexte (alle Typen)

| Typ | Beschreibung |
|-----|-------------|
| `threeExtraActions` | Sofort: +3 Aktionen in diesem Zug |
| `nextPlayerOneExtraAction` | Der nächste Spieler erhält +1 Aktion in seinem Zug |
| `discardOpponentCharacter` | Sofort: Entferne eine Portalkarte eines Gegners |
| `stealOpponentHandCard` | Sofort: Nimm eine Handkarte eines Gegners |
| `takeBackPlayedPearl` | Sofort: Nimm deine zuletzt gespielte Perlenkarte zurück auf die Hand |
| `handLimitPlusOne` | Dauerhaft: Dein Handlimit erhöht sich um 1 |
| `oneExtraActionPerTurn` | Dauerhaft: Du erhältst jede Runde +1 Aktion |
| `onesCanBeEights` | Dauerhaft: 1er-Perlenkarten zählen bei Kosten als 8 |
| `threesCanBeAny` | Dauerhaft: 3er-Perlenkarten zählen bei Kosten als beliebiger Wert |
| `decreaseWithPearl` | Dauerhaft: Gib 1 Diamant aus um den Wert einer Perlenkarte um 1 zu senken |
| `changeCharacterActions` | Dauerhaft: Tausche vor deiner 1. Aktion eine Portalkarte aus |
| `changeHandActions` | Dauerhaft: Nimm nach deiner letzten Aktion deine Hand neu auf |
| `previewCharacter` | Dauerhaft: Sieh vor deiner 1. Aktion die oberste Karte des Charakterstapels an |
| `tradeTwoForDiamond` | Dauerhaft: Tausche bei der Aktivierung eine 2er-Perle gegen 1 Diamant |
| `numberAdditionalCardActions` | Dauerhaft: Diese Karte hat einen aufgedruckten Perlenwert der bei Kosten mitgezählt wird |
| `anyAdditionalCardActions` | Dauerhaft: Diese Karte hat einen aufgedruckten Wildcard-Perlenwert |
| `irrlicht` | Dauerhaft: Direkte Nachbarn können diese Karte mitaktivieren |

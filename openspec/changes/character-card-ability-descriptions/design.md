## Context

`ActivatedCharacterDetailView` zeigt bereits den vollständigen Fähigkeiten-Block (rote/blaue Trennung, Name, Beschreibungstext via `getAbilityDisplay` + i18n). Dieser Block ist inline in der Komponente. Die übrigen Dialoge zeigen Charakterkarten ohne jegliche Fähigkeitsinformation.

## Goals / Non-Goals

**Goals:**
- Fähigkeiten-Block aus `ActivatedCharacterDetailView` in eine eigene Komponente `CharacterAbilityList` extrahieren
- Alle fünf betroffenen Dialoge nutzen die neue Komponente

**Non-Goals:**
- Änderung des visuellen Stils des bestehenden Fähigkeiten-Blocks
- i18n-Ergänzungen (alle Keys existieren bereits in `abilityDisplayMap`)
- Karten ohne Fähigkeiten (`abilities.length === 0`) rendern nichts — kein Leertext nötig

## Decisions

**Extraktion in `CharacterAbilityList`**

Props: `card: CharacterCard`. Die Komponente rendert identisch zum bestehenden Block in `ActivatedCharacterDetailView` (rote/blaue Trennung, `getAbilityDisplay`, `t(display.descriptionKey)`). Kein optionaler Conditional — die Komponente rendert `null` wenn `card.abilities.length === 0`.

**`DiscardOpponentCharacterDialog` — Fähigkeiten pro Karte**

Der Dialog zeigt mehrere Portal-Einträge (Liste). Jede Karte bekommt ihren eigenen `CharacterAbilityList`-Block direkt unter dem Kartenbild — aufklappbar oder inline je nach verfügbarem Platz. Inline ist einfacher und konsistent mit den anderen Dialogen.

**`CharacterActivationDialog` — Position**

Der Fähigkeiten-Block wird unterhalb des Kartenbilds der zu aktivierenden Karte platziert (nicht bei den payment-relevanten activated characters, die bereits ihre eigene Darstellung haben).

## Risks / Trade-offs

- [Platzbedarf] Dialoge mit langen Fähigkeitsbeschreibungen werden länger. → Kein explizites Fix nötig — `GameDialog` ist scrollbar.
- [DiscardOpponentCharacterDialog mit vielen Karten] Mehrere Karten × mehrere Fähigkeiten kann lang werden. → Akzeptiert; der Dialog ist selten und die Information ist wertvoll.

## 1. abilityDisplayMap — description-Feld ergänzen

- [ ] 1.1 `AbilityDisplayInfo`-Interface: optionales `description?: string`-Feld hinzufügen
- [ ] 1.2 Alle bestehenden blauen Einträge in `ABILITY_MAP` um `description` ergänzen (Texte aus design.md)
- [ ] 1.3 Fehlende rote Ability-Typen in `ABILITY_MAP` eintragen: `threeExtraActions`, `nextPlayerOneExtraAction`, `discardOpponentCharacter`, `stealOpponentHandCard`, `takeBackPlayedPearl` — jeweils mit `symbol`, `name` und `description`
- [ ] 1.4 Fallback in `getAbilityDisplay`: `description: ''` im Fallback-Objekt ergänzen

## 2. ActivatedCharacterDetailView — Beschreibung anzeigen

- [ ] 2.1 Import von `getAbilityDisplay` aus `'../lib/abilityDisplayMap'` hinzufügen
- [ ] 2.2 In den Ability-Renderschleifen (rot und blau): `{ability.description}` ersetzen durch `{getAbilityDisplay(ability.type).description}` — und nur rendern wenn der Text nicht leer ist

## 3. Tests — abilityDisplayMap aktualisieren

- [ ] 3.1 Bestehenden Test „provides symbol and name for all known blue ability types": um Prüfung von `display.description` erweitern (nicht leer)
- [ ] 3.2 Neuen Test hinzufügen: alle roten Ability-Typen haben `symbol`, `name` und `description`
- [ ] 3.3 Fallback-Test aktualisieren: `display.description` ist `''` für unbekannte Typen

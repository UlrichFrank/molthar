## Context

Das Projekt nutzt ein eigenes i18n-System in `game-web/src/i18n/`:
- `translations.ts` — Record aller Strings, typisiert via `TranslationKey` Union
- `LanguageContext.tsx` — React Context, stellt `{ t, language, setLanguage }` bereit
- `useTranslation.ts` — Hook für Komponenten

Viele Komponenten wurden nach der Einführung dieses Systems (Feature `i18n-language-selection`) nicht nachgezogen. Besonders Canvas-Lib-Dateien (`canvasRegions.ts`, `gameRender.ts`) haben keinen React-Kontext-Zugang und müssen über Parameter versorgt werden. `abilityDisplayMap.ts` ist eine reine Lookup-Map ohne i18n-Anbindung.

## Goals / Non-Goals

**Goals:**
- Alle sichtbaren UI-Strings reagieren auf den Sprachwechsel
- Kein hardcoded String in Komponenten-JSX oder Canvas-`fillText`-Aufrufen
- Konsistenz: keine gemischten DE/EN-Strings mehr
- `translations.ts` ist die einzige Quelle für übersetzte Strings

**Non-Goals:**
- Kein neues i18n-Framework (kein i18next, kein react-intl)
- Keine Übersetzung von technischen Logs, console.error-Meldungen
- Keine Übersetzung von Kartennamen (Eigennamen, keine UI-Strings)
- Keine Pluralisierungs-Library — einfache Singular/Plural-Keys reichen

## Decisions

### Entscheidung 1: Canvas-Strings als übersetzte Labels in CanvasGameBoard übergeben

`canvasRegions.ts` und `gameRender.ts` sind reine Funktionen ohne React-Kontext-Zugang. Zwei Alternativen:

- **Option A**: Strings als Parameter übergeben — `CanvasGameBoard` übersetzt und reicht durch.
- **Option B**: Modul-globale Variable oder Callback-Setter — unüblich, schwer testbar.

**Gewählt: Option A.** `CanvasGameBoard` nutzt `useTranslation` bereits. Die Funktionen erhalten einen optionalen `labels`-Parameter. Typen bleiben einfach.

### Entscheidung 2: abilityDisplayMap gibt TranslationKeys zurück statt fertiger Strings

Optionen:
- **Option A**: Map gibt `{ nameKey: TranslationKey, descriptionKey: TranslationKey }` zurück — Komponenten rufen `t(key)` auf.
- **Option B**: `getAbilityDisplay` bekommt `t` als Parameter — Map gibt fertige Strings.
- **Option C**: Neue TranslationKeys für alle 26 Ability-Strings (13 × name + 13 × description).

**Gewählt: Option A + C kombiniert.** Die Map enthält weiterhin `symbol`, aber `name` und `description` werden zu Keys (`ability.<type>.name`, `ability.<type>.description`). Die Komponenten kennen bereits `t()` und rufen es direkt auf. Kein API-Bruch für `symbol`.

### Entscheidung 3: ErrorBoundary ohne React-Kontext-Zugang

`ErrorBoundary` ist eine Class-Component; `useTranslation` (Hook) ist nicht nutzbar. Optionen:
- **Option A**: Auf `LanguageContext.Consumer` umstellen (Render-Prop).
- **Option B**: Strings hardcoded lassen, aber auf Englisch vereinheitlichen (akzeptables Fallback).
- **Option C**: In eine Functional Component umbauen.

**Gewählt: Option B** — Ein Error-Boundary-Fehlerscreen ist ein Ausnahmezustand; der Overhead eines Consumer-Wrappings lohnt nicht. Strings werden auf Englisch vereinheitlicht und als Kommentar markiert.

## Risks / Trade-offs

- **[Risiko] Fehlende Übersetzung für neue Keys** → Mitigation: TypeScript-Compilecheck durch `Record<TranslationKey, string>` — jede Sprache muss alle Keys implementieren, sonst Fehler.
- **[Trade-off] 26 neue Ability-Keys erhöhen translations.ts-Größe erheblich** → Akzeptabel, da TypeScript-Typ-Sicherheit die Wartbarkeit kompensiert.
- **[Risiko] Canvas-Label-Parameter-Kette wird tief** → Mitigation: Ein einzelnes `canvasLabels`-Objekt statt vieler Einzelparameter.

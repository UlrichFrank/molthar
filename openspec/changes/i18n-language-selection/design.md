## Context

Die UI enthält derzeit ~60 hardcodierte deutsche und englische Strings, verteilt auf Lobby, Dialoge, Spielfeld-Komponenten und Endscreen. Es gibt kein bestehendes Übersetzungssystem. Die Ziel-Locales sind `de` (Standard), `en-GB` und `fr`.

## Goals / Non-Goals

**Goals:**
- Alle user-sichtbaren Strings aus den Komponenten in eine zentrale Übersetzungsdatei auslagern
- Sprachauswahl in der Lobby (persistent via `localStorage`)
- TypeScript-sichere Schlüssel (kein freies `t('anything')`)
- Kein externer Library-Overhead — schlanke Eigenimplementierung

**Non-Goals:**
- Pluralisierung, Zahlenformatierung, Datumsformatierung
- Server-seitige Übersetzungen (keine Backend-Änderungen)
- Dynamisch nachladen von Sprachpaketen (alle 3 Locales werden gebündelt)
- RTL-Sprachen
- Automatische Spracherkennung via Browser-Header

## Decisions

### 1. Keine externe i18n-Library

**Entscheidung:** Eigene schlanke Implementierung statt `react-i18next`, `lingui` o. ä.

**Rationale:** Die Anwendung ist ein Spiel mit ~60 statischen Strings ohne Pluralisierungs- oder Formatierungskomplexität. Eine Drittbibliothek würde Bundelgröße, Konfigurationsaufwand und API-Komplexität erhöhen, ohne Mehrwert zu bieten.

**Alternative betrachtet:** `react-i18next` — mächtig, aber für diesen Use-Case massiv überdimensioniert.

---

### 2. Dateistruktur

```
game-web/src/i18n/
  translations.ts       # Record<Locale, Record<TranslationKey, string>>
  useTranslation.ts     # Hook: { t, language, setLanguage }
  LanguageContext.tsx   # React Context + Provider
```

**Rationale:** Zentraler Ort, klar voneinander getrennte Verantwortlichkeiten. Kein Verzeichnisbaum pro Locale (unnötig bei dieser Größe).

---

### 3. Typsichere Schlüssel

```typescript
export type TranslationKey =
  | 'lobby.enterName'
  | 'lobby.createGame'
  | 'dialog.confirm'
  | 'dialog.cancel'
  // ...alle ~60 Schlüssel
  ;
```

`t(key: TranslationKey): string` — TypeScript verhindert ungültige Schlüssel zur Compilezeit.

**Rationale:** Tippfehler in Schlüsseln werden sofort erkannt, kein Runtime-Fallback notwendig.

---

### 4. Locale-Typ und Default

```typescript
export type Locale = 'de' | 'en-GB' | 'fr';
export const DEFAULT_LOCALE: Locale = 'de';
```

`localStorage`-Schlüssel: `pvm-language`

Beim Start: `localStorage.getItem('pvm-language')` → validieren → setzen oder auf `'de'` fallen.

---

### 5. Sprachauswahl-UI

**Entscheidung:** Drei Text-Buttons (`DE` / `EN` / `FR`) im Lobby-Header.

**Rationale:** Einfach zu implementieren, kein Icon-Asset benötigt, auf Mobilgeräten gut bedienbar.

**Alternative betrachtet:** Flaggen-Buttons — intuitiver, aber erfordern Assets oder Emoji (inkonsistent). Dropdown — kompakter, aber mehr Klicks.

---

### 6. Provider-Platzierung

`LanguageProvider` wrапpt die gesamte App in `App.tsx`, damit alle Komponenten (Lobby, Spielfeld, Dialoge) Zugriff haben.

## Risks / Trade-offs

- **Übersetzungsqualität** → Übersetzungen werden manuell gepflegt; Fehler fallen erst bei manuellem Review auf. Mitigation: alle drei Locales in einer Datei — Diff zeigt fehlende Einträge sofort.
- **Schlüsselwachstum** → Neue Komponenten müssen Strings konsequent externalisieren. Mitigation: TypeScript-Fehler bei fehlendem Schlüssel.
- **Bundle-Größe** → Alle drei Sprachpakete werden gebündelt (~3–5 KB unkomprimiert). Kein Problem bei dieser Größe.
- **Fehlende Fallback-Sprache** → Wenn ein Schlüssel in einer Locale fehlt, gibt `t()` den Schlüssel selbst zurück (sichtbarer Fehler statt Absturz). Mitigation: Vollständiges `de`-Paket als Referenz, TypeScript erzwingt Vollständigkeit aller drei Locales.

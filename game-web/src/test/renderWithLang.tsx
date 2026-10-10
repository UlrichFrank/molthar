import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { LanguageProvider } from '../i18n/LanguageContext';

/** render() inside the language provider — components resolve texts via t(). */
export function renderWithLang(ui: ReactElement) {
  return render(ui, { wrapper: LanguageProvider });
}

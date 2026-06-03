import 'server-only';
import fs from 'fs';
import path from 'path';
import { defaultLocale } from './i18n';

const LANG_DIR = path.join(process.cwd(), 'lang');

export function getSupportedLocales(): string[] {
  try {
    return fs
      .readdirSync(LANG_DIR, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name.replace(/\.json$/, ''))
      .sort((left, right) => {
        if (left === defaultLocale) return -1;
        if (right === defaultLocale) return 1;
        return left.localeCompare(right);
      });
  } catch {
    return [defaultLocale];
  }
}

export function isSupportedLocale(locale: string, locales = getSupportedLocales()): boolean {
  return locales.includes(locale);
}

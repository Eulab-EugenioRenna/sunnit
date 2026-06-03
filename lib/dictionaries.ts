import 'server-only';
import { defaultLocale } from './i18n';
import { getSupportedLocales, isSupportedLocale } from './i18n-server';

export const getAvailableLocales = (): string[] => {
  return getSupportedLocales();
};

export const getDictionary = async (locale: string) => {
  try {
    const normalizedLocale = isSupportedLocale(locale) ? locale : defaultLocale;

    return (await import(`../lang/${normalizedLocale}.json`)).default;
  } catch (e) {
    return (await import(`../lang/${defaultLocale}.json`)).default;
  }
};

export type Dictionary = typeof import('../lang/it.json');

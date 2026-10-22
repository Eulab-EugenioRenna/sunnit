import 'server-only';
import { defaultLocale } from './i18n';
import { getEcosystemPageContent } from './sanity/ecosystem';
import { getSupportedLocales, isSupportedLocale } from './i18n-server';

export const getAvailableLocales = (): string[] => {
  return getSupportedLocales();
};

export const getDictionary = async (locale: string) => {
  try {
    const normalizedLocale = isSupportedLocale(locale) ? locale : defaultLocale;

    const dictionary = (await import(`../lang/${normalizedLocale}.json`)).default;
    if (process.env.ECOSYSTEM_CONTENT_SOURCE !== 'sanity') return dictionary;
    const { copy } = await getEcosystemPageContent(normalizedLocale);
    return { ...dictionary, common: { ...dictionary.common, header: { ...dictionary.common.header, ecosystem: copy.nav } } };
  } catch (e) {
    return (await import(`../lang/${defaultLocale}.json`)).default;
  }
};

export type Dictionary = typeof import('../lang/it.json');

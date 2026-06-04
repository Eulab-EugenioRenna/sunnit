export const defaultLocale = 'it';

const domainLocaleMap: Record<string, string> = {
  'sunnit.it': 'it',
  'www.sunnit.it': 'it',
  'sunnitspain.es': 'es',
  'www.sunnitspain.es': 'es',
  'sunnit.co.uk': 'en',
  'www.sunnit.co.uk': 'en',
  'sunnit.eu': 'en',
  'www.sunnit.eu': 'en',
};

function normalizeHostname(hostname: string): string {
  return hostname.split(',')[0]?.trim().toLowerCase().replace(/:\d+$/, '') || '';
}

export function getLocaleFromHostname(hostname: string, supportedLocales: string[]): string | null {
  const normalizedHostname = normalizeHostname(hostname);

  if (!normalizedHostname) {
    return null;
  }

  const mappedLocale = domainLocaleMap[normalizedHostname];

  if (mappedLocale && supportedLocales.includes(mappedLocale)) {
    return mappedLocale;
  }

  return null;
}

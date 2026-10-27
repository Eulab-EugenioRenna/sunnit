export const defaultLocale = 'it';

export const canonicalOrigins: Record<string, string> = {
  it: "https://sunnit.it",
  es: "https://sunnitspain.es",
  en: "https://sunnit.eu",
};

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

export function normalizeHostname(hostname: string): string {
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

// Only known production hosts select a canonical origin. Local/preview hosts use IT.
export function getCanonicalOriginForHostname(hostname: string): string {
  return canonicalOrigins[getLocaleFromHostname(hostname, Object.keys(canonicalOrigins)) || defaultLocale];
}
export function getSitemapLocales(hostname: string): string[] {
  const normalized = normalizeHostname(hostname).replace(/^www\./, '');
  if (normalized === 'sunnit.co.uk') return [];
  return [getLocaleFromHostname(hostname, Object.keys(canonicalOrigins)) || defaultLocale];
}

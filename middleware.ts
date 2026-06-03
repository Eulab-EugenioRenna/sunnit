import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { defaultLocale, getLocaleFromHostname } from '@/lib/i18n';

let cachedLocales: string[] | null = null;
let cachedLocalesAt = 0;

async function getSupportedLocalesForMiddleware(request: NextRequest): Promise<string[]> {
  const now = Date.now();

  if (cachedLocales && now - cachedLocalesAt < 60_000) {
    return cachedLocales;
  }

  try {
    const response = await fetch(new URL('/api/locales', request.url), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch locales: ${response.status}`);
    }

    const data = await response.json();
    const locales = Array.isArray(data?.locales)
      ? data.locales.filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
      : [defaultLocale];

    const normalizedLocales = locales.includes(defaultLocale) ? locales : [defaultLocale, ...locales];
    cachedLocales = normalizedLocales;
    cachedLocalesAt = now;
    return normalizedLocales;
  } catch {
    return [defaultLocale];
  }
}

function getPathLocale(pathname: string) {
  const segment = pathname.split('/').filter(Boolean)[0];
  return segment && /^[a-z]{2}$/i.test(segment) ? segment : null;
}

async function getLocale(request: NextRequest, supportedLocales: string[]): Promise<string> {
  const headers = new Headers(request.headers);
  const acceptLanguage = headers.get('accept-language');

  if (!acceptLanguage) {
    return defaultLocale;
  }

  const negotiatorHeaders: Record<string, string> = {
    'accept-language': acceptLanguage,
  };

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return match(languages, supportedLocales, defaultLocale);
  } catch (e) {
    return defaultLocale;
  }
}

function getRequestHostname(request: NextRequest): string {
  return request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
}

export async function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  
  // Exclude static files and API routes
  if (
    pathname.startsWith(`/_next/`) ||
    pathname.includes('/api/') ||
    pathname.match(/\.(.*)$/)
  ) {
    return;
  }

  const supportedLocales = await getSupportedLocalesForMiddleware(request);
  const domainLocale = getLocaleFromHostname(getRequestHostname(request), supportedLocales);

  const pathnameLocale = getPathLocale(pathname);

  if (pathnameLocale) {
    if (supportedLocales.includes(pathnameLocale)) {
      return;
    }

    const segments = pathname.split('/').filter(Boolean);
    segments[0] = domainLocale || defaultLocale;
    request.nextUrl.pathname = `/${segments.join('/')}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // Redirect if there is no locale
  const locale = domainLocale || await getLocale(request, supportedLocales);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
};

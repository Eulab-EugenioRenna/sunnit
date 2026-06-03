import { NextResponse } from 'next/server';
import { defaultLocale } from '@/lib/i18n';
import { getSupportedLocales } from '@/lib/i18n-server';

export function GET() {
  const locales = getSupportedLocales();

  return NextResponse.json({
    locales,
    defaultLocale,
  });
}

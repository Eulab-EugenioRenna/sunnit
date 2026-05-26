import 'server-only';
import fs from 'fs';
import path from 'path';

export const getAvailableLocales = (): string[] => {
  try {
    const langDir = path.join(process.cwd(), 'lang');
    const files = fs.readdirSync(langDir);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch (e) {
    return ['it', 'en'];
  }
};

export const getDictionary = async (locale: string) => {
  try {
    return (await import(`../lang/${locale}.json`)).default;
  } catch (e) {
    return (await import(`../lang/it.json`)).default;
  }
};

export type Dictionary = typeof import('../lang/it.json');

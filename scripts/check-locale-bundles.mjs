import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

// Vercel packages ISR and dynamic routes separately: reading languages from disk
// requires the dictionaries to appear in each route's output-file trace.
const root = process.cwd();
const dictionaries = readdirSync(path.join(root, 'lang')).filter(name => name.endsWith('.json'));
const routes = ['[lang]/page', '[lang]/blog/[slug]/page', '[lang]/portfolio/[slug]/page', 'api/locales/route'];
for (const route of routes) {
  const file = path.join(root, '.next/server/app', `${route}.js.nft.json`);
  const trace = JSON.parse(readFileSync(file, 'utf8'));
  const packaged = new Set(trace.files.map(entry => path.resolve(path.dirname(file), entry)));
  for (const dictionary of dictionaries) {
    assert(packaged.has(path.join(root, 'lang', dictionary)), `${route}: missing lang/${dictionary} from the deployment bundle`);
  }
}
console.log(`Locale deployment bundles verified: ${routes.length} routes include all ${dictionaries.length} dictionaries.`);

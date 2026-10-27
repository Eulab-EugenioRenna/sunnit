import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = process.env.SEO_CHECK_URL || 'http://localhost:3107';
const urls = [];
const domainChecks = [];
function visibleText(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, entity) => {
      if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
      if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
      return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[entity.toLowerCase()];
    }).replace(/\s+/g, ' ').trim();
}
for (const [host, canonicalHost, lang] of [['sunnit.it', 'sunnit.it', 'it'], ['sunnitspain.es', 'sunnitspain.es', 'es'], ['sunnit.eu', 'sunnit.eu', 'en'], ['sunnit.co.uk', 'sunnit.eu', 'en']]) {
  const response = await fetch(`${base}/sitemap.xml`, { headers: { host, "x-forwarded-host": host } });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /xml/);
  const sitemap = await response.text();
  assert.match(sitemap, /<urlset/);
  const items = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll('&amp;', '&'));
  if (host === 'sunnit.co.uk') assert.equal(items.length, 0);
  else {
    assert(items.length >= 13);
    assert(items.every(value => new URL(value).hostname === canonicalHost && new URL(value).pathname.startsWith(`/${lang}`)));
  }
  urls.push(...items);
  const robots = await fetch(`${base}/robots.txt`, { headers: { host, "x-forwarded-host": host } });
  assert.equal(robots.status, 200);
  assert.match(robots.headers.get('content-type') || '', /text\/plain/);
  assert((await robots.text()).includes(`Sitemap: https://${canonicalHost}/sitemap.xml`));
  // The same deployment can serve every language on every host; canonical stays stable.
  for (const [locale, canonical] of [['it', 'sunnit.it'], ['es', 'sunnitspain.es'], ['en', 'sunnit.eu']]) {
    const page = await fetch(`${base}/${locale}/contact`, { headers: { host, 'x-forwarded-host': host, 'user-agent': 'Googlebot' } });
    assert.equal(page.status, 200);
    assert((await page.text()).includes(`rel="canonical" href="https://${canonical}/${locale}/contact"`));
  }
  const root = await fetch(base, { headers: { host, 'x-forwarded-host': host, 'accept-language': 'fr' }, redirect: 'manual' });
  assert([307, 308].includes(root.status));
  assert.equal(new URL(root.headers.get('location'), base).pathname, `/${lang}`);
  domainChecks.push({ host, lang, canonicalHost, sitemapUrlCount: items.length });
}
assert.equal(new Set(urls).size, urls.length, 'No duplicate URLs across domain sitemaps');

for (const canonical of urls) {
  const url = new URL(canonical);
  assert.equal(url.search, '');
  const response = await fetch(`${base}${url.pathname}`, { headers: { host: url.hostname, 'x-forwarded-host': url.hostname, 'user-agent': 'Googlebot' }, redirect: 'manual' });
  assert.equal(response.status, 200, url.pathname);
  const html = await response.text();
  assert(html.includes(`rel="canonical" href="${canonical}"`), `Self canonical: ${canonical}`);
  assert(html.includes(`property="og:url" content="${canonical}"`), `OG URL: ${canonical}`);
  assert.match(html, /<meta name="description" content="[^\"]+"/);
  assert(!/<meta name="robots" content="[^\"]*noindex/.test(html), `Indexable: ${canonical}`);
  const lang = url.pathname.split('/')[1];
  assert(html.includes(`<html lang="${lang}"`), `HTML language: ${canonical}`);
  const schemas = [...html.matchAll(/<script\b(?=[^>]*type="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/g)].map(([, data]) => JSON.parse(data));
  const pageSchema = schemas.find(schema => schema['@id'] === `${canonical}#webpage`);
  assert(pageSchema, `Page schema: ${canonical}`);
  assert.equal(pageSchema.url, canonical);
  assert.equal(pageSchema.inLanguage, lang);
  assert.equal(pageSchema.isPartOf['@id'], 'https://sunnit.it/#website');
  assert.equal(pageSchema.publisher['@id'], 'https://sunnit.it/#organization');
  const text = visibleText(html);
  assert(text.includes(visibleText(pageSchema.name)), `Schema name belongs to actual page content: ${canonical}`);
  assert(text.includes(visibleText(pageSchema.description)), `Schema description belongs to actual page content: ${canonical}`);
  for (const entry of pageSchema.mainEntity?.itemListElement || []) {
    assert(text.includes(visibleText(entry.item.name)), `Schema list item belongs to existing content: ${canonical}`);
    if (entry.item.description) assert(text.includes(visibleText(entry.item.description)), `Schema list description belongs to existing content: ${canonical}`);
  }
  assert(!html.includes('portfolio-detail-links'));
  assert(!html.includes('ecosystem-text-index'));
  assert(!html.includes('Questa è una pratica assolutamente essenziale'));
  const main = html.match(/<main>([\s\S]*?)<\/main>/)?.[1] || html;
  const headings = [...main.matchAll(/<h([1-6])\b/g)].map(match => Number(match[1]));
  let previous = 0;
  for (const level of headings) {
    assert(level <= previous + 1, `Heading hierarchy H${previous} -> H${level}: ${canonical}`);
    previous = level;
  }
  // HTML returned by HTTP contains content without running any page JavaScript.
  assert.match(html, /<h1\b/);
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `Single primary heading: ${canonical}`);
}
for (const path of ['/zz', '/xx/services', '/robots.foo', '/it/seo-missing-page', '/it/services/missing-service', '/it/blog/seo-missing-post', '/it/portfolio/seo-missing-project']) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual' });
  assert.equal(response.status, 404, `Unknown URL: ${path}`);
}
if (process.env.SEO_REPORT_PATH) await writeFile(process.env.SEO_REPORT_PATH, JSON.stringify({
  checkedAt: new Date().toISOString(), environment: 'local production build', base,
  urlCount: urls.length, urls, domainChecks, checks: ['Domain language redirects', 'Canonical stability across all 4 hosts', 'Host-specific sitemap and robots', 'HTTP 200 for each sitemap URL', 'Self canonical', 'Localized HTML', 'Open Graph URL', 'Description present', 'Indexable robots', 'Parseable JSON-LD', 'Page schema matches existing text', 'Website/page/content hierarchy', 'Single H1 and ordered headings', 'H1 present', 'Robots text/plain', 'Sitemap XML MIME type', '7 invalid URLs return 404'],
  excluded: ['Public deployment', 'Browser layout and interactions', 'Rich Results Test', 'CMS mutation/propagation timing', 'Core Web Vitals', 'Search Console indexing'],
}, null, 2) + '\n');
console.log(`SEO HTTP checks passed: ${urls.length} sitemap URLs, robots, metadata, JSON-LD, languages and 404s. No browser JavaScript executed.`);

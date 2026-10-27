import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { parse, evaluate } from 'groq-js';
import { mdxFileToSanityDocument, sanityDocumentToMdx, mdxToSanityFields } from './lib/sanity-content.mjs';

async function contentFixture() {
  const now = new Date('2026-10-27T12:00:00Z');
  const document = { _id: 'post.it', _type: 'blogPost', title: 'Italian article', language: 'it', slug: { current: 'articolo' }, _createdAt: '2026-01-01T00:00:00Z', publishedAt: '2026-01-02T00:00:00Z', body: 'Original', translationKey: 'group-1' };
  const dataset = [
    document,
    { ...document, _id: 'post.en', language: 'en', slug: { current: 'translated-article' } },
    { ...document, _id: 'post.future', slug: { current: 'future' }, publishedAt: '2099-01-01T00:00:00Z' },
    { ...document, _id: 'drafts.post', slug: { current: 'draft' } },
    { ...document, _id: 'post.no-slug', slug: undefined },
    { ...document, _id: 'post.legacy', slug: { current: 'legacy' }, publishedAt: undefined, translationKey: undefined },
  ];
  const requests = [];
  const context = { exports: {}, require(name) {
    assert.equal(name, './client');
    return { sanityFetch: async (query, params) => {
      requests.push({ query, params });
      return (await evaluate(parse(query), { dataset, params, timestamp: now })).get();
    } };
  } };
  const source = await readFile(new URL('../lib/sanity/content.ts', import.meta.url), 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { ...context.exports, requests };
}

test('real GROQ filters exclude drafts, future publication and missing slugs but retain legacy content', async () => {
  const f = await contentFixture();
  assert.deepEqual((await f.getSanityContentList('blogPost', 'it')).map(item => item.slug).sort(), ['articolo', 'legacy']);
  assert.equal(await f.getSanityContent('blogPost', 'it', 'future'), null);
  assert.equal(await f.getSanityContent('blogPost', 'it', 'draft'), null);
  assert.deepEqual((await f.getAllSanitySlugs('blogPost')).map(item => item.slug).sort(), ['articolo', 'legacy', 'translated-article']);
});

test('missing translation stays empty or 404-ready without an Italian retry', async () => {
  const f = await contentFixture();
  assert.deepEqual(await f.getSanityContentList('blogPost', 'es'), []);
  assert.equal(await f.getSanityContent('blogPost', 'es', 'articolo'), null);
  assert.equal(f.requests.length, 2);
  assert(f.requests.every(request => request.params.language === 'es'));
});

test('translation equivalence uses explicit keys and supports distinct slugs', async () => {
  const f = await contentFixture();
  assert.deepEqual((await f.getContentLanguages('blogPost', 'it', 'articolo')).map(item => `${item.language}/${item.slug}`).sort(), ['en/translated-article', 'it/articolo']);
  assert.deepEqual(Array.from(await f.getContentLanguages('blogPost', 'it', 'legacy'), item => `${item.language}/${item.slug}`), ['it/legacy']);
});

test('SEO fields survive MDX roundtrip/import and legacy documents remain valid', async () => {
  const document = { _type: 'blogPost', title: 'Title', excerpt: 'Excerpt', body: 'Body', author: 'Editor', translationKey: 'article-1', contentUpdatedAt: '2026-10-01T00:00:00.000Z', seo: { title: 'SEO title', description: 'SEO description' } };
  const mdx = sanityDocumentToMdx(document);
  const fields = mdxToSanityFields(mdx);
  for (const field of ['author', 'translationKey', 'contentUpdatedAt', 'seo']) assert.deepEqual(fields[field], document[field]);
  const directory = await mkdtemp(path.join(tmpdir(), 'sunnit-seo-'));
  try {
    const filePath = path.join(directory, 'article.mdx');
    await writeFile(filePath, mdx);
    const imported = await mdxFileToSanityDocument({ type: 'blog', language: 'it', slug: 'article', filePath });
    for (const field of ['author', 'translationKey', 'contentUpdatedAt', 'seo']) assert.deepEqual(imported[field], document[field]);
  } finally { await rm(directory, { recursive: true, force: true }); }
  assert.deepEqual(mdxToSanityFields('---\ntitle: Title\nexcerpt: Excerpt\n---\nBody'), { title: 'Title', excerpt: 'Excerpt', body: 'Body' });
});

test('canonical resolver uses the approved domain matrix and JSON-LD escapes script terminators', async () => {
  const domainContext = { exports: {} };
  const domainSource = await readFile(new URL('../lib/i18n.ts', import.meta.url), 'utf8');
  runInNewContext(ts.transpileModule(domainSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, domainContext);
  const context = { exports: {}, URL, require: () => domainContext.exports };
  const source = await readFile(new URL('../lib/seo.ts', import.meta.url), 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const f = context.exports;
  assert.equal(f.pageUrl('es', 'services/cloud'), 'https://sunnitspain.es/es/services/cloud');
  assert.equal(f.pageUrl('en', 'about'), 'https://sunnit.eu/en/about');
  assert.equal(f.pageUrl('it', 'contact'), 'https://sunnit.it/it/contact');
  const domains = domainContext.exports;
  for (const [host, locale] of [['sunnit.it', 'it'], ['www.sunnit.it', 'it'], ['sunnitspain.es', 'es'], ['sunnit.eu', 'en'], ['www.sunnit.co.uk', 'en']]) assert.equal(domains.getLocaleFromHostname(host, ['it', 'es', 'en']), locale);
  assert.equal(domains.getCanonicalOriginForHostname('sunnit.co.uk'), 'https://sunnit.eu');
  assert.equal(domains.getCanonicalOriginForHostname('evil.example'), 'https://sunnit.it');
  assert.equal(domains.getSitemapLocales('sunnit.co.uk').length, 0);
  const dangerous = { headline: '</script><script>alert(1)</script>' };
  assert(!f.jsonLd(dangerous).includes('<'));
  assert.deepEqual(JSON.parse(f.jsonLd(dangerous)), dangerous);
});

async function loadTypeScript(relative, dependencies = {}) {
  const context = { exports: {}, URL, require: name => {
    assert(name in dependencies, `Unexpected dependency ${name}`);
    return dependencies[name];
  } };
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports;
}

test('metadata content comes from the existing localized page content, including editorial updates', async () => {
  const { getPageContent } = await loadTypeScript('../lib/seo-content.ts');
  for (const lang of ['it', 'en', 'es']) {
    const dictionary = JSON.parse(await readFile(new URL(`../lang/${lang}.json`, import.meta.url), 'utf8'));
    for (const page of ['services', 'sunnitai', 'about', 'contact', 'jobs', 'blog']) {
      assert.equal(getPageContent(dictionary, page, lang).name, dictionary[page].hero.title);
    }
    assert.equal(getPageContent(dictionary, 'about', lang).description, dictionary.about.intro.desc);
    dictionary.services.hero.title = 'Edited service page';
    assert.equal(getPageContent(dictionary, 'services', lang).name, 'Edited service page');
  }
});

test('schema connects the actual service to its page, website and organization without invented claims', async () => {
  const domains = await loadTypeScript('../lib/i18n.ts');
  const seo = await loadTypeScript('../lib/seo.ts', { './i18n': domains });
  const schema = await loadTypeScript('../lib/structured-data.ts', { './seo': seo });
  const service = { title: 'Existing service title', summary: 'Existing description', accent: 'cloud' };
  const entity = schema.serviceSchema('es', service, 'cloud');
  const page = schema.webPageSchema({ lang: 'es', path: 'services/cloud', name: service.title, description: service.summary, mainEntity: entity });
  assert.equal(page.url, 'https://sunnitspain.es/es/services/cloud');
  assert.equal(page.mainEntity.name, service.title);
  assert.equal(page.mainEntity.description, service.summary);
  assert.equal(page.mainEntity.mainEntityOfPage['@id'], page['@id']);
  assert.equal(page.isPartOf['@id'], 'https://sunnit.it/#website');
  assert.equal(page.mainEntity.provider['@id'], 'https://sunnit.it/#organization');
  assert(!('offers' in entity));
  assert(!('aggregateRating' in entity));
  assert.equal(schema.itemListSchema([entity]).numberOfItems, 1);
});

test('real MDX rendering preserves body text and puts its headings below the page H1 without skipping levels', async () => {
  const { normalizeMdxHeadings } = await loadTypeScript('../lib/mdx-headings.ts');
  const { evaluate } = await import('@mdx-js/mdx');
  const runtime = await import('react/jsx-runtime');
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { default: Content } = await evaluate('# Existing title\n\n### Nested heading\n\nBody text.\n\n## Another heading', { ...runtime, remarkPlugins: [normalizeMdxHeadings] });
  const html = renderToStaticMarkup(createElement(Content));
  assert(!html.includes('<h1'));
  assert(html.includes('<h2>Existing title</h2>'));
  assert(html.includes('<h3>Nested heading</h3>'));
  assert(html.includes('<h3>Another heading</h3>'));
  assert(html.includes('Body text.'));
});

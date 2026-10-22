import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeEcosystemContent } from '../lib/ecosystem-validation.mjs';
import { prepareEcosystemDocuments, applyEcosystemDocuments } from './import-ecosystem-to-sanity.mjs';

const template = JSON.parse(await readFile(new URL('../content/ecosystem/it.json', import.meta.url), 'utf8'));

test('all three localized seeds preserve their complete editorial content', async () => {
  for (const locale of ['it', 'es', 'en']) {
    const content = JSON.parse(await readFile(new URL(`../content/ecosystem/${locale}.json`, import.meta.url), 'utf8'));
    assert.deepEqual(normalizeEcosystemContent(content, template), content);
    assert.equal(content.departments.length, 9);
    assert.equal(content.departments.reduce((count, d) => count + d.projects.length, 0), 28);
  }
});

test('editor reordering preserves the canonical association between nodes, icons and positions', () => {
  const content = structuredClone(template);
  content.departments.reverse();
  assert.deepEqual(normalizeEcosystemContent(content, template), template);
});

test('partial, unknown and duplicated nodes reject the entire CMS document', () => {
  const cases = [null, {}, { ...template, copy: {} }];
  const missing = structuredClone(template); missing.departments.pop(); cases.push(missing);
  const unknown = structuredClone(template); unknown.departments[0].id = 'unknown'; cases.push(unknown);
  const duplicate = structuredClone(template); duplicate.departments[0].id = 'ai'; cases.push(duplicate);
  const whitespace = structuredClone(template); whitespace.copy.nav = ' '; cases.push(whitespace);
  const partial = structuredClone(template); delete partial.departments[2].projects[0].description; cases.push(partial);
  for (const content of cases) assert.equal(normalizeEcosystemContent(content, template), null);
});

test('project count respects the renderer capacity and rejects duplicate titles', () => {
  for (const count of [1, 2, 3, 4]) {
    const content = structuredClone(template);
    content.departments[0].projects = content.departments[0].projects.slice(0, count);
    assert(normalizeEcosystemContent(content, template));
  }
  const empty = structuredClone(template); empty.departments[0].projects = [];
  assert.equal(normalizeEcosystemContent(empty, template), null);
  const tooMany = structuredClone(template); tooMany.departments[0].projects.push({ ...tooMany.departments[0].projects[0], title: 'Fifth project' });
  assert.equal(normalizeEcosystemContent(tooMany, template), null);
  const duplicate = structuredClone(template); duplicate.departments[0].projects[1].title = duplicate.departments[0].projects[0].title;
  assert.equal(normalizeEcosystemContent(duplicate, template), null);
});

test('import prepares only drafts with stable keys and matching schema types', async () => {
  const documents = await prepareEcosystemDocuments();
  assert.deepEqual(documents.map(d => d._id), ['drafts.ecosystemPage.it', 'drafts.ecosystemPage.es', 'drafts.ecosystemPage.en']);
  for (const document of documents) {
    assert.equal(document._type, 'ecosystemPage');
    assert.equal(document.copy._type, 'ecosystemCopy');
    for (const department of document.departments) {
      assert.equal(department._key, department.id);
      assert.equal(department._type, 'ecosystemDepartment');
      assert.equal(new Set(department.projects.map(p => p._key)).size, department.projects.length);
      assert(department.projects.every(p => p._type === 'ecosystemProject'));
    }
    assert.deepEqual(normalizeEcosystemContent(document, template), JSON.parse(await readFile(new URL(`../content/ecosystem/${document.language}.json`, import.meta.url), 'utf8')));
  }
});

test('repeat import skips existing drafts AND published documents without replacing them', async () => {
  const documents = await prepareEcosystemDocuments();
  const store = new Map([['ecosystemPage.it', { title: 'Edited Italian' }], ['drafts.ecosystemPage.es', { title: 'Edited Spanish' }]]);
  let commits = 0;
  const client = {
    fetch: async (_query, { ids }) => [...store.keys()].filter(id => ids.includes(id)),
    transaction() {
      const pending = [];
      return {
        createIfNotExists(document) { pending.push(document); return this; },
        async commit() { commits++; for (const document of pending) if (!store.has(document._id)) store.set(document._id, document); },
      };
    },
  };
  assert.deepEqual(await applyEcosystemDocuments(client, documents), { created: 1, skipped: 2 });
  assert.deepEqual(await applyEcosystemDocuments(client, documents), { created: 0, skipped: 3 });
  assert.equal(commits, 1);
  assert.deepEqual(store.get('ecosystemPage.it'), { title: 'Edited Italian' });
  assert.deepEqual(store.get('drafts.ecosystemPage.es'), { title: 'Edited Spanish' });
  assert(!store.has('ecosystemPage.en'));
});

// Execute the server loader with only its network boundary replaced; production logic stays intact.
async function loaderFixture(source, response, fail = false) {
  const { default: ts } = await import('typescript');
  const { runInNewContext } = await import('node:vm');
  const locales = {};
  for (const locale of ['it', 'es', 'en']) locales[locale] = JSON.parse(await readFile(new URL(`../content/ecosystem/${locale}.json`, import.meta.url), 'utf8'));
  const code = await readFile(new URL('../lib/sanity/ecosystem.ts', import.meta.url), 'utf8');
  const requests = [];
  const warnings = [];
  const context = {
    exports: {}, process: { env: { ECOSYSTEM_CONTENT_SOURCE: source } }, console: { warn: message => warnings.push(message) },
    require(name) {
      if (name === 'server-only') return {};
      if (name === 'react') return { cache: callback => callback };
      if (name === '@/lib/ecosystem-content') return { getEcosystemContent: lang => locales[lang === 'es' || lang === 'en' ? lang : 'it'], getEcosystemLocale: lang => lang === 'es' || lang === 'en' ? lang : 'it' };
      if (name === '@/lib/ecosystem-validation.mjs') return { normalizeEcosystemContent };
      if (name === './client') return { sanityFetch: async (query, params) => { requests.push({ query, params }); if (fail) throw new Error('Network unavailable'); return response; } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return { load: context.exports.getEcosystemPageContent, requests, warnings, locales };
}

test('demo and unspecified source never query the CMS', async () => {
  for (const source of [undefined, 'local']) {
    const fixture = await loaderFixture(source, null);
    assert.equal(await fixture.load('es'), fixture.locales.es);
    assert.equal(fixture.requests.length, 0);
  }
});

test('enabled loader reads the fixed locale document and supplies editable labels', async () => {
  const content = structuredClone(template);
  content.copy.nav = 'Ecosistema aggiornato';
  content.departments.reverse();
  const fixture = await loaderFixture('sanity', content);
  const result = await fixture.load('it');
  assert.equal(result.copy.nav, 'Ecosistema aggiornato');
  assert.deepEqual(Array.from(result.departments, d => d.id), template.departments.map(d => d.id));
  assert.equal(fixture.requests[0].params.id, 'ecosystemPage.it');
  assert.equal(fixture.requests[0].params.language, 'it');
});

test('missing, incomplete or unavailable CMS returns the full same-language fallback', async () => {
  for (const [response, fail] of [[null, false], [{ copy: template.copy, departments: [] }, false], [null, true]]) {
    const fixture = await loaderFixture('sanity', response, fail);
    assert.equal(await fixture.load('en'), fixture.locales.en);
    assert.equal(fixture.warnings.length, 1);
  }
});

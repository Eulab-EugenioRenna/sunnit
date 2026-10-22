import assert from 'node:assert/strict';
import test from 'node:test';
import { mdxToSanityFields, sanityDocumentToMdx } from './lib/sanity-content.mjs';
import { upsertExcerpt } from './mdx-beautify.mjs';

test('upsertExcerpt replaces a multiline YAML excerpt without leaving continuation lines', () => {
  const source = sanityDocumentToMdx({
    _type: 'blogPost',
    title: 'Astrea – L’intelligenza artificiale che semplifica il lavoro dei professionisti',
    excerpt: [
      'Astrea supporta i professionisti nelle attivita quotidiane.',
      'Scrivere, analizzare e ricercare diventa piu semplice.',
    ].join('\n'),
    body: 'Contenuto dell’articolo.',
    tags: [],
  });
  const endIndex = source.indexOf('\n---\n', 4);
  const frontmatter = source.slice(0, endIndex + 5);
  const body = source.slice(endIndex + 5);

  const result = `${upsertExcerpt(frontmatter, 'Nuovo excerpt sintetico.')}\n${body}`;

  assert.deepEqual(mdxToSanityFields(result), {
    title: 'Astrea – L’intelligenza artificiale che semplifica il lavoro dei professionisti',
    excerpt: 'Nuovo excerpt sintetico.',
    body: 'Contenuto dell’articolo.',
  });
});

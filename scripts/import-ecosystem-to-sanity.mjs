#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSanityClient, projectRoot } from './lib/sanity-content.mjs';
import { normalizeEcosystemContent } from '../lib/ecosystem-validation.mjs';

export async function prepareEcosystemDocuments() {
  const documents = [];
  const template = JSON.parse(await readFile(path.join(projectRoot, 'content/ecosystem/it.json'), 'utf8'));
  for (const language of ['it', 'es', 'en']) {
    const seed = JSON.parse(await readFile(path.join(projectRoot, `content/ecosystem/${language}.json`), 'utf8'));
    const content = normalizeEcosystemContent(seed, template);
    if (!content) throw new Error(`Contenuto ecosistema ${language} non valido.`);
    documents.push({
      _id: `drafts.ecosystemPage.${language}`, _type: 'ecosystemPage', language,
      copy: { _type: 'ecosystemCopy', ...content.copy },
      departments: content.departments.map(department => ({
        _type: 'ecosystemDepartment', _key: department.id, ...department,
        projects: department.projects.map((project, index) => ({
          _type: 'ecosystemProject', _key: `${department.id}-project-${index + 1}`, ...project,
        })),
      })),
    });
  }
  return documents;
}

export async function applyEcosystemDocuments(client, documents) {
  const ids = documents.flatMap(document => [document._id, document._id.replace(/^drafts\./, '')]);
  const existing = new Set(await client.fetch('*[_id in $ids]._id', { ids }));
  const missing = documents.filter(document => !existing.has(document._id) && !existing.has(document._id.replace(/^drafts\./, '')));
  if (!missing.length) return { created: 0, skipped: documents.length };
  let transaction = client.transaction();
  for (const document of missing) transaction = transaction.createIfNotExists(document);
  await transaction.commit();
  return { created: missing.length, skipped: documents.length - missing.length };
}

async function main() {
  const args = process.argv.slice(2);
  const options = { apply: false, output: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--apply') options.apply = true;
    else if (args[i] === '--dry-run') continue;
    else if (args[i] === '--output') {
      options.output = args[++i];
      if (!options.output || options.output.startsWith('--')) throw new Error('--output richiede un percorso NDJSON.');
    } else if (args[i] === '--help') {
      console.log('Uso: npm run sanity:ecosystem -- [--dry-run] [--output percorso.ndjson] [--apply]\nIl comportamento predefinito valida soltanto. --apply crea bozze mancanti; nessuna pubblicazione e nessuna sovrascrittura.');
      return;
    } else throw new Error(`Argomento non supportato: ${args[i]}`);
  }
  if (args.includes('--apply') && args.includes('--dry-run')) throw new Error('Scegliere --apply oppure --dry-run.');
  const documents = await prepareEcosystemDocuments();
  console.log('Validati: 3 lingue, 27 competenze,', documents.reduce((count, document) => count + document.departments.reduce((n, d) => n + d.projects.length, 0), 0), 'progetti localizzati.');
  if (options.output) {
    await writeFile(options.output, documents.map(document => JSON.stringify(document)).join('\n') + '\n');
    console.log(`Bozze esportate: ${options.output}`);
  }
  if (!options.apply) {
    console.log('Dry run completato: nessuna connessione o scrittura sul CMS.');
    return;
  }
  const result = await applyEcosystemDocuments(await getSanityClient({ write: true }), documents);
  console.log(`Import bozze completato: ${result.created} nuove, ${result.skipped} già presenti. Nessun documento pubblicato o sovrascritto.`);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
}

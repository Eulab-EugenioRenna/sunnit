#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import {
  attachSanityImage,
  contentDefinitions,
  getSanityClient,
  mdxFileToSanityDocument,
  projectRoot,
} from './lib/sanity-content.mjs';

function parseArgs(argv) {
  const options = { types: Object.keys(contentDefinitions), dryRun: false, checkEnv: false, uploadImages: true };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--check-env') options.checkEnv = true;
    else if (arg === '--skip-images') options.uploadImages = false;
    else if (arg === '--type') {
      const values = String(argv[++index] || '').split(',').filter(Boolean);
      if (!values.length || values.some((value) => !(value in contentDefinitions))) {
        throw new Error('--type accetta blog,job,portfolio o una lista separata da virgole');
      }
      options.types = values;
    } else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`Argomento non supportato: ${arg}`);
  }
  return options;
}

function printHelp() {
  console.log(`Uso: npm run sanity:import -- [opzioni]\n\nOpzioni:\n  --dry-run       inventaria e valida senza scrivere su Sanity\n  --check-env     verifica solo la configurazione Sanity\n  --type          blog,job,portfolio o lista separata da virgole\n  --skip-images   conserva imageUrl senza caricare gli asset\n  --help          mostra questo messaggio`);
}

async function inventory(types) {
  const entries = [];
  for (const type of types) {
    const root = path.join(projectRoot, 'content', contentDefinitions[type].dir);
    const languages = await readdir(root, { withFileTypes: true });
    for (const languageEntry of languages.filter((entry) => entry.isDirectory())) {
      const files = await readdir(path.join(root, languageEntry.name), { withFileTypes: true });
      for (const file of files.filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))) {
        const slug = file.name.replace(/\.mdx$/, '');
        const filePath = path.join(root, languageEntry.name, file.name);
        const document = await mdxFileToSanityDocument({ type, language: languageEntry.name, slug, filePath });
        const missing = ['title', 'excerpt', 'body'].filter((field) => !String(document[field] || '').trim());
        if (missing.length) {
          throw new Error(`${path.relative(projectRoot, filePath)}: campi obbligatori mancanti (${missing.join(', ')})`);
        }
        entries.push(document);
      }
    }
  }
  return entries;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return printHelp();

  if (options.checkEnv) {
    await getSanityClient({ write: true });
    console.log('Configurazione Sanity di scrittura valida.');
    return;
  }

  const documents = await inventory(options.types);
  const ids = documents.map((document) => document._id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('L\'inventario genera ID Sanity duplicati');
  }
  const counts = documents.reduce((result, document) => {
    result[document._type] = (result[document._type] || 0) + 1;
    return result;
  }, {});
  console.log(`Contenuti validati: ${documents.length}`, counts);

  if (options.dryRun) {
    console.log('Dry run completato: nessuna scrittura eseguita.');
    return;
  }

  const client = await getSanityClient({ write: true });
  const assetCache = new Map();
  let transaction = client.transaction();
  for (const original of documents) {
    const document = options.uploadImages ? await attachSanityImage(client, original, assetCache) : original;
    transaction = transaction.createOrReplace(document);
    console.log(`Preparato ${document._id}`);
  }
  const result = await transaction.commit({ autoGenerateArrayKeys: true });
  console.log(`Import completato: ${documents.length} documenti, transazione ${result.transactionId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

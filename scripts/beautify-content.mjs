#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { beautifyMdxDocument, DEFAULT_OLLAMA_MODEL } from './mdx-beautify.mjs';
import {
  contentDefinitions,
  getSanityClient,
  loadSanityEnv,
  mdxToSanityFields,
  projectRoot,
  sanityDocumentToMdx,
} from './lib/sanity-content.mjs';

function parseArgs(argv) {
  const options = { type: '', lang: '', slug: '', file: '', scan: false, dryRun: false, mode: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--scan') options.scan = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--excerpt-only') options.mode = 'excerpt-only';
    else if (arg === '--mode') options.mode = argv[++index] || 'full';
    else if (arg === '--type') options.type = argv[++index] || '';
    else if (arg === '--lang') options.lang = argv[++index] || '';
    else if (arg === '--slug') options.slug = argv[++index] || '';
    else if (arg === '--file') options.file = argv[++index] || '';
    else throw new Error(`Argomento non supportato: ${arg}`);
  }
  return options;
}

function printHelp() {
  console.log(`Uso:\n  npm run beautify -- --type <blog|portfolio|job> --lang <it|en|es|all> --slug <slug>\n  npm run beautify -- --type <...> --lang <...> --scan\n  npm run beautify -- --file <file.mdx>\n\nSenza --file lo script legge e aggiorna direttamente Sanity.\n\nOpzioni:\n  --mode <full|excerpt-only>\n  --excerpt-only\n  --dry-run\n  --help\n\nModello Ollama: ${DEFAULT_OLLAMA_MODEL}`);
}

function normalizeMode(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'e' || normalized === 'excerpt-only') return 'excerpt-only';
  if (normalized === 'f' || normalized === 'full') return 'full';
  return '';
}

async function promptOptions(options) {
  if (options.file && options.mode) return options;
  const rl = readline.createInterface({ input, output });
  try {
    if (!normalizeMode(options.mode)) {
      options.mode = normalizeMode((await rl.question('Modalita beautify ([f]ull / [e]xcerpt-only, default: f): ')).trim() || 'f');
    }
    if (options.file) return options;
    if (!(options.type in contentDefinitions)) {
      options.type = (await rl.question('Tipo contenuto Sanity (blog|portfolio|job): ')).trim();
    }
    if (!(options.type in contentDefinitions)) throw new Error('Tipo contenuto non valido');
    if (!options.lang) options.lang = (await rl.question('Lingua (it|en|es|all, default: it): ')).trim() || 'it';
    if (!options.slug && !options.scan) {
      const answer = (await rl.question('Slug (lascia vuoto per scegliere da elenco): ')).trim();
      if (answer) options.slug = answer;
      else options.scan = true;
    }
    return options;
  } finally {
    rl.close();
  }
}

function inferTypeFromPath(filePath) {
  if (filePath.includes('/jobs/') || filePath.includes(`${path.sep}jobs${path.sep}`)) return 'job';
  if (filePath.includes('/portfolio/') || filePath.includes(`${path.sep}portfolio${path.sep}`)) return 'portfolio';
  return 'blog';
}

async function selectDocuments(documents) {
  if (!documents.length) throw new Error('Nessun contenuto Sanity corrispondente');
  console.log('Contenuti trovati:');
  documents.forEach((document, index) => console.log(`${index + 1}. [${document.language}] ${document.slug.current} — ${document.title}`));
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question('Seleziona numeri separati da virgole oppure all: ')).trim().toLowerCase();
    if (answer === 'all') return documents;
    const indexes = [...new Set(answer.split(',').map((value) => Number(value.trim()) - 1))]
      .filter((value) => Number.isInteger(value) && value >= 0 && value < documents.length);
    if (!indexes.length) throw new Error('Nessuna selezione valida');
    return indexes.map((index) => documents[index]);
  } finally {
    rl.close();
  }
}

async function beautifyLocalFile(options) {
  const filePath = path.resolve(projectRoot, options.file);
  const source = await readFile(filePath, 'utf8');
  const result = await beautifyMdxDocument({
    source,
    contentType: options.type || inferTypeFromPath(filePath),
    slug: path.basename(filePath, '.mdx'),
    mode: options.mode,
  });
  console.log(`File locale: ${path.relative(projectRoot, filePath)}`);
  if (!options.dryRun) await writeFile(filePath, result, 'utf8');
}

async function main() {
  await loadSanityEnv();
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) return printHelp();
  const options = await promptOptions(parsed);
  options.mode = normalizeMode(options.mode);
  if (!options.mode) throw new Error('La modalita deve essere full o excerpt-only');
  console.log(`Modello: ${process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL}`);

  if (options.file) {
    await beautifyLocalFile(options);
    console.log(options.dryRun ? 'Dry run completato.' : 'Beautify locale completato.');
    return;
  }

  const client = await getSanityClient({ write: !options.dryRun });
  const languages = options.lang === 'all' ? null : options.lang.split(',').map((value) => value.trim()).filter(Boolean);
  const documents = await client.fetch(
    `*[_type == $type && !(_id in path("drafts.**")) && (!defined($languages) || language in $languages) && (!defined($slug) || slug.current == $slug)] | order(language asc, slug.current asc)`,
    { type: contentDefinitions[options.type].sanityType, languages, slug: options.slug || null },
  );
  const targets = options.scan ? await selectDocuments(documents) : documents;

  for (const document of targets) {
    console.log(`[${document.language}] ${document.slug.current}`);
    if (options.dryRun) continue;
    const result = await beautifyMdxDocument({
      source: sanityDocumentToMdx(document),
      contentType: options.type,
      slug: document.slug.current,
      mode: options.mode,
    });
    const fields = mdxToSanityFields(result);
    await client.patch(document._id).set(fields).commit();
  }
  console.log(options.dryRun ? 'Dry run completato.' : 'Beautify Sanity completato.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

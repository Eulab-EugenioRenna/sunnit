#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { beautifyMdxDocument, DEFAULT_OLLAMA_MODEL } from './mdx-beautify.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const contentRoots = {
  blog: path.join(projectRoot, 'content', 'blog'),
  portfolio: path.join(projectRoot, 'content', 'portfolio'),
};

function parseArgs(argv) {
  const options = {
    type: '',
    lang: 'it',
    slug: '',
    file: '',
    scan: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--scan') {
      options.scan = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--type') {
      options.type = next || '';
      index += 1;
      continue;
    }

    if (arg === '--lang') {
      options.lang = next || 'it';
      index += 1;
      continue;
    }

    if (arg === '--slug') {
      options.slug = next || '';
      index += 1;
      continue;
    }

    if (arg === '--file') {
      options.file = next || '';
      index += 1;
      continue;
    }

    throw new Error(`Argomento non supportato: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Uso:
  npm run beautify
  npm run beautify -- --type <blog|portfolio> --lang <it|en|es> --slug <slug>
  npm run beautify -- --type <blog|portfolio> --lang <it|en|es> --scan
  npm run beautify -- --file content/blog/it/mio-articolo.mdx

Opzioni:
  --type      blog o portfolio
  --lang      lingua del contenuto (default: it)
  --slug      slug del contenuto da rifinire
  --file      percorso file MDX alternativo
  --scan      scansiona la directory e fa scegliere uno o piu contenuti
  --dry-run   non scrive il file, mostra solo l'azione
  --help, -h  mostra questo messaggio

Modello usato:
  Ollama ${DEFAULT_OLLAMA_MODEL}
`);
}

async function promptMissingOptions(options) {
  if (options.file) {
    return options;
  }

  const needsType = !(options.type in contentRoots);
  const needsLang = !options.lang;
  const needsTargetSelection = !options.scan && !options.slug;

  if (!needsType && !needsLang && !needsTargetSelection) {
    return options;
  }

  const rl = readline.createInterface({ input, output });

  try {
    if (needsType) {
      const selectedType = (await rl.question('Tipo contenuto da beautify (blog|portfolio): ')).trim();

      if (!(selectedType in contentRoots)) {
        throw new Error('Il tipo deve essere blog o portfolio');
      }

      options.type = selectedType;
    }

    if (needsLang) {
      options.lang = (await rl.question('Lingua contenuto (default: it): ')).trim() || 'it';
    }

    if (needsTargetSelection) {
      const mode = (await rl.question('Vuoi selezionare dalla directory? [Y/n]: ')).trim().toLowerCase();
      options.scan = mode !== 'n';

      if (!options.scan) {
        options.slug = (await rl.question('Slug del contenuto: ')).trim();

        if (!options.slug) {
          throw new Error('Slug obbligatorio');
        }
      }
    }
  } finally {
    rl.close();
  }

  return options;
}

function resolveTargetPath(options) {
  if (options.file) {
    return {
      filePath: path.resolve(projectRoot, options.file),
      contentType: options.type || inferTypeFromPath(options.file),
      slug: path.basename(options.file, '.mdx'),
    };
  }

  if (!(options.type in contentRoots)) {
    throw new Error('Il tipo deve essere blog o portfolio');
  }

  if (!options.slug) {
    throw new Error('Slug obbligatorio se non usi --file');
  }

  return {
    filePath: path.join(contentRoots[options.type], options.lang, `${options.slug}.mdx`),
    contentType: options.type,
    slug: options.slug,
  };
}

async function listContentEntries(contentType, lang) {
  if (!(contentType in contentRoots)) {
    throw new Error('Il tipo deve essere blog o portfolio');
  }

  const targetDir = path.join(contentRoots[contentType], lang);
  const entries = await readdir(targetDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => ({
      slug: path.basename(entry.name, '.mdx'),
      filePath: path.join(targetDir, entry.name),
      contentType,
    }))
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function parseSelectionAnswer(answer, max) {
  const trimmed = String(answer || '').trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  if (trimmed === 'all') {
    return Array.from({ length: max }, (_, index) => index);
  }

  const indexes = new Set();

  for (const token of trimmed.split(',')) {
    const value = token.trim();

    if (!value) continue;

    const rangeMatch = value.match(/^(\d+)-(\d+)$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      const min = Math.min(start, end);
      const maxRange = Math.max(start, end);

      for (let current = min; current <= maxRange; current += 1) {
        if (current >= 1 && current <= max) {
          indexes.add(current - 1);
        }
      }

      continue;
    }

    const numeric = Number(value);

    if (Number.isInteger(numeric) && numeric >= 1 && numeric <= max) {
      indexes.add(numeric - 1);
    }
  }

  return [...indexes].sort((left, right) => left - right);
}

async function promptForScanSelection(options) {
  const entries = await listContentEntries(options.type, options.lang);

  if (entries.length === 0) {
    throw new Error(`Nessun contenuto trovato in ${path.relative(projectRoot, path.join(contentRoots[options.type], options.lang))}`);
  }

  console.log(`Contenuti trovati in ${options.type}/${options.lang}:`);

  for (const [index, entry] of entries.entries()) {
    console.log(`${index + 1}. ${entry.slug}`);
  }

  const rl = readline.createInterface({ input, output });

  try {
    const answer = await rl.question('Seleziona articoli/progetti (es: 1,3-5 oppure all): ');
    const selectedIndexes = parseSelectionAnswer(answer, entries.length);

    if (selectedIndexes.length === 0) {
      throw new Error('Nessuna selezione valida ricevuta');
    }

    return selectedIndexes.map((index) => entries[index]);
  } finally {
    rl.close();
  }
}

function inferTypeFromPath(filePath) {
  if (filePath.includes(`${path.sep}portfolio${path.sep}`) || filePath.includes('/portfolio/')) {
    return 'portfolio';
  }

  return 'blog';
}

async function main() {
  const parsedOptions = parseArgs(process.argv.slice(2));

  if (parsedOptions.help) {
    printHelp();
    return;
  }

  const options = await promptMissingOptions(parsedOptions);

  const targets = options.scan
    ? await promptForScanSelection(options)
    : [resolveTargetPath(options)];

  console.log(`Modello: ${DEFAULT_OLLAMA_MODEL}`);
  console.log(`Elementi selezionati: ${targets.length}`);

  for (const target of targets) {
    const source = await readFile(target.filePath, 'utf8');
    const beautified = await beautifyMdxDocument({
      source,
      contentType: target.contentType,
      slug: target.slug,
    });

    console.log(`File: ${path.relative(projectRoot, target.filePath)}`);
    console.log(`Tipo: ${target.contentType}`);

    if (options.dryRun) {
      continue;
    }

    await writeFile(target.filePath, beautified, 'utf8');
  }

  if (options.dryRun) {
    console.log('Dry run completato, nessuna scrittura eseguita.');
    return;
  }

  console.log('Beautify completato con successo.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

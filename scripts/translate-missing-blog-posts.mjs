#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const langDir = path.join(projectRoot, 'lang');

const contentRoots = {
  blog: path.join(projectRoot, 'content', 'blog'),
  portfolio: path.join(projectRoot, 'content', 'portfolio'),
};

const localeLabels = {
  en: 'English',
  it: 'Italian',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
};

function parseArgs(argv) {
  const options = {
    model: process.env.OLLAMA_MODEL || 'gemma4:31b-cloud',
    baseUrl: process.env.OLLAMA_URL || 'http://127.0.0.1:11434',
    preferredSource: process.env.BLOG_TRANSLATION_SOURCE || 'it',
    dryRun: false,
    contentTypes: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--model') {
      options.model = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--base-url') {
      options.baseUrl = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--source') {
      options.preferredSource = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg === '--type') {
      const value = argv[index + 1];
      index += 1;

      if (!value) {
        throw new Error('--type richiede un valore');
      }

      const resolved = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      if (resolved.length === 0) {
        throw new Error('--type deve contenere almeno un valore');
      }

      for (const item of resolved) {
        if (!(item in contentRoots) && item !== 'all') {
          throw new Error(`Tipo contenuto non supportato: ${item}`);
        }
      }

      options.contentTypes = resolved.includes('all') ? Object.keys(contentRoots) : resolved;
      continue;
    }

    throw new Error(`Argomento non supportato: ${arg}`);
  }

  return options;
}

function printHelp() {
console.log(`Uso:
  npm run translate
  npm run translate:blog -- [--dry-run] [--model <nome>] [--base-url <url>] [--source <locale>] [--type <blog|portfolio|all>]

Opzioni:
  --dry-run         Mostra i file mancanti senza tradurli
  --model           Modello Ollama da usare (default: env OLLAMA_MODEL o gemma4:31b-cloud)
  --base-url        URL API Ollama (default: env OLLAMA_URL o http://127.0.0.1:11434)
  --source          Lingua sorgente preferita se disponibile (default: env BLOG_TRANSLATION_SOURCE o it)
  --type            Contenuto da tradurre: blog, portfolio o all
  --help, -h        Mostra questo messaggio
`);
}

async function promptMissingOptions(options) {
  if (options.help || options.contentTypes.length > 0) {
    return options;
  }

  const rl = readline.createInterface({ input, output });

  try {
    const selectedType = (await rl.question('Cosa vuoi tradurre? (blog|portfolio|all): ')).trim().toLowerCase();

    if (!selectedType) {
      throw new Error('Tipo contenuto obbligatorio');
    }

    const resolved = selectedType
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (resolved.length === 0) {
      throw new Error('Tipo contenuto obbligatorio');
    }

    for (const item of resolved) {
      if (!(item in contentRoots) && item !== 'all') {
        throw new Error(`Tipo contenuto non supportato: ${item}`);
      }
    }

    options.contentTypes = resolved.includes('all') ? Object.keys(contentRoots) : resolved;
  } finally {
    rl.close();
  }

  return options;
}

async function getLocales() {
  const entries = await readdir(langDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.basename(entry.name, '.json'))
    .sort();
}

async function getContentInventory(locales, contentDir) {
  const inventory = new Map();

  for (const locale of locales) {
    const localeDir = path.join(contentDir, locale);
    let entries = [];

    try {
      entries = await readdir(localeDir, { withFileTypes: true });
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }

    const slugs = new Set(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
        .map((entry) => path.basename(entry.name, '.mdx')),
    );

    inventory.set(locale, slugs);
  }

  return inventory;
}

function buildMissingTranslations(locales, inventory, preferredSource) {
  const allSlugs = new Set();

  for (const slugs of inventory.values()) {
    for (const slug of slugs) {
      allSlugs.add(slug);
    }
  }

  const tasks = [];

  for (const slug of [...allSlugs].sort()) {
    const availableLocales = locales.filter((locale) => inventory.get(locale)?.has(slug));

    for (const targetLocale of locales) {
      if (inventory.get(targetLocale)?.has(slug)) {
        continue;
      }

      const sourceLocale = pickSourceLocale(availableLocales, preferredSource);

      if (!sourceLocale) {
        continue;
      }

      tasks.push({ slug, sourceLocale, targetLocale });
    }
  }

  return tasks;
}

function pickSourceLocale(availableLocales, preferredSource) {
  if (availableLocales.includes(preferredSource)) {
    return preferredSource;
  }

  if (availableLocales.includes('en')) {
    return 'en';
  }

  return availableLocales[0];
}

function getLocaleLabel(locale) {
  return localeLabels[locale] || locale;
}

function stripCodeFence(value) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

async function translateWithOllama({ baseUrl, model, sourceLocale, targetLocale, content, slug, contentType }) {
  const system = [
    `You translate MDX ${contentType} content while preserving structure.`,
    'Return only the translated MDX document.',
    'Do not add explanations, notes, or code fences.',
    'Keep YAML frontmatter keys unchanged.',
    'Keep the image path unchanged.',
    'Preserve markdown and MDX structure exactly as much as possible.',
    'Translate title, excerpt, headings, and body text into the target language.',
    'Keep tags unchanged unless translating them is strictly necessary for meaning.',
    'Do not invent sections or content.',
  ].join(' ');

  const user = [
    `Translate this ${contentType} entry from ${getLocaleLabel(sourceLocale)} to ${getLocaleLabel(targetLocale)}.`,
    `Slug: ${slug}.`,
    'Return only the final MDX content.',
    '',
    content,
  ].join('\n');

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama ha risposto con ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const translated = stripCodeFence(data?.message?.content || '');

  if (!translated) {
    throw new Error(`Risposta vuota da Ollama per ${slug} (${targetLocale})`);
  }

  return `${translated.trim()}\n`;
}

async function main() {
  const options = await promptMissingOptions(parseArgs(process.argv.slice(2)));

  if (options.help) {
    printHelp();
    return;
  }

  const locales = await getLocales();

  if (locales.length === 0) {
    throw new Error('Nessuna lingua trovata in lang/*.json');
  }

  console.log(`Lingue rilevate: ${locales.join(', ')}`);

  for (const contentType of options.contentTypes) {
    const contentDir = contentRoots[contentType];
    const inventory = await getContentInventory(locales, contentDir);
    const tasks = buildMissingTranslations(locales, inventory, options.preferredSource);

    if (tasks.length === 0) {
      console.log(`[${contentType}] Nessun contenuto mancante da tradurre.`);
      continue;
    }

    console.log(`[${contentType}] Contenuti mancanti trovati: ${tasks.length}`);

    for (const task of tasks) {
      const sourcePath = path.join(contentDir, task.sourceLocale, `${task.slug}.mdx`);
      const targetPath = path.join(contentDir, task.targetLocale, `${task.slug}.mdx`);
      const printableTargetPath = path.relative(projectRoot, targetPath);

      console.log(`- [${contentType}] ${task.slug}: ${task.sourceLocale} -> ${task.targetLocale}`);

      if (options.dryRun) {
        continue;
      }

      const sourceContent = await readFile(sourcePath, 'utf8');
      const translatedContent = await translateWithOllama({
        baseUrl: options.baseUrl,
        model: options.model,
        sourceLocale: task.sourceLocale,
        targetLocale: task.targetLocale,
        content: sourceContent,
        slug: task.slug,
        contentType,
      });

      await mkdir(path.dirname(targetPath), { recursive: true });
      await writeFile(targetPath, translatedContent, 'utf8');

      console.log(`  creato ${printableTargetPath}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

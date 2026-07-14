#!/usr/bin/env node

import { readdir } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  contentDefinitions,
  deterministicDocumentId,
  getSanityClient,
  loadSanityEnv,
  mdxToSanityFields,
  projectRoot,
  sanityDocumentToMdx,
} from './lib/sanity-content.mjs';

const localeLabels = { en: 'English', it: 'Italian', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' };

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
    if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--model') options.model = argv[++index];
    else if (arg === '--base-url') options.baseUrl = argv[++index];
    else if (arg === '--source') options.preferredSource = argv[++index];
    else if (arg === '--type') {
      const values = String(argv[++index] || '').split(',').map((value) => value.trim()).filter(Boolean);
      if (!values.length || values.some((value) => !(value in contentDefinitions) && value !== 'all')) {
        throw new Error('--type accetta blog, portfolio, job o all');
      }
      options.contentTypes = values.includes('all') ? Object.keys(contentDefinitions) : values;
    } else throw new Error(`Argomento non supportato: ${arg}`);
  }
  return options;
}

function printHelp() {
  console.log(`Uso: npm run translate -- --type <blog|portfolio|job|all> [opzioni]\n\nLo script legge e scrive direttamente i documenti Sanity.\n\nOpzioni:\n  --dry-run         mostra le traduzioni mancanti senza chiamare Ollama\n  --model           modello Ollama\n  --base-url        URL Ollama\n  --source          lingua sorgente preferita (default: it)\n  --type            tipo o all\n  --help            mostra questo messaggio`);
}

async function promptMissingOptions(options) {
  if (options.help || options.contentTypes.length) return options;
  const rl = readline.createInterface({ input, output });
  try {
    const selected = (await rl.question('Cosa vuoi tradurre su Sanity? (blog|portfolio|job|all): ')).trim();
    if (!(selected in contentDefinitions) && selected !== 'all') throw new Error('Tipo contenuto non valido');
    options.contentTypes = selected === 'all' ? Object.keys(contentDefinitions) : [selected];
    return options;
  } finally {
    rl.close();
  }
}

async function getLocales() {
  return (await readdir(path.join(projectRoot, 'lang'), { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.basename(entry.name, '.json'))
    .sort();
}

function pickSource(documents, preferredSource) {
  return documents.find((document) => document.language === preferredSource)
    || documents.find((document) => document.language === 'en')
    || documents[0];
}

function buildTasks(documents, locales, preferredSource) {
  const bySlug = new Map();
  for (const document of documents) {
    const slug = document.slug?.current;
    if (!slug) continue;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(document);
  }

  const tasks = [];
  for (const [slug, translations] of bySlug) {
    const source = pickSource(translations, preferredSource);
    for (const targetLocale of locales) {
      if (!translations.some((document) => document.language === targetLocale)) {
        tasks.push({ slug, source, targetLocale });
      }
    }
  }
  return tasks;
}

function stripCodeFence(value) {
  const trimmed = String(value || '').trim();
  const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

async function translateWithOllama({ options, source, targetLocale, contentType }) {
  const response = await fetch(`${options.baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: [
            `You translate MDX ${contentType} content while preserving structure.`,
            'Return only the translated MDX document, without code fences or notes.',
            'Keep YAML keys, dates, image paths, tags, slugs, country keys and status values unchanged.',
            'Translate title, excerpt, headings and body. Do not invent content.',
          ].join(' '),
        },
        {
          role: 'user',
          content: `Translate from ${localeLabels[source.language] || source.language} to ${localeLabels[targetLocale] || targetLocale}.\n\n${sanityDocumentToMdx(source)}`,
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Ollama ha risposto con ${response.status}: ${await response.text()}`);
  const data = await response.json();
  const translated = stripCodeFence(data?.message?.content);
  if (!translated) throw new Error(`Risposta Ollama vuota per ${source.slug?.current}`);
  return mdxToSanityFields(translated);
}

function translatedDocument(source, type, targetLocale, fields) {
  const { _id, _rev, _createdAt, _updatedAt, ...portable } = source;
  return {
    ...portable,
    ...fields,
    _id: deterministicDocumentId(type, targetLocale, source.slug.current),
    language: targetLocale,
  };
}

async function main() {
  await loadSanityEnv();
  const options = await promptMissingOptions(parseArgs(process.argv.slice(2)));
  if (options.help) return printHelp();
  const locales = await getLocales();
  const client = await getSanityClient({ write: !options.dryRun });

  for (const type of options.contentTypes) {
    const sanityType = contentDefinitions[type].sanityType;
    const documents = await client.fetch(`*[_type == $type && !(_id in path("drafts.**"))]`, { type: sanityType });
    const tasks = buildTasks(documents, locales, options.preferredSource);
    if (!tasks.length) {
      console.log(`[${type}] Nessuna traduzione mancante.`);
      continue;
    }
    console.log(`[${type}] Traduzioni mancanti: ${tasks.length}`);
    for (const task of tasks) {
      console.log(`- ${task.slug}: ${task.source.language} -> ${task.targetLocale}`);
      if (options.dryRun) continue;
      const fields = await translateWithOllama({ options, source: task.source, targetLocale: task.targetLocale, contentType: type });
      await client.createOrReplace(translatedDocument(task.source, type, task.targetLocale, fields));
    }
  }
  console.log(options.dryRun ? 'Dry run completato.' : 'Traduzione Sanity completata.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

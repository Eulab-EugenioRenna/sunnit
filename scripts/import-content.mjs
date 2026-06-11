#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { beautifyMdxBody, beautifyMdxExcerpt, DEFAULT_OLLAMA_MODEL } from './mdx-beautify.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const contentRoots = {
  blog: path.join(projectRoot, 'content', 'blog'),
  portfolio: path.join(projectRoot, 'content', 'portfolio'),
};

const imageRoots = {
  blog: '/images/posts',
  portfolio: '/images/portfolio',
};

function parseArgs(argv) {
  const options = {
    type: '',
    lang: 'it',
    title: '',
    slug: '',
    imageUrl: '',
    textFile: '',
    body: '',
    excerpt: '',
    date: '',
    tags: '',
    tag: '',
    tone: 'blue',
    order: '',
    dryRun: false,
    skipBeautify: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--skip-beautify') {
      options.skipBeautify = true;
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
      options.lang = next || '';
      index += 1;
      continue;
    }

    if (arg === '--title') {
      options.title = next || '';
      index += 1;
      continue;
    }

    if (arg === '--slug') {
      options.slug = next || '';
      index += 1;
      continue;
    }

    if (arg === '--image-url') {
      options.imageUrl = next || '';
      index += 1;
      continue;
    }

    if (arg === '--text-file') {
      options.textFile = next || '';
      index += 1;
      continue;
    }

    if (arg === '--body') {
      options.body = next || '';
      index += 1;
      continue;
    }

    if (arg === '--excerpt') {
      options.excerpt = next || '';
      index += 1;
      continue;
    }

    if (arg === '--date') {
      options.date = next || '';
      index += 1;
      continue;
    }

    if (arg === '--tags') {
      options.tags = next || '';
      index += 1;
      continue;
    }

    if (arg === '--tag') {
      options.tag = next || '';
      index += 1;
      continue;
    }

    if (arg === '--tone') {
      options.tone = next || '';
      index += 1;
      continue;
    }

    if (arg === '--order') {
      options.order = next || '';
      index += 1;
      continue;
    }

    throw new Error(`Argomento non supportato: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Uso:
  npm run import -- --type <blog|portfolio> --lang <it|en|es> --title "Titolo" --image-url <url>

Modalita:
  1. Interattiva: lancia solo il comando e incolla il testo quando richiesto
  2. Via file:     --text-file ./mio-testo.md
  3. Via flag:     --body "# Titolo\n\nTesto..."

Opzioni principali:
  --type          blog o portfolio
  --lang          lingua del contenuto (default: it)
  --title         titolo del contenuto
  --slug          slug personalizzato (opzionale)
  --image-url     URL dell'immagine da scaricare
  --text-file     file locale con il corpo MD/MDX
  --body          corpo MD/MDX inline
  --date          data editoriale in formato YYYY-MM-DD (default: oggi)
  --dry-run       non scrive file, mostra solo cosa farebbe
  --skip-beautify salta la rifinitura MDX con Ollama

Opzioni blog:
  --excerpt       excerpt personalizzato
  --tags          lista separata da virgole

Opzioni portfolio:
  --tag           etichetta card (es. Cloud / DevOps)
  --tone          blue, green, purple, dark
  --order         ordine opzionale
`);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function stripMdx(source) {
  return source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[>*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toExcerpt(body) {
  const text = stripMdx(body);
  return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text;
}

function escapeYaml(value) {
  return String(value || '').replace(/"/g, '\\"');
}

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function inferExtension(contentType, url, contentTypeHeader) {
  const pathname = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  })();

  const extFromPath = path.extname(pathname).toLowerCase();
  if (extFromPath && extFromPath.length <= 5) {
    return extFromPath;
  }

  if (contentTypeHeader.includes('png')) return '.png';
  if (contentTypeHeader.includes('webp')) return '.webp';
  if (contentTypeHeader.includes('svg')) return '.svg';
  if (contentTypeHeader.includes('gif')) return '.gif';
  if (contentTypeHeader.includes('jpeg') || contentTypeHeader.includes('jpg')) return '.jpg';

  return contentType === 'blog' ? '.jpg' : '.png';
}

async function downloadImage({ imageUrl, targetPath, dryRun }) {
  if (dryRun) return;

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Download immagine fallito con status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, Buffer.from(arrayBuffer));
}

async function getBodyContent(options) {
  if (options.body) {
    return options.body.trim();
  }

  if (options.textFile) {
    return (await readFile(path.resolve(projectRoot, options.textFile), 'utf8')).trim();
  }

  const rl = readline.createInterface({ input, output });

  try {
    console.log('Incolla il testo MD/MDX. Termina con una riga contenente solo: EOF');
    const lines = [];

    while (true) {
      const line = await rl.question('');
      if (line === 'EOF') break;
      lines.push(line);
    }

    return lines.join('\n').trim();
  } finally {
    rl.close();
  }
}

async function promptMissingFields(options) {
  const rl = readline.createInterface({ input, output });

  try {
    if (!options.type) options.type = (await rl.question('Tipo (blog|portfolio): ')).trim();
    if (!options.lang) options.lang = (await rl.question('Lingua (it|en|es): ')).trim() || 'it';
    if (!options.title) options.title = (await rl.question('Titolo: ')).trim();
    if (!options.imageUrl) options.imageUrl = (await rl.question('URL immagine: ')).trim();

    if (options.type === 'blog' && !options.tags) {
      options.tags = (await rl.question('Tags blog (separati da virgola): ')).trim();
    }

    if (options.type === 'portfolio' && !options.tag) {
      options.tag = (await rl.question('Tag card portfolio: ')).trim();
    }
  } finally {
    rl.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  await promptMissingFields(options);

  if (!(options.type in contentRoots)) {
    throw new Error('Il tipo deve essere blog o portfolio');
  }

  if (!options.title) {
    throw new Error('Titolo obbligatorio');
  }

  if (!options.imageUrl) {
    throw new Error('URL immagine obbligatorio');
  }

  const editorialDate = options.date || getDefaultDate();

  const body = await getBodyContent(options);

  if (!body) {
    throw new Error('Corpo del contenuto vuoto');
  }

  const formattedBody = options.dryRun || options.skipBeautify
    ? body.trim()
    : await beautifyMdxBody({
        body,
        contentType: options.type,
        slug: options.slug || slugify(options.title),
      });

  const slug = options.slug || slugify(options.title);
  const contentDir = path.join(contentRoots[options.type], options.lang);
  const mdxPath = path.join(contentDir, `${slug}.mdx`);

  const imageProbe = await fetch(options.imageUrl, { method: 'HEAD' }).catch(() => null);
  const extension = inferExtension(options.type, options.imageUrl, imageProbe?.headers.get('content-type') || '');
  const imageFileName = `${slug}${extension}`;
  const imagePublicPath = `${imageRoots[options.type]}/${imageFileName}`;
  const imageDiskPath = path.join(projectRoot, 'public', imagePublicPath.replace(/^?\//, ''));

  const excerpt = options.excerpt
    || (options.dryRun || options.skipBeautify
      ? toExcerpt(formattedBody)
      : await beautifyMdxExcerpt({
          body: formattedBody,
          contentType: options.type,
          slug,
        }));

  let frontmatter = '';

  if (options.type === 'blog') {
    const tags = options.tags
      ? options.tags.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    frontmatter = [
      '---',
      `title: "${escapeYaml(options.title)}"`,
      `excerpt: "${escapeYaml(excerpt)}"`,
      `image: "${imagePublicPath}"`,
      `date: "${escapeYaml(editorialDate)}"`,
      `tags: [${tags.map((tag) => `"${escapeYaml(tag)}"`).join(', ')}]`,
      '---',
      '',
    ].join('\n');
  } else {
    frontmatter = [
      '---',
      `title: "${escapeYaml(options.title)}"`,
      `excerpt: "${escapeYaml(excerpt)}"`,
      `image: "${imagePublicPath}"`,
      `date: "${escapeYaml(editorialDate)}"`,
      `tag: "${escapeYaml(options.tag || 'Project')}"`,
      `tone: "${escapeYaml(options.tone || 'blue')}"`,
      ...(options.order ? [`order: "${escapeYaml(options.order)}"`] : []),
      '---',
      '',
    ].join('\n');
  }

  const mdxContent = `${frontmatter}${formattedBody.trim()}\n`;

  console.log(`Tipo: ${options.type}`);
  console.log(`Lingua: ${options.lang}`);
  console.log(`Slug: ${slug}`);
  console.log(`Data: ${editorialDate}`);
  console.log(`MDX: ${path.relative(projectRoot, mdxPath)}`);
  console.log(`Immagine: ${path.relative(projectRoot, imageDiskPath)}`);
  console.log(`Beautify MDX: ${options.skipBeautify ? 'saltato' : `Ollama ${DEFAULT_OLLAMA_MODEL}`}`);

  if (options.dryRun) {
    return;
  }

  await mkdir(path.dirname(mdxPath), { recursive: true });
  await writeFile(mdxPath, mdxContent, 'utf8');
  await downloadImage({ imageUrl: options.imageUrl, targetPath: imageDiskPath, dryRun: options.dryRun });

  console.log('Contenuto creato con successo.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

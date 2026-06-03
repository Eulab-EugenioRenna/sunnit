const DEFAULT_OLLAMA_MODEL = 'gemma4:31b-cloud';
const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

function stripCodeFence(value) {
  const trimmed = String(value || '').trim();
  const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function splitFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    return { frontmatter: '', body: source };
  }

  const endIndex = source.indexOf('\n---\n', 4);

  if (endIndex === -1) {
    return { frontmatter: '', body: source };
  }

  return {
    frontmatter: source.slice(0, endIndex + 5),
    body: source.slice(endIndex + 5),
  };
}

function escapeYamlDoubleQuoted(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function upsertExcerpt(frontmatter, excerpt) {
  if (!frontmatter || !excerpt) {
    return frontmatter;
  }

  const lines = frontmatter.trimEnd().split('\n');
  const bodyLines = lines.slice(1, -1);
  const excerptLine = `excerpt: "${escapeYamlDoubleQuoted(excerpt)}"`;
  const excerptIndex = bodyLines.findIndex((line) => /^excerpt\s*:/.test(line.trim()));

  if (excerptIndex >= 0) {
    bodyLines[excerptIndex] = excerptLine;
  } else {
    const titleIndex = bodyLines.findIndex((line) => /^title\s*:/.test(line.trim()));
    const insertAt = titleIndex >= 0 ? titleIndex + 1 : bodyLines.length;
    bodyLines.splice(insertAt, 0, excerptLine);
  }

  return `---\n${bodyLines.join('\n')}\n---\n`;
}

async function ollamaChat({ messages, slug, action, baseUrl = process.env.OLLAMA_URL || DEFAULT_OLLAMA_URL }) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_OLLAMA_MODEL,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama ${action} ha risposto con ${response.status} per ${slug}: ${errorText}`);
  }

  const data = await response.json();
  const content = stripCodeFence(data?.message?.content || '');

  if (!content) {
    throw new Error(`Risposta vuota da Ollama durante ${action} di ${slug}`);
  }

  return content.trim();
}

function buildBeautifyMessages({ body, contentType, slug }) {
  const system = [
    'You format editorial content into clean MDX.',
    'Use Ollama output as the final document body only.',
    'Do not add YAML frontmatter, explanations, notes, or code fences.',
    'Do not invent facts, sections, claims, links, citations, or components.',
    'Preserve the original language and meaning.',
    'Improve readability with solid markdown structure when justified by the text.',
    'You may add headings, short paragraphs, bullet lists, numbered lists, blockquotes, bold emphasis, and code fences only when clearly supported by the source text.',
    'Keep the tone professional and publish-ready.',
    'Never add MDX imports, JSX, or custom components.',
  ].join(' ');

  const user = [
    `Beautify this ${contentType} MDX body for slug "${slug}".`,
    'Return only the final MDX body.',
    '',
    body,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

function buildExcerptMessages({ body, contentType, slug }) {
  const system = [
    'You write short editorial excerpts.',
    'Return only one plain-text excerpt line.',
    'Maximum 15 words.',
    'Do not use markdown, quotes, bullets, labels, or trailing explanations.',
    'Preserve the original language and meaning.',
    'Do not invent facts or claims not supported by the source.',
  ].join(' ');

  const user = [
    `Write an excerpt for this ${contentType} MDX content with slug "${slug}".`,
    'The excerpt must be a concise summary in maximum 15 words.',
    'Return only the excerpt text.',
    '',
    body,
  ].join('\n');

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export async function beautifyMdxBody({ body, contentType, slug, baseUrl = process.env.OLLAMA_URL || DEFAULT_OLLAMA_URL }) {
  const trimmedBody = String(body || '').trim();

  if (!trimmedBody) {
    return '';
  }

  const beautified = await ollamaChat({
    messages: buildBeautifyMessages({ body: trimmedBody, contentType, slug }),
    slug,
    action: 'il beautify',
    baseUrl,
  });

  return `${beautified}\n`;
}

export async function beautifyMdxExcerpt({ body, contentType, slug, baseUrl = process.env.OLLAMA_URL || DEFAULT_OLLAMA_URL }) {
  const trimmedBody = String(body || '').trim();

  if (!trimmedBody) {
    return '';
  }

  const excerpt = await ollamaChat({
    messages: buildExcerptMessages({ body: trimmedBody, contentType, slug }),
    slug,
    action: 'la sintesi excerpt',
    baseUrl,
  });

  return excerpt
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 15)
    .join(' ');
}

export async function beautifyMdxDocument({ source, contentType, slug, baseUrl, mode = 'full' }) {
  const { frontmatter, body } = splitFrontmatter(String(source || ''));
  const excerptSource = mode === 'excerpt-only' ? body : await beautifyMdxBody({ body, contentType, slug, baseUrl });
  const excerpt = await beautifyMdxExcerpt({ body: excerptSource, contentType, slug, baseUrl });

  if (mode === 'excerpt-only') {
    return frontmatter ? `${upsertExcerpt(frontmatter, excerpt)}${body}` : body;
  }

  if (!frontmatter) {
    return excerptSource;
  }

  return `${upsertExcerpt(frontmatter, excerpt)}${excerptSource}`;
}

export { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL };

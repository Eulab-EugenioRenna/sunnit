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

export async function beautifyMdxBody({ body, contentType, slug, baseUrl = process.env.OLLAMA_URL || DEFAULT_OLLAMA_URL }) {
  const trimmedBody = String(body || '').trim();

  if (!trimmedBody) {
    return '';
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_OLLAMA_MODEL,
      stream: false,
      messages: buildBeautifyMessages({ body: trimmedBody, contentType, slug }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama beautify ha risposto con ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const beautified = stripCodeFence(data?.message?.content || '');

  if (!beautified) {
    throw new Error(`Risposta vuota da Ollama durante il beautify di ${slug}`);
  }

  return `${beautified.trim()}\n`;
}

export async function beautifyMdxDocument({ source, contentType, slug, baseUrl }) {
  const { frontmatter, body } = splitFrontmatter(String(source || ''));
  const beautifiedBody = await beautifyMdxBody({ body, contentType, slug, baseUrl });

  if (!frontmatter) {
    return beautifiedBody;
  }

  return `${frontmatter}${beautifiedBody}`;
}

export { DEFAULT_OLLAMA_MODEL, DEFAULT_OLLAMA_URL };

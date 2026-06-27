import "server-only";

import type { CmsEntry } from "./cms-content";
import { getCmsEntry, isCmsEntryEmpty, parseCmsMdxToEntry, saveCmsEntry, serializeCmsEntry } from "./cms-content";

const defaultOllamaModel = "gemma4:31b-cloud";
const defaultOllamaUrl = "http://127.0.0.1:11434";

function stripCodeFence(value: string) {
  const trimmed = String(value || "").trim();
  const fenced = trimmed.match(/^```[a-zA-Z0-9_-]*\n([\s\S]*?)\n```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

async function ollamaChat({
  messages,
  action,
  slug,
}: {
  messages: Array<{ role: "system" | "user"; content: string }>;
  action: string;
  slug: string;
}) {
  const baseUrl = process.env.OLLAMA_URL || defaultOllamaUrl;
  const model = process.env.OLLAMA_MODEL || defaultOllamaModel;
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama ${action} failed for ${slug}: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = stripCodeFence(data?.message?.content || "");

  if (!content) {
    throw new Error(`Ollama returned an empty response for ${slug}.`);
  }

  return content;
}

function buildBeautifyMessages(entry: CmsEntry) {
  return [
    {
      role: "system" as const,
      content: [
        "You format editorial content into clean MDX.",
        "Return only the final document body.",
        "Do not add YAML frontmatter, explanations, notes, or code fences.",
        "Do not invent facts, sections, claims, links, citations, or components.",
        "Preserve the original language and meaning.",
        "Improve readability with solid markdown structure when justified by the text.",
        "Never add MDX imports, JSX, or custom components.",
      ].join(" "),
    },
    {
      role: "user" as const,
      content: [`Beautify this ${entry.type} MDX body for slug "${entry.slug || entry.frontmatter.title}".`, "", entry.body].join("\n"),
    },
  ];
}

function buildExcerptMessages({ body, entry }: { body: string; entry: CmsEntry }) {
  return [
    {
      role: "system" as const,
      content: [
        "You write short editorial excerpts.",
        "Return only one plain-text excerpt line.",
        "Maximum 15 words.",
        "Do not use markdown, quotes, bullets, labels, or trailing explanations.",
        "Preserve the original language and meaning.",
        "Do not invent facts or claims not supported by the source.",
      ].join(" "),
    },
    {
      role: "user" as const,
      content: [`Write an excerpt for this ${entry.type} content.`, "Return only the excerpt text.", "", body].join("\n"),
    },
  ];
}

function buildTranslateMessages({ entry, targetLang }: { entry: CmsEntry; targetLang: string }) {
  return [
    {
      role: "system" as const,
      content: [
        `You translate MDX ${entry.type} content while preserving structure.`,
        "Return only the translated MDX document.",
        "Do not add explanations, notes, or code fences.",
        "Keep YAML frontmatter keys unchanged.",
        "If a date field exists in frontmatter, preserve it exactly.",
        "Keep the image path unchanged.",
        "Preserve markdown and MDX structure exactly as much as possible.",
        "Translate title, excerpt, headings, and body text into the target language.",
        "Keep tags unchanged unless translating them is strictly necessary for meaning.",
        "Do not invent sections or content.",
      ].join(" "),
    },
    {
      role: "user" as const,
      content: [
        `Translate this ${entry.type} entry from ${entry.lang} to ${targetLang}.`,
        `Slug: ${entry.slug || entry.frontmatter.title}.`,
        "Return only the final MDX content.",
        "",
        serializeCmsEntry(entry),
      ].join("\n"),
    },
  ];
}

export async function beautifyCmsEntry(entry: CmsEntry, { mode = "full" }: { mode?: "full" | "excerpt-only" } = {}) {
  const body = mode === "excerpt-only"
    ? entry.body
    : await ollamaChat({
        messages: buildBeautifyMessages(entry),
        action: "beautify",
        slug: entry.slug || entry.frontmatter.title,
      });
  const excerpt = await ollamaChat({
    messages: buildExcerptMessages({ body, entry }),
    action: "excerpt",
    slug: entry.slug || entry.frontmatter.title,
  });

  return {
    ...entry,
    body,
    frontmatter: {
      ...entry.frontmatter,
      excerpt: excerpt.replace(/\s+/g, " ").split(" ").filter(Boolean).slice(0, 15).join(" "),
    },
  } satisfies CmsEntry;
}

export async function translateAndSaveCmsEntry({ entry, targetLang }: { entry: CmsEntry; targetLang: string }) {
  const translatedSource = await ollamaChat({
    messages: buildTranslateMessages({ entry, targetLang }),
    action: "translate",
    slug: entry.slug || entry.frontmatter.title,
  });
  const translatedEntry = parseCmsMdxToEntry({
    type: entry.type,
    lang: targetLang,
    slug: entry.slug,
    source: `${translatedSource.trim()}\n`,
  });

  return saveCmsEntry(translatedEntry);
}

export async function translateAndSaveEmptyCmsEntries({ entry, locales }: { entry: CmsEntry; locales: string[] }) {
  const targets = locales
    .map((locale) => locale.trim())
    .filter((locale, index, source) => locale && locale !== entry.lang && source.indexOf(locale) === index);
  const created: CmsEntry[] = [];
  const skipped: string[] = [];
  const slug = entry.slug || "";

  for (const targetLang of targets) {
    const existingEntry = slug ? await getCmsEntry(entry.type, targetLang, slug) : null;

    if (!isCmsEntryEmpty(existingEntry)) {
      skipped.push(targetLang);
      continue;
    }

    created.push(await translateAndSaveCmsEntry({ entry, targetLang }));
  }

  return { created, skipped };
}

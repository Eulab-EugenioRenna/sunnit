import "server-only";

import fs from "fs";
import path from "path";
import { defaultLocale } from "./i18n";

const BLOG_ROOT = path.join(process.cwd(), "content", "blog");

export type BlogLang = string;

type FrontmatterValue = string | string[];

export type BlogPost = {
  title: string;
  excerpt: string;
  tags: string[];
  image: string;
  lang: BlogLang;
  slug: string;
  createdAt: string;
  createdAtLabel: string;
  body: string;
};

type RawFrontmatter = {
  title?: string;
  excerpt?: string;
  image?: string;
  tags?: string[];
};

function isBlogLang(value: string): value is BlogLang {
  return fs.existsSync(path.join(BLOG_ROOT, value)) && fs.statSync(path.join(BLOG_ROOT, value)).isDirectory();
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function parseArrayValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return [];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const normalized = trimmed.replace(/'/g, '"');
      const parsed = JSON.parse(normalized);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  return trimmed
    .split(",")
    .map((item) => stripQuotes(item.trim()))
    .filter(Boolean);
}

function parseFrontmatter(source: string) {
  if (!source.startsWith("---\n")) {
    return { data: {}, body: source } as { data: RawFrontmatter; body: string };
  }

  const endIndex = source.indexOf("\n---\n", 4);

  if (endIndex === -1) {
    return { data: {}, body: source } as { data: RawFrontmatter; body: string };
  }

  const block = source.slice(4, endIndex);
  const body = source.slice(endIndex + 5);
  const lines = block.split("\n");
  const data: Record<string, FrontmatterValue> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!value) {
      const items: string[] = [];
      let nextIndex = index + 1;

      while (nextIndex < lines.length) {
        const nextLine = lines[nextIndex].trim();

        if (!nextLine.startsWith("- ")) break;

        items.push(stripQuotes(nextLine.slice(2).trim()));
        nextIndex += 1;
      }

      data[key] = items;
      index = nextIndex - 1;
      continue;
    }

    data[key] = value.startsWith("[") ? parseArrayValue(value) : stripQuotes(value);
  }

  return {
    data: {
      title: typeof data.title === "string" ? data.title : undefined,
      excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
      image: typeof data.image === "string" ? data.image : undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
    },
    body,
  };
}

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stripMdx(source: string) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toExcerpt(body: string) {
  const text = stripMdx(body);
  return text.length > 180 ? `${text.slice(0, 177).trim()}...` : text;
}

function getCreatedAt(stats: fs.Stats) {
  const created = Number.isNaN(stats.birthtime.getTime()) ? stats.mtime : stats.birthtime;
  return created;
}

function formatDate(date: Date, lang: BlogLang) {
  const locale = lang === "it" ? "it-IT" : lang === "en" ? "en-US" : `${lang}-${lang.toUpperCase()}`;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getBlogDir(lang: BlogLang) {
  return path.join(BLOG_ROOT, lang);
}

function resolveBlogSourceLang(lang: BlogLang) {
  const requestedDir = getBlogDir(lang);

  if (fs.existsSync(requestedDir)) {
    return lang;
  }

  return defaultLocale;
}

function readPostFile(lang: BlogLang, slug: string) {
  const sourceLang = resolveBlogSourceLang(lang);
  const filePath = path.join(getBlogDir(sourceLang), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    if (sourceLang !== defaultLocale) {
      return readPostFile(defaultLocale, slug);
    }

    return null;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const stats = fs.statSync(filePath);
  const { data, body } = parseFrontmatter(source);
  const createdAtDate = getCreatedAt(stats);

  return {
    title: data.title || slugToTitle(slug),
    excerpt: data.excerpt || toExcerpt(body),
    tags: data.tags || [],
    image: data.image || "",
    lang,
    slug,
    createdAt: createdAtDate.toISOString(),
    createdAtLabel: formatDate(createdAtDate, lang),
    body,
  } satisfies BlogPost;
}

export function getAllBlogPosts(lang: BlogLang) {
  const sourceLang = resolveBlogSourceLang(lang);
  const blogDir = getBlogDir(sourceLang);

  if (!fs.existsSync(blogDir)) {
    return [] as BlogPost[];
  }

  return fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .map((slug) => readPostFile(lang, slug))
    .filter((post): post is BlogPost => Boolean(post))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function getBlogPost(lang: BlogLang, slug: string) {
  return readPostFile(lang, slug);
}

export function getAllBlogSlugs() {
  if (!fs.existsSync(BLOG_ROOT)) {
    return [] as Array<{ lang: BlogLang; slug: string }>;
  }

  return fs
    .readdirSync(BLOG_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isBlogLang(entry.name))
    .flatMap((entry) =>
      fs
        .readdirSync(path.join(BLOG_ROOT, entry.name), { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.endsWith(".mdx"))
        .map((file) => ({
          lang: entry.name,
          slug: file.name.replace(/\.mdx$/, ""),
        }))
    );
}

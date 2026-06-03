import "server-only";

import fs from "fs";
import path from "path";
import { defaultLocale } from "./i18n";

const PORTFOLIO_ROOT = path.join(process.cwd(), "content", "portfolio");

export type PortfolioLang = string;

type FrontmatterValue = string | string[];

export type PortfolioProject = {
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  tone: "blue" | "green" | "purple" | "dark";
  order: number;
  createdAt: string;
  lang: PortfolioLang;
  slug: string;
  body: string;
};

type RawFrontmatter = {
  title?: string;
  excerpt?: string;
  image?: string;
  tag?: string;
  tone?: string;
  order?: string;
};

function isPortfolioLang(value: string): value is PortfolioLang {
  const target = path.join(PORTFOLIO_ROOT, value);
  return fs.existsSync(target) && fs.statSync(target).isDirectory();
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
      tag: typeof data.tag === "string" ? data.tag : undefined,
      tone: typeof data.tone === "string" ? data.tone : undefined,
      order: typeof data.order === "string" ? data.order : undefined,
    },
    body,
  };
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

function getPortfolioDir(lang: PortfolioLang) {
  return path.join(PORTFOLIO_ROOT, lang);
}

function resolvePortfolioSourceLang(lang: PortfolioLang) {
  const requestedDir = getPortfolioDir(lang);

  if (fs.existsSync(requestedDir)) {
    return lang;
  }

  return defaultLocale;
}

function readProjectFile(lang: PortfolioLang, slug: string) {
  const sourceLang = resolvePortfolioSourceLang(lang);
  const filePath = path.join(getPortfolioDir(sourceLang), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    if (sourceLang !== defaultLocale) {
      return readProjectFile(defaultLocale, slug);
    }

    return null;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const stats = fs.statSync(filePath);
  const { data, body } = parseFrontmatter(source);
  const createdAtDate = getCreatedAt(stats);

  return {
    title: data.title || slug,
    excerpt: data.excerpt || toExcerpt(body),
    image: data.image || "",
    tag: data.tag || "Project",
    tone: data.tone === "green" || data.tone === "purple" || data.tone === "dark" ? data.tone : "blue",
    order: data.order ? Number(data.order) || 999 : 999,
    createdAt: createdAtDate.toISOString(),
    lang,
    slug,
    body,
  } satisfies PortfolioProject;
}

export function getAllPortfolioProjects(lang: PortfolioLang) {
  const sourceLang = resolvePortfolioSourceLang(lang);
  const portfolioDir = getPortfolioDir(sourceLang);

  if (!fs.existsSync(portfolioDir)) {
    return [] as PortfolioProject[];
  }

  return fs
    .readdirSync(portfolioDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .map((slug) => readProjectFile(lang, slug))
    .filter((project): project is PortfolioProject => Boolean(project))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export function getPortfolioProject(lang: PortfolioLang, slug: string) {
  return readProjectFile(lang, slug);
}

export function getAllPortfolioSlugs() {
  if (!fs.existsSync(PORTFOLIO_ROOT)) {
    return [] as Array<{ lang: PortfolioLang; slug: string }>;
  }

  return fs
    .readdirSync(PORTFOLIO_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isPortfolioLang(entry.name))
    .flatMap((entry) =>
      fs
        .readdirSync(path.join(PORTFOLIO_ROOT, entry.name), { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.endsWith(".mdx"))
        .map((file) => ({
          lang: entry.name,
          slug: file.name.replace(/\.mdx$/, ""),
        }))
    );
}

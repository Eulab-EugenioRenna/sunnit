import "server-only";

import fs from "fs";
import path from "path";
import { defaultLocale } from "./i18n";
import { normalizeJobCountryValue } from "./job-countries";

const JOBS_ROOT = path.join(process.cwd(), "content", "jobs");

export type JobLang = string;

type FrontmatterValue = string | string[];

export type JobPost = {
  title: string;
  excerpt: string;
  department: string;
  country: string;
  location: string;
  workMode: string;
  contract: string;
  seniority: string;
  status: "open" | "closed";
  date: string;
  lang: JobLang;
  slug: string;
  body: string;
};

type RawFrontmatter = {
  title?: string;
  excerpt?: string;
  department?: string;
  country?: string;
  location?: string;
  workMode?: string;
  contract?: string;
  seniority?: string;
  status?: string;
  date?: string;
};

function isJobLang(value: string): value is JobLang {
  const target = path.join(JOBS_ROOT, value);
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
    data[key] = stripQuotes(value);
  }

  return {
    data: {
      title: typeof data.title === "string" ? data.title : undefined,
      excerpt: typeof data.excerpt === "string" ? data.excerpt : undefined,
      department: typeof data.department === "string" ? data.department : undefined,
      country: typeof data.country === "string" ? data.country : undefined,
      location: typeof data.location === "string" ? data.location : undefined,
      workMode: typeof data.workMode === "string" ? data.workMode : undefined,
      contract: typeof data.contract === "string" ? data.contract : undefined,
      seniority: typeof data.seniority === "string" ? data.seniority : undefined,
      status: typeof data.status === "string" ? data.status : undefined,
      date: typeof data.date === "string" ? data.date : undefined,
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

function slugToTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getJobDir(lang: JobLang) {
  return path.join(JOBS_ROOT, lang);
}

function resolveJobSourceLang(lang: JobLang) {
  const requestedDir = getJobDir(lang);

  if (fs.existsSync(requestedDir)) {
    return lang;
  }

  return defaultLocale;
}

function readJobFile(lang: JobLang, slug: string) {
  const sourceLang = resolveJobSourceLang(lang);
  const filePath = path.join(getJobDir(sourceLang), `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    if (sourceLang !== defaultLocale) {
      return readJobFile(defaultLocale, slug);
    }

    return null;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const { data, body } = parseFrontmatter(source);
  const status = data.status === "closed" ? "closed" : "open";

  return {
    title: data.title || slugToTitle(slug),
    excerpt: data.excerpt || toExcerpt(body),
    department: data.department || "SUNNIT",
    country: normalizeJobCountryValue(data.country),
    location: data.location || "",
    workMode: data.workMode || "",
    contract: data.contract || "",
    seniority: data.seniority || "",
    status,
    date: data.date || "",
    lang,
    slug,
    body,
  } satisfies JobPost;
}

export function getJobPost(lang: JobLang, slug: string) {
  return readJobFile(lang, slug);
}

export function getAllJobs(lang: JobLang, { includeClosed = false } = {}) {
  const sourceLang = resolveJobSourceLang(lang);
  const jobDir = getJobDir(sourceLang);

  if (!fs.existsSync(jobDir)) {
    return [] as JobPost[];
  }

  return fs
    .readdirSync(jobDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.replace(/\.mdx$/, ""))
    .map((slug) => readJobFile(lang, slug))
    .filter((job): job is JobPost => Boolean(job))
    .filter((job) => includeClosed || job.status === "open")
    .sort((left, right) => {
      const rightTime = right.date ? new Date(right.date).getTime() : 0;
      const leftTime = left.date ? new Date(left.date).getTime() : 0;
      return rightTime - leftTime || left.title.localeCompare(right.title);
    });
}

export function getAllJobSlugs() {
  if (!fs.existsSync(JOBS_ROOT)) {
    return [] as Array<{ lang: JobLang; slug: string }>;
  }

  return fs
    .readdirSync(JOBS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isJobLang(entry.name))
    .flatMap((entry) =>
      fs
        .readdirSync(path.join(JOBS_ROOT, entry.name), { withFileTypes: true })
        .filter((file) => file.isFile() && file.name.endsWith(".mdx"))
        .map((file) => ({
          lang: entry.name,
          slug: file.name.replace(/\.mdx$/, ""),
        }))
    );
}

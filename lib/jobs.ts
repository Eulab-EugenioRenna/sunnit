import "server-only";

import { normalizeJobCountryValue } from "./job-countries";
import { getAllSanitySlugs, getSanityContent, getSanityContentList } from "./sanity/content";

export type JobLang = string;

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

function toJobPost(item: Awaited<ReturnType<typeof getSanityContentList>>[number], lang: string): JobPost {
  return {
    title: item.title,
    excerpt: item.excerpt,
    department: item.department || "SUNNIT",
    country: normalizeJobCountryValue(item.country),
    location: item.location || "",
    workMode: item.workMode || "",
    contract: item.contract || "",
    seniority: item.seniority || "",
    status: item.status === "closed" ? "closed" : "open",
    date: item.publishedAt || "",
    lang,
    slug: item.slug,
    body: item.body || "",
  };
}

export async function getJobPost(lang: JobLang, slug: string) {
  const item = await getSanityContent("job", lang, slug);
  return item ? toJobPost(item, lang) : null;
}

export async function getAllJobs(lang: JobLang, { includeClosed = false } = {}) {
  const items = await getSanityContentList("job", lang);
  return items.map((item) => toJobPost(item, lang)).filter((job) => includeClosed || job.status === "open");
}

export function getAllJobSlugs() {
  return getAllSanitySlugs("job");
}

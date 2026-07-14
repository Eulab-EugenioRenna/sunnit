import "server-only";

import { getAllSanitySlugs, getSanityContent, getSanityContentList } from "./sanity/content";

export type PortfolioLang = string;

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

function resolveTone(value?: string): PortfolioProject["tone"] {
  return value === "green" || value === "purple" || value === "dark" ? value : "blue";
}

function toPortfolioProject(
  item: Awaited<ReturnType<typeof getSanityContentList>>[number],
  lang: string,
): PortfolioProject {
  return {
    title: item.title,
    excerpt: item.excerpt,
    image: item.image || "",
    tag: item.tag || "Project",
    tone: resolveTone(item.tone),
    order: item.order ?? 999,
    createdAt: item.publishedAt,
    lang,
    slug: item.slug,
    body: item.body || "",
  };
}

export async function getAllPortfolioProjects(lang: PortfolioLang) {
  const items = await getSanityContentList("portfolioProject", lang);
  return items.map((item) => toPortfolioProject(item, lang));
}

export async function getPortfolioProject(lang: PortfolioLang, slug: string) {
  const item = await getSanityContent("portfolioProject", lang, slug);
  return item ? toPortfolioProject(item, lang) : null;
}

export function getAllPortfolioSlugs() {
  return getAllSanitySlugs("portfolioProject");
}

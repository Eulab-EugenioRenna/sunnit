import "server-only";

import { getAllSanitySlugs, getSanityContent, getSanityContentList } from "./sanity/content";

export type BlogLang = string;

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

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  const locale = lang === "it" ? "it-IT" : lang === "es" ? "es-ES" : "en-US";

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function toBlogPost(item: Awaited<ReturnType<typeof getSanityContentList>>[number], lang: string): BlogPost {
  return {
    title: item.title,
    excerpt: item.excerpt,
    tags: item.tags || [],
    image: item.image || "",
    lang,
    slug: item.slug,
    createdAt: item.publishedAt,
    createdAtLabel: formatDate(item.publishedAt, lang),
    body: item.body || "",
  };
}

export async function getAllBlogPosts(lang: BlogLang) {
  const items = await getSanityContentList("blogPost", lang);
  return items.map((item) => toBlogPost(item, lang));
}

export async function getBlogPost(lang: BlogLang, slug: string) {
  const item = await getSanityContent("blogPost", lang, slug);
  return item ? toBlogPost(item, lang) : null;
}

export function getAllBlogSlugs() {
  return getAllSanitySlugs("blogPost");
}

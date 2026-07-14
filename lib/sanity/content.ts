import { sanityFetch } from "./client";

export type SanityContentType = "blogPost" | "job" | "portfolioProject";

export type SanityContent = {
  _id: string;
  _type: SanityContentType;
  title: string;
  excerpt: string;
  language: string;
  slug: string;
  body: string;
  image: string;
  publishedAt: string;
  tags?: string[];
  tag?: string;
  tone?: string;
  order?: number;
  department?: string;
  country?: string;
  location?: string;
  workMode?: string;
  contract?: string;
  seniority?: string;
  status?: "open" | "closed";
};

const projection = `{
  _id, _type, title, excerpt, language,
  "slug": slug.current,
  body,
  "image": coalesce(image.asset->url, imageUrl, ""),
  "publishedAt": coalesce(publishedAt, _createdAt),
  tags, tag, tone, order, department, country, location, workMode, contract, seniority, status
}`;

export async function getSanityContentList(type: SanityContentType, language: string) {
  const order = type === "portfolioProject" ? "order asc, publishedAt desc" : "publishedAt desc";
  const query = `*[_type == $type && language == $language] | order(${order}) ${projection}`;
  const items = await sanityFetch<SanityContent[]>(query, { type, language }, []);

  if (items.length > 0 || language === "it") return items;
  return sanityFetch<SanityContent[]>(query, { type, language: "it" }, []);
}

export async function getSanityContent(type: SanityContentType, language: string, slug: string) {
  const query = `*[_type == $type && language == $language && slug.current == $slug][0] ${projection}`;
  const item = await sanityFetch<SanityContent | null>(query, { type, language, slug }, null);

  if (item || language === "it") return item;
  return sanityFetch<SanityContent | null>(query, { type, language: "it", slug }, null);
}

export async function getAllSanitySlugs(type: SanityContentType) {
  return sanityFetch<Array<{ lang: string; slug: string }>>(
    `*[_type == $type && defined(slug.current)] {"lang": language, "slug": slug.current}`,
    { type },
    [],
  );
}

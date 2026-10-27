import { sanityFetch } from "./client";

export type SanityContentType = "blogPost" | "job" | "portfolioProject";

export type SanityContent = {
  _id: string;
  _type: SanityContentType;
  title: string;
  seo?: { title?: string; description?: string };
  author?: string;
  contentUpdatedAt?: string;
  translationKey?: string;
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

export const publishedFilter = `!(_id in path("drafts.**")) && defined(slug.current) && dateTime(coalesce(publishedAt, _createdAt)) <= dateTime(now())`;

const projection = `{
  _id, _type, title, excerpt, language, seo, author, contentUpdatedAt, translationKey,
  "slug": slug.current,
  body,
  "image": coalesce(image.asset->url, imageUrl, ""),
  "publishedAt": coalesce(publishedAt, _createdAt),
  tags, tag, tone, order, department, country, location, workMode, contract, seniority, status
}`;

export async function getSanityContentList(type: SanityContentType, language: string) {
  const order = type === "portfolioProject" ? "order asc, publishedAt desc" : "publishedAt desc";
  const query = `*[_type == $type && ${publishedFilter} && language == $language] | order(${order}) ${projection}`;
  const items = await sanityFetch<SanityContent[]>(query, { type, language }, []);

  return items;
}

export async function getSanityContent(type: SanityContentType, language: string, slug: string) {
  const query = `*[_type == $type && ${publishedFilter} && language == $language && slug.current == $slug][0] ${projection}`;
  const item = await sanityFetch<SanityContent | null>(query, { type, language, slug }, null);

  return item;
}

export async function getAllSanitySlugs(type: SanityContentType) {
  return sanityFetch<Array<{ lang: string; slug: string }>>(
    `*[_type == $type && ${publishedFilter}] {"lang": language, "slug": slug.current}`,
    { type },
    [],
  );
}

// Only an explicit editorial translation key establishes equivalence; equal slugs do not.
export async function getContentLanguages(type: SanityContentType, language: string, slug: string) {
  const item = await getSanityContent(type, language, slug);
  if (!item?.translationKey) return [{ language, slug }];
  return sanityFetch<Array<{ language: string; slug: string }>>(
    `*[_type == $type && ${publishedFilter} && translationKey == $key]{language, "slug": slug.current}`,
    { type, key: item.translationKey }, [],
  );
}

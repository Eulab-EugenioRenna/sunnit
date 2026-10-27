import { headers } from "next/headers";
import { getSitemapLocales } from "@/lib/i18n";
import type { MetadataRoute } from "next";
import { seoLocales, staticRoutes, serviceSlugs, pageUrl } from "@/lib/seo";
import { getSanityContentList } from "@/lib/sanity/content";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = await headers();
  const locales = getSitemapLocales(requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "");
  const entries: MetadataRoute.Sitemap = locales.flatMap(lang => [...staticRoutes, ...serviceSlugs.map(slug => `services/${slug}`)].map(path => ({
    url: pageUrl(lang, path), alternates: { languages: Object.fromEntries(seoLocales.map(locale => [locale, pageUrl(locale, path)])) },
  })));
  for (const lang of locales) {
    for (const [type, prefix] of [["blogPost", "blog"], ["portfolioProject", "portfolio"]] as const) {
      const items = await getSanityContentList(type, lang);
      for (const item of items) {
        const modified = item.contentUpdatedAt || item.publishedAt;
        entries.push({ url: pageUrl(lang, `${prefix}/${item.slug}`), ...(modified && Number.isFinite(Date.parse(modified)) ? { lastModified: modified } : {}) });
      }
    }
  }
  return entries;
}

import { pageUrl, siteOrigin } from "./seo";

export type SchemaEntity = Record<string, unknown>;
export const organizationId = `${siteOrigin}/#organization`;
export const websiteId = `${siteOrigin}/#website`;

export function webPageSchema({ lang, path, name, description, type = "WebPage", mainEntity }: {
  lang: string; path: string; name: string; description: string; type?: string; mainEntity?: SchemaEntity;
}) {
  const url = pageUrl(lang, path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url, name, description, inLanguage: lang,
    isPartOf: { "@id": websiteId },
    publisher: { "@id": organizationId },
    ...(mainEntity ? { mainEntity } : {}),
  };
}

export function serviceSchema(lang: string, item: { title: string; summary: string; accent: string }, slug: string) {
  const url = pageUrl(lang, `services/${slug}`);
  return {
    "@type": "Service", "@id": `${url}#service`,
    name: item.title, description: item.summary, url,
    provider: { "@id": organizationId },
    mainEntityOfPage: { "@id": `${url}#webpage` },
  };
}

export function itemListSchema(items: SchemaEntity[]): SchemaEntity {
  return { "@type": "ItemList", numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, item })),
  };
}

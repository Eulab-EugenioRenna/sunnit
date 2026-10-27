import type { Dictionary } from "@/lib/dictionaries";
import { getPageContent, type StaticPagePath } from "@/lib/seo-content";
import { jsonLd, pageUrl, serviceSlugs } from "@/lib/seo";
import { itemListSchema, organizationId, serviceSchema, webPageSchema, type SchemaEntity } from "@/lib/structured-data";

export function PageStructuredData(props: Parameters<typeof webPageSchema>[0]) {
  return <script type="application/ld+json" data-seo="page" dangerouslySetInnerHTML={{ __html: jsonLd(webPageSchema(props)) }} />;
}

export default function StaticPageStructuredData({ lang, path, dictionary, mainEntity }: {
  lang: string; path: StaticPagePath; dictionary: Dictionary; mainEntity?: SchemaEntity;
}) {
  const content = getPageContent(dictionary, path, lang);
  let entity = mainEntity;
  if (path === "services") {
    entity = itemListSchema(dictionary.services.categories.map((service, index) => serviceSchema(lang, service, serviceSlugs[index])));
  } else if (path === "about" || path === "" || path === "contact") {
    entity = { "@id": organizationId };
  } else if (path === "sunnitai") {
    entity = { "@type": "SoftwareApplication", name: dictionary.sunnitai.hero.title,
      description: dictionary.sunnitai.hero.desc, url: pageUrl(lang, path),
      publisher: { "@id": organizationId },
    };
  }
  return <PageStructuredData lang={lang} path={path} {...content} mainEntity={entity} />;
}

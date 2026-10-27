import { getDictionary } from "./dictionaries";
import { pageMetadata } from "./seo";
import { getPageContent, type StaticPagePath } from "./seo-content";

export async function staticPageMetadata(lang: string, path: StaticPagePath) {
  const content = getPageContent(await getDictionary(lang), path, lang);
  return pageMetadata(lang, path, content.name, content.description);
}

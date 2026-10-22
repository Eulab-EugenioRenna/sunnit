import "server-only";
import { cache } from "react";
import { getEcosystemContent, getEcosystemLocale, type EcosystemContent } from "@/lib/ecosystem-content";
import { normalizeEcosystemContent } from "@/lib/ecosystem-validation.mjs";
import { sanityFetch } from "./client";

export const getEcosystemPageContent = cache(async (lang: string): Promise<EcosystemContent> => {
  const locale = getEcosystemLocale(lang);
  const fallback = getEcosystemContent(locale);
  // The review demo remains local until the CMS migration is explicitly activated.
  if (process.env.ECOSYSTEM_CONTENT_SOURCE !== "sanity") return fallback;
  try {
    const document = await sanityFetch<unknown>(
      `*[_type == "ecosystemPage" && _id == $id && language == $language][0]{copy, departments[]{id, label, title, headline, description, skills, projects[]{title, sector, description}}}`,
      { id: `ecosystemPage.${locale}`, language: locale },
      null,
    );
    const content = normalizeEcosystemContent(document, fallback);
    if (!content) console.warn(`[ecosystem] Contenuto ${locale} assente o incompleto: uso il fallback locale.`);
    return content ?? fallback;
  } catch {
    console.warn(`[ecosystem] CMS non disponibile per ${locale}: uso il fallback locale.`);
    return fallback;
  }
});

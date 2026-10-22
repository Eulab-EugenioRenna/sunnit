import it from "@/content/ecosystem/it.json";
import es from "@/content/ecosystem/es.json";
import en from "@/content/ecosystem/en.json";

// Canonical fallback and import source: editorial content adapted from Sunnit's 2026 decks.
export type EcosystemContent = typeof it;
export const ecosystemLocales = ["it", "es", "en"] as const;
export function getEcosystemLocale(lang: string) {
  return lang === "es" || lang === "en" ? lang : "it";
}
export function getEcosystemContent(lang: string): EcosystemContent {
  return { it, es, en }[getEcosystemLocale(lang)];
}

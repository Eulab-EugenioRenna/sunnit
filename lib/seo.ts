import { canonicalOrigins } from "./i18n";
import type { Metadata } from "next";

// All domains share one Vercel deployment; language determines the canonical host.
export const siteOrigin = canonicalOrigins.it;
export const seoLocales = ["it", "en", "es"] as const;
export const staticRoutes = ["", "services", "sunnitai", "about", "contact", "jobs", "blog", "ecosystem"];
export const serviceSlugs = ["software-su-misura", "web", "data-analytics", "cloud", "devops"];
export function pageUrl(lang: string, path = "") {
  return `${canonicalOrigins[lang] || siteOrigin}/${encodeURIComponent(lang)}${path ? `/${path.split("/").map(encodeURIComponent).join("/")}` : ""}`;
}
export function pageMetadata(lang: string, path: string, title: string, description: string, languages: Record<string, string> = Object.fromEntries(seoLocales.map(locale => [locale, pageUrl(locale, path)])), image = "/images/og-image.png"): Metadata {
  const url = pageUrl(lang, path);
  const images = [new URL(image || "/images/og-image.png", canonicalOrigins[lang] || siteOrigin).href];
  return {
    title, description,
    alternates: { canonical: url, languages },
    openGraph: { title: `${title} | SUNNIT`, description, url, siteName: "SUNNIT", locale: { it: "it_IT", en: "en_US", es: "es_ES" }[lang] || lang, type: "website", images },
    twitter: { card: "summary_large_image", title: `${title} | SUNNIT`, description, images },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

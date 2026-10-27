import type { Dictionary } from "./dictionaries";

export type StaticPagePath = "" | "services" | "sunnitai" | "about" | "contact" | "jobs" | "blog";

// This copy is also rendered in the existing blog sidebar.
export function getBlogDescription(lang: string) {
  return lang === "en"
    ? "Practical articles on software delivery, cloud architecture, AI, and product quality."
    : lang === "es"
      ? "Articulos practicos sobre entrega de software, arquitectura cloud, IA y calidad de producto."
      : "Articoli pratici su delivery software, architetture cloud, AI e qualita di prodotto.";
}

export function getPageContent(dictionary: Dictionary, path: StaticPagePath, lang: string) {
  const d = dictionary;
  const pages = {
    "": {
      name: `${d.home.hero.titleStart}${d.home.hero.slides[0].word}${d.home.hero.titleEnd}`,
      description: d.home.hero.slides[0].text || d.home.hero.subtitle,
      type: "WebPage",
    },
    services: { name: d.services.hero.title, description: d.services.hero.text, type: "CollectionPage" },
    sunnitai: { name: d.sunnitai.hero.title, description: d.sunnitai.hero.desc, type: "WebPage" },
    about: { name: d.about.hero.title, description: d.about.intro.desc, type: "AboutPage" },
    contact: { name: d.contact.hero.title, description: d.contact.hero.text, type: "ContactPage" },
    jobs: { name: d.jobs.hero.title, description: d.jobs.hero.text, type: "CollectionPage" },
    blog: { name: d.blog.hero.title, description: getBlogDescription(lang), type: "CollectionPage" },
  };
  return pages[path];
}

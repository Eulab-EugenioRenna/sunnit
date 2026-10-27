import { getDictionary } from "./dictionaries";
import { pageMetadata } from "./seo";

const titles: Record<string, string[]> = {
  it: ["Software, cloud e intelligenza artificiale per aziende", "Sviluppo software, dati, cloud e DevOps", "Intelligenza artificiale per aziende: SunnitAI", "Chi siamo", "Contatti e consulenza tecnologica", "Lavora con noi", "Approfondimenti su software, cloud e AI"],
  en: ["Software, cloud and artificial intelligence for businesses", "Software development, data, cloud and DevOps", "Artificial intelligence for businesses: SunnitAI", "About us", "Contact and technology consulting", "Careers", "Insights on software, cloud and AI"],
  es: ["Software, cloud e inteligencia artificial para empresas", "Desarrollo de software, datos, cloud y DevOps", "Inteligencia artificial para empresas: SunnitAI", "Quiénes somos", "Contacto y consultoría tecnológica", "Trabaja con nosotros", "Artículos sobre software, cloud e IA"],
};
const paths = ["", "services", "sunnitai", "about", "contact", "jobs", "blog"];
export async function staticPageMetadata(lang: string, path: string) {
  const d = await getDictionary(lang);
  const descriptions = [d.home.hero.visualMainDesc, d.services.hero.text, d.sunnitai.hero.desc, d.about.intro.desc, d.contact.hero.text, d.jobs.hero.text, ({ it: "Approfondimenti SUNNIT su sviluppo software, cloud, dati e intelligenza artificiale per aziende.", en: "SUNNIT insights on software development, cloud, data and artificial intelligence for businesses.", es: "Artículos SUNNIT sobre desarrollo de software, cloud, datos e inteligencia artificial para empresas." }[lang] || "SUNNIT insights")];
  const index = paths.indexOf(path);
  return pageMetadata(lang, path, (titles[lang] || titles.it)[index], descriptions[index]);
}

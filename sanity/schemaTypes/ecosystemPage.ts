import { defineArrayMember, defineField, defineType } from "sanity";
import seed from "../../content/ecosystem/it.json";
import { languageField } from "./shared";

const requiredText = (name: string, title: string, multiline = false) => defineField({
  name, title, type: multiline ? "text" : "string",
  ...(multiline ? { rows: 3 } : {}),
  validation: rule => rule.required().custom(value => typeof value === "string" && value.trim() ? true : "Inserire un testo non vuoto."),
});
const labels: Record<string, string> = {
  nav: "Voce del menu e titolo pagina", eyebrow: "Sopratitolo", title: "Titolo principale", accent: "Titolo in evidenza", intro: "Introduzione",
  explore: "Invito a selezionare una competenza", map: "Nome accessibile della mappa", mapTag: "Etichetta della mappa", team: "Etichetta competenze",
  projects: "Etichetta progetti", partner: "Testo del nodo Sunnit", contact: "Invito al contatto", all: "Link alla mappa",
  back: "Ritorno alla mappa", close: "Chiusura finestra", projectDetails: "Invito ad aprire il progetto", projectLabel: "Etichetta progetto",
  relatedSkills: "Competenze nella finestra", scopeHint: "Istruzioni nell’ambito", pause: "Pausa animazioni", play: "Ripresa animazioni",
  ctaEyebrow: "Sopratitolo contatto", ctaTitle: "Titolo contatto", ctaText: "Descrizione contatto", meta: "Descrizione SEO",
  selected: "Etichetta selezione", skills: "Etichetta competenze dell’ambito", examples: "Titolo esempi", examplesIntro: "Introduzione esempi",
  next: "Competenza successiva", previous: "Competenza precedente",
};
export const ecosystemCopy = defineType({
  name: "ecosystemCopy", title: "Testi pagina e interfaccia", type: "object",
  fields: Object.keys(seed.copy).map(key => requiredText(key, labels[key] || key, ["intro", "explore", "scopeHint", "ctaTitle", "ctaText", "meta"].includes(key))),
});
export const ecosystemProject = defineType({
  name: "ecosystemProject", title: "Progetto dell’ecosistema", type: "object",
  fields: [requiredText("title", "Titolo"), requiredText("sector", "Settore"), requiredText("description", "Descrizione del progetto", true)],
  preview: { select: { title: "title", subtitle: "sector" } },
});
export const ecosystemDepartment = defineType({
  name: "ecosystemDepartment", title: "Competenza", type: "object",
  fields: [
    defineField({ name: "id", title: "Nodo della mappa", type: "string", description: "Identità stabile: determina icona e posizione, anche se l’elenco viene riordinato.", options: { list: seed.departments.map(d => ({ title: d.label, value: d.id })) }, readOnly: ({ document }) => Boolean(document?._createdAt), validation: rule => rule.required().custom(value => seed.departments.some(d => d.id === value) || "Selezionare un nodo della mappa.") }),
    requiredText("label", "Etichetta della bolla"), requiredText("title", "Nome completo"), requiredText("headline", "Titolo dell’ambito"), requiredText("description", "Descrizione dell’ambito", true),
    defineField({ name: "skills", title: "Competenze e tecnologie", type: "array", of: [defineArrayMember({ type: "string", validation: rule => rule.required() })], validation: rule => rule.required().min(1).max(8).unique() }),
    defineField({ name: "projects", title: "Bolle progetto", type: "array", of: [defineArrayMember({ type: "ecosystemProject" })], validation: rule => rule.required().min(1).max(4).custom(value => {
      if (!Array.isArray(value)) return true;
      const titles = value.map(item => (item as { title?: string }).title);
      return new Set(titles).size === titles.length || "Ogni progetto deve avere un titolo distinto nell’ambito.";
    }) }),
  ],
  preview: { select: { title: "title", subtitle: "label" } },
});
export const ecosystemPage = defineType({
  name: "ecosystemPage", title: "Ecosistema", type: "document",
  fields: [
    { ...languageField, readOnly: ({ document }) => Boolean(document?._createdAt) },
    defineField({ name: "copy", title: "Testi pagina, etichette e SEO", type: "ecosystemCopy", validation: rule => rule.required() }),
    defineField({ name: "departments", title: "Le nove competenze", type: "array", of: [defineArrayMember({ type: "ecosystemDepartment" })], validation: rule => rule.required().length(9).custom(value => {
      if (!Array.isArray(value)) return true;
      const ids = value.map(item => (item as { id?: string }).id);
      return seed.departments.every(d => ids.includes(d.id)) && new Set(ids).size === 9 || "Inserire ciascuno dei nove nodi esattamente una volta.";
    }) }),
  ],
  validation: rule => rule.custom(document => {
    if (!document?.language) return true;
    return String(document._id).replace(/^drafts\./, "") === `ecosystemPage.${document.language}` || "Modificare la pagina dall’elenco Ecosistema scegliendo la lingua: è prevista una sola pagina per lingua.";
  }),
  preview: { select: { title: "copy.nav", language: "language" }, prepare: ({ title, language }) => ({ title: title || "Ecosistema", subtitle: `Ecosistema · ${String(language || "").toUpperCase()}` }) },
});

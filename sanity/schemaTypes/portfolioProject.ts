import { defineField, defineType } from "sanity";
import { bodyField, imageFields, languageField, slugField } from "./shared";

export const portfolioProject = defineType({
  name: "portfolioProject",
  title: "Portfolio",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    slugField,
    languageField,
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "tag", title: "Etichetta", type: "string" }),
    defineField({
      name: "tone",
      title: "Tono card",
      type: "string",
      initialValue: "blue",
      options: { list: ["blue", "green", "purple", "dark"], layout: "radio" },
    }),
    defineField({ name: "order", title: "Ordine", type: "number", initialValue: 999 }),
    ...imageFields,
    defineField({ name: "publishedAt", title: "Data", type: "datetime", validation: (rule) => rule.required() }),
    bodyField,
  ],
  preview: {
    select: { title: "title", language: "language", tag: "tag", media: "image" },
    prepare: ({ title, language, tag, media }) => ({ title, subtitle: `Portfolio · ${String(language || "-").toUpperCase()} · ${tag || ""}`, media }),
  },
});

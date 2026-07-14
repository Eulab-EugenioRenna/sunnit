import { defineField, defineType } from "sanity";
import { bodyField, languageField, slugField } from "./shared";

export const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    slugField,
    languageField,
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "department", title: "Dipartimento", type: "string" }),
    defineField({
      name: "country",
      title: "Paese",
      type: "string",
      options: { list: [{ title: "Italia", value: "it" }, { title: "Spagna", value: "es" }] },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "location", title: "Sede", type: "string" }),
    defineField({ name: "workMode", title: "Modalità di lavoro", type: "string" }),
    defineField({ name: "contract", title: "Contratto", type: "string" }),
    defineField({ name: "seniority", title: "Seniority", type: "string" }),
    defineField({
      name: "status",
      title: "Stato",
      type: "string",
      initialValue: "open",
      options: { list: [{ title: "Aperta", value: "open" }, { title: "Chiusa", value: "closed" }], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "publishedAt", title: "Data", type: "datetime" }),
    bodyField,
  ],
  preview: {
    select: { title: "title", language: "language", status: "status" },
    prepare: ({ title, language, status }) => ({ title, subtitle: `Job · ${String(language || "-").toUpperCase()} · ${status}` }),
  },
});

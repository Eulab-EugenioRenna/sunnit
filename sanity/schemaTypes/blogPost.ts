import { defineField, defineType } from "sanity";
import { bodyField, imageFields, languageField, slugField } from "./shared";

export const blogPost = defineType({
  name: "blogPost",
  title: "Blog",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titolo", type: "string", validation: (rule) => rule.required() }),
    slugField,
    languageField,
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "tags", title: "Tag", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    ...imageFields,
    defineField({ name: "publishedAt", title: "Data di pubblicazione", type: "datetime", validation: (rule) => rule.required() }),
    bodyField,
  ],
  preview: {
    select: { title: "title", language: "language", media: "image" },
    prepare: ({ title, language, media }) => ({ title, subtitle: `Blog · ${String(language || "-").toUpperCase()}`, media }),
  },
});

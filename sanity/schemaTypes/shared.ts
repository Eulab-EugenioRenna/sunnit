import { defineField, type SlugIsUniqueValidator } from "sanity";

const isSlugUniquePerLanguage: SlugIsUniqueValidator = async (value, context) => {
  const language = context.document?.language;
  if (!value || typeof language !== "string") return false;

  const client = context.getClient({ apiVersion: "2025-02-19" });
  const publishedId = String(context.document?._id || "").replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;
  const count = await client.fetch<number>(
    `count(*[_type == $type && language == $language && slug.current == $slug && !(_id in [$publishedId, $draftId])])`,
    { type: context.document?._type, language, slug: value, publishedId, draftId },
  );

  return count === 0;
};

export const languageField = defineField({
  name: "language",
  title: "Lingua",
  type: "string",
  options: {
    list: [
      { title: "Italiano", value: "it" },
      { title: "English", value: "en" },
      { title: "Español", value: "es" },
    ],
    layout: "radio",
  },
  validation: (rule) => rule.required(),
});

export const slugField = defineField({
  name: "slug",
  title: "Slug",
  type: "slug",
  options: { source: "title", maxLength: 96, isUnique: isSlugUniquePerLanguage },
  validation: (rule) => rule.required(),
});

export const imageFields = [
  defineField({
    name: "image",
    title: "Immagine Sanity",
    type: "image",
    options: { hotspot: true },
  }),
  defineField({
    name: "imageUrl",
    title: "Percorso o URL immagine",
    description: "Fallback per gli asset storici in /public o su URL esterni.",
    type: "string",
  }),
];

export const bodyField = defineField({
  name: "body",
  title: "Corpo Markdown / MDX",
  description: "Markdown compatibile con gli script Ollama beautify e translate.",
  type: "text",
  rows: 28,
  validation: (rule) => rule.required(),
});

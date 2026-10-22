"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "sunnit",
  title: "SUNNIT Content Studio",
  projectId,
  dataset,
  basePath: "/studio",
  schema: {
    types: schemaTypes,
    templates: previous => previous.map(template => template.id === "ecosystemPage" ? {
      ...template,
      parameters: [{ name: "language", title: "Lingua", type: "string" }],
      value: ({ language }: { language: string }) => ({ language }),
    } : template),
  },
  plugins: [structureTool({
    structure: S => S.list().title("Contenuti").items([
      S.listItem().id("ecosystem").title("Ecosistema").child(
        S.list().title("Ecosistema · Lingue").items([
          { language: "it", title: "Italiano" }, { language: "es", title: "Español" }, { language: "en", title: "English" },
        ].map(({ language, title }) => S.listItem().id(`ecosystem-${language}`).title(title).child(
          S.document().schemaType("ecosystemPage").documentId(`ecosystemPage.${language}`).initialValueTemplate("ecosystemPage", { language }),
        ))),
      ),
      ...S.documentTypeListItems().filter(item => item.getId() !== "ecosystemPage"),
    ]),
  })],
  document: {
    newDocumentOptions: previous => previous.filter(option => option.templateId !== "ecosystemPage"),
  },
});

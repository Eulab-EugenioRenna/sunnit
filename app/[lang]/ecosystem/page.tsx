import { PageStructuredData } from "@/components/page-structured-data";
import { itemListSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import EcosystemExplorer from "@/components/ecosystem-explorer";
import { getEcosystemPageContent } from "@/lib/sanity/ecosystem";

type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { copy } = await getEcosystemPageContent(lang);
  return pageMetadata(lang, "ecosystem", `${copy.title} ${copy.accent}`, copy.intro);
}
export default async function EcosystemPage({ params }: Props) {
  const { lang } = await params;
  const content = await getEcosystemPageContent(lang);
  return <>
    <PageStructuredData lang={lang} path="ecosystem" name={`${content.copy.title} ${content.copy.accent}`} description={content.copy.intro} type="CollectionPage" mainEntity={itemListSchema(content.departments.map(department => ({ "@type": "Thing", name: department.label })))} />
    <EcosystemExplorer lang={lang} content={content} />
  </>;
}

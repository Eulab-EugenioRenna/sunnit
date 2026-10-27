import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import EcosystemExplorer from "@/components/ecosystem-explorer";
import { getEcosystemPageContent } from "@/lib/sanity/ecosystem";

type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { copy } = await getEcosystemPageContent(lang);
  return pageMetadata(lang, "ecosystem", copy.nav, copy.meta);
}
export default async function EcosystemPage({ params }: Props) {
  const { lang } = await params;
  const content = await getEcosystemPageContent(lang);
  return <EcosystemExplorer lang={lang} content={content} />;
}

import type { Metadata } from "next";
import EcosystemExplorer from "@/components/ecosystem-explorer";
import { getEcosystemContent } from "@/lib/ecosystem-content";

type Props = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { copy } = getEcosystemContent(lang);
  return { title: copy.nav, description: copy.meta, alternates: { canonical: `/${lang}/ecosystem`, languages: { it: '/it/ecosystem', es: '/es/ecosystem', en: '/en/ecosystem' } }, openGraph: { title: `${copy.nav} | SUNNIT`, description: copy.meta } };
}
export default async function EcosystemPage({ params }: Props) {
  const { lang } = await params;
  return <EcosystemExplorer lang={lang} content={getEcosystemContent(lang)} />;
}

import Link from "next/link";
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
  return <>
    <EcosystemExplorer lang={lang} content={content} />
    <section className="container ecosystem-text-index" aria-label={content.copy.team}>
      <h2>{content.copy.team}</h2>
      {content.departments.map(department => <article key={department.id}>
        <h3>{department.title}</h3><p>{department.description}</p>
        <ul>{department.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
        <h4>{content.copy.projects}</h4>
        <ul>{department.projects.map(project => <li key={project.title}><strong>{project.title}</strong><p>{project.description}</p></li>)}</ul>
      </article>)}
      <Link className="outline-btn" href={`/${lang}/contact`}>{content.copy.contact}</Link>
      <Link className="outline-btn" href={`/${lang}/services`}>{lang === "it" ? "Servizi" : lang === "es" ? "Servicios" : "Services"}</Link>
    </section>
  </>;
}

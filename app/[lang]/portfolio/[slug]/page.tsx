import { normalizeMdxHeadings } from "@/lib/mdx-headings";
import { PageStructuredData } from "@/components/page-structured-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { useMDXComponents } from "@/mdx-components";
import { getPortfolioProject } from "@/lib/portfolio";
import { getSanityContent, getContentLanguages } from "@/lib/sanity/content";
import { pageMetadata, pageUrl, seoLocales } from "@/lib/seo";
import PageHero from "@/components/page-hero";
import SeoBreadcrumbs from "@/components/seo-breadcrumbs";
type Props = { params: Promise<{ lang: string; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const project = await getSanityContent("portfolioProject", lang, slug);
  if (!project) return {};
  const translations = await getContentLanguages("portfolioProject", lang, slug);
  return pageMetadata(lang, `portfolio/${slug}`, project.seo?.title || project.title, project.seo?.description || project.excerpt, Object.fromEntries(translations.filter(item => seoLocales.some(locale => locale === item.language)).map(item => [item.language, pageUrl(item.language, `portfolio/${item.slug}`)])), project.image);
}
export default async function PortfolioPage({ params }: Props) {
  const { lang, slug } = await params;
  const project = await getPortfolioProject(lang, slug);
  if (!project) notFound();
  const { default: Content } = await evaluate(project.body, { ...runtime, remarkPlugins: [normalizeMdxHeadings], useMDXComponents: () => useMDXComponents({}) });
  return <>
    <PageStructuredData lang={lang} path={`portfolio/${slug}`} name={project.title} description={project.excerpt} mainEntity={{ "@type": "CreativeWork", "@id": `${pageUrl(lang, `portfolio/${slug}`)}#project`, name: project.title, description: project.excerpt, mainEntityOfPage: { "@id": `${pageUrl(lang, `portfolio/${slug}`)}#webpage` } }} />
    <SeoBreadcrumbs lang={lang} items={[{ name: project.title, path: `portfolio/${slug}` }]} />
    <PageHero title={project.title} crumb="Portfolio" text={project.excerpt} />
    <article className="container blog-post-card"><div className="blog-post-content"><Content /></div>
      <Link className="outline-btn" href={`/${lang}/contact`}>{lang === "it" ? "Parliamo del tuo progetto" : lang === "es" ? "Hablemos de tu proyecto" : "Let’s discuss your project"}</Link>
    </article>
  </>;
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";
import { pageMetadata, serviceSlugs } from "@/lib/seo";
import PageHero from "@/components/page-hero";
import SeoBreadcrumbs from "@/components/seo-breadcrumbs";
type Props = { params: Promise<{ lang: string; slug: string }> };
async function getService(lang: string, slug: string) {
  const dictionary = await getDictionary(lang);
  return dictionary.services.categories[serviceSlugs.indexOf(slug)] || null;
}
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const service = await getService(lang, slug);
  return service ? pageMetadata(lang, `services/${slug}`, service.title, service.summary) : {};
}
export default async function ServicePage({ params }: Props) {
  const { lang, slug } = await params;
  const service = await getService(lang, slug);
  if (!service) notFound();
  const dictionary = await getDictionary(lang);
  return <>
    <SeoBreadcrumbs lang={lang} items={[{ name: dictionary.services.hero.title, path: "services" }, { name: service.title, path: `services/${slug}` }]} />
    <PageHero title={service.title} crumb={dictionary.services.hero.title} text={service.summary} />
    <article className="container blog-post-card">
      {service.description.map((text: string) => <p key={text}>{text}</p>)}
      <h2>{dictionary.services.intro.title}</h2>
      {service.detail.map((text: string) => <p key={text}>{text}</p>)}
      <ul>{service.bullets.map((text: string) => <li key={text}>{text}</li>)}</ul>
      <Link className="outline-btn" href={`/${lang}/contact`}>{dictionary.services.closing.cta}</Link>
    </article>
  </>;
}

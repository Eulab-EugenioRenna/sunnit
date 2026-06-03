import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import ServicesScrollStory from "@/components/services-scroll-story";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "Services",
  description: "Sviluppo software personalizzato, web, data, cloud e DevOps per aziende."
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const content = (dict as typeof dict & {
    services: {
      hero: { title: string; crumb: string; text: string };
      intro: { eyebrow: string; title: string; text: string[]; cta: string };
      lead: {
        title: string;
        text: string[];
        stats: Array<{ value: string; label: string }>;
      };
      categories: Array<{
        number: string;
        title: string;
        summary: string;
        description: string[];
        detail: string[];
        bullets: string[];
        accent: "software" | "web" | "data" | "cloud" | "devops";
      }>;
      closing: { title: string; text: string[]; points: string[]; cta: string };
    };
  }).services;

  return (
    <>
      <PageHero
        title={content.hero.title}
        crumb={content.hero.crumb}
        text={content.hero.text}
      />

      <section className="container services-lead">
        <GsapReveal className="services-lead__copy">
          <p>{content.intro.eyebrow}</p>
          <h2>{content.intro.title}</h2>
          {content.intro.text.map((paragraph: string) => (
            <span key={paragraph}>{paragraph}</span>
          ))}
          <Link href={`/${lang}/contact`} className="outline-btn">
            {content.intro.cta}
          </Link>
        </GsapReveal>
        <GsapReveal className="services-lead__panel" delay={120} direction="left">
          <small>{content.lead.title}</small>
          <h3>
            {content.lead.text.map((paragraph: string, index: number) => (
              <span key={paragraph}>
                {index > 0 ? <br /> : null}
                {paragraph}
              </span>
            ))}
          </h3>
          <div className="services-lead__stats">
            {content.lead.stats.map((item: { value: string; label: string }) => (
              <div key={item.label} className="services-lead__stat">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </GsapReveal>
      </section>

      <ServicesScrollStory
        eyebrow={content.intro.eyebrow}
        title={content.hero.title}
        items={content.categories}
      />

      <GsapReveal className="container services-closing" distance={28}>
        <div>
          <p>{content.closing.title}</p>
          <h2>
            {content.closing.text.map((paragraph: string, index: number) => (
              <span key={paragraph}>
                {index > 0 ? <br /> : null}
                {paragraph}
              </span>
            ))}
          </h2>
        </div>
        <div>
          <ul className="services-closing__list">
            {content.closing.points.map((point: string) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link href={`/${lang}/contact`} className="outline-btn">
            {content.closing.cta}
          </Link>
        </div>
      </GsapReveal>
    </>
  );
}

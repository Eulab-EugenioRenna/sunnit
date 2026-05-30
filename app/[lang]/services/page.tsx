import type { Metadata } from "next";
import Link from "next/link";
import FAQ from "@/components/faq";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "Services",
  description: "Servizi software, cloud, data, DevOps e AI con layout bento."
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'it' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const cards = (dict as any).services.cards;
  const cases = (dict as any).services.cases;
  const faqItems = (dict as any).services.faqItems;

  return (
    <>
      <PageHero title={dict.services.hero.title} crumb={dict.services.hero.crumb} />

      <section className="container offer-banner">
        <div className="offer-copy">
          <p>{dict.services.banner.eyebrow}</p>
          <h2>{dict.services.banner.title}</h2>
          <p>{dict.services.banner.desc}</p>
          <ul className="check-list">
            {dict.services.banner.list.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href={`/${lang}/contact`} className="outline-btn">{dict.services.banner.cta}</Link>
        </div>
      </section>

      <section className="container dark-grid">
        {cards.slice(0, 3).map((service: any, index: number) => (
          <GsapReveal key={service.title} delay={index * 90}>
            <article className="dark-feature">
              <div>
                <div className="icon-star"><span /></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <Link href={`/${lang}/contact`} className="outline-btn tiny">Discover more</Link>
            </article>
          </GsapReveal>
        ))}
      </section>

      <div className="ghost-marquee">{dict.services.marquee}</div>

      <section className="container">
        <div className="filter-row">
          <button className="active">All</button>
          <button>AI Design</button>
          <button>AI Robots</button>
          <button>AR Media</button>
          <button>UAV Technologies</button>
        </div>
        <div className="case-grid">
          {cases.map((item: any, index: number) => (
            <GsapReveal key={item.title} delay={index * 90} direction="left">
              <article className={`case-card ${item.tone}`}>
                <small>{item.tag}</small>
                <h3>{item.title}</h3>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container faq-panel">
        <div className="intro-copy">
          <p>{dict.services.faq.eyebrow}</p>
          <h2>{dict.services.faq.titleStart} <span style={{ color: "var(--primary)" }}>{dict.services.faq.titleHighlight}</span> {dict.services.faq.titleEnd}</h2>
        </div>
        <div>
          <p style={{ color: "var(--muted)", fontWeight: 700 }}>
            {dict.services.faq.desc}
          </p>
          <FAQ items={faqItems} />
        </div>
      </section>

      <section className="container">
        <SectionTitle title={dict.services.pricing.title} align="center" />
        <div className="filter-row">
          <button className="active">{dict.services.pricing.monthly}</button>
          <button>{dict.services.pricing.yearly}</button>
        </div>
        <div className="pricing-grid">
          <GsapReveal className="price-card">
            <div>
              <small>{dict.services.pricing.starterTitle}</small>
              <strong><sup>$</sup>{dict.services.pricing.starterPrice}<span>{dict.services.pricing.starterPeriod}</span></strong>
              <p>{dict.services.pricing.starterDesc}</p>
            </div>
            <ul>
              {dict.services.pricing.starterList.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={`/${lang}/contact`} className="outline-btn tiny">{dict.services.pricing.starterCta}</Link>
          </GsapReveal>
          <GsapReveal className="price-card gradient" delay={140} direction="left">
            <div>
              <small>{dict.services.pricing.businessTitle}</small>
              <strong><sup>$</sup>{dict.services.pricing.businessPrice}<span>{dict.services.pricing.businessPeriod}</span></strong>
              <p>{dict.services.pricing.businessDesc}</p>
            </div>
            <ul>
              {dict.services.pricing.businessList.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link href={`/${lang}/contact`} className="outline-btn tiny">{dict.services.pricing.businessCta}</Link>
          </GsapReveal>
        </div>
      </section>
    </>
  );
}

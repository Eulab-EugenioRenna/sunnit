import type { Metadata } from "next";
import Link from "next/link";
import FAQ from "@/components/faq";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "SunnitAI",
  description: "Soluzione AI per document intelligence e conoscenza aziendale."
};

export default async function SunnitAIPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'it' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHero title={dict.sunnitai.hero.title} crumb={dict.sunnitai.hero.crumb} />

      <section className="container ai-hero-card">
        <h2>{dict.sunnitai.hero.headline}</h2>
        <p>{dict.sunnitai.hero.desc}</p>
        <div className="hero-actions">
          <Link href={`/${lang}/contact`} className="solid-btn">{dict.sunnitai.hero.cta1}</Link>
          <Link href={`/${lang}/services`} className="outline-btn">{dict.sunnitai.hero.cta2}</Link>
        </div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.sunnitai.features.eyebrow} title={dict.sunnitai.features.title} align="center" />
        <div className="service-grid">
          {dict.sunnitai.features.items.map((item: any, index: number) => (
            <GsapReveal key={item.title} delay={index * 100}>
              <article className={`service-tile ${index === 0 ? "dark" : ""}`} data-index={`0${index + 1}`}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container faq-panel">
        <div className="intro-copy">
          <p>{dict.sunnitai.faq.eyebrow}</p>
          <h2>{dict.sunnitai.faq.title}</h2>
          <p>{dict.sunnitai.faq.desc}</p>
        </div>
        <FAQ items={(dict as any).sunnitai.faq.items} />
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.sunnitai.useCases.eyebrow} title={dict.sunnitai.useCases.title} />
        <div className="usecase-grid">
          {dict.sunnitai.useCases.items.map((item: any, index: number) => (
            <GsapReveal className="usecase-card" key={item.title} delay={index * 70}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </GsapReveal>
          ))}
        </div>
      </section>

      <GsapReveal className="container split-panel">
        <div className="intro-copy">
          <p>{dict.sunnitai.download.eyebrow}</p>
          <h2>{dict.sunnitai.download.title}</h2>
        </div>
        <div>
          <p>{dict.sunnitai.download.desc}</p>
          <Link href={`/${lang}/contact`} className="solid-btn">{dict.sunnitai.download.cta}</Link>
        </div>
      </GsapReveal>
    </>
  );
}

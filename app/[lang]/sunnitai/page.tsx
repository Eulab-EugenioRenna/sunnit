import type { Metadata } from "next";
import FAQ from "@/components/faq";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import TextLines from "@/components/text-lines";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "SunnitAI",
  description: "Soluzione AI per document intelligence e conoscenza aziendale."
};

export default async function SunnitAIPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const company = dict.common.company;

  return (
    <>
      <PageHero title={dict.sunnitai.hero.title} crumb={dict.sunnitai.hero.crumb} />

      <section className="container ai-hero-card">
        <h2>{dict.sunnitai.hero.headline}</h2>
        <TextLines text={dict.sunnitai.hero.desc} />
        <div className="hero-actions">
          <a href={company.presentationPdf} className="solid-btn" download>{dict.sunnitai.hero.cta1}</a>
          <a href={`/${lang}/services`} className="outline-btn">{dict.sunnitai.hero.cta2}</a>
        </div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.sunnitai.features.eyebrow} title={dict.sunnitai.features.title} align="center" />
        <div className="service-grid sunnitai-features-grid">
          {dict.sunnitai.features.items.map((item: any, index: number) => (
            <GsapReveal key={item.title} delay={index * 100}>
              <article
                className={`service-tile sunnitai-feature-tile ${index === 0 ? "dark" : ""}`}
                data-index={`0${index + 1}`}
              >
                <h3>{item.title}</h3>
                <TextLines text={item.text} />
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container faq-panel">
        <div className="intro-copy">
          <p>{dict.sunnitai.faq.eyebrow}</p>
          <h2>{dict.sunnitai.faq.title}</h2>
          <TextLines text={dict.sunnitai.faq.desc} />
        </div>
        <FAQ items={(dict as any).sunnitai.faq.items} />
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.sunnitai.useCases.eyebrow} title={dict.sunnitai.useCases.title} />
        <div className="usecase-grid">
          {dict.sunnitai.useCases.items.map((item: any, index: number) => (
            <GsapReveal className="usecase-card" key={item.title} delay={index * 70}>
              <h3>{item.title}</h3>
              <TextLines text={item.text} />
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
          <TextLines text={dict.sunnitai.download.desc} />
          <a href={company.presentationPdf} className="solid-btn" download>{dict.sunnitai.download.cta}</a>
        </div>
      </GsapReveal>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "About Us",
  description: "Chi siamo, metodo, team e storia SUNNIT."
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: 'en' | 'it' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHero title={dict.about.hero.title} crumb={dict.about.hero.crumb} />

      <section className="container about-intro">
        <GsapReveal className="intro-copy">
          <p>{dict.about.intro.eyebrow}</p>
          <h2>{dict.about.intro.title}</h2>
          <p>{dict.about.intro.desc}</p>
          <Link href={`/${lang}/contact`} className="outline-btn">{dict.about.intro.cta}</Link>
        </GsapReveal>
        <GsapReveal className="visual-card" delay={120} direction="left" scrub={true} />
      </section>

      <section className="container value-cards">
        {dict.about.values.map((item: any, index: number) => (
          <GsapReveal className="value-card" key={item.title} delay={index * 100}>
            <div className="icon-star"><span /></div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </GsapReveal>
        ))}
      </section>

      <GsapReveal className="container visual-wide" scrub={true} distance={20}>
        <div>
          <h2>{dict.about.visualWide.title}</h2>
          <p>{dict.about.visualWide.desc}</p>
        </div>
      </GsapReveal>

      <section className="container stats-strip">
        <div><strong>+15%</strong><span>{dict.about.stats.stat1}</span></div>
        <div><strong>+16K</strong><span>{dict.about.stats.stat2}</span></div>
        <div><strong>+10K</strong><span>{dict.about.stats.stat3}</span></div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.about.story.eyebrow} title={dict.about.story.title} align="center" />
        <div className="timeline-card">
          {dict.about.story.events.map((event: any) => (
            <div className="timeline-row" key={event.year}>
              <div className="timeline-box"><strong>{event.left}</strong><p>{dict.about.story.descLeft}</p></div>
              <b>{event.year}</b>
              <div className="timeline-box"><strong>{event.right}</strong><p>{dict.about.story.descRight}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.about.team.eyebrow} title={dict.about.team.title} />
        <div className="team-grid">
          {dict.about.team.members.map((person: string, index: number) => (
            <GsapReveal className="team-card" key={person} delay={index * 70}>
              <span>{person}</span>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container split-panel">
        <div className="visual-small" />
        <div className="intro-copy">
          <p>{dict.about.whyUs.eyebrow}</p>
          <h2>{dict.about.whyUs.title}</h2>
          <p>{dict.about.whyUs.desc}</p>
        </div>
      </section>

      <GsapReveal className="container quote-card" distance={40}>
        <p>{dict.about.quote.text}</p>
        <strong>{dict.about.quote.author}</strong>
      </GsapReveal>
    </>
  );
}

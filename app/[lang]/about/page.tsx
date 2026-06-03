import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import AboutExpertiseBand from "@/components/about-expertise-band";
import TextLines from "@/components/text-lines";
import { getDictionary } from "@/lib/dictionaries";

export const metadata: Metadata = {
  title: "About Us",
  description: "Chi siamo, metodo, team e storia SUNNIT."
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
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
          <TextLines text={dict.about.intro.desc} />
          <Link href={`/${lang}/contact`} className="outline-btn">{dict.about.intro.cta}</Link>
        </GsapReveal>
        <GsapReveal className="visual-card" delay={120} direction="left" scrub={true} />
      </section>

      <AboutExpertiseBand
        eyebrow={dict.about.expertiseBand.eyebrow}
        title={dict.about.expertiseBand.title}
        description={dict.about.expertiseBand.text}
        logos={dict.about.expertiseBand.logos}
      />

      <GsapReveal className="container visual-wide" scrub={true} distance={20}>
        <div>
          <h2>{dict.about.visualWide.title}</h2>
          <TextLines text={dict.about.visualWide.desc} />
        </div>
      </GsapReveal>

      <section className="container">
        <SectionTitle eyebrow={dict.about.story.eyebrow} title={dict.about.story.title} align="center" />
        <div className="timeline-card">
          {dict.about.story.events.map((event: any) => (
            <div className="timeline-row" key={event.year}>
              <div className="timeline-box"><strong>{event.left}</strong><TextLines text={dict.about.story.descLeft} /></div>
              <b>{event.year}</b>
              <div className="timeline-box"><strong>{event.right}</strong><TextLines text={dict.about.story.descRight} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.about.team.eyebrow} title={dict.about.team.title} />
        <div className="split-panel team-story-panel">
          <GsapReveal className="intro-copy" distance={24}>
            <p>{dict.about.team.story.eyebrow}</p>
            <h2>{dict.about.team.story.title}</h2>
            <TextLines text={dict.about.team.story.desc} />
            <Link href={`/${lang}/contact`} className="outline-btn">{dict.about.team.story.cta}</Link>
          </GsapReveal>
          <div className="team-grid team-grid--compact">
            {dict.about.team.members.map((person: string, index: number) => (
              <GsapReveal className="team-card" key={person} delay={index * 70} direction="left">
                <span>{person}</span>
              </GsapReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container split-panel">
        <div className="visual-small" />
        <div className="intro-copy">
          <p>{dict.about.whyUs.eyebrow}</p>
          <h2>{dict.about.whyUs.title}</h2>
          <TextLines text={dict.about.whyUs.desc} />
        </div>
      </section>

      <GsapReveal className="container quote-card" distance={40}>
        <TextLines text={dict.about.quote.text} />
        <strong>{dict.about.quote.author}</strong>
      </GsapReveal>
    </>
  );
}

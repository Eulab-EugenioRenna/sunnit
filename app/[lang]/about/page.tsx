import StaticPageStructuredData from "@/components/page-structured-data";
import { staticPageMetadata } from "@/lib/seo-pages";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import SectionTitle from "@/components/section-title";
import AboutExpertiseBand from "@/components/about-expertise-band";
import TextLines from "@/components/text-lines";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  return staticPageMetadata((await params).lang, "about");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const imageAlt = lang === "es"
    ? "Estructuras modulares conectadas que representan plataformas digitales"
    : lang === "en"
      ? "Connected modular structures representing digital platforms"
      : "Strutture modulari connesse che rappresentano piattaforme digitali";

  const methodImageAlt = lang === "es"
    ? "Recorridos conectados que convergen en una estructura organizada"
    : lang === "en"
      ? "Connected pathways converging into an organized structure"
      : "Percorsi connessi che convergono in una struttura organizzata";

  return (
    <>
      <StaticPageStructuredData lang={lang} path="about" dictionary={dict} />
      <PageHero title={dict.about.hero.title} crumb={dict.about.hero.crumb} />

      <section className="container about-intro">
        <GsapReveal className="intro-copy">
          <p>{dict.about.intro.eyebrow}</p>
          <h2>{dict.about.intro.title}</h2>
          <TextLines text={dict.about.intro.desc} />
          <Link href={`/${lang}/contact`} className="outline-btn">{dict.about.intro.cta}</Link>
        </GsapReveal>
        <GsapReveal className="visual-card about-image" delay={120} direction="left" scrub={true}>
          <Image
            src="/images/about/digital-platforms.webp"
            alt={imageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 52vw"
            priority
          />
        </GsapReveal>
      </section>

      <AboutExpertiseBand
        eyebrow={dict.about.expertiseBand.eyebrow}
        title={dict.about.expertiseBand.title}
        description={dict.about.expertiseBand.text}
        logos={dict.about.expertiseBand.logos}
      />

      {/* Presentation section hidden until the video is ready.
      <GsapReveal className="container visual-wide" scrub={true} distance={20}>
        <div>
          <h2>{dict.about.visualWide.title}</h2>
          <TextLines text={dict.about.visualWide.desc} />
        </div>
      </GsapReveal>
      */}

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
          {/* Team cards temporarily hidden until final team assets/content are ready.
          <div className="team-grid team-grid--compact">
            {dict.about.team.members.map((person: string, index: number) => (
              <GsapReveal className="team-card" key={person} delay={index * 70} direction="left">
                <span>{person}</span>
              </GsapReveal>
            ))}
          </div>
          */}
        </div>
      </section>

      <section className="container split-panel">
        <div className="visual-small about-image">
          <Image
            src="/images/about/delivery-method.webp"
            alt={methodImageAlt}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
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

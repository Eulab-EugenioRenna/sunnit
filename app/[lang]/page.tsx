import Link from "next/link";
import HeroDynamicCopy from "@/components/hero-dynamic-copy";
import GsapReveal from "@/components/gsap-reveal";
import ScrollVideo from "@/components/scroll-video";
import SectionTitle from "@/components/section-title";
import { cases, clients, posts, processCards, serviceCards } from "@/lib/data";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: 'en' | 'it' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <section className="hero-shell hero-full full-bleed-section">
        <div className="hero-content">
          <HeroDynamicCopy dict={dict} />
          <div className="hero-actions">
            <Link href={`/${lang}/services`} className="solid-btn">{dict.home.hero.ctaPrimary}</Link>
            <Link href={`/${lang}/contact`} className="outline-btn">{dict.home.hero.ctaSecondary}</Link>
          </div>
          <div className="hero-mini-metrics" aria-label="Metriche principali">
            <span><strong>+16K</strong> {dict.home.hero.metric1}</span>
            <span><strong>+70K</strong> {dict.home.hero.metric2}</span>
            <span><strong>24/7</strong> {dict.home.hero.metric3}</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-main">
            <span className="arrow-floating">/</span>
            <strong>{dict.home.hero.visualMainTitle}</strong>
            <p>{dict.home.hero.visualMainDesc}</p>
          </div>
          <div className="hero-visual-card light"><strong>+150k</strong><span>{dict.home.hero.visualCard1}</span></div>
          <div className="hero-visual-card dark"><strong>AI</strong><span>{dict.home.hero.visualCard2}</span></div>
          <div className="hero-visual-card gradient"><strong>100%</strong><span>{dict.home.hero.visualCard3}</span></div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </section>

      <ScrollVideo />

      <section className="container bento-grid" aria-label="Highlights">
        <GsapReveal className="bento-card bento-main">
          <span className="arrow-floating">/</span>
          <p className="card-eyebrow">{dict.home.highlights.eyebrow}</p>
          <h2>{dict.home.highlights.title}</h2>
          <p>{dict.home.highlights.desc}</p>
          <Link href={`/${lang}/services`} className="outline-btn">{dict.home.highlights.cta}</Link>
        </GsapReveal>

        <GsapReveal className="bento-card bento-small bento-kpi-one" delay={100} direction="left">
          <strong>+150k</strong>
          <p>{dict.home.highlights.kpi1Text}</p>
        </GsapReveal>

        <GsapReveal className="bento-card bento-small bento-kpi-two" delay={180} direction="left">
          <strong>+70k</strong>
          <p>{dict.home.highlights.kpi2Text}</p>
        </GsapReveal>

        <GsapReveal className="bento-card bento-side" delay={240} direction="left">
          <span className="arrow-floating">/</span>
          <div className="avatar-stack"><span /><span /><span /></div>
          <h3>{dict.home.highlights.aiTitle}</h3>
          <p>{dict.home.highlights.aiDesc}</p>
          <Link href={`/${lang}/sunnitai`} className="outline-btn">{dict.home.highlights.aiCta}</Link>
        </GsapReveal>
      </section>

      <GsapReveal className="container split-panel full-slab" distance={50}>
        <div>
          <p className="card-eyebrow">{dict.home.howWeWork.eyebrow}</p>
          <h2>{dict.home.howWeWork.titleStart} <span>{dict.home.howWeWork.titleHighlight}</span> {dict.home.howWeWork.titleEnd}</h2>
        </div>
        <div>
          <p>{dict.home.howWeWork.desc}</p>
          <ul className="check-list">
            <li>{dict.home.howWeWork.list1}</li>
            <li>{dict.home.howWeWork.list2}</li>
            <li>{dict.home.howWeWork.list3}</li>
            <li>{dict.home.howWeWork.list4}</li>
          </ul>
        </div>
      </GsapReveal>

      <GsapReveal className="ghost-marquee" scrub={true} direction="none" distance={0}>SOFTWARE CLOUD DATA AI DEVOPS</GsapReveal>

      <section className="container service-showcase">
        <GsapReveal className="service-feature">
          <p className="card-eyebrow">{dict.home.services.eyebrow}</p>
          <h3>{dict.home.services.title}</h3>
          <p>{dict.home.services.desc}</p>
          <Link href={`/${lang}/services`} className="outline-btn">{dict.home.services.cta}</Link>
        </GsapReveal>
        <GsapReveal className="service-rail" delay={120} direction="left"><h3>{dict.home.services.rail1}</h3></GsapReveal>
        <GsapReveal className="service-rail" delay={220} direction="left"><h3>{dict.home.services.rail2}</h3></GsapReveal>
      </section>

      <section className="container">
        <SectionTitle
          eyebrow={dict.home.serviceShowcase.eyebrow}
          title={dict.home.serviceShowcase.title}
          text={dict.home.serviceShowcase.desc}
        />
        <div className="service-grid service-grid-full">
          {serviceCards.map((service, index) => (
            <GsapReveal key={service.title} delay={index * 80}>
              <article className={`service-tile ${index === 0 ? "dark" : ""}`} data-index={service.eyebrow}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul>
                  {service.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.home.process.eyebrow} title={dict.home.process.title} />
        <div className="process-grid">
          {processCards.map((card, index) => (
            <GsapReveal key={card.title} delay={index * 90}>
              <article className="process-card">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container testimonial-stats">
        <GsapReveal className="quote-card">
          <p>{dict.home.stats.quote}</p>
          <strong>{dict.home.stats.author}</strong>
        </GsapReveal>
        <GsapReveal className="stat-card" delay={140} direction="left">
          <span>{dict.home.stats.growthLabel}</span>
          <strong>+273%</strong>
          <p>{dict.home.stats.growthDesc}</p>
          <div className="dot-chart" aria-hidden="true">{Array.from({ length: 55 }).map((_, i) => <i key={i} />)}</div>
        </GsapReveal>
      </section>

      <section className="container">
        <SectionTitle eyebrow={dict.home.cases.eyebrow} title={dict.home.cases.title} align="center" />
        <div className="filter-row">
          <button className="active">{dict.home.cases.filterAll}</button>
          <button>{dict.home.cases.filterAi}</button>
          <button>{dict.home.cases.filterCloud}</button>
          <button>{dict.home.cases.filterData}</button>
          <button>{dict.home.cases.filterUx}</button>
        </div>
        <div className="case-grid case-grid-full">
          {cases.map((item, index) => (
            <GsapReveal key={item.title} delay={index * 90}>
              <article className={`case-card ${item.tone}`}>
                <small>{item.tag}</small>
                <h3>{item.title}</h3>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container blog-section">
        <SectionTitle eyebrow={dict.home.blog.eyebrow} title={dict.home.blog.title} />
        <div className="blog-grid">
          {posts.map((post, index) => (
            <GsapReveal key={post.title} delay={index * 90}>
              <article className="blog-card">
                <div>
                  <small>{post.date} by SUNNIT / {post.category}</small>
                  <h3>{post.title}</h3>
                  <p>{post.text}</p>
                </div>
                <Link href={`/${lang}/blog`} className="outline-btn tiny">{dict.home.blog.readMore}</Link>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="logo-row">
          {clients.map((client) => <div className="logo-pill" key={client}>{client}</div>)}
        </div>
      </section>

      <section className="container cta-band">
        <div>
          <p className="card-eyebrow">{dict.home.cta.eyebrow}</p>
          <h2>{dict.home.cta.title}</h2>
          <p>{dict.home.cta.email}</p>
          <p>{dict.home.cta.phone}</p>
        </div>
        <form className="cta-form form-grid">
          <input placeholder={dict.home.cta.placeholderName} />
          <input placeholder={dict.home.cta.placeholderEmail} />
          <textarea placeholder={dict.home.cta.placeholderMessage} />
          <button type="button" className="dark-btn">{dict.home.cta.send}</button>
        </form>
      </section>
    </>
  );
}

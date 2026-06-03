import Link from "next/link";
import HeroDynamicCopy from "@/components/hero-dynamic-copy";
import GsapReveal from "@/components/gsap-reveal";
import ScrollVideo from "@/components/scroll-video";
import SectionTitle from "@/components/section-title";
import NewsSlider from "@/components/news-slider";
import ServiceScrollPanels from "@/components/service-scroll-panels";
import RotaryServices from "@/components/rotary-services";
import TextLines from "@/components/text-lines";
import { getAllBlogPosts, type BlogLang } from "@/lib/blog";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const content = (dict as any).common.content;
  const posts = getAllBlogPosts(lang as BlogLang).slice(0, 3);

  type client = {
    name: string;
    url: string;
    logo: string;
  }

  return (
    <>
      <section className="hero-shell hero-full full-bleed-section">
        <div className="hero-content">
          <HeroDynamicCopy dict={dict} />
          <div className="hero-actions">
            <Link href={`/${lang}/#services`} className="solid-btn">{dict.home.hero.ctaPrimary}</Link>
            <Link href={`/${lang}/contact`} className="outline-btn">{dict.home.hero.ctaSecondary}</Link>
          </div>

        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-main">
            <span className="arrow-floating">/</span>
            <strong>{dict.home.hero.visualMainTitle}</strong>
            <TextLines text={dict.home.hero.visualMainDesc} />
          </div>
          <div className="hero-visual-card light"><strong>+150k</strong><span>{dict.home.hero.visualCard1}</span></div>
          <div className="hero-visual-card dark"><strong>AI</strong><span>{dict.home.hero.visualCard2}</span></div>
          <div className="hero-visual-card gradient"><strong>100%</strong><span>{dict.home.hero.visualCard3}</span></div>
        </div>
        <div className="hero-orbit" aria-hidden="true" />
      </section>

      <ScrollVideo />

      <section className="container">
        <div className="logo-row">
          {content.clients.map((client: client) => <div className="logo-pill" key={client.name}><img src={client.logo} alt={client.name} /></div>)}
        </div>
      </section>

      {/* <section className="container bento-grid" aria-label="Highlights">
        <GsapReveal className="bento-card bento-main">
          <span className="arrow-floating">/</span>
          <p className="card-eyebrow">{dict.home.highlights.eyebrow}</p>
          <h2>{dict.home.highlights.title}</h2>
          <p>{dict.home.highlights.desc}</p>
          <Link href={`/${lang}/services`} className="outline-btn">{dict.home.highlights.cta}</Link>
        </GsapReveal>

        <GsapReveal className="bento-card bento-small bento-kpi-one" delay={100} direction="left">
          <strong>{dict.home.highlights.kpi1Number}</strong>
          <p>{dict.home.highlights.kpi1Text}</p>
        </GsapReveal>

        <GsapReveal className="bento-card bento-small bento-kpi-two" delay={180} direction="left">
          <strong>{dict.home.highlights.kpi2Number}</strong>
          <p>{dict.home.highlights.kpi2Text}</p>
        </GsapReveal>

        <GsapReveal className="bento-card bento-side" delay={240} direction="left">
          <span className="arrow-floating">/</span>
          <div className="avatar-stack"><span /><span /><span /></div>
          <h3>{dict.home.highlights.aiTitle}</h3>
          <p>{dict.home.highlights.aiDesc}</p>
          <Link href={`/${lang}/sunnitai`} className="outline-btn">{dict.home.highlights.aiCta}</Link>
        </GsapReveal>
      </section> */}

      <GsapReveal className="container split-panel full-slab" distance={50}>
        <div>
          <p className="card-eyebrow">{dict.home.howWeWork.eyebrow}</p>
          <h2>{dict.home.howWeWork.titleStart} <span>{dict.home.howWeWork.titleHighlight}</span> {dict.home.howWeWork.titleEnd}</h2>
        </div>
        <div>
          <TextLines text={dict.home.howWeWork.desc} />
          <ul className="check-list">
            <li>{dict.home.howWeWork.list1}</li>
            <li>{dict.home.howWeWork.list2}</li>
            <li>{dict.home.howWeWork.list3}</li>
            <li>{dict.home.howWeWork.list4}</li>
          </ul>
        </div>
      </GsapReveal>

      <section id="services" className="home-anchor-section">
        <ServiceScrollPanels
          marquee="SOFTWARE CLOUD DATA AI DEVOPS"
          panels={[
            {
              label: "Development",
              title: dict.home.services.title,
              desc: dict.home.services.desc,
              cta: dict.home.services.cta,
              href: `/${lang}/services#software`,
              tone: "development",
            },
            {
              label: dict.home.services.rail1,
              title: (dict.home.services as any).cloudTitle,
              desc: (dict.home.services as any).cloudDesc,
              cta: dict.home.services.cta,
              href: `/${lang}/services#cloud`,
              tone: "cloud",
            },
            {
              label: dict.home.services.rail2,
              title: (dict.home.services as any).aiTitle,
              desc: (dict.home.services as any).aiDesc,
              cta: dict.home.services.cta,
              href: `/${lang}/sunnitai`,
              tone: "ai",
            },
          ]}
        />
      </section>

      <section id="service-showcase" className="container home-anchor-section">
        <SectionTitle
          eyebrow={dict.home.serviceShowcase.eyebrow}
          title={dict.home.serviceShowcase.title}
          text={dict.home.serviceShowcase.desc}
        />
        <RotaryServices cards={dict.home.serviceShowcase.cards} />
      </section>

      <section id="process" className="container home-anchor-section">
        <SectionTitle eyebrow={dict.home.process.eyebrow} title={dict.home.process.title} />
        <div className="process-grid">
          {dict.home.process.cards.map((card: any, index: number) => (
            <GsapReveal key={card.title} delay={index * 90}>
              <article className="process-card">
                <h3>{card.title}</h3>
                <TextLines text={card.text} />
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      {/* <section className="container testimonial-stats">
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
      </section> */}

      <section id="cases" className="container home-anchor-section">
        <SectionTitle eyebrow={dict.home.cases.eyebrow} title={dict.home.cases.title} align="center" />
        <div className="filter-row">
          <button className="active">{dict.home.cases.filterAll}</button>
          <button>{dict.home.cases.filterAi}</button>
          <button>{dict.home.cases.filterCloud}</button>
          <button>{dict.home.cases.filterData}</button>
          <button>{dict.home.cases.filterUx}</button>
        </div>
        <div className="case-grid case-grid-full">
          {dict.home.cases.items.map((item: any, index: number) => (
            <GsapReveal key={item.title} delay={index * 90}>
              <article className={`case-card ${item.tone}`}>
                <small>{item.tag}</small>
                <h3>{item.title}</h3>
              </article>
            </GsapReveal>
          ))}
        </div>
      </section>

      <section id="blog" className="container blog-section home-anchor-section">
        <SectionTitle eyebrow={dict.home.blog.eyebrow} title={dict.home.blog.title} />
        <div style={{ marginTop: 18 }}>
          <NewsSlider posts={posts as any} lang={lang} />
        </div>
      </section>



      <section id="contact" className="container cta-band home-anchor-section">
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

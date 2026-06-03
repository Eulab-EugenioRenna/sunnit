import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/page-hero";
import GsapReveal from "@/components/gsap-reveal";
import { getDictionary } from "@/lib/dictionaries";
import EuropeMap from "@/components/europe-map";
import TextLines from "@/components/text-lines";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contatti e form richiesta consulenza SUNNIT."
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHero
        title={dict.contact.hero.title}
        crumb={dict.contact.hero.crumb}
        text={dict.contact.hero.text}
      />

      <section className="container contact-layout">
        <GsapReveal className="contact-card">
          <h2>{dict.contact.intro.title}</h2>
          <TextLines text={dict.contact.intro.desc} />
          <div className="contact-form-wrap">
            <form className="form-grid">
              <input placeholder={dict.contact.form.name} />
              <input placeholder={dict.contact.form.email} />
              <input placeholder={dict.contact.form.company} />
              <select defaultValue="">
                <option value="" disabled>{dict.contact.form.service}</option>
                {dict.contact.form.services.map((svc: string) => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
              <textarea placeholder={dict.contact.form.message} />
              <button type="button" className="dark-btn">{dict.contact.form.submit}</button>
            </form>
          </div>
        </GsapReveal>

        <div className="contact-info-grid">
          <GsapReveal className="info-card" delay={100} direction="left">
            <h3>{dict.contact.info.email}</h3>
            <a href="mailto:info@sunnit.it">info@sunnit.it</a>
          </GsapReveal>
          <GsapReveal className="info-card" delay={180} direction="left">
            <h3>{dict.contact.info.phone}</h3>
            <a href="tel:+390645251300">+39 06 45251 300</a>
          </GsapReveal>
          <GsapReveal className="info-card" delay={260} direction="left">
            <h3>{dict.contact.info.office}</h3>
            <TextLines text={dict.contact.info.officeAddress} />
            <Link href={`/${lang}/services`} className="outline-btn tiny">{dict.contact.info.cta}</Link>
          </GsapReveal>
          <EuropeMap lang={lang} />
        </div>
      </section>
    </>
  );
}

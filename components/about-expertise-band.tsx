"use client";

import GsapReveal from "@/components/gsap-reveal";
import TextLines from "@/components/text-lines";

type AboutExpertiseBandProps = {
  eyebrow: string;
  title: string;
  description: string;
  logos: Array<{
    src: string;
    alt: string;
    label: string;
  }>;
};

export default function AboutExpertiseBand({
  eyebrow,
  title,
  description,
  logos,
}: AboutExpertiseBandProps) {
  return (
    <section className="container expertise-band">
      <GsapReveal className="expertise-band__copy" distance={26}>
        <p className="card-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <TextLines text={description} />
      </GsapReveal>

      <GsapReveal className="expertise-band__logos" delay={120} direction="left" scrub={true}>
        {logos.map((logo, index) => (
          <div className="expertise-logo-card" key={logo.label}>
            <div className="expertise-logo-card__media">
              <img src={logo.src} alt={logo.alt} className="expertise-logo-card__image" />
            </div>
            <div className="expertise-logo-card__content">
              <h3>{logo.label}</h3>
              <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
            </div>
          </div>
        ))}
      </GsapReveal>
    </section>
  );
}

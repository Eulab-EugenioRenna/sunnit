"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TextLines from "@/components/text-lines";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ServicePanel = {
  label: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  tone: "development" | "cloud" | "ai";
};

export default function ServiceScrollPanels({
  marquee,
  panels,
}: {
  marquee?: string;
  panels: ServicePanel[];
}) {
  const stageRef = useRef<HTMLElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const mobileCardsRef = useRef<Array<HTMLElement | null>>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 720px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!stage || !section || !track || panels.length < 3) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || isMobile || window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      const panelNodes = gsap.utils.toArray<HTMLElement>(".service-scroll-panel");
      const contentNodes = gsap.utils.toArray<HTMLElement>(".service-scroll-panel__content");
      const collapsedWidth = "15%";
      const expandedWidth = "70%";
      const navWrap = document.querySelector<HTMLElement>(".site-header .nav-wrap");
      const pinOffset = (navWrap?.offsetHeight ?? 72) + 60;

      gsap.set(panelNodes[0], { width: expandedWidth, zIndex: 3 });
      gsap.set(panelNodes[1], { width: collapsedWidth, zIndex: 2 });
      gsap.set(panelNodes[2], { width: collapsedWidth, zIndex: 1 });
      gsap.set(contentNodes[0], { autoAlpha: 1, y: 0 });
      gsap.set([contentNodes[1], contentNodes[2]], { autoAlpha: 0, y: 18 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${pinOffset}`,
          end: "+=185%",
          scrub: 0.8,
          pin: section,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(panelNodes[0], { width: collapsedWidth, duration: 1 }, 0)
        .to(panelNodes[1], { width: expandedWidth, duration: 1 }, 0)
        .to(contentNodes[0], { autoAlpha: 0, y: -18, duration: 0.4 }, 0.32)
        .to(contentNodes[1], { autoAlpha: 1, y: 0, duration: 0.5 }, 0.62)
        .to(panelNodes[1], { width: collapsedWidth, duration: 1 }, 1)
        .to(panelNodes[2], { width: expandedWidth, duration: 1, zIndex: 4 }, 1)
        .to(contentNodes[1], { autoAlpha: 0, y: -18, duration: 0.4 }, 1.32)
        .to(contentNodes[2], { autoAlpha: 1, y: 0, duration: 0.5 }, 1.62);
    }, stage);

    return () => ctx.revert();
  }, [isMobile, panels]);

  useEffect(() => {
    if (activeMobilePanel > panels.length - 1) {
      setActiveMobilePanel(0);
    }
  }, [activeMobilePanel, panels.length]);

  useEffect(() => {
    if (!isMobile || panels.length === 0) return;

    const cards = mobileCardsRef.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) return;

        const nextIndex = Number(visibleEntries[0].target.getAttribute("data-mobile-index"));
        if (!Number.isNaN(nextIndex)) {
          setActiveMobilePanel(nextIndex);
        }
      },
      {
        threshold: [0.4, 0.6, 0.8],
        rootMargin: "-10% 0px -35% 0px",
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [isMobile, panels]);

  const scrollToMobilePanel = (index: number) => {
    const card = mobileCardsRef.current[index];
    if (!card) return;

    setActiveMobilePanel(index);
    card.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="service-scroll-stage" ref={stageRef}>
      <div className="container service-scroll-showcase" ref={sectionRef}>
        {marquee ? <div className="ghost-marquee service-scroll-marquee">{marquee}</div> : null}

        {isMobile ? (
          <div className="service-mobile-shell">
            <div className="service-mobile-tabs" aria-label="Service categories">
              {panels.map((panel, index) => (
                <button
                  key={panel.label}
                  type="button"
                  className={`service-mobile-tab ${index === activeMobilePanel ? "is-active" : ""}`}
                  onClick={() => scrollToMobilePanel(index)}
                >
                  {panel.label}
                </button>
              ))}
            </div>

            <div className="service-mobile-stack">
              {panels.map((panel, index) => (
              <article
                key={panel.label}
                ref={(node) => {
                  mobileCardsRef.current[index] = node;
                }}
                data-mobile-index={index}
                className={`service-mobile-card service-scroll-panel--${panel.tone} ${index === activeMobilePanel ? "is-active" : ""}`}
              >
                <div className="service-mobile-card__inner">
                  <p className="card-eyebrow">{panel.label}</p>
                  <h3>{panel.title}</h3>
                  <TextLines text={panel.desc} />
                  <Link href={panel.href} className="outline-btn">
                    {panel.cta}
                  </Link>
                </div>
              </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="service-scroll-track" ref={trackRef}>
            {panels.map((panel) => (
              <article
                key={panel.label}
                className={`service-scroll-panel service-scroll-panel--${panel.tone}`}
                data-label={panel.label}
              >
                <div className="service-scroll-panel__content">
                  <p className="card-eyebrow">{panel.label}</p>
                  <h3>{panel.title}</h3>
                  <TextLines text={panel.desc} />
                  <Link href={panel.href} className="outline-btn">
                    {panel.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

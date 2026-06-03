"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type ServiceStoryItem = {
  number: string;
  title: string;
  summary: string;
  description: readonly string[];
  detail: readonly string[];
  bullets: readonly string[];
  accent: "software" | "web" | "data" | "cloud" | "devops";
};

const sectionIdByAccent: Record<ServiceStoryItem["accent"], string> = {
  software: "software",
  web: "web",
  data: "data",
  cloud: "cloud",
  devops: "devops",
};

export default function ServicesScrollStory({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: readonly ServiceStoryItem[];
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const articleRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = useMemo(() => items[activeIndex] ?? items[0], [activeIndex, items]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = articleRefs.current.filter(Boolean) as HTMLElement[];

      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top center+=40",
          end: "bottom center",
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        });

        gsap.fromTo(
          card,
          { opacity: 0.35, y: 48 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            duration: 0.8,
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      gsap.fromTo(
        ".services-story__preview-inner",
        { y: 24, opacity: 0.7 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: root,
            start: "top 78%",
          },
        }
      );
    }, root);

    return () => ctx.revert();
  }, [items]);

  return (
    <section className="container services-story" ref={rootRef}>
      <div className="services-story__heading">
        <p>{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <div className="services-story__layout">
        <div className="services-story__rail">
          {items.map((item, index) => (
            <article
              key={item.number}
              id={sectionIdByAccent[item.accent]}
              ref={(node) => {
                articleRefs.current[index] = node;
              }}
              className={`services-story-card services-story-card--${item.accent}${
                index === activeIndex ? " is-active" : ""
              }`}
            >
              <div className="services-story-card__meta">
                <span>{item.number}</span>
                <h3>{item.title}</h3>
              </div>
              <p className="services-story-card__summary">{item.summary}</p>
              {item.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {item.detail.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <ul className="services-story-card__list">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <aside className={`services-story__preview services-story__preview--${activeItem.accent}`}>
          <div className="services-story__preview-inner" key={activeItem.number}>
            <span>{activeItem.number}</span>
            <h3>{activeItem.title}</h3>
            <p>{activeItem.summary}</p>
            <div className="services-story__chips">
              {activeItem.bullets.slice(0, 4).map((bullet) => (
                <b key={bullet}>{bullet}</b>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

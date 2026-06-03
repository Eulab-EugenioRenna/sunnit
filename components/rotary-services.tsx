"use client";

import React, { useEffect, useRef, useState } from "react";
import TextLines from "@/components/text-lines";

export default function RotaryServices({ cards }: { cards: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section || cards.length === 0) return;

    if (window.innerWidth <= 720) {
      track.style.transform = "";

      const visibleCards = cardRefs.current.filter(Boolean) as HTMLElement[];
      if (visibleCards.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          const nextActive = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (!nextActive) return;

          const index = Number(nextActive.target.getAttribute("data-rotary-index"));
          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        },
        {
          threshold: [0.35, 0.6, 0.8],
          rootMargin: "-10% 0px -30% 0px",
        }
      );

      visibleCards.forEach((card) => observer.observe(card));

      return () => observer.disconnect();
    }

    const first = track.querySelector<HTMLElement>(".rotary-card");
    if (!first) return;

    const handleScroll = () => {
      const cardW = first.offsetWidth + 20;
      const viewW = section.offsetWidth;
      const maxX = Math.max(0, cards.length * cardW - viewW);
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight / 2 - rect.top) / rect.height));
      const raw = progress * (cards.length - 1);
      const idx = Math.round(raw);
      const clamped = Math.min(idx, cards.length - 1);
      setActiveIndex(clamped);

      const tx = clamped * cardW;
      track.style.transform = `translateX(${-Math.min(tx, maxX)}px)`;
    };

    const handleResize = () => handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [cards]);

  return (
    <section className="rotary-section" ref={sectionRef}>
      <div className="rotary-track" ref={trackRef}>
        {cards.map((card, i) => (
          <article
            key={i}
            ref={(node) => {
              cardRefs.current[i] = node;
            }}
            data-rotary-index={i}
            className={`rotary-card${i === activeIndex ? " rotary-card--active" : ""}`}
          >
            <h3>{card.title}</h3>
            <TextLines text={card.text} />
            <ul>
              {card.bullets?.map((b: string) => <li key={b}>{b}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

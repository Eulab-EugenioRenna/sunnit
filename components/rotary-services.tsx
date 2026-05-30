"use client";

import React, { useEffect, useRef, useState } from "react";

export default function RotaryServices({ cards }: { cards: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section || cards.length === 0) return;

    const first = track.querySelector<HTMLElement>(".rotary-card");
    if (!first) return;
    const cardW = first.offsetWidth + 20;
    const viewW = section.offsetWidth;
    const maxX = Math.max(0, cards.length * cardW - viewW);

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const viewCenter = window.innerHeight / 2;
      const progress = Math.max(0, Math.min(1, (viewCenter - rect.top) / rect.height));
      const raw = progress * (cards.length - 1);
      const idx = Math.round(raw);
      const clamped = Math.min(idx, cards.length - 1);
      setActiveIndex(clamped);

      const tx = clamped * cardW;
      track.style.transform = `translateX(${-Math.min(tx, maxX)}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [cards]);

  return (
    <section className="rotary-section" ref={sectionRef}>
      <div className="rotary-track" ref={trackRef}>
        {cards.map((card, i) => (
          <article
            key={i}
            className={`rotary-card${i === activeIndex ? " rotary-card--active" : ""}`}
          >
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            <ul>
              {card.bullets?.map((b: string) => <li key={b}>{b}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
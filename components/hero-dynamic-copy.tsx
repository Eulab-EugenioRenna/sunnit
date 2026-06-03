"use client";

import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import type { Dictionary } from "@/lib/dictionaries";
import TextLines from "@/components/text-lines";

export default function HeroDynamicCopy({ dict }: { dict: Dictionary }) {
  const [index, setIndex] = useState(0);
  const home = (dict as any).home;
  const slides = home.hero.slides;
  const slide = slides[index];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const kicker = container.querySelector(".hero-kicker");
    const heading = container.querySelector("h1");
    const subcopy = container.querySelector(".hero-subcopy");
    if (!kicker || !heading || !subcopy) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(kicker, { opacity: 0, y: 15, duration: 0.6 })
        .from(heading, { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
        .from(subcopy, { opacity: 0, y: 15, duration: 0.6 }, "-=0.6");
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div className="hero-dynamic-copy" ref={containerRef}>
      <div className="hero-bg-words" aria-hidden="true">
        <span key={`ghost-${slide.word}`}>{slide.word}</span>
      </div>

      <p className="hero-kicker" key={`kicker-${slide.word}`}>
        {slide.kicker}
      </p>

      <h1>
        {home.hero.titleStart}
        <span className="animated-word" aria-live="polite">
          <span key={`word-${slide.word}`}>{slide.word}</span>
        </span>{" "}
        {home.hero.titleEnd}
      </h1>

      <TextLines
        text={slide.text || home.hero.subtitle}
        className="hero-subcopy"
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { heroSlides } from "@/lib/data";
import { gsap } from "gsap";
import type { Dictionary } from "@/lib/dictionaries";

export default function HeroDynamicCopy({ dict }: { dict: Dictionary }) {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index];

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % heroSlides.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(".hero-kicker", { opacity: 0, y: 15, duration: 0.6 })
        .from("h1", { opacity: 0, y: 30, duration: 0.8 }, "-=0.4")
        .from(".hero-subcopy", { opacity: 0, y: 15, duration: 0.6 }, "-=0.6")
        .from(".hero-actions", { opacity: 0, y: 15, duration: 0.6 }, "-=0.5");
        
    }, containerRef);
    
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
        {dict.home.hero.titleStart}
        <span className="animated-word" aria-live="polite">
          <span key={`word-${slide.word}`}>{slide.word}</span>
        </span>{" "}
        {dict.home.hero.titleEnd}
      </h1>

      <p className="hero-subcopy" key={`copy-${slide.word}`}>
        {dict.home.hero.subtitle}
      </p>
    </div>
  );
}

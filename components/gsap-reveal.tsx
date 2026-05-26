"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type GsapRevealProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  scrub?: boolean | number;
};

export default function GsapReveal({ 
  children, 
  className = "", 
  delay = 0,
  direction = "up",
  distance = 34,
  duration = 0.8,
  scrub = false
}: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Se preferisce motion ridotto, non animare
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(element, { opacity: 1, x: 0, y: 0 });
      return;
    }

    let x = 0;
    let y = 0;

    if (direction === "up") y = distance;
    else if (direction === "left") x = -distance;
    else if (direction === "right") x = distance;

    const ctx = gsap.context(() => {
      // Setup iniziale
      gsap.set(element, { 
        opacity: 0, 
        x, 
        y,
        scale: 0.985
      });

      // Animazione ScrollTrigger
      gsap.to(element, {
        scrollTrigger: {
          trigger: element,
          start: scrub ? "top bottom+=100" : "top 90%",
          end: scrub ? "center center" : "bottom top",
          scrub: scrub,
          toggleActions: "play reverse play reverse" // animazioni avanti e indietro
        },
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: scrub ? undefined : duration,
        delay: scrub ? 0 : delay / 1000,
        ease: "power2.out"
      });
    }, element);

    return () => ctx.revert();
  }, [direction, distance, duration, delay, scrub]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

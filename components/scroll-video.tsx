"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    gsap.registerPlugin(ScrollTrigger);

    let timeline: gsap.core.Timeline | undefined;
    let trigger: ScrollTrigger | undefined;
    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set(container, { opacity: 1, scale: 1 });
      }

      timeline = gsap.timeline({ paused: true, defaults: { duration: 0.8, ease: "power3.out" } });
      timeline.fromTo(
        container,
        { scale: 0.8, opacity: 0, transformOrigin: "center center" },
        { scale: 1, opacity: 1 }
      );

      if (prefersReducedMotion) {
        gsap.set(container, { opacity: 1, scale: 1 });
      } else {
        trigger = ScrollTrigger.create({
          trigger: container,
          start: "top bottom",
          end: "center bottom",
          animation: timeline,
          scrub: true,
        });
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              video.play().catch(console.error);
            } else {
              video.pause();
            }
          });
        },
        { threshold: [0, 0.5, 1] }
      );

      observer.observe(container);
    }, container);

    return () => {
      observer?.disconnect();
      trigger?.kill();
      timeline?.kill();
      video.pause();
      ctx.revert();
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="scroll-video-section" 
      aria-label="Video Showcase"
    >
      <video
        ref={videoRef}
        className="scroll-video"
        muted
        playsInline
        loop
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src="/sunnit.mp4" type="video/mp4" />
        Il tuo browser non supporta il tag video.
      </video>
      <div className="scroll-video-overlay" />
    </section>
  );
}

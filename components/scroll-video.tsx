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

    // Assicuriamoci che i plugin siano registrati (anche se fatti nel provider per sicurezza)
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Respect users who prefer reduced motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Ensure visible without animation
        gsap.set(container, { opacity: 1, scale: 1 });
      }

      // Timeline for the zoom-in appearance from center
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.8, ease: "power3.out" } });
      tl.fromTo(
        container,
        { scale: 0.8, opacity: 0, transformOrigin: "center center" },
        { scale: 1, opacity: 1 }
      );

      // Animation ScrollTrigger: link the timeline to scroll so the animation
      // progress follows scroll between start and end (scrubbed animation)
      if (prefersReducedMotion) {
        gsap.set(container, { opacity: 1, scale: 1 });
      } else {
        ScrollTrigger.create({
          trigger: container,
          start: "top bottom", // when top of section hits bottom of viewport
          end: "center bottom", // animation end when center of section meets bottom of viewport
          animation: tl,
          scrub: true,
        });
      }

      // Video playback: use IntersectionObserver to start the video when
      // at least 50% of the section is visible, pause otherwise.
      const io = new IntersectionObserver(
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

      io.observe(container);
    }, container);

    return () => {
      ctx.revert();
      // disconnect any observers created in the context
      try {
        // io is declared above in this scope; guard in case it's missing
        // @ts-ignore
        if (typeof io !== "undefined" && io && typeof io.disconnect === "function") io.disconnect();
      } catch (e) {
        // ignore
      }
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

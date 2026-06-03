"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type PortfolioSliderProject = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  tone: "blue" | "green" | "purple" | "dark";
};

export default function PortfolioSlider({
  projects,
  openLabel,
  onOpenProject,
  autoplay = true,
  autoplayInterval = 4200,
  scrollDuration = 900,
}: {
  projects: PortfolioSliderProject[];
  openLabel: string;
  onOpenProject: (slug: string) => void;
  autoplay?: boolean;
  autoplayInterval?: number;
  scrollDuration?: number;
}) {
  const len = projects.length;
  const [visible, setVisible] = useState(3);
  const [paused, setPaused] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const timerRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateVisible() {
      const width = window.innerWidth;
      if (width < 720) setVisible(1);
      else if (width < 1024) setVisible(2);
      else setVisible(3);
    }

    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const effectiveVisible = Math.max(1, Math.min(visible, len || 1));
  const loopStartIndex = len;

  const orderedProjects = useMemo(() => {
    if (len === 0) return [] as PortfolioSliderProject[];

    return Array.from({ length: len }, (_, index) => projects[(anchorIndex + index) % len]);
  }, [projects, len, anchorIndex]);

  const trackProjects = useMemo(() => {
    if (len === 0) return [] as PortfolioSliderProject[];
    return [...orderedProjects, ...orderedProjects, ...orderedProjects];
  }, [orderedProjects, len]);

  useEffect(() => {
    setAnchorIndex(0);
    setCurrentIndex(loopStartIndex);
    setTransitionEnabled(false);
  }, [loopStartIndex]);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const gap = parseFloat(getComputedStyle(track).gap || "16") || 16;
      const hoverAllowance = 6;
      const width = (viewport.clientWidth - gap * Math.max(effectiveVisible - 1, 0) - hoverAllowance * 2) / effectiveVisible;
      setItemWidth(width);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [effectiveVisible]);

  useEffect(() => {
    if (!autoplay || paused || len <= 1) return;

    timerRef.current = window.setInterval(() => {
      setTransitionEnabled(true);
      setCurrentIndex((value) => value + 1);
    }, autoplayInterval);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [autoplay, paused, autoplayInterval, len]);

  useEffect(() => {
    if (transitionEnabled) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        animatingRef.current = false;
        setTransitionEnabled(true);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [transitionEnabled]);

  if (len === 0) return null;

  const prev = () => {
    if (len <= 1 || animatingRef.current) return;

    animatingRef.current = true;
    setTransitionEnabled(true);
    setCurrentIndex(loopStartIndex - 1);
  };

  const next = () => {
    if (len <= 1 || animatingRef.current) return;

    animatingRef.current = true;
    setTransitionEnabled(true);
    setCurrentIndex(loopStartIndex + 1);
  };

  const handleTransitionEnd = () => {
    if (len <= 1) return;

    if (currentIndex === loopStartIndex) {
      animatingRef.current = false;
      return;
    }

    const delta = currentIndex > loopStartIndex ? 1 : -1;
    setTransitionEnabled(false);
    setAnchorIndex((value) => (value + delta + len) % len);
    setCurrentIndex(loopStartIndex);
  };

  return (
    <div
      className="news-slider portfolio-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button aria-label="Previous" className="news-nav news-nav-left" onClick={prev}>
        ‹
      </button>

      <div className="news-viewport" ref={viewportRef}>
        <div
          className="news-track"
          ref={trackRef}
          role="list"
          onTransitionEnd={handleTransitionEnd}
          style={{
            width: itemWidth ? `${trackProjects.length * itemWidth + Math.max(trackProjects.length - 1, 0) * 16}px` : undefined,
            transform: `translate3d(-${currentIndex * (itemWidth + 16)}px, 0, 0)`,
            transition: transitionEnabled ? `transform ${scrollDuration}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          }}
        >
          {trackProjects.map((project, index) => (
            <button
              type="button"
              key={`${project.slug}-${index}`}
              className="news-item portfolio-card-link"
              role="listitem"
              aria-label={`${openLabel}: ${project.title}`}
              style={{ width: itemWidth ? `${itemWidth}px` : `${100 / effectiveVisible}%` }}
              onClick={() => onOpenProject(project.slug)}
            >
              <article className={`case-card portfolio-card ${project.tone}`}>
                {project.image ? (
                  <div className="portfolio-card__media">
                    <img src={project.image} alt={project.title} className="portfolio-card__image" loading="lazy" />
                  </div>
                ) : null}

                <div className="portfolio-card__body">
                  <small>{project.tag}</small>
                  <h3>{project.title}</h3>
                  <p>{project.excerpt}</p>
                </div>
              </article>
            </button>
          ))}
        </div>
      </div>

      <button aria-label="Next" className="news-nav news-nav-right" onClick={next}>
        ›
      </button>
    </div>
  );
}

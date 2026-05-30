"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export default function NewsSlider({
  posts,
  lang,
  autoplay = true,
  autoplayInterval = 4000,
  scrollDuration = 900,
}: {
  posts: BlogPost[];
  lang: string;
  autoplay?: boolean;
  autoplayInterval?: number;
  scrollDuration?: number;
}) {
  const len = posts.length;
  const [visible, setVisible] = useState(3);
  const [paused, setPaused] = useState(false);
  const [itemWidth, setItemWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const timerRef = useRef<number | null>(null);
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

  const clonesPerSide = Math.min(visible, len);

  const trackPosts = useMemo(() => {
    if (len === 0) return [] as BlogPost[];
    const head = posts.slice(0, clonesPerSide);
    const tail = posts.slice(-clonesPerSide);
    return [...tail, ...posts, ...head];
  }, [posts, len, clonesPerSide]);

  useEffect(() => {
    setCurrentIndex(clonesPerSide);
    setTransitionEnabled(false);
  }, [clonesPerSide]);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const gap = parseFloat(getComputedStyle(track).gap || "16") || 16;
      const hoverAllowance = 6;
      const width = (viewport.clientWidth - gap * Math.max(visible - 1, 0) - hoverAllowance * 2) / Math.max(visible, 1);
      setItemWidth(width);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible]);

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
        setTransitionEnabled(true);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [transitionEnabled]);

  if (len === 0) return null;

  const prev = () => {
    setTransitionEnabled(true);
    setCurrentIndex((value) => value - 1);
  };

  const next = () => {
    setTransitionEnabled(true);
    setCurrentIndex((value) => value + 1);
  };

  const handleTransitionEnd = () => {
    if (len <= 1) return;

    if (currentIndex >= len + clonesPerSide) {
      setTransitionEnabled(false);
      setCurrentIndex(clonesPerSide);
      return;
    }

    if (currentIndex < clonesPerSide) {
      setTransitionEnabled(false);
      setCurrentIndex(len + currentIndex);
    }
  };

  return (
    <div
      className="news-slider"
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
            width: itemWidth ? `${trackPosts.length * itemWidth + Math.max(trackPosts.length - 1, 0) * 16}px` : undefined,
            transform: `translate3d(-${currentIndex * (itemWidth + 16)}px, 0, 0)`,
            transition: transitionEnabled ? `transform ${scrollDuration}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
          }}
        >
          {trackPosts.map((post, index) => (
            <Link
              key={`${post.slug}-${index}`}
              href={`/${lang}/blog/${post.slug}`}
              className="news-item blog-card"
              role="listitem"
              style={{ width: itemWidth ? `${itemWidth}px` : `${100 / Math.max(visible, 1)}%` }}
            >
              {post.image ? (
                <div className="news-image">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
              ) : (
                <div className="news-image" aria-hidden="true" />
              )}
              <h3 className="news-title">{post.title}</h3>
            </Link>
          ))}
        </div>
      </div>

      <button aria-label="Next" className="news-nav news-nav-right" onClick={next}>
        ›
      </button>
    </div>
  );
}

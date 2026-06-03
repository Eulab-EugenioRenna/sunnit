"use client";

import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import GsapReveal from "@/components/gsap-reveal";
import PortfolioModal from "@/components/portfolio-modal";
import PortfolioSlider from "@/components/portfolio-slider";
import { useMDXComponents } from "@/mdx-components";

type PortfolioProject = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tag: string;
  tone: "blue" | "green" | "purple" | "dark";
  body: string;
};

type MdxContentComponent = ComponentType<Record<string, never>>;

async function getMdxContent(body: string) {
  const result = await evaluate(body, {
    ...runtime,
    useMDXComponents: () => useMDXComponents({}),
  });

  return result.default as MdxContentComponent;
}

export default function PortfolioExperience({
  lang,
  projects,
  openLabel,
  closeLabel,
  detailsLabel,
}: {
  lang: string;
  projects: PortfolioProject[];
  openLabel: string;
  closeLabel: string;
  detailsLabel: string;
}) {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<MdxContentComponent | null>(null);

  const activeProject = useMemo(
    () => projects.find((project) => project.slug === activeProjectSlug) ?? null,
    [projects, activeProjectSlug]
  );
  const ActiveContent = activeContent;

  useEffect(() => {
    let cancelled = false;

    if (!activeProject) {
      setActiveContent(null);
      return;
    }

    getMdxContent(activeProject.body).then((Content) => {
      if (!cancelled) {
        setActiveContent(() => Content);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeProject]);

  return (
    <>
      <GsapReveal className="portfolio-grid" distance={24}>
        <PortfolioSlider
          projects={projects}
          openLabel={openLabel}
          onOpenProject={(slug) => setActiveProjectSlug(slug)}
          autoplay={!activeProjectSlug}
        />
      </GsapReveal>

      {activeProject ? (
        <PortfolioModal closeLabel={closeLabel} detailsLabel={detailsLabel} onClose={() => setActiveProjectSlug(null)}>
          <div className="portfolio-modal__panel">
            <div className={`portfolio-modal__hero portfolio-modal__hero--${activeProject.tone}`}>
              <div className="portfolio-modal__hero-copy">
                <small>{activeProject.tag}</small>
                <h3>{activeProject.title}</h3>
                <p>{activeProject.excerpt}</p>
              </div>

              {activeProject.image ? (
                <div className="portfolio-modal__hero-media">
                  <img src={activeProject.image} alt={activeProject.title} className="portfolio-modal__hero-image" />
                </div>
              ) : null}
            </div>

            <div className="portfolio-modal__content">
              {ActiveContent ? <ActiveContent /> : null}
            </div>

            <div className="portfolio-modal__actions">
              <button type="button" className="outline-btn" onClick={() => setActiveProjectSlug(null)}>
                {closeLabel}
              </button>
            </div>
          </div>
        </PortfolioModal>
      ) : null}
    </>
  );
}

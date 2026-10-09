"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUpRight, BrainCircuit, Check, ClipboardCheck, Cloud, Code2, Database, Network, Pause, Play, Plus, ShieldCheck, Smartphone, Workflow, X } from "lucide-react";
import type { EcosystemContent } from "@/lib/ecosystem-content";
import styles from "./ecosystem-explorer.module.css";

const icons = [Database, BrainCircuit, Code2, Smartphone, ClipboardCheck, Cloud, Network, ShieldCheck, Workflow];
const positions = [[50, 14], [74, 22], [88, 44], [81, 71], [62, 87], [38, 87], [19, 71], [12, 44], [26, 22]];
const projectPositions = [[50, 24], [80, 27], [80, 76], [50, 78]];
const mobileProjectPositions = [[27, 60], [73, 60], [27, 84], [73, 84]];

export default function EcosystemExplorer({ lang, content: { copy, departments } }: { lang: string; content: EcosystemContent }) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [projectIndex, setProjectIndex] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [windowPosition, setWindowPosition] = useState({ left: 0, top: 0 });
  const stage = useRef<HTMLElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const projectWindow = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const projectButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollFrame = useRef<number | null>(null);
  const selected = departments[active];
  const project = projectIndex === null ? null : selected.projects[projectIndex];
  const motionPaused = paused || reducedMotion;
  const satellitePositions = selected.projects.length === 4 ? projectPositions : [[54, 25], [81, 51], [54, 77]];
  const mobileSatellitePositions = selected.projects.length === 4 ? mobileProjectPositions : [[27, 60], [73, 60], [50, 84]];

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener('change', sync);
    return () => {
      preference.removeEventListener('change', sync);
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, []);

  useLayoutEffect(() => {
    if (projectIndex === null) return;
    function positionWindow() {
      const panel = projectWindow.current;
      const anchor = projectButtons.current[projectIndex!];
      const workspace = map.current;
      if (!panel || !anchor || !workspace) return;
      const bounds = workspace.getBoundingClientRect();
      const bubble = anchor.getBoundingClientRect();
      const inset = 18;
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      let left = bubble.right - bounds.left + 16;
      if (left + width > bounds.width - inset) left = bubble.left - bounds.left - width - 16;
      // Keep the parent node visible while placing details next to the selected project.
      const isMobile = window.matchMedia('(max-width: 720px)').matches;
      const parent = buttons.current[active]?.getBoundingClientRect();
      const minLeft = !isMobile && parent ? Math.max(inset, parent.right - bounds.left + 18) : inset;
      const top = window.matchMedia('(max-width: 720px)').matches
        ? 370
        : bubble.top - bounds.top + bubble.height / 2 - height / 2;
      setWindowPosition({
        left: Math.max(minLeft, Math.min(left, bounds.width - width - inset)),
        top: Math.max(inset, Math.min(top, bounds.height - height - inset)),
      });
    }
    positionWindow();
    const observer = new ResizeObserver(positionWindow);
    if (map.current) observer.observe(map.current);
    if (projectWindow.current) observer.observe(projectWindow.current);
    return () => observer.disconnect();
  }, [projectIndex, active]);

  function scrollOnMobile(target: HTMLElement | null) {
    if (!target || !window.matchMedia('(max-width: 720px)').matches) return;
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
      scrollFrame.current = null;
    });
  }

  function returnToMap() {
    setExpanded(false);
    setProjectIndex(null);
    setPreview(null);
    buttons.current[active]?.focus({ preventScroll: true });
    scrollOnMobile(stage.current);
  }

  function select(index: number) {
    if (expanded && index === active) {
      returnToMap();
      return;
    }
    setActive(index);
    setExpanded(true);
    setProjectIndex(null);
    setPreview(null);
    scrollOnMobile(stage.current);
  }

  function closeProject() {
    setProjectIndex(null);
    if (projectIndex !== null) projectButtons.current[projectIndex]?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (projectIndex === null) return;
    closeButton.current?.focus({ preventScroll: true });
    scrollOnMobile(projectWindow.current);
    // Opening a window is an explicit action; resize must not move focus or scroll again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIndex]);

  return (
    <div className={styles.page}>
      <section className={`container ${styles.hero}`} aria-labelledby="ecosystem-heading">
        <div>
          <p className={styles.eyebrow}><span />{copy.eyebrow}</p>
          <h1 id="ecosystem-heading">{copy.title}<br /><span>{copy.accent}</span></h1>
          <p className={styles.intro}>{copy.intro}</p>
        </div>
        <a href="#ecosystem-map" className={styles.exploreLink}>{copy.all}<ArrowDown size={20} aria-hidden="true" /></a>
      </section>

      <section ref={stage} id="ecosystem-map" className={`container ${styles.stage} ${expanded ? styles.stageExpanded : ''} ${motionPaused ? styles.paused : ''}`} aria-label={copy.map}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); if (projectIndex !== null) closeProject(); else if (expanded) returnToMap(); } }}>
        <div className={styles.stageTop}>
          {expanded ? <button type="button" className={styles.backButton} onClick={returnToMap}><ArrowLeft size={15} aria-hidden="true" />{copy.back}</button> : <div className={styles.liveLabel}><span />SUNNIT / CONNECTED EXPERTISE</div>}
          <button className={styles.motionButton} type="button" onClick={() => setPaused(!paused)} aria-label={motionPaused ? copy.play : copy.pause} disabled={reducedMotion} title={motionPaused ? copy.play : copy.pause}>
            {motionPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
          </button>
        </div>
        <div ref={map} className={`${styles.map} ${expanded ? styles.expandedMap : ''}`}>
          <svg className={`${styles.connections} ${expanded ? styles.connectionsHidden : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="50" cy="50" rx="38" ry="37" className={styles.orbit} />
            <ellipse cx="50" cy="50" rx="28" ry="25" className={styles.innerOrbit} />
            {positions.map(([x, y], index) => <g key={departments[index].id} className={preview === index ? styles.connectionActive : styles.connection}>
              <path d={`M50 50 L${x} ${y}`} />
              <circle r="0.45" className={styles.particle}><animateMotion dur="4s" repeatCount="indefinite" path={`M50 50 L${x} ${y}`} /></circle>
            </g>)}
          </svg>
          {expanded && <>
            <svg className={`${styles.connections} ${styles.scopeConnectionsDesktop}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {satellitePositions.map(([x, y], index) => <g key={index} className={projectIndex === index ? styles.connectionActive : styles.connection}><path d={`M18 23 Q${x - 14} ${y} ${x} ${y}`} /><circle r="0.45" className={styles.particle}><animateMotion dur="4s" repeatCount="indefinite" path={`M18 23 Q${x - 14} ${y} ${x} ${y}`} /></circle></g>)}
            </svg>
            <svg className={`${styles.connections} ${styles.scopeConnectionsMobile}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {mobileSatellitePositions.map(([x, y], index) => <g key={index} className={projectIndex === index ? styles.connectionActive : styles.connection}><path d={`M50 10 Q50 ${y - 10} ${x} ${y}`} /></g>)}
            </svg>
          </>}
          <div className={`${styles.hub} ${expanded ? styles.hubHidden : ''}`} aria-hidden={expanded}>
            <div className={styles.hubHalo} />
            <Image src="/logo.png" alt="SUNNIT — Coding the future" width={256} height={59} className={styles.hubLogo} />
            <span>{copy.partner}</span>
          </div>
          {departments.map((department, index) => {
            const Icon = icons[index];
            const isParent = expanded && active === index;
            const hidden = expanded && !isParent;
            return <div key={department.id} aria-hidden={hidden} className={`${styles.bubblePosition} ${isParent ? styles.parentPosition : ''} ${hidden ? styles.bubbleHidden : ''}`} style={{ '--x': `${positions[index][0]}%`, '--y': `${positions[index][1]}%`, '--delay': `${index * -0.6}s`, '--entrance': `${index * 55}ms` } as CSSProperties}>
              <button ref={node => { buttons.current[index] = node; }} type="button" disabled={hidden}
                className={`${styles.bubble} ${isParent ? styles.bubbleActive : ''}`}
                aria-expanded={isParent} aria-controls="ecosystem-scope" aria-label={isParent ? `${department.title} — ${copy.back}` : department.title}
                onClick={() => select(index)} onPointerEnter={() => setPreview(index)} onPointerLeave={() => setPreview(null)} onFocus={() => setPreview(index)} onBlur={() => setPreview(null)}
                onKeyDown={event => {
                  if (!expanded && ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                    event.preventDefault();
                    const next = event.key === 'Home' ? 0 : event.key === 'End' ? departments.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + departments.length) % departments.length;
                    buttons.current[next]?.focus({ preventScroll: true });
                  }
                }}>
                <Icon className={styles.bubbleIcon} strokeWidth={1.6} aria-hidden="true" />
                <span className={styles.bubbleBrand}>SUNNIT</span><strong>{department.label}</strong>
                {isParent ? <ArrowLeft className={styles.returnIcon} size={14} aria-hidden="true" /> : <span className={styles.bubbleIndex}>{String(index + 1).padStart(2, '0')}</span>}
              </button>
            </div>;
          })}

          {expanded && <div id="ecosystem-scope" className={styles.scope}>
            <div className={styles.scopeDescription} key={selected.id}>
              <p className={styles.eyebrow}>{selected.title}</p>
              <h2>{selected.headline}</h2><p>{selected.description}</p>
              <ul className={styles.scopeSkills}>{selected.skills.map(skill => <li key={skill}><Check size={12} aria-hidden="true" />{skill}</li>)}</ul>
            </div>
            {selected.projects.map((item, index) => <div key={item.title} className={styles.projectPosition} style={{ '--x': `${satellitePositions[index][0]}%`, '--y': `${satellitePositions[index][1]}%`, '--mx': `${mobileSatellitePositions[index][0]}%`, '--my': `${mobileSatellitePositions[index][1]}%`, '--entrance': `${180 + index * 100}ms` } as CSSProperties}>
              <button ref={node => { projectButtons.current[index] = node; }} className={`${styles.projectBubble} ${projectIndex === index ? styles.projectBubbleActive : ''}`} type="button" onClick={() => setProjectIndex(index)} aria-haspopup="dialog" aria-expanded={projectIndex === index} aria-controls={projectIndex === index ? 'ecosystem-project-detail' : undefined}>
                <span>{item.sector}</span><strong>{item.title}</strong><Plus size={20} aria-hidden="true" /><small>{copy.projectDetails}</small>
              </button>
            </div>)}
          </div>}

          {project && <aside ref={projectWindow} id="ecosystem-project-detail" role="dialog" aria-modal="false" aria-labelledby="ecosystem-project-title" className={styles.projectWindow} style={{ left: windowPosition.left, top: windowPosition.top }}>
            <div className={styles.windowHeader}><span>{selected.label} / {copy.projectLabel}</span><button ref={closeButton} type="button" onClick={closeProject} aria-label={copy.close}><X size={18} /></button></div>
            <div className={styles.windowContent} key={project.title}>
              <p className={styles.eyebrow}>{project.sector}</p><h3 id="ecosystem-project-title">{project.title}</h3>
              <p>{project.description}</p>
              <p className={styles.windowSkillsLabel}>{copy.relatedSkills}</p>
              <ul>{selected.skills.map(skill => <li key={skill}><Check size={13} aria-hidden="true" />{skill}</li>)}</ul>
              <Link href={`/${lang}/contact`} className={styles.textLink}>{copy.contact}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </aside>}
        </div>
        <div className={styles.stageBottom}>
          <p aria-live="polite" aria-atomic="true">{expanded ? `${selected.title}. ${copy.scopeHint}` : copy.explore}</p>
          <span><b>{expanded ? String(selected.projects.length).padStart(2, '0') : '09'}</b> {expanded ? copy.projects : copy.team}{!expanded && <><i /><b>28</b> {copy.projects}</>}</span>
        </div>
      </section>
      <section className={`container ${styles.cta}`}>
        <div><p className={styles.eyebrow}>LET’S CONNECT</p><h2>{copy.ctaTitle}</h2><p>{copy.ctaText}</p></div>
        <Link href={`/${lang}/contact`} className={styles.ctaLink}><ArrowUpRight size={36} aria-hidden="true" /><span>{copy.contact}</span></Link>
      </section>
    </div>
  );
}

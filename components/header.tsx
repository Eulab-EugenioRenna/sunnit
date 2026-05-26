"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";

export default function Header({ dict, lang, availableLocales }: { dict: Dictionary; lang: string; availableLocales: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnRect, setBtnRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdown on click outside or window resize
    const handleClick = () => setIsLangOpen(false);
    const handleResize = () => setIsLangOpen(false);
    
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navItems = [
    { href: `/${lang}`, label: dict.common.header.homepage, exact: true },
    { href: `/${lang}/services`, label: dict.common.header.services },
    { href: `/${lang}/sunnitai`, label: dict.common.header.sunnitai },
    { href: `/${lang}/about`, label: dict.common.header.about },
    { href: `/${lang}/blog`, label: dict.common.header.blog },
    { href: `/${lang}/contact`, label: dict.common.header.contact },
  ];

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLangOpen && btnRef.current) {
      setBtnRect(btnRef.current.getBoundingClientRect());
    }
    setIsLangOpen(!isLangOpen);
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;
    const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPathname || `/${newLang}`);
    setIsLangOpen(false);
  };

  const langSelectorContent = (
    <div 
      className="lang-dropdown-portal"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: btnRect ? btnRect.bottom + 8 : -999, // Hide completely if not measured yet
        left: btnRect ? btnRect.right - 80 : "auto",
        width: "80px",
        background: "var(--background, #fff)",
        border: "1px solid var(--border, #eaeaea)",
        borderRadius: "var(--radius, 8px)",
        padding: "0.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        zIndex: 99999,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        opacity: 1, // Opaco
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transformOrigin: "top center",
        transform: isLangOpen ? "translateY(0)" : "translateY(-20px)",
        clipPath: isLangOpen ? "inset(-10px -10px -10px -10px)" : "inset(0 0 100% 0)",
        pointerEvents: isLangOpen ? "auto" : "none",
        visibility: isLangOpen ? "visible" : "hidden"
      }}
    >
      {availableLocales.map(l => (
        <button 
          key={l}
          style={{ 
            background: l === lang ? "var(--muted, #f5f5f5)" : "transparent", 
            border: "none", 
            color: "var(--foreground, #000)", 
            cursor: "pointer", 
            padding: "0.5rem",
            textAlign: "center",
            fontWeight: l === lang ? "bold" : "normal",
            borderRadius: "4px"
          }} 
          onClick={() => handleLanguageChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href={`/${lang}`} className="brand" aria-label="SUNNIT home">
          <span className="brand-mark">
            <i />
            <b />
          </span>
          <span>SUNNIT</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          <button 
            className="search-trigger" 
            type="button" 
            aria-label="Open search"
            onClick={() => window.dispatchEvent(new Event("open-spotlight"))}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              borderRadius: "50%",
              transition: "background 0.2s, color 0.2s"
            }}
          >
            <Search size={18} />
          </button>

          <button 
            ref={btnRef}
            className="lang-switch" 
            type="button" 
            aria-label="Change language"
            onClick={toggleLang}
          >
            {lang.toUpperCase()}
          </button>
          {mounted && createPortal(langSelectorContent, document.body)}
          
          <Link className="outline-btn tiny" href={`/${lang}/contact`}>
            {dict.common.header.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

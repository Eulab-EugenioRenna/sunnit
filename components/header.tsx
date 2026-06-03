"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  hasDropdown?: boolean;
  children?: { href: string; label: string; isExternal?: boolean }[];
}

export default function Header({ dict, lang, availableLocales }: { dict: Dictionary; lang: string; availableLocales: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => {
      setIsLangOpen(false);
      setIsAiOpen(false);
    };
    const handleResize = () => {
      setIsLangOpen(false);
      setIsAiOpen(false);
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setIsLangOpen(false);
    setIsAiOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
        { href: `/${lang}/about`, label: dict.common.header.about },

    { href: `/${lang}/services`, label: dict.common.header.services },
    { 
      href: `/${lang}/sunnitai`, 
      label: dict.common.header.sunnitai,
      hasDropdown: true,
      children: [
        { href: "https://astrea.sunnit.ai/", label: "Astrea", isExternal: true }
      ]
    },
    { href: `/${lang}/blog`, label: dict.common.header.blog },
    { href: `/${lang}/contact`, label: dict.common.header.contact },
  ];

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLangOpen((open) => !open);
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang === lang) return;
    const newPathname = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPathname || `/${newLang}`);
    setIsLangOpen(false);
  };



  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href={`/${lang}`} className="brand" aria-label="SUNNIT home">
          <Image src="/logo.png" alt="SUNNIT" width={152} height={44} priority className="brand-logo" />
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => {
            if (item.hasDropdown) {
              const active = pathname.startsWith(item.href);
              return (
                <div
                  key={item.href}
                  ref={aiRef}
                  className="nav-item-dropdown-container"
                  onMouseEnter={() => setIsAiOpen(true)}
                  onMouseLeave={() => setIsAiOpen(false)}
                >
                  <div className="dropdown-trigger-wrapper">
                    <Link
                      href={item.href}
                      className={`dropdown-trigger ${active ? "active" : ""}`}
                    >
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      className="dropdown-caret-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAiOpen((open) => !open);
                      }}
                      aria-label="Toggle submenu"
                    >
                      <ChevronDown size={12} className={`dropdown-caret ${isAiOpen ? "open" : ""}`} />
                    </button>
                  </div>
                  
                  <div className={`nav-dropdown-menu ${isAiOpen ? "show" : ""}`}>
                    {item.children?.map((child) => {
                      if (child.isExternal) {
                        return (
                          <a
                            key={child.href}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dropdown-link"
                          >
                            {child.label}
                          </a>
                        );
                      }
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`dropdown-link ${childActive ? "active" : ""}`}
                          onClick={() => setIsAiOpen(false)}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

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

          <div style={{ position: "relative" }}>
            <button
              ref={btnRef}
              className="lang-switch"
              type="button"
              aria-label="Change language"
              onClick={toggleLang}
            >
              {lang.toUpperCase()}
            </button>
            <div
              className="lang-dropdown-portal"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
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
                opacity: 1,
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
          </div>

          <Link className="outline-btn tiny" href={`/${lang}/contact`}>
            {dict.common.header.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}

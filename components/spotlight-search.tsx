"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, FileText, CornerDownLeft, Laptop, Info, Mail, Award, Cpu, BookOpen } from "lucide-react";

interface SearchItem {
  title: string;
  subtitle: string;
  searchText: string;
  category: "pagine" | "articoli";
  href: string;
  icon: React.ReactNode;
}

type SpotlightArticle = {
  title: string;
  excerpt: string;
  content: string;
  createdAtLabel: string;
  href: string;
  tags: string[];
};

export default function SpotlightSearch({ articles }: { articles: SpotlightArticle[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Detect current language from pathname (defaults to 'it')
  const lang = pathname?.startsWith("/en") ? "en" : "it";

  // Define searchable items based on language
  const getSearchItems = (): SearchItem[] => {
    const isEn = lang === "en";
    
    const pages: SearchItem[] = [
      {
        title: isEn ? "Homepage" : "Homepage",
        subtitle: isEn ? "Back to home page" : "Torna alla pagina principale",
        searchText: `${isEn ? "Homepage" : "Homepage"} ${isEn ? "Back to home page" : "Torna alla pagina principale"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}`,
        icon: <Laptop className="search-icon-svg" size={18} />
      },
      {
        title: isEn ? "Services & Expertise" : "Servizi & Competenze",
        subtitle: isEn ? "What we do: Software, cloud, DevOps, AI" : "Cosa facciamo: Software, cloud, DevOps, AI",
        searchText: `${isEn ? "Services & Expertise" : "Servizi & Competenze"} ${isEn ? "What we do: Software, cloud, DevOps, AI" : "Cosa facciamo: Software, cloud, DevOps, AI"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/services`,
        icon: <Award className="search-icon-svg" size={18} />
      },
      {
        title: "SunnitAI",
        subtitle: isEn ? "Document intelligence & generative AI solutions" : "Soluzioni AI e document intelligence avanzata",
        searchText: `SunnitAI ${isEn ? "Document intelligence & generative AI solutions" : "Soluzioni AI e document intelligence avanzata"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/sunnitai`,
        icon: <Cpu className="search-icon-svg" size={18} />
      },
      {
        title: isEn ? "About Us" : "Chi Siamo",
        subtitle: isEn ? "Our history, team, and digital philosophy" : "La nostra storia, il team e la filosofia digitale",
        searchText: `${isEn ? "About Us" : "Chi Siamo"} ${isEn ? "Our history, team, and digital philosophy" : "La nostra storia, il team e la filosofia digitale"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/about`,
        icon: <Info className="search-icon-svg" size={18} />
      },
      {
        title: "Blog & Insights",
        subtitle: isEn ? "Articles, news, and technical guides" : "Articoli, news e guide tecniche",
        searchText: `Blog & Insights ${isEn ? "Articles, news, and technical guides" : "Articoli, news e guide tecniche"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/blog`,
        icon: <BookOpen className="search-icon-svg" size={18} />
      },
      {
        title: isEn ? "Contact Us" : "Contattaci",
        subtitle: isEn ? "Get in touch for a technical assessment" : "Entra in contatto per una valutazione tecnica",
        searchText: `${isEn ? "Contact Us" : "Contattaci"} ${isEn ? "Get in touch for a technical assessment" : "Entra in contatto per una valutazione tecnica"}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/contact`,
        icon: <Mail className="search-icon-svg" size={18} />
      }
    ];

    const articleItems: SearchItem[] = articles.map((post) => ({
      title: post.title,
      subtitle: `${post.createdAtLabel}${post.tags[0] ? ` • ${post.tags[0]}` : ""} - ${post.excerpt.substring(0, 60)}...`,
      searchText: [post.title, post.excerpt, post.content, post.tags.join(" ")].join(" ").toLowerCase(),
      category: "articoli",
      href: post.href,
      icon: <FileText className="search-icon-svg" size={18} />
    }));

    return [...pages, ...articleItems];
  };

  const allItems = getSearchItems();

  // Filter items based on user input
  const normalizedQuery = query.trim().toLowerCase();

  const filteredItems = normalizedQuery === ""
    ? allItems.slice(0, 6)
    : allItems.filter((item) => item.searchText.includes(normalizedQuery));

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Handle global Cmd+K or Ctrl+K shortcut and Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-spotlight", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-spotlight", handleCustomOpen);
    };
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden"; // Disable background scrolling
    } else {
      setQuery("");
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle keyboard navigation inside the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filteredItems[activeIndex]);
    }
  };

  const handleSelect = (item: SearchItem) => {
    router.push(item.href);
    setIsOpen(false);
  };

  // Close modal when clicking outside the container
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="spotlight-backdrop" onClick={handleBackdropClick}>
      <div className="spotlight-container" ref={modalRef} onKeyDown={handleKeyDown}>
        <div className="spotlight-search-header">
          <Search className="spotlight-search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder={lang === "en" ? "Search pages, posts... (Esc to close)" : "Cerca pagine, articoli... (Esc per chiudere)"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="spotlight-shortcut-badge">ESC</kbd>
        </div>

        <div className="spotlight-results">
          {filteredItems.length > 0 ? (
            <div className="spotlight-group">
              <div className="spotlight-group-title">
                {query.trim() === "" 
                  ? (lang === "en" ? "Quick Links" : "Collegamenti Rapidi") 
                  : (lang === "en" ? "Search Results" : "Risultati di Ricerca")}
              </div>
              
              {filteredItems.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <div
                    key={item.href + item.title}
                    className={`spotlight-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <div className="spotlight-item-left">
                      <div className="spotlight-item-icon">{item.icon}</div>
                      <div className="spotlight-item-info">
                        <span className="spotlight-item-title">{item.title}</span>
                        <span className="spotlight-item-subtitle">{item.subtitle}</span>
                      </div>
                    </div>
                    {isActive && (
                      <div className="spotlight-item-right">
                        <span className="spotlight-action-label">{lang === "en" ? "Go" : "Vai"}</span>
                        <CornerDownLeft size={14} className="spotlight-enter-icon" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="spotlight-no-results">
              <Search className="spotlight-empty-icon" size={28} />
              <p>{lang === "en" ? `No results found for "${query}"` : `Nessun risultato trovato per "${query}"`}</p>
            </div>
          )}
        </div>
        
        <div className="spotlight-footer">
          <div className="spotlight-footer-tip">
            <span>↑↓</span> {lang === "en" ? "to navigate" : "per navigare"}
          </div>
          <div className="spotlight-footer-tip">
            <span>↵</span> {lang === "en" ? "to select" : "per selezionare"}
          </div>
          <div className="spotlight-footer-tip">
            <span>⌘K / Ctrl+K</span> {lang === "en" ? "to toggle" : "per aprire/chiudere"}
          </div>
        </div>
      </div>
    </div>
  );
}

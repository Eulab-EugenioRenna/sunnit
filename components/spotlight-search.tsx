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

  const lang = pathname?.split("/").filter(Boolean)[0] || "it";
  const copy = lang === "en"
    ? {
        homeSubtitle: "Back to home page",
        servicesTitle: "Services & Expertise",
        servicesSubtitle: "What we do: Software, cloud, DevOps, AI",
        aiSubtitle: "Document intelligence & generative AI solutions",
        aboutTitle: "About Us",
        aboutSubtitle: "Our history, team, and digital philosophy",
        blogTitle: "Blog & Insights",
        blogSubtitle: "Articles, news, and technical guides",
        contactTitle: "Contact Us",
        contactSubtitle: "Get in touch for a technical assessment",
        placeholder: "Search pages, posts... (Esc to close)",
        quickLinks: "Quick Links",
        searchResults: "Search Results",
        go: "Go",
        noResults: (query: string) => `No results found for \"${query}\"`,
        navigate: "to navigate",
        select: "to select",
        toggle: "to toggle",
      }
    : lang === "es"
      ? {
          homeSubtitle: "Volver a la pagina principal",
          servicesTitle: "Servicios y Competencias",
          servicesSubtitle: "Lo que hacemos: Software, cloud, DevOps, IA",
          aiSubtitle: "Soluciones de inteligencia documental e IA generativa",
          aboutTitle: "Quienes somos",
          aboutSubtitle: "Nuestra historia, el equipo y la filosofia digital",
          blogTitle: "Blog e Insights",
          blogSubtitle: "Articulos, noticias y guias tecnicas",
          contactTitle: "Contactanos",
          contactSubtitle: "Ponte en contacto para una evaluacion tecnica",
          placeholder: "Buscar paginas, articulos... (Esc para cerrar)",
          quickLinks: "Enlaces rapidos",
          searchResults: "Resultados de busqueda",
          go: "Ir",
          noResults: (query: string) => `No se encontraron resultados para \"${query}\"`,
          navigate: "para navegar",
          select: "para seleccionar",
          toggle: "para abrir/cerrar",
        }
      : {
          homeSubtitle: "Torna alla pagina principale",
          servicesTitle: "Servizi & Competenze",
          servicesSubtitle: "Cosa facciamo: Software, cloud, DevOps, AI",
          aiSubtitle: "Soluzioni AI e document intelligence avanzata",
          aboutTitle: "Chi Siamo",
          aboutSubtitle: "La nostra storia, il team e la filosofia digitale",
          blogTitle: "Blog & Insights",
          blogSubtitle: "Articoli, news e guide tecniche",
          contactTitle: "Contattaci",
          contactSubtitle: "Entra in contatto per una valutazione tecnica",
          placeholder: "Cerca pagine, articoli... (Esc per chiudere)",
          quickLinks: "Collegamenti Rapidi",
          searchResults: "Risultati di Ricerca",
          go: "Vai",
          noResults: (query: string) => `Nessun risultato trovato per \"${query}\"`,
          navigate: "per navigare",
          select: "per selezionare",
          toggle: "per aprire/chiudere",
        };

  // Define searchable items based on language
  const getSearchItems = (): SearchItem[] => {
    const pages: SearchItem[] = [
      {
        title: "Homepage",
        subtitle: copy.homeSubtitle,
        searchText: `Homepage ${copy.homeSubtitle}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}`,
        icon: <Laptop className="search-icon-svg" size={18} />
      },
      {
        title: copy.servicesTitle,
        subtitle: copy.servicesSubtitle,
        searchText: `${copy.servicesTitle} ${copy.servicesSubtitle}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/services`,
        icon: <Award className="search-icon-svg" size={18} />
      },
      {
        title: "SunnitAI",
        subtitle: copy.aiSubtitle,
        searchText: `SunnitAI ${copy.aiSubtitle}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/sunnitai`,
        icon: <Cpu className="search-icon-svg" size={18} />
      },
      {
        title: copy.aboutTitle,
        subtitle: copy.aboutSubtitle,
        searchText: `${copy.aboutTitle} ${copy.aboutSubtitle}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/about`,
        icon: <Info className="search-icon-svg" size={18} />
      },
      {
        title: copy.blogTitle,
        subtitle: copy.blogSubtitle,
        searchText: `${copy.blogTitle} ${copy.blogSubtitle}`.toLowerCase(),
        category: "pagine",
        href: `/${lang}/blog`,
        icon: <BookOpen className="search-icon-svg" size={18} />
      },
      {
        title: copy.contactTitle,
        subtitle: copy.contactSubtitle,
        searchText: `${copy.contactTitle} ${copy.contactSubtitle}`.toLowerCase(),
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
            placeholder={copy.placeholder}
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
                  ? copy.quickLinks
                  : copy.searchResults}
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
                        <span className="spotlight-action-label">{copy.go}</span>
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
              <p>{copy.noResults(query)}</p>
            </div>
          )}
        </div>
        
        <div className="spotlight-footer">
          <div className="spotlight-footer-tip">
            <span>↑↓</span> {copy.navigate}
          </div>
          <div className="spotlight-footer-tip">
            <span>↵</span> {copy.select}
          </div>
          <div className="spotlight-footer-tip">
            <span>⌘K / Ctrl+K</span> {copy.toggle}
          </div>
        </div>
      </div>
    </div>
  );
}

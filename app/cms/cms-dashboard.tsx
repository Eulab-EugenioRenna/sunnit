"use client";

import { useEffect, useState } from "react";
import { Languages, LogOut, Plus, Save, Sparkles, TextQuote, Trash2 } from "lucide-react";

type CmsContentType = "blog" | "portfolio" | "job";

type CmsEntry = {
  type: CmsContentType;
  lang: string;
  slug: string;
  frontmatter: Record<string, string>;
  body: string;
};

const tabs: Array<{ type: CmsContentType; label: string }> = [
  { type: "blog", label: "Blog" },
  { type: "portfolio", label: "Portfolio" },
  { type: "job", label: "Job" },
];

const fields: Record<CmsContentType, Array<{ key: string; label: string; kind?: "textarea" | "select" }>> = {
  blog: [
    { key: "title", label: "Titolo" },
    { key: "excerpt", label: "Excerpt", kind: "textarea" },
    { key: "image", label: "Image URL o path" },
    { key: "date", label: "Data" },
    { key: "tags", label: "Tag, separati da virgola" },
  ],
  portfolio: [
    { key: "title", label: "Titolo" },
    { key: "excerpt", label: "Excerpt", kind: "textarea" },
    { key: "image", label: "Image URL o path" },
    { key: "date", label: "Data" },
    { key: "tag", label: "Tag card" },
    { key: "tone", label: "Tone", kind: "select" },
    { key: "order", label: "Ordine" },
  ],
  job: [
    { key: "title", label: "Titolo" },
    { key: "excerpt", label: "Excerpt", kind: "textarea" },
    { key: "department", label: "Area" },
    { key: "country", label: "Paese" },
    { key: "location", label: "Sede" },
    { key: "workMode", label: "Modalita" },
    { key: "contract", label: "Contratto" },
    { key: "seniority", label: "Seniorita" },
    { key: "status", label: "Stato", kind: "select" },
    { key: "date", label: "Data" },
  ],
};

const defaults: Record<CmsContentType, Record<string, string>> = {
  blog: {
    title: "",
    excerpt: "",
    image: "",
    date: new Date().toISOString().slice(0, 10),
    tags: "",
  },
  portfolio: {
    title: "",
    excerpt: "",
    image: "",
    date: new Date().toISOString().slice(0, 10),
    tag: "Project",
    tone: "blue",
    order: "",
  },
  job: {
    title: "",
    excerpt: "",
    department: "",
    country: "",
    location: "",
    workMode: "",
    contract: "",
    seniority: "",
    status: "open",
    date: new Date().toISOString().slice(0, 10),
  },
};

function makeBlankEntry(type: CmsContentType, lang: string): CmsEntry {
  return {
    type,
    lang,
    slug: "",
    frontmatter: { ...defaults[type] },
    body: "",
  };
}

export default function CmsDashboard() {
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [locales, setLocales] = useState(["it", "en", "es"]);
  const [lang, setLang] = useState("it");
  const [activeType, setActiveType] = useState<CmsContentType>("blog");
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<CmsEntry>(makeBlankEntry("blog", "it"));
  const [isLoading, setIsLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState("");
  const [message, setMessage] = useState("");
  const activeTabLabel = tabs.find((tab) => tab.type === activeType)?.label || "contenuto";

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/cms/session");
      const data = await response.json();
      setConfigured(Boolean(data.configured));
      setAuthenticated(Boolean(data.authenticated));
    };

    const loadLocales = async () => {
      const response = await fetch("/api/locales");
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.locales) && data.locales.length > 0) {
        setLocales(data.locales);
        setLang(data.defaultLocale || data.locales[0]);
      }
    };

    void loadSession();
    void loadLocales();
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    void loadEntries(activeType, lang);
  }, [authenticated, activeType, lang]);

  const loadEntries = async (type: CmsContentType, nextLang: string) => {
    setIsLoading(true);
    setActiveCommand("load");
    setMessage("");

    try {
      const response = await fetch(`/api/cms/content?type=${type}&lang=${nextLang}`);
      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      const loadedEntries = Array.isArray(data.entries) ? data.entries : [];
      setEntries(loadedEntries);
      setActiveEntry(loadedEntries[0] || makeBlankEntry(type, nextLang));
    } catch {
      setMessage("Impossibile caricare i contenuti.");
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/cms/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setMessage("Credenziali non valide o CMS non configurato.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
  };

  const logout = async () => {
    await fetch("/api/cms/logout", { method: "POST" });
    setAuthenticated(false);
  };

  const updateFrontmatter = (key: string, value: string) => {
    setActiveEntry((current) => ({
      ...current,
      frontmatter: {
        ...current.frontmatter,
        [key]: value,
      },
    }));
  };

  const saveEntry = async () => {
    setIsLoading(true);
    setActiveCommand("save");
    setMessage("");

    try {
      const payload = { ...activeEntry, type: activeType, lang };
      const response = await fetch("/api/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setMessage("Import/Salva completato. Se l'immagine era un URL remoto, e stata scaricata come nello script.");
      await loadEntries(activeType, lang);
      setActiveEntry(data.entry);
    } catch {
      setMessage("Import/Salva non riuscito.");
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const runBeautify = async (mode: "full" | "excerpt-only") => {
    setIsLoading(true);
    setActiveCommand(mode === "excerpt-only" ? "excerpt" : "beautify");
    setMessage("");

    try {
      const payload = { ...activeEntry, type: activeType, lang };
      const response = await fetch("/api/cms/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "beautify", mode, entry: payload }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setActiveEntry(data.entry);
      setMessage(mode === "excerpt-only" ? "Excerpt aggiornata. Salva per scrivere il file." : "Beautify completato. Salva per scrivere il file.");
    } catch {
      setMessage("Beautify non riuscito. Verifica Ollama/OLLAMA_URL.");
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const runTranslate = async () => {
    setIsLoading(true);
    setActiveCommand("translate");
    setMessage("");

    try {
      const payload = { ...activeEntry, type: activeType, lang };
      const response = await fetch("/api/cms/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "translate", locales, entry: payload }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      const created = Array.isArray(data.created) ? data.created.map((entry: CmsEntry) => entry.lang.toUpperCase()).join(", ") : "";
      const skipped = Array.isArray(data.skipped) ? data.skipped.map((locale: string) => locale.toUpperCase()).join(", ") : "";
      setMessage(
        created
          ? `Traduzioni create: ${created}.${skipped ? ` Gia presenti: ${skipped}.` : ""}`
          : `Nessuna lingua vuota da tradurre.${skipped ? ` Gia presenti: ${skipped}.` : ""}`,
      );
    } catch {
      setMessage("Traduzione non riuscita. Verifica Ollama/OLLAMA_URL.");
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const deleteEntry = async () => {
    if (!activeEntry.slug) return;
    if (!window.confirm(`Eliminare ${activeEntry.slug}?`)) return;

    setIsLoading(true);
    setActiveCommand("delete");
    setMessage("");

    try {
      const response = await fetch(`/api/cms/content?type=${activeType}&lang=${lang}&slug=${activeEntry.slug}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(await response.text());

      setMessage("Contenuto eliminato.");
      await loadEntries(activeType, lang);
    } catch {
      setMessage("Eliminazione non riuscita.");
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  if (!configured) {
    return (
      <main className="cms-shell">
        <section className="cms-login-card">
          <h1>CMS non configurato</h1>
          <p>Imposta `CMS_USERNAME`, `CMS_PASSWORD` e `CMS_SESSION_SECRET`.</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="cms-shell">
        <form className="cms-login-card" onSubmit={login}>
          <span>SUNNIT CMS</span>
          <h1>Accesso admin</h1>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nome" autoComplete="username" required />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" autoComplete="current-password" required />
          <button type="submit" className="dark-btn">Entra</button>
          {message ? <p className="form-feedback form-feedback-error">{message}</p> : null}
        </form>
      </main>
    );
  }

  return (
    <main className="cms-shell cms-dashboard">
      <nav className="cms-topbar" aria-label="Sezioni CMS">
        <div className="cms-topbar__brand">
          <span>SUNNIT CMS</span>
          <h1>Contenuti</h1>
        </div>

        <div className="cms-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.type}
              type="button"
              className={activeType === tab.type ? "active" : ""}
              onClick={() => {
                setActiveType(tab.type);
                setActiveEntry(makeBlankEntry(tab.type, lang));
              }}
            >
              {tab.label}
            </button>
          ))}
                    <button type="button" className="cms-new-btn" onClick={() => setActiveEntry(makeBlankEntry(activeType, lang))}>
            <Plus size={16} aria-hidden />
            Nuovo {activeTabLabel}
          </button>
        </div>

        <div className="cms-topbar__actions">
          <label className="cms-field cms-topbar__language">
            <span>Lingua</span>
            <select value={lang} onChange={(event) => setLang(event.target.value)}>
              {locales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale.toUpperCase()}
                </option>
              ))}
            </select>
          </label>



          <button type="button" className="cms-logout" onClick={logout}>
            <LogOut size={16} aria-hidden />
            Logout
          </button>
        </div>
      </nav>

      <section className="cms-list">
        <h2>{activeTabLabel}</h2>
        {isLoading ? <p>Caricamento...</p> : null}
        {entries.map((entry) => (
          <button
            key={entry.slug}
            type="button"
            className={activeEntry.slug === entry.slug ? "active" : ""}
            onClick={() => setActiveEntry(entry)}
          >
            <strong>{entry.frontmatter.title || entry.slug}</strong>
          </button>
        ))}
      </section>

      <section className="cms-editor">
        <div className="cms-editor__topbar">
          <label className="cms-field">
            <span>Slug</span>
            <input value={activeEntry.slug} onChange={(event) => setActiveEntry((current) => ({ ...current, slug: event.target.value }))} placeholder="auto-da-titolo" />
          </label>
          <div className="cms-editor__actions">
            <button type="button" className="outline-btn tiny" onClick={deleteEntry} disabled={!activeEntry.slug || isLoading}>
              <Trash2 size={15} aria-hidden />
              Elimina
            </button>
            <button type="button" className="dark-btn tiny" onClick={saveEntry} disabled={isLoading}>
              <Save size={15} aria-hidden />
              {activeCommand === "save" ? "Import..." : "Import/Salva"}
            </button>
          </div>
        </div>

        <div className="cms-script-panel" aria-label="Azioni script">
          <div>
            <span>Script UI</span>
            <strong>Equivalente grafico di import, beautify e translate</strong>
          </div>
          <button type="button" className="outline-btn tiny" onClick={() => runBeautify("full")} disabled={isLoading || !activeEntry.body.trim()}>
            <Sparkles size={15} aria-hidden />
            {activeCommand === "beautify" ? "Beautify..." : "Beautify"}
          </button>
          <button type="button" className="outline-btn tiny" onClick={() => runBeautify("excerpt-only")} disabled={isLoading || !activeEntry.body.trim()}>
            <TextQuote size={15} aria-hidden />
            {activeCommand === "excerpt" ? "Excerpt..." : "Excerpt only"}
          </button>
          <button type="button" className="outline-btn tiny" onClick={runTranslate} disabled={isLoading || !activeEntry.body.trim()}>
            <Languages size={15} aria-hidden />
            {activeCommand === "translate" ? "Translate..." : "Translate empty"}
          </button>
        </div>

        <div className="cms-form-grid">
          {fields[activeType].map((field) => (
            <label key={field.key} className={`cms-field ${field.kind === "textarea" ? "wide" : ""}`}>
              <span>{field.label}</span>
              {field.kind === "textarea" ? (
                <textarea value={activeEntry.frontmatter[field.key] || ""} onChange={(event) => updateFrontmatter(field.key, event.target.value)} />
              ) : field.key === "tone" ? (
                <select value={activeEntry.frontmatter[field.key] || "blue"} onChange={(event) => updateFrontmatter(field.key, event.target.value)}>
                  {["blue", "green", "purple", "dark"].map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              ) : field.key === "status" ? (
                <select value={activeEntry.frontmatter[field.key] || "open"} onChange={(event) => updateFrontmatter(field.key, event.target.value)}>
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                </select>
              ) : (
                <input value={activeEntry.frontmatter[field.key] || ""} onChange={(event) => updateFrontmatter(field.key, event.target.value)} />
              )}
            </label>
          ))}
        </div>

        <label className="cms-field cms-body-field">
          <span>Body MDX</span>
          <textarea value={activeEntry.body} onChange={(event) => setActiveEntry((current) => ({ ...current, body: event.target.value }))} />
        </label>

        {message ? <p className="cms-message">{message}</p> : null}
      </section>
    </main>
  );
}

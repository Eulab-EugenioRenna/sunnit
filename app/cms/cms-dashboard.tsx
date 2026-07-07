"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, Plus, Save, Sparkles, TextQuote, Trash2 } from "lucide-react";

type CmsContentType = "blog" | "portfolio" | "job";

type CmsEntry = {
  type: CmsContentType;
  lang: string;
  slug: string;
  frontmatter: Record<string, string>;
  body: string;
};

type CmsDraftEntry = CmsEntry & {
  draftKey: string;
  sourceKey?: string;
  pendingDelete?: boolean;
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

function makeDraftKey() {
  return crypto.randomUUID();
}

function entryKey(entry: Pick<CmsEntry, "type" | "lang" | "slug">) {
  return `${entry.type}:${entry.lang}:${entry.slug}`;
}

function makeDraftEntry(entry: CmsEntry, draftKey = entryKey(entry), sourceKey?: string, pendingDelete = false): CmsDraftEntry {
  return {
    ...entry,
    draftKey,
    sourceKey,
    pendingDelete,
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
  const [entries, setEntries] = useState<CmsDraftEntry[]>([]);
  const [stagedEntries, setStagedEntries] = useState<Record<string, CmsDraftEntry>>({});
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, true>>({});
  const [activeDraftKey, setActiveDraftKey] = useState("");
  const [activeEntry, setActiveEntry] = useState<CmsDraftEntry>(makeDraftEntry(makeBlankEntry("blog", "it"), makeDraftKey()));
  const [isLoading, setIsLoading] = useState(false);
  const [activeCommand, setActiveCommand] = useState("");
  const [message, setMessage] = useState("");
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const activeTabLabel = tabs.find((tab) => tab.type === activeType)?.label || "contenuto";
  const stagedEntriesRef = useRef(stagedEntries);
  const pendingDeletesRef = useRef(pendingDeletes);

  stagedEntriesRef.current = stagedEntries;
  pendingDeletesRef.current = pendingDeletes;

  const stageEntry = (nextEntry: CmsDraftEntry, { pendingDelete = false }: { pendingDelete?: boolean } = {}) => {
    const deleteKeys = [nextEntry.sourceKey, nextEntry.draftKey].filter(Boolean) as string[];

    setActiveDraftKey(nextEntry.draftKey);
    setActiveEntry({ ...nextEntry, pendingDelete });
    setStagedEntries((current) => ({
      ...current,
      [nextEntry.draftKey]: { ...nextEntry, pendingDelete },
    }));
    stagedEntriesRef.current = {
      ...stagedEntriesRef.current,
      [nextEntry.draftKey]: { ...nextEntry, pendingDelete },
    };
    setPendingDeletes((current) => {
      const next = { ...current };

      for (const key of deleteKeys) {
        delete next[key];
      }

      if (pendingDelete && nextEntry.sourceKey) {
        next[nextEntry.sourceKey] = true;
      }

      return next;
    });
    const nextPendingDeletes = { ...pendingDeletesRef.current };
    for (const key of deleteKeys) {
      delete nextPendingDeletes[key];
    }
    if (pendingDelete && nextEntry.sourceKey) {
      nextPendingDeletes[nextEntry.sourceKey] = true;
    }
    pendingDeletesRef.current = nextPendingDeletes;
    setEntries((current) => {
      const updated = current.map((entry) => (entry.draftKey === nextEntry.draftKey ? { ...nextEntry, pendingDelete } : entry));
      if (current.some((entry) => entry.draftKey === nextEntry.draftKey)) {
        return updated;
      }

      return [{ ...nextEntry, pendingDelete }, ...updated];
    });
  };

  const rebuildEntries = (sourceEntries: CmsEntry[], nextType: CmsContentType, nextLang: string) => {
    const stagedForContext = Object.values(stagedEntriesRef.current).filter((entry) => entry.type === nextType && entry.lang === nextLang);
    const stagedBySourceKey = new Map(stagedForContext.filter((entry) => entry.sourceKey).map((entry) => [entry.sourceKey as string, entry]));
    const pendingDeleteKeys = new Set(
      Object.keys(pendingDeletesRef.current).filter((key) => {
        const [type, entryLang] = key.split(":");
        return type === nextType && entryLang === nextLang;
      }),
    );

    const merged = sourceEntries.flatMap((entry) => {
      const sourceKey = entryKey(entry);
      if (pendingDeleteKeys.has(sourceKey)) {
        return [];
      }

      const staged = stagedBySourceKey.get(sourceKey);
      if (staged) {
        return [{ ...staged, pendingDelete: Boolean(pendingDeletesRef.current[staged.sourceKey || staged.draftKey]) }];
      }

      return [makeDraftEntry(entry, sourceKey, sourceKey, false)];
    });

    for (const staged of stagedForContext) {
      if (staged.sourceKey && sourceEntries.some((entry) => entryKey(entry) === staged.sourceKey)) {
        continue;
      }

      if (!staged.sourceKey && !merged.some((entry) => entry.draftKey === staged.draftKey)) {
        merged.unshift({ ...staged, pendingDelete: Boolean(pendingDeletesRef.current[staged.draftKey]) });
      }
    }

    return merged;
  };

  const syncActiveEntry = (nextEntries: CmsDraftEntry[], fallback: CmsDraftEntry) => {
    const nextActive = nextEntries.find((entry) => entry.draftKey === activeDraftKey) || nextEntries[0] || fallback;
    setActiveDraftKey(nextActive.draftKey);
    setActiveEntry(nextActive);
  };

  const clearQueueState = () => {
    setStagedEntries({});
    setPendingDeletes({});
    stagedEntriesRef.current = {};
    pendingDeletesRef.current = {};
  };

  const resetWorkspace = () => {
    clearQueueState();
    setEntries([]);
    setActiveDraftKey("");
    setActiveEntry(makeDraftEntry(makeBlankEntry(activeType, lang), makeDraftKey()));
    setActiveCommand("");
    setMessage("");
    setExitDialogOpen(false);
  };

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
      const mergedEntries = rebuildEntries(loadedEntries, type, nextLang);
      setEntries(mergedEntries);
      syncActiveEntry(mergedEntries, makeDraftEntry(makeBlankEntry(type, nextLang), makeDraftKey()));
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
    resetWorkspace();
  };

  const updateFrontmatter = (key: string, value: string) => {
    const nextEntry = {
      ...activeEntry,
      frontmatter: {
        ...activeEntry.frontmatter,
        [key]: value,
      },
    };

    stageEntry(nextEntry);
  };

  const pushQueuedChanges = async () => {
    setIsLoading(true);
    setActiveCommand("save");
    setMessage("");

    try {
      const upserts = Object.values(stagedEntriesRef.current)
        .filter((entry) => !entry.pendingDelete && !pendingDeletesRef.current[entry.draftKey] && !pendingDeletesRef.current[entry.sourceKey || entry.draftKey])
        .map(({ draftKey, sourceKey, pendingDelete, ...entry }) => entry);
      const deletes = Object.keys(pendingDeletesRef.current).map((sourceKey) => {
        const [type, entryLang, ...slugParts] = String(sourceKey).split(":");
        return {
          type: type as CmsContentType,
          lang: entryLang,
          slug: slugParts.join(":"),
        };
      });

      const response = await fetch("/api/cms/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upserts, deletes }),
      });

      if (!response.ok) throw new Error(await response.text());

      await response.json();
      setMessage("Modifiche pronte al push.");
      clearQueueState();
      await loadEntries(activeType, lang);
      return true;
    } catch {
      setMessage("Push non riuscito.");
      return false;
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const openExitDialog = () => {
    setExitDialogOpen(true);
  };

  const cancelExitDialog = () => {
    setExitDialogOpen(false);
  };

  const acceptExit = async () => {
    const pushed = await pushQueuedChanges();
    if (!pushed) return;

    await logout();
  };

  const discardQueuedChanges = async () => {
    clearQueueState();
    setExitDialogOpen(false);
    setMessage("Modifiche scartate.");
    await loadEntries(activeType, lang);
  };

  const importCurrentEntry = () => {
    stageEntry(activeEntry);
    setMessage("Articolo importato in coda.");
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

      if (!response.ok) {
        const raw = await response.text();
        let detail = raw;

        try {
          const parsed = JSON.parse(raw) as { error?: string };
          if (parsed?.error) detail = parsed.error;
        } catch {
          // Keep raw response text if payload is not JSON.
        }

        throw new Error(detail || "Beautify non riuscito.");
      }

      const data = await response.json();
      stageEntry(makeDraftEntry(data.entry, activeEntry.draftKey, activeEntry.sourceKey, activeEntry.pendingDelete));
      setMessage(mode === "excerpt-only" ? "Excerpt aggiornata. Rimane in bozza fino al salvataggio." : "Beautify completato. Rimane in bozza fino al salvataggio.");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Beautify non riuscito.";
      setMessage(detail);
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

      if (!response.ok) {
        const raw = await response.text();
        let detail = raw;

        try {
          const parsed = JSON.parse(raw) as { error?: string };
          if (parsed?.error) detail = parsed.error;
        } catch {
          // Keep raw response text if payload is not JSON.
        }

        throw new Error(detail || "Traduzione non riuscita.");
      }

      const data = await response.json();
      const created = Array.isArray(data.created) ? data.created.map((entry: CmsEntry) => entry.lang.toUpperCase()).join(", ") : "";
      const skipped = Array.isArray(data.skipped) ? data.skipped.map((locale: string) => locale.toUpperCase()).join(", ") : "";
      if (Array.isArray(data.created)) {
        for (const createdEntry of data.created as CmsEntry[]) {
          const draftKey = entryKey(createdEntry);
          const draft = makeDraftEntry(createdEntry, draftKey, draftKey, false);
          setStagedEntries((current) => ({ ...current, [draft.draftKey]: draft }));
          stagedEntriesRef.current = { ...stagedEntriesRef.current, [draft.draftKey]: draft };
          setEntries((current) => [draft, ...current.filter((entry) => entry.draftKey !== draft.draftKey)]);
        }
      }
      setMessage(
        created
          ? `Traduzioni pronte: ${created}.${skipped ? ` Gia presenti: ${skipped}.` : ""}`
          : `Nessuna lingua vuota da tradurre.${skipped ? ` Gia presenti: ${skipped}.` : ""}`,
      );
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Traduzione non riuscita.";
      setMessage(detail);
    } finally {
      setIsLoading(false);
      setActiveCommand("");
    }
  };

  const deleteEntry = async () => {
    if (!activeEntry.slug) return;
    if (!window.confirm(`Mettere in coda l'eliminazione di ${activeEntry.slug}?`)) return;

    if (!activeEntry.sourceKey) {
      setStagedEntries((current) => {
        const next = { ...current };
        delete next[activeEntry.draftKey];
        stagedEntriesRef.current = next;
        return next;
      });
      setEntries((current) => current.filter((entry) => entry.draftKey !== activeEntry.draftKey));
      const blankDraft = makeDraftEntry(makeBlankEntry(activeType, lang), makeDraftKey());
      setActiveDraftKey(blankDraft.draftKey);
      setActiveEntry(blankDraft);
      setMessage("Bozza rimossa.");
      return;
    }

    const nextEntry = { ...activeEntry, pendingDelete: true };
    stageEntry(nextEntry, { pendingDelete: true });
    setMessage("Eliminazione messa in coda. Conferma dal dialog di uscita.");
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
                const blankDraft = makeDraftEntry(makeBlankEntry(tab.type, lang), makeDraftKey());
                setActiveDraftKey(blankDraft.draftKey);
                setActiveEntry(blankDraft);
              }}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            className="cms-new-btn"
            onClick={() => {
              const blankDraft = makeDraftEntry(makeBlankEntry(activeType, lang), makeDraftKey());
              setActiveDraftKey(blankDraft.draftKey);
              setActiveEntry(blankDraft);
              setStagedEntries((current) => ({ ...current, [blankDraft.draftKey]: blankDraft }));
              stagedEntriesRef.current = { ...stagedEntriesRef.current, [blankDraft.draftKey]: blankDraft };
              setEntries((current) => [blankDraft, ...current]);
            }}
          >
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

          <button type="button" className="cms-logout" onClick={openExitDialog}>
            <Save size={16} aria-hidden />
            Salva ed esci
          </button>
        </div>
      </nav>

      <section className="cms-list">
        <h2>{activeTabLabel}</h2>
        {isLoading ? <p>Caricamento...</p> : null}
        {entries.map((entry) => (
          <button
            key={entry.draftKey}
            type="button"
            className={`${activeEntry.draftKey === entry.draftKey ? "active" : ""}${entry.pendingDelete ? " pending-delete" : ""}`}
            onClick={() => {
              setActiveDraftKey(entry.draftKey);
              setActiveEntry(entry);
            }}
          >
            <strong>{entry.frontmatter.title || entry.slug}</strong>
            {entry.pendingDelete ? <span> da eliminare</span> : null}
          </button>
        ))}
      </section>

      <section className="cms-editor">
        <div className="cms-editor__topbar">
          <label className="cms-field">
            <span>Slug</span>
            <input
              value={activeEntry.slug}
              onChange={(event) =>
                stageEntry({
                  ...activeEntry,
                  slug: event.target.value,
                })
              }
              placeholder="auto-da-titolo"
            />
          </label>
          <div className="cms-editor__actions">
            <button type="button" className="outline-btn tiny" onClick={deleteEntry} disabled={!activeEntry.slug || isLoading || activeEntry.pendingDelete}>
              <Trash2 size={15} aria-hidden />
              Elimina
            </button>
            <button type="button" className="dark-btn tiny" onClick={importCurrentEntry} disabled={isLoading}>
              <Plus size={15} aria-hidden />
              Importa
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
          <textarea
            value={activeEntry.body}
            onChange={(event) =>
              stageEntry({
                ...activeEntry,
                body: event.target.value,
              })
            }
          />
        </label>

        {message ? <p className="cms-message">{message}</p> : null}
      </section>

      {exitDialogOpen ? (
        <div className="cms-dialog-backdrop" role="presentation" onClick={cancelExitDialog}>
          <div
            className="cms-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-exit-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="cms-exit-dialog-title">Salvare la coda e uscire?</h2>
            <p>
              Hai {Object.keys(stagedEntries).length} elementi in bozza e {Object.keys(pendingDeletes).length} cancellazioni in coda.
              Puoi pushare tutto, restare nel CMS oppure scartare le modifiche.
            </p>
            <div className="cms-dialog__actions">
              <button type="button" className="dark-btn" onClick={acceptExit} disabled={isLoading}>
                Accetta
              </button>
              <button type="button" className="outline-btn" onClick={cancelExitDialog} disabled={isLoading}>
                Annulla
              </button>
              <button type="button" className="outline-btn" onClick={discardQueuedChanges} disabled={isLoading}>
                Discard
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, FileText, MapPin, Search, SlidersHorizontal, UploadCloud, X } from "lucide-react";
import type { JobPost } from "@/lib/jobs";
import { getJobCountryLabel, getJobCountrySearchText, normalizeJobCountryValue } from "@/lib/job-countries";

type JobsCopy = {
  filters: {
    search: string;
    all: string;
    department: string;
    country: string;
    workMode: string;
    contract: string;
    seniority: string;
    reset: string;
    results: string;
    empty: string;
  };
  card: {
    apply: string;
    statusOpen: string;
  };
  application: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    cv: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    missing: string;
    error: string;
    close: string;
  };
};

type FilterKey = "department" | "country" | "workMode" | "contract" | "seniority";

const filterKeys: FilterKey[] = ["department", "country", "workMode", "contract", "seniority"];

function getFilterValue(job: JobPost, key: FilterKey) {
  return key === "country" ? normalizeJobCountryValue(job.country) : job[key];
}

function getFilterLabel(key: FilterKey, value: string, lang: string) {
  return key === "country" ? getJobCountryLabel(value, lang) : value;
}

function uniqueValues(jobs: JobPost[], key: FilterKey, lang: string) {
  return [...new Set(jobs.map((job) => getFilterValue(job, key)).filter(Boolean))].sort((left, right) =>
    getFilterLabel(key, left, lang).localeCompare(getFilterLabel(key, right, lang)),
  );
}

function jobMatches(job: JobPost, query: string, filters: Record<FilterKey, string>, lang: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const haystack = [
    job.title,
    job.excerpt,
    job.department,
    getJobCountryLabel(job.country, lang),
    getJobCountrySearchText(job.country),
    job.location,
    job.workMode,
    job.contract,
    job.seniority,
    job.body,
  ]
    .join(" ")
    .toLowerCase();

  if (normalizedQuery && !haystack.includes(normalizedQuery)) {
    return false;
  }

  return filterKeys.every((key) => !filters[key] || getFilterValue(job, key) === filters[key]);
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      return (
        <strong key={`${part}-${index}`}>
          <em>{part.slice(3, -3)}</em>
        </strong>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${part}-${index}`}>{part.slice(1, -1)}</code>;
    }

    return part;
  });
}

function renderJobBody(body: string) {
  const blocks: ReactNode[] = [];
  const lines = body.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) continue;

    const heading = line.match(/^#{1,4}\s+(.+)$/);
    if (heading) {
      blocks.push(<h3 key={`heading-${index}`}>{renderInlineMarkdown(heading[1])}</h3>);
      continue;
    }

    if (line.startsWith("* ") || line.startsWith("- ")) {
      const items: string[] = [];

      while (index < lines.length) {
        const itemLine = lines[index].trim();

        if (!itemLine.startsWith("* ") && !itemLine.startsWith("- ")) break;

        items.push(itemLine.slice(2).trim());
        index += 1;
      }

      index -= 1;
      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    blocks.push(<p key={`paragraph-${index}`}>{renderInlineMarkdown(line)}</p>);
  }

  return blocks;
}

const maxCvSize = 10 * 1024 * 1024;

export default function JobsBoard({
  jobs,
  copy,
  lang,
  initialJobSlug = "",
}: {
  jobs: JobPost[];
  copy: JobsCopy;
  lang: string;
  initialJobSlug?: string;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    department: "",
    country: "",
    workMode: "",
    contract: "",
    seniority: "",
  });
  const [activeJob, setActiveJob] = useState<JobPost | null>(null);
  const [applicationState, setApplicationState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isCvDragging, setIsCvDragging] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const filteredJobs = jobs.filter((job) => jobMatches(job, query, filters, lang));
  const hasActiveFilters = query || filterKeys.some((key) => filters[key]);

  useEffect(() => {
    if (!initialJobSlug) return;

    const matchedJob = jobs.find((job) => job.slug === initialJobSlug);

    if (matchedJob) {
      setQuery(matchedJob.title);
    }
  }, [initialJobSlug, jobs]);

  const resetFilters = () => {
    setQuery("");
    setFilters({
      department: "",
      country: "",
      workMode: "",
      contract: "",
      seniority: "",
    });
  };

  const openApplication = (job: JobPost) => {
    setActiveJob(job);
    setApplicationState("idle");
    setFormError("");
    setCvFile(null);
    setIsCvDragging(false);
  };

  const closeApplication = () => {
    setActiveJob(null);
    setApplicationState("idle");
    setFormError("");
    setCvFile(null);
    setIsCvDragging(false);
  };

  const syncCvFile = (file: File | null) => {
    if (file && file.size > maxCvSize) {
      setFormError(`${copy.application.cv} (B)`);
      setCvFile(null);

      if (cvInputRef.current) {
        cvInputRef.current.value = "";
      }

      return;
    }

    setFormError("");
    setCvFile(file);

    if (!cvInputRef.current) return;

    const dataTransfer = new DataTransfer();

    if (file) {
      dataTransfer.items.add(file);
    }

    cvInputRef.current.files = dataTransfer.files;
  };

  return (
    <>
      <section className="jobs-filter-panel" aria-label="Job filters">
        <div className="jobs-search-field">
          <Search size={18} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.filters.search}
            aria-label={copy.filters.search}
          />
        </div>

        <div className="jobs-filter-grid">
          {filterKeys.map((key) => (
            <label key={key} className="jobs-filter-select">
              <span>{copy.filters[key]}</span>
              <select
                value={filters[key]}
                onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}
              >
                <option value="">{copy.filters.all}</option>
                {uniqueValues(jobs, key, lang).map((value) => (
                  <option key={value} value={value}>
                    {getFilterLabel(key, value, lang)}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="jobs-filter-summary">
          <span>
            <SlidersHorizontal size={15} aria-hidden />
            {filteredJobs.length} {copy.filters.results}
          </span>
          {hasActiveFilters ? (
            <button type="button" className="jobs-reset-btn" onClick={resetFilters}>
              <X size={14} aria-hidden />
              {copy.filters.reset}
            </button>
          ) : null}
        </div>
      </section>

      {filteredJobs.length > 0 ? (
        <section className="jobs-grid" aria-live="polite">
          {filteredJobs.map((job) => (
            <article key={job.slug} className="job-card">
              <div className="job-card__topline">
                <span className="job-status">
                  <CheckCircle2 size={14} aria-hidden />
                  {copy.card.statusOpen}
                </span>
                <span>{job.department}</span>
              </div>
              <h2>{job.title}</h2>
              <p>{job.excerpt}</p>
              <div className="job-card__meta">
                <span>
                  <MapPin size={14} aria-hidden />
                  {job.location}
                </span>
                <span>
                  <BriefcaseBusiness size={14} aria-hidden />
                  {job.contract}
                </span>
                <span>
                  <FileText size={14} aria-hidden />
                  {job.seniority}
                </span>
              </div>
              <div className="job-card__footer">
                <span>{getJobCountryLabel(job.country, lang)}</span>
                <span>{job.workMode}</span>
                <button type="button" className="dark-btn tiny" onClick={() => openApplication(job)}>
                  {copy.card.apply}
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="jobs-empty-state">{copy.filters.empty}</div>
      )}

      {activeJob ? (
        <div className="job-modal" role="dialog" aria-modal="true" aria-label={copy.application.title}>
          <button type="button" className="job-modal__backdrop" aria-label={copy.application.close} onClick={closeApplication} />
          <div className="job-modal__panel">
            <button type="button" className="job-modal__close" aria-label={copy.application.close} onClick={closeApplication}>
              <X size={18} aria-hidden />
            </button>
            {applicationState === "success" ? (
              <div className="job-application-success">
                <CheckCircle2 size={34} aria-hidden />
                <h2>{copy.application.success}</h2>
              </div>
            ) : (
              <>
                <div className="job-modal__header">
                  <span>{activeJob.title}</span>
                  <h2>{copy.application.title}</h2>
                  <p>{copy.application.subtitle}</p>
                </div>
                {activeJob.body.trim() ? <div className="job-modal__body">{renderJobBody(activeJob.body)}</div> : null}
                <form
                  className="job-application-form"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setFormError("");

                    const form = event.currentTarget;
                    const formData = new FormData(form);

                    if (!formData.get("name") || !formData.get("email") || !formData.get("cv")) {
                      setFormError(copy.application.missing);
                      return;
                    }

                    setApplicationState("sending");

                    try {
                      const response = await fetch("/api/jobs/apply", {
                        method: "POST",
                        body: formData,
                      });

                      if (!response.ok) {
                        let details = "";

                        try {
                          const data = await response.json();
                          details = typeof data?.details === "string" ? data.details : typeof data?.error === "string" ? data.error : "";
                        } catch {
                          details = await response.text();
                        }

                        throw new Error(details || `HTTP ${response.status}`);
                      }

                      form.reset();
                      setApplicationState("success");
                    } catch (error) {
                      setApplicationState("error");
                      setFormError(error instanceof Error && error.message ? error.message : copy.application.error);
                    }
                  }}
                >
                  <input type="hidden" name="jobTitle" value={activeJob.title} />
                  <input type="hidden" name="jobSlug" value={activeJob.slug} />
                  <input type="hidden" name="lang" value={lang} />
                  <input name="name" placeholder={copy.application.name} aria-label={copy.application.name} required />
                  <input name="email" type="email" placeholder={copy.application.email} aria-label={copy.application.email} required />
                  <input name="phone" placeholder={copy.application.phone} aria-label={copy.application.phone} />
                  <div
                    className={`job-cv-dropzone ${isCvDragging ? "is-dragging" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => cvInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        cvInputRef.current?.click();
                      }
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsCvDragging(true);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "copy";
                      setIsCvDragging(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setIsCvDragging(false);
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      setIsCvDragging(false);
                      syncCvFile(event.dataTransfer.files[0] || null);
                    }}
                  >
                    <input
                      ref={cvInputRef}
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      aria-label={copy.application.cv}
                      required
                      onChange={(event) => syncCvFile(event.currentTarget.files?.[0] || null)}
                    />
                    <UploadCloud size={24} aria-hidden />
                    <span>{cvFile ? cvFile.name : copy.application.cv}</span>
                    {cvFile ? <small>{Math.ceil(cvFile.size / 1024)} KB · max 10 MB</small> : <small>PDF, DOC o DOCX · max 10 MB</small>}
                  </div>
                  <textarea name="message" placeholder={copy.application.message} aria-label={copy.application.message} />
                  <button type="submit" className="dark-btn" disabled={applicationState === "sending"}>
                    {applicationState === "sending" ? copy.application.sending : copy.application.submit}
                  </button>
                  {formError ? <p className="form-feedback form-feedback-error">{formError}</p> : null}
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export const jobCountries = [
  {
    key: "it",
    labels: {
      it: "Italia",
      en: "Italy",
      es: "Italia",
      fr: "Italie",
      de: "Italien",
    },
  },
  {
    key: "es",
    labels: {
      it: "Spagna",
      en: "Spain",
      es: "España",
      fr: "Espagne",
      de: "Spanien",
    },
  },
  {
    key: "fr",
    labels: {
      it: "Francia",
      en: "France",
      es: "Francia",
      fr: "France",
      de: "Frankreich",
    },
  }
] as const;

export type JobCountryKey = (typeof jobCountries)[number]["key"];

export type JobCountryOption = {
  key: JobCountryKey;
  value: string;
};

function normalizeCountryText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeJobCountryKey(value: string | null | undefined) {
  const normalized = normalizeCountryText(String(value || ""));

  if (!normalized) return "";

  const directMatch = jobCountries.find((country) => country.key === normalized);
  if (directMatch) return directMatch.key;

  const labelMatch = jobCountries.find((country) =>
    Object.values(country.labels).some((label) => normalizeCountryText(label) === normalized),
  );

  return labelMatch?.key || "";
}

export function normalizeJobCountryValue(value: string | null | undefined) {
  return normalizeJobCountryKey(value) || String(value || "").trim();
}

export function getJobCountryLabel(value: string | null | undefined, lang: string) {
  const key = normalizeJobCountryKey(value);
  const country = jobCountries.find((item) => item.key === key);

  if (!country) return String(value || "").trim();

  const labels = country.labels as Record<string, string>;
  const locale = String(lang || "").split("-")[0];
  return labels[locale] || labels.en || labels.it || country.key;
}

export function getJobCountryOptions(lang: string): JobCountryOption[] {
  return jobCountries.map((country) => ({
    key: country.key,
    value: getJobCountryLabel(country.key, lang),
  }));
}

export function getJobCountrySearchText(value: string | null | undefined) {
  const key = normalizeJobCountryKey(value);
  const country = jobCountries.find((item) => item.key === key);

  if (!country) return String(value || "");

  return [country.key, ...Object.values(country.labels)].join(" ");
}

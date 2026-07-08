import "server-only";

import fs from "fs";
import path from "path";
import { normalizeJobCountryKey } from "./job-countries";

/**
 * Job application routing config.
 * Supports:
 * - Per-country routing (email by country from job frontmatter)
 * - Per-job routing (email by specific job slug)
 * - Fallback to global default email
 *
 * Config file: lib/jobs-routing.json
 */

export type JobsRoutingConfig = {
  /** Global fallback email for all job applications */
  defaultEmail: string;

  /** Route by country code (from job.country) */
  byCountry?: Record<string, string>;

  /** Route by job slug (takes precedence over country) */
  byJobSlug?: Record<string, string>;
};

const CONFIG_FILE = path.join(process.cwd(), "lib", "jobs-routing.json");

function loadConfig(): JobsRoutingConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    // Return default from env if config file doesn't exist
    return {
      defaultEmail: process.env.JOBS_TO_EMAIL || "p.dimicco@sunnit.it",
    };
  }

  const content = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(content) as JobsRoutingConfig;
}

export function getJobApplicationEmail({
  jobSlug,
  country,
}: {
  jobSlug?: string;
  country?: string;
}): string {
  const config = loadConfig();

  // Check job slug routing first (highest priority)
  if (jobSlug && config.byJobSlug?.[jobSlug]) {
    return config.byJobSlug[jobSlug];
  }

  // Check country routing
  if (country && config.byCountry) {
    const countryKey = normalizeJobCountryKey(country);
    const directMatch = config.byCountry[countryKey];

    if (directMatch) {
      return directMatch;
    }

    const normalizedMatch = Object.entries(config.byCountry).find(
      ([configuredCountry]) => normalizeJobCountryKey(configuredCountry) === countryKey,
    );

    if (normalizedMatch) {
      return normalizedMatch[1];
    }
  }

  // Fallback to default or env variable
  return config.defaultEmail || process.env.JOBS_TO_EMAIL || "jobs@sunnit.it";
}

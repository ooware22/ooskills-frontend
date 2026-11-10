// Public address of this deployment, used for canonical URLs, the sitemap and
// Open Graph tags. Set NEXT_PUBLIC_SITE_URL per environment
// (e.g. https://staging.ooskills.com); production is the default.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://ooskills.com"
).replace(/\/+$/, "");

export const SITE_NAME = "OOSkills";

/** Base URL of the backend API, without a trailing slash (may be empty). */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

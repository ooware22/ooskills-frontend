// Locale helpers shared by the server (root layout) and the client (I18nProvider).
// No "use client" here: this module must stay importable from both sides.

export type Locale = "fr" | "en" | "ar";

export const LOCALES: Locale[] = ["fr", "en", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";

/** Name of the cookie AND of the localStorage entry that hold the visitor's choice. */
export const LOCALE_STORAGE_KEY = "ooskills-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/**
 * Pick the locale for a request.
 *
 * 1. the visitor's explicit choice (cookie), if any;
 * 2. otherwise the first supported language of the browser (Accept-Language);
 * 3. otherwise French.
 */
export function resolveLocale(
  cookieValue: string | undefined | null,
  acceptLanguage: string | undefined | null,
): Locale {
  if (isLocale(cookieValue)) return cookieValue;

  const preferred = (acceptLanguage || "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? parseFloat(q) : 1 };
    })
    .filter((entry) => entry.lang && !Number.isNaN(entry.q))
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}

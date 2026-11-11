"use client";

import { useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Each language is written in its own language, everywhere on the site. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

/**
 * Compact language switch used on pages without the main header
 * (sign-in, sign-up, forgot password). Audit FN-14 / UX-27.
 */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div role="group" aria-label="Langue / Language / اللغة" className={cn("flex gap-1", className)}>
      {(Object.keys(LOCALE_LABELS) as Locale[]).map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          onClick={() => setLocale(lang)}
          aria-pressed={locale === lang}
          className={cn(
            "min-h-[32px] px-2.5 rounded-md text-xs font-medium transition-colors",
            locale === lang
              ? "bg-gold text-oxford"
              : "bg-white/70 dark:bg-white/10 text-oxford dark:text-white hover:bg-white dark:hover:bg-white/20",
          )}
        >
          {LOCALE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}

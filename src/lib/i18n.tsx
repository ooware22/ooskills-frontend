// Simple i18n context for multilingual support
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  dirOf,
  isLocale,
  type Locale,
} from "@/lib/locale";

export type { Locale } from "@/lib/locale";

type Messages = Record<string, unknown>;

const translations: Record<Locale, () => Promise<Messages>> = {
  fr: () => import("../../messages/fr.json").then((m) => m.default as Messages),
  en: () => import("../../messages/en.json").then((m) => m.default as Messages),
  ar: () => import("../../messages/ar.json").then((m) => m.default as Messages),
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getNestedValue(obj: Messages, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Messages)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === "string" ? current : path;
}

/** Remember an explicit language choice for the next visit (server + client). */
function persistLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode): the cookie below is enough.
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}

interface I18nProviderProps {
  children: ReactNode;
  /** Locale chosen on the server from the cookie / Accept-Language. */
  initialLocale: Locale;
  /** Messages of that locale, so the first render (server and client) has text. */
  initialMessages: Messages;
}

export function I18nProvider({
  children,
  initialLocale,
  initialMessages,
}: I18nProviderProps) {
  // Locale and messages live in ONE state value: they always change together,
  // so the page can never show the menu in one language and the body in another.
  const [state, setState] = useState<{ locale: Locale; messages: Messages }>({
    locale: initialLocale,
    messages: initialMessages,
  });

  // Each switch gets a number; a slow download that finishes after a newer
  // switch is ignored. (Without this, the last file to arrive won, whatever
  // language had been asked for.)
  const latestRequest = useRef(0);
  const requestedLocale = useRef<Locale>(initialLocale);

  const switchTo = useCallback((next: Locale) => {
    const request = ++latestRequest.current;
    requestedLocale.current = next;
    persistLocale(next);
    translations[next]().then((messages) => {
      if (request !== latestRequest.current) return;
      setState({ locale: next, messages });
    });
  }, []);

  // Visitors who picked a language before the cookie existed only have it in
  // localStorage: honour it once, which also writes the cookie for next time.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      saved = null;
    }
    if (isLocale(saved) && saved !== initialLocale) {
      switchTo(saved);
    }
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep <html lang dir> in step with the language shown.
  useEffect(() => {
    document.documentElement.lang = state.locale;
    document.documentElement.dir = dirOf(state.locale);
  }, [state.locale]);

  const value = useMemo<I18nContextType>(
    () => ({
      locale: state.locale,
      messages: state.messages,
      dir: dirOf(state.locale),
      setLocale: (next: Locale) => {
        // Compare with the last language ASKED for, not the one displayed: a
        // click back to the current language must cancel a pending switch.
        if (next !== requestedLocale.current) switchTo(next);
      },
      t: (key: string) => getNestedValue(state.messages, key),
    }),
    [state, switchTo],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t } = useI18n();

  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey);
  };
}

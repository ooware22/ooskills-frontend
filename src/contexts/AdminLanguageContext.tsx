"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export type AdminLocale = "fr" | "en" | "ar";

export const adminLocaleLabels: Record<AdminLocale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

interface AdminLanguageContextType {
  editingLocale: AdminLocale;
  setEditingLocale: (locale: AdminLocale) => void;
}

const AdminLanguageContext = createContext<AdminLanguageContextType | null>(null);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
  // Get the current UI locale and use it as the default editing locale
  const { locale } = useI18n();
  const [editingLocale, setEditingLocale] = useState<AdminLocale>(
    (locale as AdminLocale) || "en"
  );

  // Sync editing locale when UI locale changes (optional - remove if you want them independent)
  useEffect(() => {
    if (locale && ["fr", "en", "ar"].includes(locale)) {
      setEditingLocale(locale as AdminLocale);
    }
  }, [locale]);

  return (
    <AdminLanguageContext.Provider value={{ editingLocale, setEditingLocale }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    throw new Error("useAdminLanguage must be used within an AdminLanguageProvider");
  }
  return context;
}

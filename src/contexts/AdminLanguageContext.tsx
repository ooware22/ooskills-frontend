"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  const [editingLocale, setEditingLocale] = useState<AdminLocale>("en");

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

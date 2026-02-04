"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, GlobeAltIcon as Globe, CalendarIcon as Calendar, ClockIcon as Clock } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";

type CountdownFormData = {
  title: string;
  subtitle: string;
  ctaText: string;
};

// Shared settings (same across all languages)
type SharedSettings = {
  launchDate: string;
  launchTime: string;
  isActive: boolean;
};

// Default content per language
const defaultContent: Record<AdminLocale, CountdownFormData> = {
  en: {
    title: "Platform Launching Soon",
    subtitle: "Get ready for an exceptional learning experience",
    ctaText: "Notify Me at Launch",
  },
  fr: {
    title: "Lancement de la plateforme bientôt",
    subtitle: "Préparez-vous pour une expérience d'apprentissage exceptionnelle",
    ctaText: "Me notifier au lancement",
  },
  ar: {
    title: "انطلاقة المنصة قريباً",
    subtitle: "استعدوا لتجربة تعليمية استثنائية",
    ctaText: "أخبرني عند الإطلاق",
  },
};

const defaultSharedSettings: SharedSettings = {
  launchDate: "2026-05-01",
  launchTime: "09:00",
  isActive: true,
};

export default function CountdownAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t, locale } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, CountdownFormData>>(defaultContent);
  
  // Shared settings (same across all languages)
  const [sharedSettings, setSharedSettings] = useState<SharedSettings>(defaultSharedSettings);
  
  // Current form data based on selected language
  const formData = allContent[editingLocale];

  const updateFormData = (updates: Partial<CountdownFormData>) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], ...updates }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    console.log(`Saving ${editingLocale} content:`, formData);
    console.log("Saving shared settings:", sharedSettings);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.countdown.title"
        subtitleKey="admin.countdown.subtitle"
      />
      
      <div className="p-6 space-y-6">
        {/* Language-Specific Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-oxford dark:text-white">
                  {t("admin.countdown.editContent")}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-sm text-silver dark:text-white/50 mt-1">
                {t("admin.common.editingLanguage")}: <span className="font-medium text-oxford dark:text-white">{adminLocaleLabels[editingLocale]}</span>
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-gold hover:bg-gold-light text-oxford rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-oxford/30 border-t-oxford rounded-full animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saved ? t("admin.common.saved") : t("admin.common.save")}
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.countdown.countdownTitle")}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.countdown.countdownSubtitle")}
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => updateFormData({ subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.countdown.ctaButton")}
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => updateFormData({ ctaText: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        </motion.div>

        {/* Shared Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">
            {t("admin.countdown.launchDate")} & {t("admin.countdown.launchTime")}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Calendar className="w-4 h-4 inline me-2" />
                {t("admin.countdown.launchDate")}
              </label>
              <input
                type="date"
                value={sharedSettings.launchDate}
                onChange={(e) => setSharedSettings(s => ({ ...s, launchDate: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                <Clock className="w-4 h-4 inline me-2" />
                {t("admin.countdown.launchTime")}
              </label>
              <input
                type="time"
                value={sharedSettings.launchTime}
                onChange={(e) => setSharedSettings(s => ({ ...s, launchTime: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sharedSettings.isActive}
                  onChange={(e) => setSharedSettings(s => ({ ...s, isActive: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-sm font-medium text-oxford dark:text-white">
                  {sharedSettings.isActive ? t("admin.countdown.showCountdown") : t("admin.countdown.hideCountdown")}
                </span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, ArrowPathIcon as RotateCcw, CheckIcon as Check, GlobeAltIcon as Globe, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  fetchHeroContent, 
  saveHeroContent,
  updateHeroContent,
  resetHeroContent,
  selectHeroContent,
  selectHeroLoading,
  selectHeroSaving,
  selectHeroError,
} from "@/store/exports";
import type { HeroContent } from "@/store/slices/heroSlice";
import type { Locale } from "@/types/content";

export default function HeroAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t, locale } = useI18n();
  const dispatch = useAppDispatch();
  
  // Redux state
  const heroContent = useAppSelector((state) => selectHeroContent(state, editingLocale as Locale));
  const loading = useAppSelector(selectHeroLoading);
  const saving = useAppSelector(selectHeroSaving);
  const error = useAppSelector(selectHeroError);
  
  // Local state for save feedback
  const [saved, setSaved] = useState(false);
  
  // Fetch hero content on mount
  useEffect(() => {
    dispatch(fetchHeroContent({}));
  }, [dispatch]);
  
  // Current form data from Redux
  const formData: HeroContent = heroContent;

  const updateFormData = (updates: Partial<HeroContent>) => {
    dispatch(updateHeroContent({ locale: editingLocale as Locale, updates }));
  };

  const handleSave = async () => {
    try {
      await dispatch(saveHeroContent({ 
        locale: editingLocale as Locale, 
        content: formData 
      })).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save hero content:", err);
    }
  };

  const handleReset = () => {
    dispatch(resetHeroContent(editingLocale as Locale));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          titleKey="admin.hero.title"
          subtitleKey="admin.hero.subtitle"
        />
        <div className="p-6">
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-silver dark:text-white/50">{t("admin.common.loading")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.hero.title"
        subtitleKey="admin.hero.subtitle"
      />
      
      <div className="p-6">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{t("admin.common.error")}</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          {/* Form Header */}
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-oxford dark:text-white">
                  {t("admin.hero.editContent")}
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-silver hover:text-oxford dark:hover:text-white border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t("admin.common.cancel")}
              </button>
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
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {/* Badge */}
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.hero.badge")}
              </label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => updateFormData({ badge: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>

            {/* Title Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.hero.mainTitle")}
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
                  {t("admin.hero.highlight")}
                </label>
                <input
                  type="text"
                  value={formData.titleHighlight}
                  onChange={(e) => updateFormData({ titleHighlight: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.hero.subtitleField")}
              </label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={(e) => updateFormData({ subtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>

            {/* CTA Buttons */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.hero.primaryCta")}
                </label>
                <input
                  type="text"
                  value={formData.ctaPrimary}
                  onChange={(e) => updateFormData({ ctaPrimary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                  {t("admin.hero.secondaryCta")}
                </label>
                <input
                  type="text"
                  value={formData.ctaSecondary}
                  onChange={(e) => updateFormData({ ctaSecondary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                  dir={editingLocale === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>

            {/* Illustration Content */}
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-semibold text-oxford dark:text-white mb-4">
                {t("admin.hero.preview")}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                    {t("admin.common.sectionTitle")}
                  </label>
                  <input
                    type="text"
                    value={formData.illustrationTitle}
                    onChange={(e) => updateFormData({ illustrationTitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    dir={editingLocale === "ar" ? "rtl" : "ltr"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                    {t("admin.common.sectionSubtitle")}
                  </label>
                  <input
                    type="text"
                    value={formData.illustrationSubtitle}
                    onChange={(e) => updateFormData({ illustrationSubtitle: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                    dir={editingLocale === "ar" ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

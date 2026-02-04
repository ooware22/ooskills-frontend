"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, ArrowPathIcon as RotateCcw, CheckIcon as Check, GlobeAltIcon as Globe } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";

type HeroFormData = {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  illustrationTitle: string;
  illustrationSubtitle: string;
};

// Default content per language (will be fetched from API later)
const defaultContent: Record<AdminLocale, HeroFormData> = {
  en: {
    badge: "#1 E-Learning Platform in Algeria",
    title: "Develop your skills with",
    titleHighlight: "OOSkills",
    subtitle: "Access quality training in IT, office tools, and personal development. Learn at your own pace with experts.",
    ctaPrimary: "Explore Courses",
    ctaSecondary: "Learn More",
    illustrationTitle: "Learn. Practice. Succeed.",
    illustrationSubtitle: "Your journey to excellence starts here",
  },
  fr: {
    badge: "#1 Plateforme E-Learning en Algérie",
    title: "Développez vos compétences avec",
    titleHighlight: "OOSkills",
    subtitle: "Accédez à des formations de qualité en informatique, bureautique et développement personnel. Apprenez à votre rythme avec des experts.",
    ctaPrimary: "Explorer les cours",
    ctaSecondary: "En savoir plus",
    illustrationTitle: "Apprendre. Pratiquer. Réussir.",
    illustrationSubtitle: "Votre parcours vers l'excellence commence ici",
  },
  ar: {
    badge: "#1 منصة التعليم الإلكتروني في الجزائر",
    title: "طوّر مهاراتك مع",
    titleHighlight: "OOSkills",
    subtitle: "احصل على تدريب عالي الجودة في تكنولوجيا المعلومات وأدوات المكتب والتنمية الشخصية. تعلم بالسرعة التي تناسبك مع الخبراء.",
    ctaPrimary: "استكشف الدورات",
    ctaSecondary: "اعرف المزيد",
    illustrationTitle: "تعلم. تدرب. انجح.",
    illustrationSubtitle: "رحلتك نحو التميز تبدأ هنا",
  },
};

export default function HeroAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t, locale } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isRtl = locale === "ar";
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, HeroFormData>>(defaultContent);
  
  // Current form data based on selected language
  const formData = allContent[editingLocale];

  const updateFormData = (updates: Partial<HeroFormData>) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], ...updates }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Replace with actual Django API call to save content for the current locale
    console.log(`Saving ${editingLocale} content:`, formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: defaultContent[editingLocale]
    }));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.hero.title"
        subtitleKey="admin.hero.subtitle"
      />
      
      <div className="p-6">
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

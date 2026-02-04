"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, Bars2Icon as GripVertical, GlobeAltIcon as Globe } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";

const iconOptions = [
  "Monitor", "Users", "Award", "Zap", "Clock", "Shield", 
  "Target", "Rocket", "BookOpen", "Star", "Heart", "CheckCircle"
];

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

type FeaturesFormData = {
  sectionTitle: string;
  sectionSubtitle: string;
  features: Feature[];
};

// Default content per language
const defaultContent: Record<AdminLocale, FeaturesFormData> = {
  en: {
    sectionTitle: "Why Choose OOSkills?",
    sectionSubtitle: "Everything you need for an exceptional learning experience",
    features: [
      { id: "1", icon: "Monitor", title: "Quality Courses", description: "Professionally designed content by industry experts" },
      { id: "2", icon: "Users", title: "Expert Instructors", description: "Learn from professionals with real experience" },
      { id: "3", icon: "Award", title: "Certificates", description: "Get recognized certificates upon completion" },
      { id: "4", icon: "Zap", title: "Learn at Your Pace", description: "Flexible schedules to fit your lifestyle" },
      { id: "5", icon: "Clock", title: "24/7 Access", description: "Access your courses anytime, anywhere" },
      { id: "6", icon: "Shield", title: "Lifetime Access", description: "Once enrolled, access content forever" },
    ],
  },
  fr: {
    sectionTitle: "Pourquoi choisir OOSkills ?",
    sectionSubtitle: "Tout ce dont vous avez besoin pour une expérience d'apprentissage exceptionnelle",
    features: [
      { id: "1", icon: "Monitor", title: "Cours de qualité", description: "Contenu conçu professionnellement par des experts du secteur" },
      { id: "2", icon: "Users", title: "Instructeurs experts", description: "Apprenez avec des professionnels expérimentés" },
      { id: "3", icon: "Award", title: "Certificats", description: "Obtenez des certificats reconnus à la fin de chaque cours" },
      { id: "4", icon: "Zap", title: "Apprenez à votre rythme", description: "Des horaires flexibles adaptés à votre style de vie" },
      { id: "5", icon: "Clock", title: "Accès 24/7", description: "Accédez à vos cours à tout moment, n'importe où" },
      { id: "6", icon: "Shield", title: "Accès à vie", description: "Une fois inscrit, accédez au contenu pour toujours" },
    ],
  },
  ar: {
    sectionTitle: "لماذا تختار OOSkills؟",
    sectionSubtitle: "كل ما تحتاجه لتجربة تعليمية استثنائية",
    features: [
      { id: "1", icon: "Monitor", title: "دورات عالية الجودة", description: "محتوى مصمم باحترافية من قبل خبراء الصناعة" },
      { id: "2", icon: "Users", title: "مدربون خبراء", description: "تعلم من محترفين ذوي خبرة حقيقية" },
      { id: "3", icon: "Award", title: "شهادات", description: "احصل على شهادات معترف بها عند الانتهاء" },
      { id: "4", icon: "Zap", title: "تعلم بالسرعة التي تناسبك", description: "جداول مرنة تتناسب مع نمط حياتك" },
      { id: "5", icon: "Clock", title: "وصول على مدار الساعة", description: "الوصول إلى دوراتك في أي وقت ومن أي مكان" },
      { id: "6", icon: "Shield", title: "وصول مدى الحياة", description: "بمجرد التسجيل، الوصول إلى المحتوى للأبد" },
    ],
  },
};

export default function FeaturesAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, FeaturesFormData>>(defaultContent);
  
  // Current form data based on selected language
  const formData = allContent[editingLocale];

  const updateSectionTitle = (value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], sectionTitle: value }
    }));
  };

  const updateSectionSubtitle = (value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], sectionSubtitle: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    console.log(`Saving ${editingLocale} content:`, formData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addFeature = () => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        features: [
          ...prev[editingLocale].features,
          { id: Date.now().toString(), icon: "Star", title: "New Feature", description: "Description here" }
        ]
      }
    }));
  };

  const removeFeature = (id: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        features: prev[editingLocale].features.filter(f => f.id !== id)
      }
    }));
  };

  const updateFeature = (id: string, field: keyof Feature, value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        features: prev[editingLocale].features.map(f => f.id === id ? { ...f, [field]: value } : f)
      }
    }));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.features.title"
        subtitleKey="admin.features.subtitle"
      />
      
      <div className="p-6 space-y-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.common.sectionTitle")}</h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
              <Globe className="w-3 h-3" />
              {adminLocaleLabels[editingLocale]}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                {t("admin.common.sectionTitle")}
              </label>
              <input
                type="text"
                value={formData.sectionTitle}
                onChange={(e) => updateSectionTitle(e.target.value)}
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
                value={formData.sectionSubtitle}
                onChange={(e) => updateSectionSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.features.featureCards")}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-xs text-silver dark:text-white/50">{formData.features.length} {t("admin.features.items")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={addFeature}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.features.addFeature")}
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

          <div className="divide-y divide-gray-200 dark:divide-white/10">
            {formData.features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-2 cursor-grab text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1 grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.features.icon")}</label>
                      <select
                        value={feature.icon}
                        onChange={(e) => updateFeature(feature.id, "icon", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.features.featureTitle")}</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(feature.id, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.features.description")}</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, "description", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeFeature(feature.id)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

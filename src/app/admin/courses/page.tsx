"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, Bars2Icon as GripVertical, PhotoIcon as ImageIcon, GlobeAltIcon as Globe } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import Image from "next/image";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";

interface Course {
  id: string;
  image: string;
  title: string;
  category: string;
  duration: string;
  level: string;
}

type CoursesFormData = {
  sectionTitle: string;
  sectionSubtitle: string;
  courses: Course[];
};

// Default content per language
const defaultContent: Record<AdminLocale, CoursesFormData> = {
  en: {
    sectionTitle: "Our Popular Courses",
    sectionSubtitle: "Discover our most requested courses",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "Excel - From Beginner to Expert", category: "Office", duration: "12 hours", level: "All levels" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "Modern Web Development", category: "IT", duration: "40 hours", level: "Intermediate" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "Python for Beginners", category: "Programming", duration: "20 hours", level: "Beginner" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "Professional Communication", category: "Soft Skills", duration: "8 hours", level: "All levels" },
    ],
  },
  fr: {
    sectionTitle: "Nos cours populaires",
    sectionSubtitle: "Découvrez nos cours les plus demandés",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "Excel - Du débutant à l'expert", category: "Bureautique", duration: "12 heures", level: "Tous niveaux" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "Développement Web Moderne", category: "Informatique", duration: "40 heures", level: "Intermédiaire" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "Python pour débutants", category: "Programmation", duration: "20 heures", level: "Débutant" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "Communication professionnelle", category: "Soft Skills", duration: "8 heures", level: "Tous niveaux" },
    ],
  },
  ar: {
    sectionTitle: "دوراتنا الشائعة",
    sectionSubtitle: "اكتشف الدورات الأكثر طلبًا",
    courses: [
      { id: "1", image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop", title: "إكسل - من المبتدئين إلى الخبراء", category: "المكتبية", duration: "12 ساعة", level: "جميع المستويات" },
      { id: "2", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop", title: "تطوير الويب الحديث", category: "تكنولوجيا المعلومات", duration: "40 ساعة", level: "متوسط" },
      { id: "3", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop", title: "بايثون للمبتدئين", category: "البرمجة", duration: "20 ساعة", level: "مبتدئ" },
      { id: "4", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop", title: "التواصل المهني", category: "المهارات الناعمة", duration: "8 ساعات", level: "جميع المستويات" },
    ],
  },
};

export default function CoursesAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Store content for all languages
  const [allContent, setAllContent] = useState<Record<AdminLocale, CoursesFormData>>(defaultContent);
  
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

  const addCourse = () => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        courses: [
          ...prev[editingLocale].courses,
          { id: Date.now().toString(), image: "", title: "New Course", category: "Category", duration: "10 hours", level: "Beginner" }
        ]
      }
    }));
  };

  const removeCourse = (id: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        courses: prev[editingLocale].courses.filter(c => c.id !== id)
      }
    }));
  };

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setAllContent(prev => ({
      ...prev,
      [editingLocale]: {
        ...prev[editingLocale],
        courses: prev[editingLocale].courses.map(c => c.id === id ? { ...c, [field]: value } : c)
      }
    }));
  };

  return (
    <div className="min-h-screen">
      <AdminHeader 
        titleKey="admin.courses.title"
        subtitleKey="admin.courses.subtitle"
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

        {/* Courses List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.courses.courseCards")}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-xs text-silver dark:text-white/50">{formData.courses.length} {t("admin.courses.coursesCount")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={addCourse}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.courses.addCourse")}
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
            {formData.courses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-2 cursor-grab text-gray-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  {/* Image Preview */}
                  <div className="w-24 h-16 bg-gray-100 dark:bg-oxford rounded-lg overflow-hidden flex-shrink-0 relative">
                    {course.image ? (
                      <Image src={course.image} alt={course.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 grid md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.courses.courseTitle")}</label>
                      <input
                        type="text"
                        value={course.title}
                        onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.courses.category")}</label>
                      <input
                        type="text"
                        value={course.category}
                        onChange={(e) => updateCourse(course.id, "category", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.courses.duration")}</label>
                      <input
                        type="text"
                        value={course.duration}
                        onChange={(e) => updateCourse(course.id, "duration", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.courses.level")}</label>
                      <input
                        type="text"
                        value={course.level}
                        onChange={(e) => updateCourse(course.id, "level", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Image URL */}
                <div className="ms-9 mt-3">
                  <label className="block text-xs font-medium text-silver mb-1">{t("admin.courses.imageUrl")}</label>
                  <input
                    type="text"
                    value={course.image}
                    onChange={(e) => updateCourse(course.id, "image", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

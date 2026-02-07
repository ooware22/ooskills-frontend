"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, ChevronDownIcon as ChevronDown, ChevronUpIcon as ChevronUp, GlobeAltIcon as Globe, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adminFAQApi } from "@/services/contentApi";
import {
  fetchFAQContent,
  createFAQItem,
  updateFAQItem,
  deleteFAQItem,
  updateFAQSection,
  selectFAQContent,
  selectFAQItems,
  selectFAQLoading,
  selectFAQSaving,
  selectFAQError,
} from "@/store/exports";
import type { FAQContent, FAQ } from "@/store/slices/faqSlice";
import type { Locale } from "@/types/content";

// Extended FAQ type to track changes
interface EditableFAQ extends FAQ {
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
}

export default function FAQAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  
  // Redux state (source of truth from server) - select all content, derive for locale
  const allContent = useAppSelector((state) => state.faq.content);
  const items = useAppSelector(selectFAQItems);
  const loading = useAppSelector(selectFAQLoading);
  const saving = useAppSelector(selectFAQSaving);
  const error = useAppSelector(selectFAQError);
  
  // Derive content for current editing locale - ensures immediate update when locale changes
  const reduxContent = useMemo(() => {
    return allContent[editingLocale as Locale];
  }, [allContent, editingLocale]);
  
  // LOCAL form state - completely separate from Redux during editing
  const [localTitle, setLocalTitle] = useState("");
  const [localSubtitle, setLocalSubtitle] = useState("");
  const [localFAQs, setLocalFAQs] = useState<EditableFAQ[]>([]);
  const [saved, setSaved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch content and active section on mount
  useEffect(() => {
    dispatch(fetchFAQContent({}));
    // Also fetch the active FAQ section to get its ID
    adminFAQApi.section.getActive()
      .then((section) => {
        setActiveSectionId(section.id);
        // Use section title/subtitle from backend
        const locale = editingLocale as Locale;
        const title = section.title?.[locale] || section.title?.fr || section.title?.en || "";
        const subtitle = section.subtitle?.[locale] || section.subtitle?.fr || section.subtitle?.en || "";
        if (title || subtitle) {
          setLocalTitle(title);
          setLocalSubtitle(subtitle);
        }
      })
      .catch(() => {
        // No active section yet - that's okay
        console.log("No active FAQ section found, will create one on first save");
      });
  }, [dispatch, editingLocale]);
  
  // Initialize local state from Redux when data is available
  useEffect(() => {
    // Initialize when we have data and haven't initialized yet
    if (reduxContent && !isInitialized && !loading) {
      // Check if we have real backend data (items > 0) or just defaults
      const hasBackendData = items.length > 0;
      if (hasBackendData) {
        // Only set title/subtitle if we don't have them from section API
        if (!localTitle && !localSubtitle) {
          setLocalTitle(reduxContent.sectionTitle);
          setLocalSubtitle(reduxContent.sectionSubtitle);
        }
        setLocalFAQs(reduxContent.faqs.map(f => ({ ...f })));
        setIsInitialized(true);
      }
    }
  }, [items, reduxContent, isInitialized, loading, localTitle, localSubtitle]);
  
  // Reset local state when locale changes - now reduxContent is already the correct locale
  useEffect(() => {
    if (items.length > 0 && reduxContent && isInitialized) {
      // Fetch section title for new locale
      if (activeSectionId) {
        adminFAQApi.section.retrieve(activeSectionId)
          .then((section) => {
            const locale = editingLocale as Locale;
            setLocalTitle(section.title?.[locale] || section.title?.fr || "");
            setLocalSubtitle(section.subtitle?.[locale] || section.subtitle?.fr || "");
          })
          .catch(() => {
            setLocalTitle(reduxContent.sectionTitle);
            setLocalSubtitle(reduxContent.sectionSubtitle);
          });
      } else {
        setLocalTitle(reduxContent.sectionTitle);
        setLocalSubtitle(reduxContent.sectionSubtitle);
      }
      setLocalFAQs(reduxContent.faqs.map(f => ({ ...f })));
    }
  }, [editingLocale, activeSectionId, items.length, reduxContent, isInitialized]);


  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 0. Save section title/subtitle to backend
      let sectionId = activeSectionId;
      const locale = editingLocale as Locale;
      
      if (sectionId) {
        // Update existing section
        await adminFAQApi.section.update(sectionId, {
          title: { [locale]: localTitle },
          subtitle: { [locale]: localSubtitle },
        });
      } else {
        // Create new section if none exists
        const newSection = await adminFAQApi.section.create({
          title: { [locale]: localTitle },
          subtitle: { [locale]: localSubtitle },
          is_active: true,
        });
        sectionId = newSection.id;
        setActiveSectionId(sectionId);
      }
      
      // Also update Redux state
      dispatch(updateFAQSection({
        locale: locale,
        title: localTitle,
        subtitle: localSubtitle,
      }));

      // 1. Process new FAQs
      const newFAQs = localFAQs.filter(f => f.isNew && !f.isDeleted);
      for (const faq of newFAQs) {
        await dispatch(createFAQItem({
          locale: locale,
          faq: {
            question: faq.question,
            answer: faq.answer,
          },
          sectionId: sectionId ?? undefined,
        })).unwrap();
      }

      // 2. Process modified existing FAQs
      const modifiedFAQs = localFAQs.filter(f => f.isModified && !f.isNew && !f.isDeleted);
      for (const faq of modifiedFAQs) {
        const numericId = parseInt(faq.id);
        if (!isNaN(numericId)) {
          await dispatch(updateFAQItem({
            locale: locale,
            id: numericId,
            updates: {
              question: faq.question,
              answer: faq.answer,
            },
          })).unwrap();
        }
      }

      // 3. Process deletions
      const deletedFAQs = localFAQs.filter(f => f.isDeleted && !f.isNew);
      for (const faq of deletedFAQs) {
        const numericId = parseInt(faq.id);
        if (!isNaN(numericId)) {
          await dispatch(deleteFAQItem(numericId)).unwrap();
        }
      }

      // 4. Update local state to reflect saved changes (remove deleted, mark new as saved)
      setLocalFAQs(prev => prev
        .filter(f => !f.isDeleted) // Remove deleted items
        .map(f => ({
          ...f,
          isNew: false, // Mark new items as saved
          isModified: false, // Clear modified flag
        }))
      );
      
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save FAQ:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = () => {
    const tempId = `temp-${Date.now()}`;
    const newFaq: EditableFAQ = {
      id: tempId,
      question: editingLocale === "ar" ? "سؤال جديد؟" : editingLocale === "fr" ? "Nouvelle question ?" : "New Question?",
      answer: editingLocale === "ar" ? "إجابة هنا..." : editingLocale === "fr" ? "Réponse ici..." : "Answer here...",
      isOpen: true,
      isNew: true,
    };
    setLocalFAQs(prev => [...prev, newFaq]);
  };

  const handleRemoveFaq = (id: string) => {
    setLocalFAQs(prev => {
      const faq = prev.find(f => f.id === id);
      if (!faq) return prev;
      
      // If it's a new FAQ, just remove it from the list
      if (faq.isNew) {
        return prev.filter(f => f.id !== id);
      }
      
      // Otherwise, mark it as deleted
      return prev.map(f => f.id === id ? { ...f, isDeleted: true } : f);
    });
  };

  const handleUpdateFaq = (id: string, field: keyof FAQ, value: string) => {
    setLocalFAQs(prev => prev.map(f => {
      if (f.id !== id) return f;
      return { ...f, [field]: value, isModified: true };
    }));
  };

  const handleToggleFaq = (id: string) => {
    setLocalFAQs(prev => prev.map(f => {
      if (f.id !== id) return f;
      return { ...f, isOpen: !f.isOpen };
    }));
  };

  // Filter out deleted FAQs for display
  const visibleFAQs = useMemo(() => 
    localFAQs.filter(f => !f.isDeleted),
    [localFAQs]
  );

  // Loading state
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          titleKey="admin.faq.title"
          subtitleKey="admin.faq.subtitle"
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
        titleKey="admin.faq.title"
        subtitleKey="admin.faq.subtitle"
      />
      
      <div className="p-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{t("admin.common.error")}</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

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
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
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
                value={localSubtitle}
                onChange={(e) => setLocalSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                dir={editingLocale === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-oxford dark:text-white">{t("admin.faq.questionsAnswers")}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gold/10 text-gold rounded-full text-xs font-medium">
                  <Globe className="w-3 h-3" />
                  {adminLocaleLabels[editingLocale]}
                </span>
              </div>
              <p className="text-xs text-silver dark:text-white/50">{visibleFAQs.length} {t("admin.features.items")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddFaq}
                className="px-3 py-2 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.faq.addQuestion")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-gold hover:bg-gold-light text-oxford rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
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
            {visibleFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 ${faq.isNew ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
              >
                {/* Question Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 bg-gold/10 rounded text-gold text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => handleToggleFaq(faq.id)}
                    className="flex-1 flex items-center justify-between text-start"
                  >
                    <span className="text-sm font-medium text-oxford dark:text-white" dir={editingLocale === "ar" ? "rtl" : "ltr"}>
                      {faq.question || "Untitled Question"}
                    </span>
                    {faq.isOpen ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveFaq(faq.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Content */}
                {faq.isOpen && (
                  <div className="ms-9 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.faq.question")}</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFaq(faq.id, "question", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.faq.answer")}</label>
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => handleUpdateFaq(faq.id, "answer", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold resize-none"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

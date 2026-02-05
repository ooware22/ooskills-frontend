"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, PlusIcon as Plus, TrashIcon as Trash2, Bars2Icon as GripVertical, GlobeAltIcon as Globe, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchFeaturesContent,
  createFeatureItem,
  updateFeatureItem,
  deleteFeatureItem,
  saveFeaturesSection,
  selectFeaturesContent,
  selectFeaturesLoading,
  selectFeaturesSaving,
  selectFeaturesError,
  selectActiveSection,
} from "@/store/exports";
import type { FeaturesContent, Feature } from "@/store/slices/featuresSlice";
import type { Locale } from "@/types/content";

const iconOptions = [
  "monitor", "users", "award", "zap", "clock", "shield", 
  "target", "rocket", "book-open", "star", "heart", "check-circle"
];

// Extended feature type to track changes
interface EditableFeature extends Feature {
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
}

export default function FeaturesAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  
  // Redux state (source of truth from server)
  const reduxContent = useAppSelector((state) => selectFeaturesContent(state, editingLocale as Locale));
  const activeSection = useAppSelector(selectActiveSection);
  const loading = useAppSelector(selectFeaturesLoading);
  const saving = useAppSelector(selectFeaturesSaving);
  const error = useAppSelector(selectFeaturesError);
  
  // LOCAL form state - completely separate from Redux during editing
  const [localTitle, setLocalTitle] = useState("");
  const [localSubtitle, setLocalSubtitle] = useState("");
  const [localFeatures, setLocalFeatures] = useState<EditableFeature[]>([]);
  const [saved, setSaved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Fetch content on mount - use cache if available
  useEffect(() => {
    dispatch(fetchFeaturesContent({}));
  }, [dispatch]);
  
  // Initialize local state from Redux when BACKEND data loads (check activeSection exists)
  useEffect(() => {
    // Only initialize when we have real backend data (activeSection is not null)
    if (activeSection && reduxContent && !isInitialized && !loading) {
      setLocalTitle(reduxContent.sectionTitle);
      setLocalSubtitle(reduxContent.sectionSubtitle);
      setLocalFeatures(reduxContent.features.map(f => ({ ...f })));
      setIsInitialized(true);
    }
  }, [activeSection, reduxContent, isInitialized, loading]);
  
  // Reset local state when locale changes
  useEffect(() => {
    if (activeSection && reduxContent && isInitialized) {
      setLocalTitle(reduxContent.sectionTitle);
      setLocalSubtitle(reduxContent.sectionSubtitle);
      setLocalFeatures(reduxContent.features.map(f => ({ ...f })));
    }
  }, [editingLocale]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!activeSection) return;
    
    try {
      // 1. Save section title/subtitle
      await dispatch(saveFeaturesSection({
        locale: editingLocale as Locale,
        title: localTitle,
        subtitle: localSubtitle,
      })).unwrap();

      // 2. Process new features
      const newFeatures = localFeatures.filter(f => f.isNew && !f.isDeleted);
      for (const feature of newFeatures) {
        await dispatch(createFeatureItem({
          locale: editingLocale as Locale,
          feature: {
            icon: feature.icon,
            title: feature.title,
            description: feature.description,
          },
        })).unwrap();
      }

      // 3. Process modified existing features
      const modifiedFeatures = localFeatures.filter(f => f.isModified && !f.isNew && !f.isDeleted);
      for (const feature of modifiedFeatures) {
        const numericId = parseInt(feature.id);
        if (!isNaN(numericId)) {
          await dispatch(updateFeatureItem({
            locale: editingLocale as Locale,
            id: numericId,
            updates: {
              icon: feature.icon,
              title: feature.title,
              description: feature.description,
            },
          })).unwrap();
        }
      }

      // 4. Process deletions
      const deletedFeatures = localFeatures.filter(f => f.isDeleted && !f.isNew);
      for (const feature of deletedFeatures) {
        const numericId = parseInt(feature.id);
        if (!isNaN(numericId)) {
          await dispatch(deleteFeatureItem(numericId)).unwrap();
        }
      }

      // 5. Update local state to reflect saved changes (remove deleted, mark new as saved)
      setLocalFeatures(prev => prev
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
      console.error("Failed to save features:", err);
    }
  };

  const handleAddFeature = () => {
    const newFeature: EditableFeature = {
      id: `temp-${Date.now()}`,
      icon: "star",
      title: editingLocale === "ar" ? "ميزة جديدة" : editingLocale === "fr" ? "Nouvelle fonctionnalité" : "New Feature",
      description: editingLocale === "ar" ? "الوصف هنا" : editingLocale === "fr" ? "Description ici" : "Description here",
      isNew: true,
    };
    setLocalFeatures(prev => [...prev, newFeature]);
  };

  const handleRemoveFeature = (id: string) => {
    setLocalFeatures(prev => {
      const feature = prev.find(f => f.id === id);
      if (!feature) return prev;
      
      // If it's a new feature, just remove it from the list
      if (feature.isNew) {
        return prev.filter(f => f.id !== id);
      }
      
      // Otherwise, mark it as deleted
      return prev.map(f => f.id === id ? { ...f, isDeleted: true } : f);
    });
  };

  const handleUpdateFeature = (id: string, field: keyof Feature, value: string) => {
    setLocalFeatures(prev => prev.map(f => {
      if (f.id !== id) return f;
      return { ...f, [field]: value, isModified: true };
    }));
  };

  // Filter out deleted features for display
  const visibleFeatures = useMemo(() => 
    localFeatures.filter(f => !f.isDeleted),
    [localFeatures]
  );

  // Loading state
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          titleKey="admin.features.title"
          subtitleKey="admin.features.subtitle"
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
        titleKey="admin.features.title"
        subtitleKey="admin.features.subtitle"
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
              <p className="text-xs text-silver dark:text-white/50">{visibleFeatures.length} {t("admin.features.items")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddFeature}
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
            {visibleFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 ${feature.isNew ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
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
                        onChange={(e) => handleUpdateFeature(feature.id, "icon", e.target.value)}
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
                        onChange={(e) => handleUpdateFeature(feature.id, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-silver mb-1">{t("admin.features.description")}</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => handleUpdateFeature(feature.id, "description", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-sm text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold"
                        dir={editingLocale === "ar" ? "rtl" : "ltr"}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFeature(feature.id)}
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

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, GlobeAltIcon as Globe, CalendarIcon as Calendar, ClockIcon as Clock, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n } from "@/lib/i18n";
import countdownApi, { type AdminCountdown } from "@/services/countdownApi";
import { getErrorMessage } from "@/lib/axios";

type CountdownFormData = {
  title: string;
  subtitle: string;
  ctaText: string;
};

const emptyContent = (): Record<AdminLocale, CountdownFormData> => ({
  en: { title: "", subtitle: "", ctaText: "" },
  fr: { title: "", subtitle: "", ctaText: "" },
  ar: { title: "", subtitle: "", ctaText: "" },
});

function splitDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export default function CountdownAdmin() {
  const { editingLocale } = useAdminLanguage();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allContent, setAllContent] = useState<Record<AdminLocale, CountdownFormData>>(emptyContent());
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [isActive, setIsActive] = useState(true);

  const applyServerData = (data: AdminCountdown) => {
    setAllContent({
      en: {
        title: data.title?.en || "",
        subtitle: data.subtitle?.en || "",
        ctaText: data.cta_text?.en || "",
      },
      fr: {
        title: data.title?.fr || "",
        subtitle: data.subtitle?.fr || "",
        ctaText: data.cta_text?.fr || "",
      },
      ar: {
        title: data.title?.ar || "",
        subtitle: data.subtitle?.ar || "",
        ctaText: data.cta_text?.ar || "",
      },
    });
    const { date, time } = splitDateTime(data.launch_date);
    setLaunchDate(date);
    setLaunchTime(time);
    setIsActive(data.is_active);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await countdownApi.getAdmin();
      applyServerData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formData = allContent[editingLocale];

  const updateFormData = (updates: Partial<CountdownFormData>) => {
    setAllContent((prev) => ({
      ...prev,
      [editingLocale]: { ...prev[editingLocale], ...updates },
    }));
  };

  const handleSave = async () => {
    if (!launchDate || !launchTime) {
      setError(t("admin.countdown.launchDate") + " / " + t("admin.countdown.launchTime") + " required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const localIso = `${launchDate}T${launchTime}:00`;
      const updated = await countdownApi.update({
        title: { en: allContent.en.title, fr: allContent.fr.title, ar: allContent.ar.title },
        subtitle: { en: allContent.en.subtitle, fr: allContent.fr.subtitle, ar: allContent.ar.subtitle },
        cta_text: { en: allContent.en.ctaText, fr: allContent.fr.ctaText, ar: allContent.ar.ctaText },
        launch_date: new Date(localIso).toISOString(),
        is_active: isActive,
      });
      applyServerData(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AdminHeader titleKey="admin.countdown.title" subtitleKey="admin.countdown.subtitle" />
        <div className="p-6 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        titleKey="admin.countdown.title"
        subtitleKey="admin.countdown.subtitle"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

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
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
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
                value={launchTime}
                onChange={(e) => setLaunchTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                />
                <span className="text-sm font-medium text-oxford dark:text-white">
                  {isActive ? t("admin.countdown.showCountdown") : t("admin.countdown.hideCountdown")}
                </span>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

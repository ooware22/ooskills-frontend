"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DocumentCheckIcon as Save, CheckIcon as Check, GlobeAltIcon as Globe, SwatchIcon as Palette, BellIcon as Bell, ShieldCheckIcon as Shield, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchSiteSettings,
  updateSiteSettings,
  selectSiteSettings,
  selectSiteSettingsLoading,
  selectSiteSettingsSaving,
  selectSiteSettingsError,
} from "@/store/slices/siteSettingsSlice";

export default function SettingsAdmin() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const reduxSettings = useAppSelector(selectSiteSettings);
  const loading = useAppSelector(selectSiteSettingsLoading);
  const saving = useAppSelector(selectSiteSettingsSaving);
  const error = useAppSelector(selectSiteSettingsError);
  
  // Local form state
  const [saved, setSaved] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    site_tagline: "",
    default_language: "fr",
    google_analytics_id: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    dark_mode_enabled: true,
    notifications_enabled: true,
    maintenance_mode: false,
    registration_enabled: true,
  });

  // Fetch settings from Redux/backend on mount (with caching)
  useEffect(() => {
    dispatch(fetchSiteSettings({}));
  }, [dispatch]);

  // Initialize local state from Redux when data is available
  useEffect(() => {
    if (reduxSettings && !isInitialized && !loading) {
      setSettings({
        site_name: reduxSettings.siteName || "",
        site_tagline: reduxSettings.siteTagline || "",
        default_language: reduxSettings.defaultLanguage || "fr",
        google_analytics_id: reduxSettings.googleAnalyticsId || "",
        meta_title: reduxSettings.metaTitle || "",
        meta_description: reduxSettings.metaDescription || "",
        meta_keywords: reduxSettings.metaKeywords || "",
        dark_mode_enabled: reduxSettings.darkModeEnabled ?? true,
        notifications_enabled: reduxSettings.notificationsEnabled ?? true,
        maintenance_mode: reduxSettings.maintenanceMode ?? false,
        registration_enabled: reduxSettings.registrationEnabled ?? true,
      });
      setIsInitialized(true);
    }
  }, [reduxSettings, isInitialized, loading]);


  const handleSave = async () => {
    try {
      await dispatch(updateSiteSettings({
        siteName: settings.site_name,
        siteTagline: settings.site_tagline,
        defaultLanguage: settings.default_language as "fr" | "ar" | "en",
        googleAnalyticsId: settings.google_analytics_id,
        metaTitle: settings.meta_title,
        metaDescription: settings.meta_description,
        metaKeywords: settings.meta_keywords,
        darkModeEnabled: settings.dark_mode_enabled,
        notificationsEnabled: settings.notifications_enabled,
        maintenanceMode: settings.maintenance_mode,
        registrationEnabled: settings.registration_enabled,
      })).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  // Loading state
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen">
        <AdminHeader 
          title="Settings" 
          subtitle="General site settings and configurations" 
        />
        <div className="p-6">
          <div className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-silver dark:text-white/50">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen">
      <AdminHeader 
        title="Settings" 
        subtitle="General site settings and configurations" 
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
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">General Settings</h3>
              <p className="text-xs text-silver dark:text-white/50">Basic site configuration</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Site Tagline
              </label>
              <input
                type="text"
                value={settings.site_tagline}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Default Language
              </label>
              <select
                value={settings.default_language}
                onChange={(e) => setSettings({ ...settings, default_language: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* SEO Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-oxford dark:text-white">SEO Settings</h3>
              <p className="text-xs text-silver dark:text-white/50">Search engine optimization</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.meta_title}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={settings.meta_description}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-oxford dark:text-white mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.meta_keywords}
                onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-oxford rounded-lg border border-gray-200 dark:border-white/10 text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Feature Toggles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-oxford dark:text-white">Feature Toggles</h3>
                <p className="text-xs text-silver dark:text-white/50">Enable or disable features</p>
              </div>
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
              {saved ? "Saved!" : "Save All Settings"}
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-oxford rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-oxford dark:text-white" />
                <div>
                  <p className="font-medium text-oxford dark:text-white">Dark Mode</p>
                  <p className="text-xs text-silver dark:text-white/50">
                    Allow users to switch between light and dark themes
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.dark_mode_enabled}
                  onChange={(e) => setSettings({ ...settings, dark_mode_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-oxford rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-oxford dark:text-white" />
                <div>
                  <p className="font-medium text-oxford dark:text-white">Notifications</p>
                  <p className="text-xs text-silver dark:text-white/50">
                    Enable notification badges in admin panel
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-oxford rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-oxford dark:text-white" />
                <div>
                  <p className="font-medium text-oxford dark:text-white">Maintenance Mode</p>
                  <p className="text-xs text-silver dark:text-white/50">
                    Show maintenance page to visitors
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>

            {/* Registration Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-oxford rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-oxford dark:text-white" />
                <div>
                  <p className="font-medium text-oxford dark:text-white">User Registration</p>
                  <p className="text-xs text-silver dark:text-white/50">
                    Allow new user registrations
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.registration_enabled}
                  onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 dark:bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

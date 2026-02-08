"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BellIcon as Bell,
  MagnifyingGlassIcon as Search,
  UserIcon as User,
  Bars3Icon as Menu,
  SunIcon as Sun,
  MoonIcon as Moon,
  GlobeAltIcon as Globe,
  ChevronDownIcon as ChevronDown,
} from "@heroicons/react/24/outline";
import { useSidebar } from "./AdminSidebar";
import { useAdminLanguage, AdminLocale, adminLocaleLabels } from "@/contexts/AdminLanguageContext";
import { useI18n, Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  titleKey?: string;
  subtitleKey?: string;
}

export default function AdminHeader({ title, subtitle, titleKey, subtitleKey }: AdminHeaderProps) {
  const { setMobileOpen } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { editingLocale, setEditingLocale } = useAdminLanguage();
  const { t, locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRtl = locale === "ar";
  
  // Get user from auth state
  const user = useAppSelector((state) => state.auth.user);
  const userName = user?.first_name && user?.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user?.email || "Admin";
  const userEmail = user?.email || "admin@example.com";
  const userAvatar = user?.avatar_display_url || null;
  const userRole = user?.role === "SUPER_ADMIN" ? "Super Admin" : user?.role === "ADMIN" ? "Administrator" : "User";

  // Resolved title and subtitle from translation keys or direct props
  const resolvedTitle = titleKey ? t(titleKey) : title || "";
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle || "";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setLangOpen(false);
    };
    if (langOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [langOpen]);

  const localeLabels: Record<Locale, string> = {
    fr: "Français",
    en: "English",
    ar: "العربية",
  };

  return (
    <header className="bg-white dark:bg-oxford-light border-b border-gray-200 dark:border-white/10 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              "lg:hidden p-2 text-oxford dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors",
              isRtl ? "-me-2" : "-ms-2"
            )}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-semibold text-oxford dark:text-white">
              {resolvedTitle}
            </h1>
            {resolvedSubtitle && (
              <p className="text-sm text-silver dark:text-white/50 hidden sm:block">
                {resolvedSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/5 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("admin.header.searchPlaceholder")}
              className="bg-transparent text-sm text-oxford dark:text-white placeholder:text-gray-400 focus:outline-none w-40"
              dir={isRtl ? "rtl" : "ltr"}
            />
          </div>

          {/* UI Language Switcher */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen(!langOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-white/60 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              title={t("admin.common.selectEditingLanguage")}
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{locale.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className={cn(
                "absolute top-full mt-1 bg-white dark:bg-oxford rounded-lg shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden min-w-[140px] py-1 z-50",
                isRtl ? "left-0" : "right-0"
              )}>
                {(["fr", "en", "ar"] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocale(lang);
                      // Also sync editing locale with UI locale
                      setEditingLocale(lang as AdminLocale);
                      setLangOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-oxford dark:text-white",
                      locale === lang && "bg-gray-50 dark:bg-white/5"
                    )}
                  >
                    <span className="font-medium w-6">{lang.toUpperCase()}</span>
                    <span>{localeLabels[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              title={
                theme === "dark"
                  ? t("admin.header.lightMode")
                  : t("admin.header.darkMode")
              }
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          )}

          {/* Notifications */}
          <button 
            className="relative p-2 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            title={t("admin.header.notifications")}
          >
            <Bell className="w-5 h-5" />
            <span className={cn(
              "absolute top-1.5 w-2 h-2 bg-gold rounded-full",
              isRtl ? "left-1.5" : "right-1.5"
            )} />
          </button>

          {/* Profile */}
          <div className={cn(
            "flex items-center gap-3 border-gray-200 dark:border-white/10",
            isRtl ? "pe-2 lg:pe-3 border-e" : "ps-2 lg:ps-3 border-s"
          )}>
            <div className={cn("hidden md:block", isRtl ? "text-start" : "text-end")}>
              <p className="text-sm font-medium text-oxford dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                {userEmail}
              </p>
            </div>
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={36}
                height={36}
                className="w-9 h-9 rounded-lg object-cover"
              />
            ) : (
              <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-oxford font-semibold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

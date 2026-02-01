"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Menu, X, Sun, Moon, Monitor, GraduationCap, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, useTranslations, Locale } from "@/lib/i18n";

const localeLabels: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, dir } = useI18n();
  const t = useTranslations("nav");
  
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setThemeOpen(false);
      setLangOpen(false);
    };
    if (themeOpen || langOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [themeOpen, langOpen]);

  const navLinks = [
    { href: "#hero", label: t("home") },
    { href: "#features", label: t("features") },
    { href: "#courses", label: t("courses") },
    { href: "#how-it-works", label: t("howItWorks") },
    { href: "#faq", label: t("faq") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        isScrolled || isOpen
          ? "bg-white/95 dark:bg-oxford/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-white/5"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-oxford" />
            </div>
            <span className="text-lg font-semibold text-oxford dark:text-white">
              OOSkills
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-oxford/70 dark:text-white/70 hover:text-oxford dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen(!langOpen);
                  setThemeOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-oxford/70 dark:text-white/70 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{locale.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langOpen && (
                <div className="absolute top-full end-0 mt-1 bg-white dark:bg-oxford-light rounded-lg shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden min-w-[140px] py-1">
                  {(["fr", "en", "ar"] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocale(lang);
                        setLangOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-oxford dark:text-white",
                        locale === lang && "bg-gray-50 dark:bg-white/5"
                      )}
                    >
                      <span>{localeLabels[lang]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Theme Switcher */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setThemeOpen(!themeOpen);
                  setLangOpen(false);
                }}
                className="p-2 text-oxford/70 dark:text-white/70 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                {mounted ? (
                  theme === "dark" ? (
                    <Moon className="w-4 h-4" />
                  ) : theme === "light" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Monitor className="w-4 h-4" />
                  )
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </button>
              {themeOpen && (
                <div className="absolute top-full end-0 mt-1 bg-white dark:bg-oxford-light rounded-lg shadow-lg border border-gray-200 dark:border-white/10 overflow-hidden min-w-[120px] py-1">
                  {[
                    { value: "light", icon: Sun, label: t("light") },
                    { value: "dark", icon: Moon, label: t("dark") },
                    { value: "system", icon: Monitor, label: t("system") },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setTheme(item.value);
                        setThemeOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-oxford dark:text-white",
                        theme === item.value && "bg-gray-50 dark:bg-white/5"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

            {/* CTA Buttons */}
            <Link
              href="#"
              className="px-3 py-2 text-sm text-oxford/70 dark:text-white/70 hover:text-oxford dark:hover:text-white transition-colors"
            >
              {t("login")}
            </Link>
            <Link 
              href="#" 
              className="px-4 py-2 text-sm font-medium text-oxford bg-gold hover:bg-gold-light rounded-lg transition-colors"
            >
              {t("signup")}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-oxford dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2.5 text-sm font-medium text-oxford dark:text-white rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
                {/* Language buttons */}
                <div className="flex gap-1">
                  {(["fr", "en", "ar"] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLocale(lang)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        locale === lang
                          ? "bg-gold text-oxford"
                          : "bg-gray-100 dark:bg-white/5 text-oxford dark:text-white"
                      )}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-md bg-gray-100 dark:bg-white/5 text-oxford dark:text-white"
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
                <Link 
                  href="#" 
                  className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-200 dark:border-white/10 text-oxford dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link 
                  href="#" 
                  className="flex-1 text-center py-2.5 text-sm font-medium bg-gold text-oxford rounded-lg hover:bg-gold-light transition-colors"
                >
                  {t("signup")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

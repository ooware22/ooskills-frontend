"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations, useI18n } from "@/lib/i18n";
import { ArrowLeftIcon, DocumentTextIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";

export default function TermsOfServicePage() {
  const t = useTranslations("termsOfService");
  const { locale, setLocale } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "ar", label: "العربية", flag: "🇩🇿" },
  ];

  return (
    <div className="min-h-screen bg-cream dark:bg-oxford transition-colors duration-300">
      {/* Header navigation bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-oxford/80 border-b border-oxford/5 dark:border-white/5">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            {mounted ? (
              <Image
                src={
                  resolvedTheme === "dark"
                    ? "/images/logo/logo_DarkMood2.png"
                    : "/images/logo/logo_LightMood2.png"
                }
                alt="OOSkills"
                width={220}
                height={60}
                className="h-6 w-auto"
                priority
              />
            ) : (
              <Image
                src="/images/logo/logo_LightMood2.png"
                alt="OOSkills"
                width={220}
                height={60}
                className="h-6 w-auto"
                priority
              />
            )}
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4 text-oxford/50 dark:text-white/50" />
            <div className="flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    locale === lang.code
                      ? "bg-gold text-oxford shadow-sm"
                      : "bg-oxford/5 dark:bg-white/5 text-oxford/60 dark:text-white/60 hover:bg-oxford/10 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="mr-1">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Title Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-oxford via-oxford/95 to-oxford/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold/50 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 py-16 md:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-gold transition-colors mb-8 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("backToHome")}
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center">
              <DocumentTextIcon className="w-7 h-7 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {t("title")}
              </h1>
            </div>
          </div>
          <p className="text-lg text-white/60 max-w-2xl">
            {t("subtitle")}
          </p>
          <p className="text-sm text-white/40 mt-4">
            {t("lastUpdated")}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <main className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Table of Contents */}
          <nav className="mb-12 p-6 rounded-2xl bg-white dark:bg-white/5 border border-oxford/5 dark:border-white/5 shadow-sm">
            <h2 className="text-sm font-semibold text-oxford dark:text-white uppercase tracking-wider mb-4">
              {t("tableOfContents")}
            </h2>
            <ol className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <li key={num}>
                  <a
                    href={`#section-${num}`}
                    className="text-sm text-oxford/60 dark:text-white/60 hover:text-gold transition-colors flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-gold/10 text-gold text-xs font-bold flex items-center justify-center shrink-0">
                      {num}
                    </span>
                    {t(`sections.s${num}.title`)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-10">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <section
                key={num}
                id={`section-${num}`}
                className="scroll-mt-24 p-6 md:p-8 rounded-2xl bg-white dark:bg-white/5 border border-oxford/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light text-oxford text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {num}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-oxford dark:text-white">
                    {t(`sections.s${num}.title`)}
                  </h2>
                </div>
                <div className="ml-14 text-oxford/70 dark:text-white/70 leading-relaxed whitespace-pre-line text-sm md:text-base">
                  {t(`sections.s${num}.content`)}
                </div>
              </section>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
            <h2 className="text-xl font-bold text-oxford dark:text-white mb-3">
              {t("contact.title")}
            </h2>
            <p className="text-oxford/70 dark:text-white/70 mb-4 text-sm">
              {t("contact.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:contact@ooskills.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-oxford font-medium rounded-xl hover:bg-gold-light transition-colors text-sm"
              >
                {t("contact.emailButton")}
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-oxford/5 dark:bg-white/5 text-oxford dark:text-white font-medium rounded-xl hover:bg-oxford/10 dark:hover:bg-white/10 transition-colors text-sm"
              >
                {t("backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-oxford/5 dark:border-white/5 py-6">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <p className="text-xs text-oxford/40 dark:text-white/40">
            © 2026 OOSkills. {t("allRightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}

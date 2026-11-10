"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslations } from "@/lib/i18n";

// Localized 404 with a way out (it used to be the default English Next.js page).
export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20 flex items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <p className="text-6xl font-bold text-oxford dark:text-white mb-4">404</p>
          <h1 className="text-2xl font-bold text-oxford dark:text-white mb-3">{t("title")}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">{t("description")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold text-oxford font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              {t("home")}
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-6 py-3 border border-oxford/20 dark:border-white/20 text-oxford dark:text-white font-medium rounded-lg hover:bg-oxford/5 dark:hover:bg-white/5 transition-colors"
            >
              {t("catalog")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

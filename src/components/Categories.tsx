"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n, useTranslations } from "@/lib/i18n";
import { getCategoryIcon } from "@/lib/categoryIcons";
import publicCoursesApi, { type PublicCategory } from "@/services/publicCoursesApi";

/**
 * Home-page categories, read from the API (audit FN-21: twelve categories used
 * to be hard-coded while the catalogue had none). Each one opens the catalogue
 * filtered on it. With no category yet, the section is not shown at all.
 */
export default function Categories() {
  const t = useTranslations("categories");
  const { locale } = useI18n();
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    let cancelled = false;
    publicCoursesApi
      .listCategories()
      .then(({ results }) => {
        if (!cancelled) setCategories(results);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (categories.length === 0) return null;

  const nameOf = (c: PublicCategory) => {
    const names = c.name as unknown as Record<string, string> | string;
    if (typeof names === "string") return names;
    return names[locale] || names.fr || names.en || Object.values(names)[0] || c.slug;
  };

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-oxford dark:text-white mb-3">
            {t("title")}
          </h2>
          <p className="text-silver dark:text-gray-300 text-sm md:text-base">
            {t("subtitle")}
          </p>
        </motion.div>

        <ul className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <li key={category.id}>
                <Link
                  href={`/courses?category=${encodeURIComponent(category.slug)}`}
                  className="group flex items-center gap-3 px-6 py-4 bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 transition-all duration-300"
                >
                  <span className="w-10 h-10 bg-gold/10 dark:bg-gold/20 rounded-lg flex items-center justify-center group-hover:bg-gold transition-colors duration-300">
                    <Icon className="w-5 h-5 text-gold group-hover:text-oxford" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium text-oxford dark:text-white whitespace-nowrap">
                    {nameOf(category)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

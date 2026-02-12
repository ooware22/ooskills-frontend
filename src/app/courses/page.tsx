"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslations } from "@/lib/i18n";
import { allCourses, categoryList, formatStudents } from "@/data/courses";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function CoursesPage() {
  const t = useTranslations("coursesPage");
  const tc = useTranslations("categories");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner": return t("beginner");
      case "intermediate": return t("intermediate");
      case "advanced": return t("advanced");
      default: return level;
    }
  };

  // Count courses per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCourses.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let courses = [...allCourses];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter((c) => c.title.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategory) {
      courses = courses.filter((c) => c.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== "all") {
      courses = courses.filter((c) => c.level === selectedLevel);
    }

    // Sorting
    switch (sortBy) {
      case "popular":
        courses.sort((a, b) => b.students - a.students);
        break;
      case "newest":
        courses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "highestRated":
        courses.sort((a, b) => b.rating - a.rating);
        break;
    }

    return courses;
  }, [search, selectedCategory, selectedLevel, sortBy]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-oxford via-oxford-light to-oxford dark:from-oxford dark:via-oxford-light/50 dark:to-oxford py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
                {t("subtitle")}
              </p>

              {/* Search Bar in Hero */}
              <div className="max-w-xl mx-auto relative">
                <MagnifyingGlassIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 z-10" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all text-base"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 text-oxford dark:text-white font-medium text-sm"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              {t("allCategories")}
              {selectedCategory && (
                <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs">1</span>
              )}
            </button>

            {/* Sidebar — Categories */}
            <aside
              className={`lg:w-72 flex-shrink-0 ${
                mobileFiltersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-200 dark:border-white/10 p-5 sticky top-24">
                <h3 className="text-sm font-semibold text-oxford dark:text-white uppercase tracking-wider mb-4">
                  {t("allCategories")}
                </h3>

                {/* All Categories */}
                <button
                  onClick={() => { setSelectedCategory(null); setMobileFiltersOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                    !selectedCategory
                      ? "bg-gold/10 text-gold dark:bg-gold/15"
                      : "text-silver hover:text-oxford dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{t("allCategories")}</span>
                  <span className="text-xs opacity-60">{allCourses.length}</span>
                </button>

                <div className="space-y-0.5">
                  {categoryList.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.key;
                    return (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(isActive ? null : cat.key);
                          setMobileFiltersOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gold/10 text-gold dark:bg-gold/15"
                            : "text-silver hover:text-oxford dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : ""}`} />
                        <span className="flex-1 text-start">{tc(`items.${cat.key}`)}</span>
                        <span className="text-xs opacity-60">{categoryCounts[cat.key] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm text-silver dark:text-gray-400">
                  <span className="font-semibold text-oxford dark:text-white">{filteredCourses.length}</span>{" "}
                  {t("coursesFound")}
                </p>

                <div className="flex items-center gap-3">
                  {/* Level Filter */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                  >
                    <option value="all">{t("allLevels")}</option>
                    <option value="beginner">{t("beginner")}</option>
                    <option value="intermediate">{t("intermediate")}</option>
                    <option value="advanced">{t("advanced")}</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center' }}
                  >
                    <option value="popular">{t("popular")}</option>
                    <option value="newest">{t("newest")}</option>
                    <option value="highestRated">{t("highestRated")}</option>
                  </select>
                </div>
              </div>

              {/* Course Grid */}
              <AnimatePresence mode="wait">
                {filteredCourses.length > 0 ? (
                  <motion.div
                    key={`${selectedCategory}-${selectedLevel}-${sortBy}-${search}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {filteredCourses.map((course, index) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="block"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.04 }}
                          className="group h-full bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-gray-100 dark:bg-oxford relative overflow-hidden">
                            <Image
                              src={course.image}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Category */}
                            <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                              {tc(`items.${course.category}`)}
                            </div>

                            <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                              {course.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-silver mb-4">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span>{course.duration} {t("hours")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ChartBarIcon className="w-3.5 h-3.5" />
                                <span>{levelLabel(course.level)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 group-hover:border-gold/20 transition-colors duration-300">
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3.5 h-3.5 fill-gold text-gold" />
                                <span className="text-xs font-medium text-oxford dark:text-white">
                                  {course.rating}
                                </span>
                                <span className="text-xs text-silver">({course.reviews})</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-silver">
                                <UserGroupIcon className="w-3.5 h-3.5" />
                                <span>{formatStudents(course.students)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20"
                  >
                    <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-oxford dark:text-white mb-2">
                      {t("noCourses")}
                    </h3>
                    <p className="text-silver dark:text-gray-400 text-sm">
                      {t("tryDifferent")}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslations, useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPublicCourses,
  fetchPublicCategories,
} from "@/store/slices/publicCoursesSlice";
import type { CourseFilterParams } from "@/services/publicCoursesApi";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  AcademicCapIcon,
  BeakerIcon,
  LanguageIcon,
  ComputerDesktopIcon,
  BriefcaseIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  HeartIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";

/** Map backend icon name → Heroicon component */
const CATEGORY_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  academic: AcademicCapIcon,
  star: StarIcon,
  science: BeakerIcon,
  language: LanguageIcon,
  computer: ComputerDesktopIcon,
  business: BriefcaseIcon,
  music: MusicalNoteIcon,
  art: PaintBrushIcon,
  health: HeartIcon,
  default: CubeIcon,
};

/** Format large student counts as e.g. "2.4k" */
function formatStudents(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

export default function CoursesPage() {
  const t = useTranslations("coursesPage");
  const { locale } = useI18n();
  const dispatch = useAppDispatch();

  const {
    courses,
    categories,
    loading,
    categoriesLoading,
  } = useAppSelector((s) => s.publicCourses);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch all courses + categories once on mount
  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicCourses(undefined));
  }, [dispatch]);

  // Client-side filter + sort
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Level
    if (selectedLevel !== "all") {
      result = result.filter((c) => c.level === selectedLevel);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.students - a.students);
        break;
      case "newest":
        result.sort((a, b) => {
          const da = a.date ? new Date(a.date).getTime() : 0;
          const db = b.date ? new Date(b.date).getTime() : 0;
          return db - da;
        });
        break;
      case "highestRated":
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
    }

    return result;
  }, [courses, search, selectedCategory, selectedLevel, sortBy]);

  // Search handler — instant since filtering is local
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return t("beginner");
      case "intermediate":
        return t("intermediate");
      case "advanced":
        return t("advanced");
      default:
        return level;
    }
  };

  /** Get localised category name from the API‑returned i18n object */
  const getCategoryName = (name: Record<string, string> | string) => {
    if (typeof name === "string") return name;
    return name[locale] || name.en || name.fr || Object.values(name)[0] || "";
  };

  /** Resolve category slug → localised label (from fetched categories list) */
  const categoryLabel = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return slug;
    return getCategoryName(cat.name as unknown as Record<string, string>);
  };

  /** Get an icon component for a category's icon name */
  const getCategoryIcon = (iconName: string) => {
    return CATEGORY_ICONS[iconName] || CATEGORY_ICONS.default;
  };

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
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all text-base"
                />
                {search && (
                  <button
                    onClick={() => handleSearchChange("")}
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

                {/* All Categories button */}
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setMobileFiltersOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
                    !selectedCategory
                      ? "bg-gold/10 text-gold dark:bg-gold/15"
                      : "text-silver hover:text-oxford dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{t("allCategories")}</span>
                  <span className="text-xs opacity-60">{courses.length}</span>
                </button>

                {categoriesLoading ? (
                  <div className="space-y-2 mt-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.slug;
                      const label = getCategoryName(cat.name as unknown as Record<string, string>);
                      const IconComp = cat.icon ? getCategoryIcon(cat.icon) : null;
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => {
                            setSelectedCategory(isActive ? null : cat.slug);
                            setMobileFiltersOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-gold/10 text-gold dark:bg-gold/15"
                              : "text-silver hover:text-oxford dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        >
                          {IconComp && (
                            <IconComp className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-start">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Top Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm text-silver dark:text-gray-400">
                  <span className="font-semibold text-oxford dark:text-white">
                    {filteredCourses.length}
                  </span>{" "}
                  {t("coursesFound")}
                </p>

                <div className="flex items-center gap-3">
                  {/* Level Filter */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer pr-8"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                    }}
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
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.5rem center",
                    }}
                  >
                    <option value="popular">{t("popular")}</option>
                    <option value="newest">{t("newest")}</option>
                    <option value="highestRated">{t("highestRated")}</option>
                  </select>
                </div>
              </div>

              {/* Course Grid */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-pulse"
                      >
                        <div className="aspect-video bg-gray-200 dark:bg-white/5" />
                        <div className="p-5 space-y-3">
                          <div className="h-5 w-20 bg-gray-200 dark:bg-white/5 rounded-full" />
                          <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/5 rounded" />
                          <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/5 rounded" />
                          <div className="h-px bg-gray-100 dark:bg-white/5" />
                          <div className="h-4 w-full bg-gray-200 dark:bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : filteredCourses.length > 0 ? (
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
                        href={`/courses/${course.slug}`}
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
                            {course.image ? (
                              <Image
                                src={course.image}
                                alt={course.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-oxford/60 to-oxford flex items-center justify-center">
                                <AcademicCapIcon className="w-12 h-12 text-gold/40" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Content */}
                          <div className="p-5">
                            {/* Category */}
                            <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                              {categoryLabel(course.category)}
                            </div>

                            <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                              {course.title}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-silver mb-4">
                              <div className="flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span>
                                  {course.duration} {t("hours")}
                                </span>
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
                                <span className="text-xs text-silver">
                                  ({course.reviews})
                                </span>
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

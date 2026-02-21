"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslations, useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPublicCourses,
  fetchPublicCategories,
} from "@/store/slices/publicCoursesSlice";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";
import {
  MagnifyingGlassIcon,
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

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    if (selectedCategory) {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (selectedLevel !== "all") {
      result = result.filter((c) => c.level === selectedLevel);
    }

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

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const levelLabel = (level: string) => {
    switch (level) {
      case "initialisation":
        return t("initialisation");
      case "approfondissement":
        return t("approfondissement");
      case "advanced":
        return t("advanced");
      default:
        return level;
    }
  };

  const getCategoryName = (name: Record<string, string> | string) => {
    if (typeof name === "string") return name;
    return name[locale] || name.en || name.fr || Object.values(name)[0] || "";
  };

  const categoryLabel = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) return slug;
    return getCategoryName(cat.name as unknown as Record<string, string>);
  };

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
                    <option value="initialisation">{t("initialisation")}</option>
                    <option value="approfondissement">{t("approfondissement")}</option>
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
                      <CourseCardSkeleton key={i} />
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
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        badgeText={categoryLabel(course.category)}
                        levelLabel={levelLabel(course.level)}
                        hoursLabel={` ${t("hours")}`}
                      />
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


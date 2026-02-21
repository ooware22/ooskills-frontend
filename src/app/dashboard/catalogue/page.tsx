"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusIcon,
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
import { useTranslations, useI18n } from "@/lib/i18n";
import StudentHeader from "@/components/student/StudentHeader";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchMyEnrollments } from "@/store/slices/enrollmentSlice";
import {
  fetchPublicCourses,
  fetchPublicCategories,
} from "@/store/slices/publicCoursesSlice";
import EnrollDialog from "@/components/EnrollDialog";
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

export default function CataloguePage() {
  const t = useTranslations("coursesPage");
  const { locale } = useI18n();
  const dispatch = useAppDispatch();

  // API courses & categories
  const { courses: apiCourses, categories, loading, categoriesLoading } = useAppSelector(
    (s) => s.publicCourses,
  );

  // Enrollments
  const enrollments = useAppSelector((state) => state.enrollment.enrollments);
  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_slug)),
    [enrollments],
  );

  // Fetch courses + categories + enrollments on mount
  useEffect(() => {
    dispatch(fetchPublicCourses(undefined));
    dispatch(fetchPublicCategories());
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  // Enroll dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCourse, setDialogCourse] = useState<{
    id: string;
    title: string;
    price: number;
    originalPrice: number;
  } | null>(null);

  const openEnrollDialog = (
    e: React.MouseEvent,
    course: { id: string | number; title: string; price: number; originalPrice: number },
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDialogCourse({
      id: String(course.id),
      title: course.title,
      price: course.price,
      originalPrice: course.originalPrice,
    });
    setDialogOpen(true);
  };

  // Local filter / sort state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Helpers
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

  // Client-side filter + sort
  const filteredCourses = useMemo(() => {
    let courses = [...apiCourses];

    if (search.trim()) {
      const q = search.toLowerCase();
      courses = courses.filter((c) => c.title.toLowerCase().includes(q));
    }

    if (selectedCategory) {
      courses = courses.filter((c) => c.category === selectedCategory);
    }

    if (selectedLevel !== "all") {
      courses = courses.filter((c) => c.level === selectedLevel);
    }

    switch (sortBy) {
      case "popular":
        courses.sort((a, b) => b.students - a.students);
        break;
      case "newest":
        courses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        break;
      case "highestRated":
        courses.sort(
          (a, b) => parseFloat(b.rating) - parseFloat(a.rating),
        );
        break;
    }

    return courses;
  }, [apiCourses, search, selectedCategory, selectedLevel, sortBy]);

  return (
    <div className="min-h-screen">
      <StudentHeader
        titleKey="student.catalogue.title"
        subtitleKey="student.catalogue.subtitle"
      />

      <div className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <MagnifyingGlassIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-silver dark:text-white/40 z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full ps-12 pe-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-oxford dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 text-oxford dark:text-white font-medium text-sm"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {t("allCategories")}
            {selectedCategory && (
              <span className="px-2 py-0.5 bg-gold/10 text-gold rounded-full text-xs">
                1
              </span>
            )}
          </button>

          {/* Sidebar — Categories (from API) */}
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
                <span className="text-xs opacity-60">{apiCourses.length}</span>
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
                          <IconComp className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : ""}`} />
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
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <motion.div
                  key={`${selectedCategory}-${selectedLevel}-${sortBy}-${search}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {filteredCourses.map((course, index) => {
                    const isEnrolled = enrolledIds.has(course.slug);
                    return (
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        badgeText={categoryLabel(course.category)}
                        levelLabel={levelLabel(course.level)}
                        hoursLabel={` ${t("hours")}`}
                        overlayBadge={
                          isEnrolled ? (
                            <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {t("enrolled")}
                            </span>
                          ) : undefined
                        }
                        footer={
                          isEnrolled ? (
                            <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              {t("enrolled")}
                            </span>
                          ) : (
                            <button
                              onClick={(e) => openEnrollDialog(e, course)}
                              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-gold text-oxford hover:bg-gold-light transition-colors duration-200"
                            >
                              <PlusIcon className="w-4 h-4" />
                              {t("enrollNow")}
                            </button>
                          )
                        }
                      />
                    );
                  })}
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

      {/* Enroll Dialog */}
      {dialogCourse && (
        <EnrollDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          courseId={dialogCourse.id}
          courseTitle={dialogCourse.title}
          coursePrice={dialogCourse.price}
          courseOriginalPrice={dialogCourse.originalPrice}
        />
      )}
    </div>
  );
}


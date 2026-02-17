"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  CheckCircleIcon,
  PlusIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useTranslations, useI18n } from "@/lib/i18n";
import { categoryList } from "@/data/courses";
import StudentHeader from "@/components/student/StudentHeader";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { enrollInCourse, fetchMyEnrollments } from "@/store/slices/enrollmentSlice";
import {
  fetchPublicCourses,
  fetchPublicCategories,
} from "@/store/slices/publicCoursesSlice";
import EnrollDialog from "@/components/EnrollDialog";

/** Format large student counts */
function formatStudents(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

export default function CataloguePage() {
  const t = useTranslations("coursesPage");
  const tc = useTranslations("categories");
  const dispatch = useAppDispatch();

  // API courses
  const { courses: apiCourses, categories: apiCategories, loading } = useAppSelector(
    (s) => s.publicCourses,
  );

  // Enrollments
  const enrollments = useAppSelector((state) => state.enrollment.enrollments);
  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_slug)),
    [enrollments],
  );

  // Fetch courses + enrollments on mount
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

  // Category counts from API courses
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    apiCourses.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [apiCourses]);

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
                <span className="text-xs opacity-60">{apiCourses.length}</span>
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
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-gold" : ""}`}
                      />
                      <span className="flex-1 text-start">
                        {tc(`items.${cat.key}`)}
                      </span>
                      <span className="text-xs opacity-60">
                        {categoryCounts[cat.key] || 0}
                      </span>
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
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        <div className="h-10 w-full bg-gray-200 dark:bg-white/5 rounded-xl" />
                      </div>
                    </div>
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
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="block"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.04 }}
                          className="group h-full bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
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
                            {/* Enrolled badge */}
                            {isEnrolled && (
                              <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Enrolled
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 self-start group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                              {course.level}
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

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 group-hover:border-gold/20 transition-colors duration-300 mb-4">
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-3.5 h-3.5 fill-gold text-gold" />
                                <span className="text-xs font-medium text-oxford dark:text-white">
                                  {parseFloat(course.rating).toFixed(1)}
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

                            {/* Enroll Button */}
                            <div className="mt-auto">
                              {isEnrolled ? (
                                <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                  <CheckCircleIcon className="w-4 h-4" />
                                  Enrolled
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => openEnrollDialog(e, course)}
                                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-gold text-oxford hover:bg-gold-light transition-colors duration-200"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                  Enroll Now
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </Link>
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

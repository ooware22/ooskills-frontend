"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnrollDialog from "@/components/EnrollDialog";
import GiftDialog from "@/components/GiftDialog";
import CourseRatingSection from "@/components/CourseRatingSection";
import { useTranslations, useI18n } from "@/lib/i18n";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCourseDetail,
  clearCourseDetail,
} from "@/store/slices/publicCoursesSlice";
import { fetchMyEnrollments } from "@/store/slices/enrollmentSlice";
import {
  ArrowLeftIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  PlayCircleIcon,
  HeartIcon,
  ShieldCheckIcon,
  GiftIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpeakerWaveIcon,
  PresentationChartBarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

/** Format large student counts as e.g. "2.4k" */
function formatStudents(n: number) {
  return n >= 1000
    ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k"
    : String(n);
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = use(params);
  const router = useRouter();
  const t = useTranslations("courseDetail");
  const tp = useTranslations("coursesPage");
  const { locale } = useI18n();
  const dispatch = useAppDispatch();

  const {
    courseDetail: course,
    courseDetailLoading,
    courseDetailError,
  } = useAppSelector((s) => s.publicCourses);

  const { enrollments } = useAppSelector((s) => s.enrollment);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [guestAuthPromptOpen, setGuestAuthPromptOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number>(0);

  // Check if user is enrolled in this course (compare by slug)
  const enrolled = enrollments.some((e) => e.course_slug === slug);

  useEffect(() => {
    dispatch(fetchCourseDetail(slug));
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
      setGuestAuthPromptOpen(false);
    }
    return () => {
      dispatch(clearCourseDetail());
    };
  }, [dispatch, slug, isAuthenticated]);

  const handleEnroll = useCallback(() => {
    if (!isAuthenticated) {
      setGuestAuthPromptOpen(true);
      return;
    }
    setDialogOpen(true);
  }, [isAuthenticated]);

  const handleStart = useCallback(() => {
    router.push(`/courses/${slug}/learn`);
  }, [slug, router]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return tp("beginner");
      case "intermediate":
        return tp("intermediate");
      case "advanced":
        return tp("advanced");
      default:
        return level;
    }
  };

  const levelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10";
      case "intermediate":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10";
      case "advanced":
        return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10";
      default:
        return "";
    }
  };

  /** Get localised category name */
  const categoryLabel = (categorySlug: string) => {
    return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (courseDetailLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20">
          <section className="bg-gradient-to-br from-oxford via-oxford-light to-oxford py-12 lg:py-16">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-32 bg-white/10 rounded" />
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                  <div className="flex-1 space-y-4">
                    <div className="h-8 w-48 bg-white/10 rounded" />
                    <div className="h-10 w-3/4 bg-white/10 rounded" />
                    <div className="h-20 bg-white/10 rounded" />
                    <div className="flex gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-5 w-20 bg-white/10 rounded" />
                      ))}
                    </div>
                  </div>
                  <div className="lg:w-[480px] aspect-video bg-white/10 rounded-2xl" />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────
  if (!course || courseDetailError) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center px-4"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <AcademicCapIcon className="w-12 h-12 text-gray-400 dark:text-white/20" />
            </div>
            <h1 className="text-2xl font-bold text-oxford dark:text-white mb-3">
              {t("courseNotFound")}
            </h1>
            <p className="text-silver dark:text-gray-400 mb-6 max-w-md">
              {t("courseNotFoundDesc")}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-oxford font-medium rounded-xl hover:bg-gold/90 transition-colors"
            >
              {t("browseCourses")}
            </Link>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Course data ready ─────────────────────────────────────────────────
  const discount = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100,
  );

  const totalLessons =
    course.sections?.reduce((total: number, section: any) => {
      return (
        total +
        (section.modules_list || []).reduce(
          (s: number, m: any) => s + (m.lessons || 0),
          0,
        )
      );
    }, 0) || 0;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-oxford via-oxford-light to-oxford py-12 lg:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 rtl:rotate-180" />
                {t("backToCourses")}
              </Link>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left — Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gold/15 text-gold text-xs font-medium rounded-full">
                      {categoryLabel(course.category)}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${levelColor(course.level)}`}
                    >
                      {levelLabel(course.level)}
                    </span>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                    {course.title}
                  </h1>

                  <p className="text-white/50 text-base lg:text-lg mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
                    <div className="flex items-center gap-1.5">
                      <StarIcon className="w-4 h-4 text-gold" />
                      <span className="text-white font-semibold">
                        {course.rating}
                      </span>
                      <span>
                        ({course.reviews} {t("reviews")})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>
                        {formatStudents(course.students)} {t("students")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {course.duration} {t("hours")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChartBarIcon className="w-4 h-4" />
                      <span>{levelLabel(course.level)}</span>
                    </div>
                  </div>
                </div>

                {/* Right — Image */}
                <div className="lg:w-[480px] flex-shrink-0">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-oxford/60 to-oxford flex items-center justify-center">
                        <AcademicCapIcon className="w-16 h-16 text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                        <PlayCircleIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column – Main Content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 p-6 lg:p-8"
              >
                <h2 className="text-xl font-bold text-oxford dark:text-white mb-5 flex items-center gap-2">
                  <CheckCircleIcon className="w-6 h-6 text-gold" />
                  {t("whatYouLearn")}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm text-silver dark:text-gray-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Prerequisites */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 p-6 lg:p-8"
              >
                <h2 className="text-xl font-bold text-oxford dark:text-white mb-5 flex items-center gap-2">
                  <ShieldCheckIcon className="w-6 h-6 text-gold" />
                  {t("prerequisites")}
                </h2>
                <ul className="space-y-2.5">
                  {course.prerequisites.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full flex-shrink-0 mt-2" />
                      <span className="text-sm text-silver dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Curriculum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 p-6 lg:p-8"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-oxford dark:text-white flex items-center gap-2">
                    <AcademicCapIcon className="w-6 h-6 text-gold" />
                    {t("curriculum")}
                  </h2>
                  <span className="text-xs text-silver dark:text-gray-400">
                    {course.sections?.length || 0} sections • {totalLessons}{" "}
                    {t("lessons")} • {course.duration} {t("hours")}
                  </span>
                </div>

                <div className="space-y-3">
                  {course.sections?.map((sec: any, i: number) => {
                    const sectionLessons = (sec.modules_list || []).reduce(
                      (s: number, m: any) => s + (m.lessons || 0),
                      0,
                    );
                    const isIntro = sec.type === "INTRO";
                    const isUnlocked = enrolled || isIntro;
                    const isExpanded = expandedSection === i;

                    return (
                      <div
                        key={i}
                        className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5"
                      >
                        {/* Section Header */}
                        <button
                          onClick={() => {
                            if (isUnlocked) {
                              setExpandedSection(isExpanded ? -1 : i);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-4 transition-colors ${
                            isUnlocked
                              ? "bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/8 cursor-pointer"
                              : "bg-gray-50/60 dark:bg-white/[0.02] cursor-default"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isUnlocked
                                  ? "bg-gold/10"
                                  : "bg-gray-200/60 dark:bg-white/5"
                              }`}
                            >
                              {isUnlocked ? (
                                <span className="text-xs font-bold text-gold">
                                  {String(sec.sequence || i + 1).padStart(
                                    2,
                                    "0",
                                  )}
                                </span>
                              ) : (
                                <LockClosedIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                            <div className="text-left min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  isUnlocked
                                    ? "text-oxford dark:text-white"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                {sec.title}
                              </p>
                              <p className="text-xs text-silver dark:text-gray-400">
                                {sec.modules_count || 0} modules •{" "}
                                {sectionLessons} {t("lessons")} • {sec.duration}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isIntro && !enrolled && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md uppercase tracking-wider">
                                {t("freePreview")}
                              </span>
                            )}
                            {isUnlocked ? (
                              isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4 text-silver dark:text-gray-400" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-silver dark:text-gray-400" />
                              )
                            ) : (
                              <LockClosedIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Modules List */}
                        <AnimatePresence initial={false}>
                          {isExpanded &&
                            isUnlocked &&
                            (sec.modules_list || []).length > 0 && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.25,
                                  ease: "easeInOut",
                                }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 space-y-1.5 bg-white dark:bg-oxford-light">
                                  {(sec.modules_list || []).map(
                                    (mod: any, mi: number) => {
                                      const lessonRows: any[] = isIntro
                                        ? mod.lessons_list || []
                                        : [];
                                      return (
                                        <div
                                          key={mi}
                                          className="rounded-lg overflow-hidden"
                                        >
                                          <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50/80 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-2.5">
                                              <PlayCircleIcon className="w-4 h-4 text-gold/70 flex-shrink-0" />
                                              <span className="text-sm text-oxford dark:text-gray-200">
                                                {mod.title}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-silver dark:text-gray-500">
                                              {mod.lessons > 0 && (
                                                <span>
                                                  {mod.lessons} {t("lessons")}
                                                </span>
                                              )}
                                              {mod.duration && (
                                                <span className="flex items-center gap-1">
                                                  <ClockIcon className="w-3 h-3" />
                                                  {mod.duration}
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Free-preview lesson resources */}
                                          {lessonRows.length > 0 && (
                                            <div className="px-3 pb-2.5 pt-1.5 space-y-1.5 bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-t border-emerald-100/60 dark:border-emerald-500/10">
                                              {lessonRows.map(
                                                (lesson: any, li: number) => (
                                                  <div
                                                    key={li}
                                                    className="flex flex-wrap items-center justify-between gap-2 py-1"
                                                  >
                                                    <span className="text-xs text-silver dark:text-gray-400 truncate max-w-[55%]">
                                                      {lesson.title}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                      {lesson.audioUrl && (
                                                        <a
                                                          href={lesson.audioUrl}
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold/10 hover:bg-gold/20 text-gold text-[11px] font-medium rounded-md transition-colors"
                                                        >
                                                          <SpeakerWaveIcon className="w-3 h-3" />
                                                          {t("listenAudio")}
                                                        </a>
                                                      )}
                                                      {lesson.diapositiveUrl && (
                                                        <a
                                                          href={
                                                            lesson.diapositiveUrl
                                                          }
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] font-medium rounded-md transition-colors"
                                                        >
                                                          <PresentationChartBarIcon className="w-3 h-3" />
                                                          {t("viewSlides")}
                                                        </a>
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Locked overlay hint for non-first sections */}
                        {!isUnlocked && (
                          <div className="px-4 py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/60 dark:from-white/[0.02] dark:to-white/[0.01] border-t border-gray-100/80 dark:border-white/5">
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                              <LockClosedIcon className="w-3 h-3" />
                              {t("lockedSectionHint")}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Unlock all prompt for non-enrolled users */}
                {!enrolled && (course.sections?.length || 0) > 1 && (
                  <div className="mt-5 p-4 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 dark:from-gold/[0.03] dark:via-gold/[0.06] dark:to-gold/[0.03] rounded-xl border border-gold/20 dark:border-gold/10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <LockClosedIcon className="w-4.5 h-4.5 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-oxford dark:text-white">
                            {t("unlockAllTitle")}
                          </p>
                          <p className="text-xs text-silver dark:text-gray-400 mt-0.5">
                            {t("unlockAllDesc")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleEnroll}
                        className="px-5 py-2.5 bg-gold hover:bg-gold/90 text-oxford font-semibold text-sm rounded-lg transition-colors whitespace-nowrap"
                      >
                        {t("enrollNow")}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Ratings & Reviews */}
              <CourseRatingSection
                slug={slug}
                enrolled={enrolled}
                isAuthenticated={isAuthenticated}
                courseRating={course.rating}
                courseReviews={course.reviews}
              />
            </div>

            {/* Right Column — Sticky Price Card */}
            <div className="lg:w-[360px] flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 p-6 sticky top-24"
              >
                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-bold text-oxford dark:text-white whitespace-nowrap">
                      {course.price === 0
                        ? t("free") || "Free"
                        : `${course.price.toLocaleString()}\u00A0${t("currency")}`}
                    </span>
                    {course.price > 0 && (
                      <span className="text-lg text-silver line-through whitespace-nowrap">
                        {course.originalPrice.toLocaleString()}&nbsp;
                        {t("currency")}
                      </span>
                    )}
                    {course.price > 0 && discount > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md">
                        {discount}% {t("off")}
                      </span>
                    )}
                  </div>
                </div>

                {/* CTA Buttons */}
                {enrolled ? (
                  <>
                    <button
                      onClick={handleStart}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors mb-3 text-sm flex items-center justify-center gap-2"
                    >
                      <PlayCircleIcon className="w-5 h-5" />
                      {t("startNow")}
                    </button>
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span className="font-medium">{t("enrolled")}</span>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full py-3.5 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors mb-3 text-sm"
                  >
                    {t("enrollNow")}
                  </button>
                )}
                <div className="flex gap-2">
                  <button className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    <HeartIcon className="w-4 h-4" />
                    {t("addToWishlist")}
                  </button>
                  {enrolled && course.price > 0 && (
                    <button
                      onClick={() => {
                        if (!isAuthenticated) {
                          router.push(
                            `/auth/signin?returnUrl=${encodeURIComponent(`/courses/${slug}`)}`,
                          );
                          return;
                        }
                        setGiftDialogOpen(true);
                      }}
                      className="py-3.5 px-4 bg-gold/10 hover:bg-gold/20 text-gold font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                      title="Offrir ce cours"
                    >
                      <GiftIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Course Info */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-oxford dark:text-white uppercase tracking-wider">
                    {t("courseInfo")}
                  </h3>

                  {[
                    {
                      icon: ChartBarIcon,
                      label: t("level"),
                      value: levelLabel(course.level),
                    },
                    {
                      icon: ClockIcon,
                      label: t("duration"),
                      value: `${course.duration} ${t("hours")}`,
                    },
                    {
                      icon: PlayCircleIcon,
                      label: t("curriculum"),
                      value: `${totalLessons} ${t("lessons")}`,
                    },
                    {
                      icon: GlobeAltIcon,
                      label: t("language"),
                      value: course.language,
                    },
                    {
                      icon: AcademicCapIcon,
                      label: t("certificate"),
                      value: course.certificate ? t("yes") : t("no"),
                    },
                    {
                      icon: UserGroupIcon,
                      label: t("enrolled"),
                      value: `${formatStudents(course.students)} ${t("students")}`,
                    },
                    {
                      icon: CalendarDaysIcon,
                      label: t("lastUpdated"),
                      value: course.lastUpdated,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-silver dark:text-gray-400">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-oxford dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Guest Auth Prompt */}
      {guestAuthPromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setGuestAuthPromptOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-oxford-light shadow-2xl p-6">
            <button
              onClick={() => setGuestAuthPromptOpen(false)}
              className="absolute top-4 end-4 p-1.5 rounded-lg text-silver hover:text-oxford dark:text-white/40 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-5">
              <h3 className="text-xl font-bold text-oxford dark:text-white mb-2">
                Inscrivez-vous pour rejoindre ce cours
              </h3>
              <p className="text-sm text-silver dark:text-gray-400 leading-relaxed">
                Vous n&apos;êtes pas encore connecté. Créez un compte pour vous
                inscrire, ou connectez-vous si vous avez déjà un compte.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href={`/auth/signup?returnUrl=${encodeURIComponent(`/courses/${slug}`)}`}
                className="flex w-full items-center justify-center rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-oxford transition-colors hover:bg-gold/90"
              >
                Créer un compte
              </Link>
              <Link
                href={`/auth/signin?returnUrl=${encodeURIComponent(`/courses/${slug}`)}`}
                className="flex w-full items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-medium text-oxford dark:text-white transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
              >
                J&apos;ai déjà un compte
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Dialog */}
      {course && (
        <EnrollDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          courseId={String(course.id)}
          courseTitle={course.title}
          coursePrice={course.price}
          courseOriginalPrice={course.originalPrice}
        />
      )}

      {/* Gift Dialog */}
      {course && (
        <GiftDialog
          open={giftDialogOpen}
          onClose={() => setGiftDialogOpen(false)}
          courseId={String(course.id)}
          courseTitle={course.title}
        />
      )}
    </>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useI18n, useTranslations } from "@/lib/i18n";
import StudentHeader from "@/components/student/StudentHeader";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchMyEnrollments,
  fetchMyCertificates,
} from "@/store/slices/enrollmentSlice";
import type { Enrollment, Certificate } from "@/store/slices/enrollmentSlice";

function normalizeImg(src: string | undefined | null): string | null {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/${src}`;
}

type CourseFilter = "all" | "active" | "completed" | "cancelled";

export default function MyCoursesPage() {
  const { t } = useI18n();
  const tp = useTranslations("coursesPage");
  const tc = (key: string) => t(`student.myCourses.${key}`);
  const dispatch = useAppDispatch();

  const { enrollments, enrollmentsLoading, certificates } = useAppSelector(
    (state) => state.enrollment,
  );
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const [filter, setFilter] = useState<CourseFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
      dispatch(fetchMyCertificates());
    }
  }, [dispatch, isAuthenticated]);

  // Map course UUIDs to certificate status
  const certMap = useMemo(() => {
    const map = new Map<string, Certificate>();
    for (const c of certificates) {
      map.set(c.course, c);
    }
    return map;
  }, [certificates]);

  // Filter & search
  const filteredCourses = useMemo(() => {
    return enrollments.filter((e) => {
      const matchesFilter = filter === "all" || e.status === filter;
      const matchesSearch = (e.course_title || "")
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [enrollments, filter, search]);

  const counts = useMemo(
    () => ({
      all: enrollments.length,
      active: enrollments.filter((e) => e.status === "active").length,
      completed: enrollments.filter((e) => e.status === "completed").length,
      cancelled: enrollments.filter((e) => e.status === "cancelled").length,
    }),
    [enrollments],
  );

  const filterOptions: { key: CourseFilter; labelKey: string }[] = [
    { key: "all", labelKey: "all" },
    { key: "active", labelKey: "inProgress" },
    { key: "completed", labelKey: "completed" },
    { key: "cancelled", labelKey: "cancelled" },
  ];

  const statusLabel = (status: string) => {
    switch (status) {
      case "active":
        return tc("inProgress");
      case "completed":
        return tc("completed");
      case "cancelled":
        return tc("cancelled") || "Cancelled";
      default:
        return status;
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (enrollmentsLoading && enrollments.length === 0) {
    return (
      <div className="min-h-screen">
        <StudentHeader
          titleKey="student.myCourses.title"
          subtitleKey="student.myCourses.subtitle"
        />
        <div className="p-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-white/10" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-9 w-full bg-gray-200 dark:bg-white/10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StudentHeader
        titleKey="student.myCourses.title"
        subtitleKey="student.myCourses.subtitle"
      />

      <div className="p-6">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          {/* Filter Tabs */}
          <div
            className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto max-w-full scrollbar-none"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  filter === opt.key
                    ? "bg-white dark:bg-oxford-light text-oxford dark:text-white shadow-sm"
                    : "text-silver dark:text-white/50 hover:text-oxford dark:hover:text-white",
                )}
              >
                <span className="hidden sm:inline">{tc(opt.labelKey)}</span>
                <span className="sm:hidden">
                  {tc(opt.labelKey).split(" ")[0]}
                </span>{" "}
                ({counts[opt.key]})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-silver dark:text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tc("searchPlaceholder")}
              className="w-full ps-9 pe-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-oxford dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-colors"
            />
          </div>
        </motion.div>

        {/* Course Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((enrollment, index) => {
              const progress = parseFloat(enrollment.progress) || 0;
              const hasCert = certMap.has(enrollment.course);

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                  className="group bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 dark:bg-oxford relative overflow-hidden">
                    {normalizeImg(enrollment.course_image) ? (
                      <Image
                        src={normalizeImg(enrollment.course_image)!}
                        alt={enrollment.course_title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gold/20 via-oxford/60 to-oxford flex items-center justify-center">
                        <AcademicCapIcon className="w-12 h-12 text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Status Badge */}
                    <span
                      className={cn(
                        "absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
                        enrollment.status === "completed" &&
                          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                        enrollment.status === "active" &&
                          "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                        enrollment.status === "cancelled" &&
                          "bg-red-500/20 text-red-300 border border-red-500/30",
                      )}
                    >
                      {statusLabel(enrollment.status)}
                    </span>

                    {/* Certificate Badge */}
                    {hasCert && (
                      <span className="absolute top-3 start-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm bg-gold/20 text-gold border border-gold/30 flex items-center gap-1">
                        <TrophyIcon className="w-3 h-3" />
                        {tc("certified") || "Certified"}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                      {enrollment.course_title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-silver mb-4">
                      <span>
                        {tc("enrolledOn") || "Enrolled"}{" "}
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-silver dark:text-white/50">
                          {tc("progress") || "Progress"}
                        </span>
                        <span className="font-semibold text-gold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            enrollment.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-gold",
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/courses/${enrollment.course_slug}/learn`}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        enrollment.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : enrollment.status === "cancelled"
                            ? "bg-gray-100 dark:bg-white/5 text-silver dark:text-white/50 pointer-events-none"
                            : "bg-gold/10 text-gold hover:bg-gold/20",
                      )}
                    >
                      {enrollment.status === "completed" ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          {tc("reviewCourse")}
                        </>
                      ) : enrollment.status === "cancelled" ? (
                        <>
                          <BookOpenIcon className="w-4 h-4" />
                          {tc("cancelled") || "Cancelled"}
                        </>
                      ) : (
                        <>
                          <PlayCircleIcon className="w-4 h-4" />
                          {tc("continueCourse")}
                        </>
                      )}
                    </Link>
                    {/* View Certificate link */}
                    {hasCert && (
                      <Link
                        href="/dashboard/certificates"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium bg-gold/10 text-gold hover:bg-gold/20 transition-all duration-200 mt-2"
                      >
                        <TrophyIcon className="w-3.5 h-3.5" />
                        {tc("viewCertificate") || "View Badge"}
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpenIcon className="w-12 h-12 text-silver/30 dark:text-white/10 mx-auto mb-4" />
            <p className="text-silver dark:text-white/50 mb-4">
              {tc("noCourses")}
            </p>
            {enrollments.length === 0 && (
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-oxford rounded-xl text-sm font-medium hover:bg-gold-light transition-colors"
              >
                {tc("browseCatalog") || "Browse Courses"}
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

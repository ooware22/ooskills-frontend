"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  PlayCircleIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useI18n, useTranslations } from "@/lib/i18n";
import { allCourses, formatStudents, type Course } from "@/data/courses";
import StudentHeader from "@/components/student/StudentHeader";
import { useAppSelector } from "@/store/hooks";

type CourseFilter = "all" | "in-progress" | "completed" | "not-started";

export default function MyCoursesPage() {
  const { t } = useI18n();
  const tp = useTranslations("coursesPage");
  const tc = (key: string) => t(`student.myCourses.${key}`);

  const enrollments = useAppSelector((state) => state.enrollment.enrollments);

  const [filter, setFilter] = useState<CourseFilter>("all");
  const [search, setSearch] = useState("");

  // Join enrollment data with course data
  const enrolledCourses = useMemo(() => {
    return enrollments
      .map((enrollment) => {
        const course = allCourses.find((c) => c.id === enrollment.courseId);
        if (!course) return null;
        return { ...course, enrollment };
      })
      .filter(Boolean) as (Course & { enrollment: (typeof enrollments)[0] })[];
  }, [enrollments]);

  const filteredCourses = useMemo(() => {
    return enrolledCourses.filter((course) => {
      const matchesFilter = filter === "all" || course.enrollment.status === filter;
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [enrolledCourses, filter, search]);

  const counts = useMemo(() => ({
    all: enrolledCourses.length,
    "in-progress": enrolledCourses.filter(c => c.enrollment.status === "in-progress").length,
    completed: enrolledCourses.filter(c => c.enrollment.status === "completed").length,
    "not-started": enrolledCourses.filter(c => c.enrollment.status === "not-started").length,
  }), [enrolledCourses]);

  const filterOptions: { key: CourseFilter; labelKey: string }[] = [
    { key: "all", labelKey: "all" },
    { key: "in-progress", labelKey: "inProgress" },
    { key: "completed", labelKey: "completed" },
    { key: "not-started", labelKey: "notStarted" },
  ];

  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner": return tp("beginner");
      case "intermediate": return tp("intermediate");
      case "advanced": return tp("advanced");
      default: return level;
    }
  };

  const totalLessons = (course: Course) => {
    return course.modules.reduce((sum, m) => sum + m.lessons, 0);
  };

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
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1 overflow-x-auto max-w-full scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  filter === opt.key
                    ? "bg-white dark:bg-oxford-light text-oxford dark:text-white shadow-sm"
                    : "text-silver dark:text-white/50 hover:text-oxford dark:hover:text-white"
                )}
              >
                <span className="hidden sm:inline">{tc(opt.labelKey)}</span>
                <span className="sm:hidden">{tc(opt.labelKey).split(' ')[0]}</span>
                {' '}({counts[opt.key]})
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
            {filteredCourses.map((course, index) => {
              const total = totalLessons(course);
              const enrollment = course.enrollment;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                  className="group bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/5 hover:-translate-y-1 transition-all duration-300"
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
                    {/* Status Badge */}
                    <span className={cn(
                      "absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
                      enrollment.status === "completed" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
                      enrollment.status === "in-progress" && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                      enrollment.status === "not-started" && "bg-white/20 text-white/70 border border-white/20",
                    )}>
                      {tc(enrollment.status === "in-progress" ? "inProgress" : enrollment.status === "completed" ? "completed" : "notStarted")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-silver mb-4">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{course.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ChartBarIcon className="w-3.5 h-3.5" />
                        <span>{levelLabel(course.level)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 fill-gold text-gold" />
                        <span className="text-oxford dark:text-white font-medium">{course.rating}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-silver dark:text-white/50">
                          {enrollment.completedLessons}/{total} {tc("lessonsCompleted")}
                        </span>
                        <span className="font-semibold text-gold">{enrollment.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            enrollment.status === "completed" ? "bg-emerald-500" : "bg-gold"
                          )}
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/courses/${course.id}/learn`}
                      className={cn(
                        "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                        enrollment.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : enrollment.status === "not-started"
                          ? "bg-gold text-oxford hover:bg-gold-light"
                          : "bg-gold/10 text-gold hover:bg-gold/20"
                      )}
                    >
                      {enrollment.status === "completed" ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          {tc("reviewCourse")}
                        </>
                      ) : enrollment.status === "not-started" ? (
                        <>
                          <PlayCircleIcon className="w-4 h-4" />
                          {tc("startCourse")}
                        </>
                      ) : (
                        <>
                          <PlayCircleIcon className="w-4 h-4" />
                          {tc("continueCourse")}
                        </>
                      )}
                    </Link>
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
            <p className="text-silver dark:text-white/50 mb-4">{tc("noCourses")}</p>
            {enrolledCourses.length === 0 && (
              <Link
                href="/dashboard/catalogue"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-oxford rounded-xl text-sm font-medium hover:bg-gold-light transition-colors"
              >
                Browse Catalogue
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

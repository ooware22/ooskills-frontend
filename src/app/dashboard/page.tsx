"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  PlayCircleIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import Image from "next/image";
import StudentHeader from "@/components/student/StudentHeader";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMyEnrollments,
  fetchMyQuizAttempts,
  fetchMyCertificates,
} from "@/store/slices/enrollmentSlice";

/** Ensure image src starts with / or is an absolute URL */
function normalizeImg(src: string | undefined | null): string | null {
  if (!src) return null;
  if (src.startsWith("http") || src.startsWith("/")) return src;
  return `/${src}`;
}

export default function StudentDashboard() {
  const { t } = useI18n();
  const td = (key: string) => t(`student.dashboard.${key}`);
  const dispatch = useAppDispatch();

  const {
    enrollments,
    enrollmentsLoading,
    quizAttempts,
    certificates,
  } = useAppSelector((s) => s.enrollment);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyEnrollments());
      dispatch(fetchMyQuizAttempts());
      dispatch(fetchMyCertificates());
    }
  }, [dispatch, isAuthenticated]);

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((e) => e.status === "active").length;
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const totalXp = quizAttempts.reduce((sum, q) => sum + (q.xp_earned || 0), 0);
    return [
      {
        labelKey: "enrolledCourses",
        value: String(total),
        icon: BookOpenIcon,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        labelKey: "completedCourses",
        value: String(completed),
        icon: CheckCircleIcon,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        labelKey: "inProgress",
        value: String(active),
        icon: ClockIcon,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        labelKey: "totalXp",
        value: totalXp.toLocaleString(),
        icon: SparklesIcon,
        color: "text-gold",
        bg: "bg-gold/10",
      },
    ];
  }, [enrollments, quizAttempts]);

  // ── Continue learning — active enrollments ─────────────────────────────
  const continueLearning = useMemo(
    () =>
      enrollments
        .filter((e) => e.status === "active")
        .sort(
          (a, b) =>
            new Date(b.enrolled_at).getTime() -
            new Date(a.enrolled_at).getTime(),
        )
        .slice(0, 4),
    [enrollments],
  );

  // ── Recent activity from quiz attempts (sorted newest first) ──────────
  const recentActivity = useMemo(() => {
    const items: {
      type: "quiz" | "certificate";
      text: string;
      course: string;
      time: string;
    }[] = [];

    for (const q of quizAttempts.slice(0, 10)) {
      items.push({
        type: "quiz",
        text: `${q.passed ? "Passed" : "Attempted"} Quiz (${q.score}%)`,
        course: "",
        time: new Date(q.submitted_at).toLocaleDateString(),
      });
    }

    for (const c of certificates.slice(0, 5)) {
      items.push({
        type: "certificate",
        text: `Certificate earned: ${c.course_title}`,
        course: c.course_title,
        time: new Date(c.issuedAt).toLocaleDateString(),
      });
    }

    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8);
  }, [quizAttempts, certificates]);

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (enrollmentsLoading && enrollments.length === 0) {
    return (
      <div className="min-h-screen">
        <StudentHeader
          titleKey="student.dashboard.welcomeBack"
          subtitleKey="student.dashboard.subtitle"
        />
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-lg mb-3" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-white/10 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded" />
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
        titleKey="student.dashboard.welcomeBack"
        subtitleKey="student.dashboard.subtitle"
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-oxford dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-silver dark:text-white/50 mt-0.5">
                {td(stat.labelKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Continue Learning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 mb-8"
        >
          <div className="p-5 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-oxford dark:text-white">
                {td("continueLearning")}
              </h2>
              <p className="text-xs text-silver dark:text-white/50 mt-0.5">
                {td("pickUpWhere")}
              </p>
            </div>
            <Link
              href="/dashboard/my-courses"
              className="text-sm text-gold hover:text-gold-light transition-colors flex items-center gap-1"
            >
              {td("viewAll")}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {continueLearning.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpenIcon className="w-10 h-10 text-silver/40 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">
                {td("noCoursesYet") || "No courses yet. Start learning!"}
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-light mt-3"
              >
                {td("browseCatalog") || "Browse catalog"}
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {continueLearning.map((enrollment, index) => {
                const progress = parseFloat(enrollment.progress) || 0;
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                        {normalizeImg(enrollment.course_image) ? (
                          <Image
                            src={normalizeImg(enrollment.course_image)!}
                            alt={enrollment.course_title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                            <BookOpenIcon className="w-6 h-6 text-gold/60" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-oxford dark:text-white text-sm truncate">
                          {enrollment.course_title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gold">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/courses/${enrollment.course_slug}/learn`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gold/10 hover:bg-gold/20 rounded-lg"
                      >
                        <PlayCircleIcon className="w-5 h-5 text-gold" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10"
        >
          <div className="p-5 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-oxford dark:text-white">
              {td("recentActivity")}
            </h2>
            <p className="text-xs text-silver dark:text-white/50 mt-0.5">
              {td("recentActivityDesc")}
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-10 h-10 text-silver/40 mx-auto mb-3" />
              <p className="text-sm text-silver dark:text-white/50">
                {td("noActivity") || "No recent activity"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.04 }}
                  className="px-5 py-3.5 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      activity.type === "quiz"
                        ? "bg-emerald-500/10"
                        : "bg-gold/10"
                    }`}
                  >
                    {activity.type === "quiz" ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrophyIcon className="w-4 h-4 text-gold" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-oxford dark:text-white">
                      {activity.text}
                    </p>
                    <p className="text-xs text-silver dark:text-white/40 mt-0.5">
                      {activity.course ? `${activity.course} · ` : ""}
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEnrollment } from "@/hooks/useEnrollment";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslations } from "@/lib/i18n";
import { getCourseById, formatStudents, categoryList } from "@/data/courses";
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
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("courseDetail");
  const tc = useTranslations("categories");
  const tp = useTranslations("coursesPage");
  const { isEnrolled, enroll } = useEnrollment();

  const courseId = Number(id);
  const course = getCourseById(courseId);
  const enrolled = isEnrolled(courseId);
  const [enrolling, setEnrolling] = useState(false);

  const handleEnroll = useCallback(() => {
    setEnrolling(true);
    enroll(courseId);
    setTimeout(() => setEnrolling(false), 600);
  }, [courseId, enroll]);

  const handleStart = useCallback(() => {
    router.push(`/courses/${courseId}/learn`);
  }, [courseId, router]);

  if (!course) {
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

  const discount = Math.round(
    ((course.originalPrice - course.price) / course.originalPrice) * 100
  );

  const levelLabel = (level: string) => {
    switch (level) {
      case "beginner": return tp("beginner");
      case "intermediate": return tp("intermediate");
      case "advanced": return tp("advanced");
      default: return level;
    }
  };

  const levelColor = (level: string) => {
    switch (level) {
      case "beginner": return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10";
      case "intermediate": return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10";
      case "advanced": return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10";
      default: return "";
    }
  };

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons, 0);

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
                      {tc(`items.${course.category}`)}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${levelColor(course.level)}`}>
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
                      <span className="text-white font-semibold">{course.rating}</span>
                      <span>({course.reviews} {t("reviews")})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{formatStudents(course.students)} {t("students")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>{course.duration} {t("hours")}</span>
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
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                    />
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
                      <span className="text-sm text-silver dark:text-gray-300">{item}</span>
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
                      <span className="text-sm text-silver dark:text-gray-300">{item}</span>
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
                    {course.modules.length} sections • {totalLessons} {t("lessons")} • {course.duration} {t("hours")}
                  </span>
                </div>

                <div className="space-y-2">
                  {course.modules.map((mod, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gold/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-oxford dark:text-white">{mod.title}</p>
                          <p className="text-xs text-silver dark:text-gray-400">
                            {mod.lessons} {t("lessons")} • {mod.duration}
                          </p>
                        </div>
                      </div>
                      <ClockIcon className="w-4 h-4 text-silver dark:text-gray-500" />
                    </div>
                  ))}
                </div>
              </motion.div>


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
                      {course.price.toLocaleString()}&nbsp;{t("currency")}
                    </span>
                    <span className="text-lg text-silver line-through whitespace-nowrap">
                      {course.originalPrice.toLocaleString()}&nbsp;{t("currency")}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-md">
                      {discount}% {t("off")}
                    </span>
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
                    disabled={enrolling}
                    className="w-full py-3.5 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors mb-3 text-sm disabled:opacity-60"
                  >
                    {enrolling ? "..." : t("enrollNow")}
                  </button>
                )}
                <button className="w-full py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-oxford dark:text-white font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  <HeartIcon className="w-4 h-4" />
                  {t("addToWishlist")}
                </button>

                {/* Course Info */}
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-oxford dark:text-white uppercase tracking-wider">
                    {t("courseInfo")}
                  </h3>

                  {[
                    { icon: ChartBarIcon, label: t("level"), value: levelLabel(course.level) },
                    { icon: ClockIcon, label: t("duration"), value: `${course.duration} ${t("hours")}` },
                    { icon: PlayCircleIcon, label: t("curriculum"), value: `${totalLessons} ${t("lessons")}` },
                    { icon: GlobeAltIcon, label: t("language"), value: course.language },
                    { icon: AcademicCapIcon, label: t("certificate"), value: course.certificate ? t("yes") : t("no") },
                    { icon: UserGroupIcon, label: t("enrolled"), value: `${formatStudents(course.students)} ${t("students")}` },
                    { icon: CalendarDaysIcon, label: t("lastUpdated"), value: course.lastUpdated },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-silver dark:text-gray-400">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-oxford dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

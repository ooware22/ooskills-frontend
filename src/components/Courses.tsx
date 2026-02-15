"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon as ArrowRight,
  ClockIcon as Clock,
  ChartBarIcon as BarChart2,
  UserGroupIcon as Users,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as Star } from "@heroicons/react/24/solid";
import { useTranslations } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPublicCourses,
} from "@/store/slices/publicCoursesSlice";

/** Format large student counts as e.g. "2.4k" */
function formatStudents(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

export default function Courses() {
  const t = useTranslations("courses");
  const dispatch = useAppDispatch();
  const { courses, loading } = useAppSelector((s) => s.publicCourses);

  // Fetch courses once (reuses same Redux state as /courses page)
  useEffect(() => {
    if (courses.length === 0) {
      dispatch(fetchPublicCourses(undefined));
    }
  }, [dispatch, courses.length]);

  // Show up to 4 courses sorted by popularity
  const displayCourses = [...courses]
    .sort((a, b) => b.students - a.students)
    .slice(0, 4);

  return (
    <section id="courses" className="py-24 relative bg-gray-50 dark:bg-oxford-light/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-oxford dark:text-white tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-silver dark:text-gray-400">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className={`grid gap-6 ${displayCourses.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : displayCourses.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : "max-w-md mx-auto"}`}>
          {loading ? (
            /* Loading skeletons */
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden animate-pulse"
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
            ))
          ) : (
            displayCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/courses/${course.slug}`}
                  className="group block bg-white dark:bg-oxford-light rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden hover:border-gold/30 dark:hover:border-gold/30 hover:shadow-xl hover:shadow-gold/10 dark:hover:shadow-gold/15 hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 dark:bg-oxford relative overflow-hidden">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-oxford/60 to-oxford flex items-center justify-center">
                        <AcademicCapIcon className="w-12 h-12 text-gold/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-oxford/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Level Badge */}
                    <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
                      {course.level}
                    </div>
                    <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-silver mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>{course.level}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 group-hover:border-gold/20 transition-colors duration-300">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                        <span className="text-xs font-medium text-oxford dark:text-white">
                          {parseFloat(course.rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-silver">({course.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-silver">
                        <Users className="w-3.5 h-3.5" />
                        <span>{formatStudents(course.students)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mt-12"
        >
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-oxford hover:bg-oxford-light dark:bg-white dark:text-oxford dark:hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {t("viewAll")}
            <ArrowRight className="w-4 h-4 ms-2 rtl:rotate-180" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon as ArrowRight,
} from "@heroicons/react/24/outline";
import { useTranslations } from "@/lib/i18n";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchPublicCourses,
} from "@/store/slices/publicCoursesSlice";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";

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
            [1, 2, 3, 4].map((i) => (
              <CourseCardSkeleton key={i} />
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
                <CourseCard
                  course={course}
                  index={index}
                  hoursLabel="h"
                />
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


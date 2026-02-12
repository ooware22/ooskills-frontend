'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslations } from '@/lib/i18n';
import { useEnrollment } from '@/hooks/useEnrollment';
import { getCourseById } from '@/data/courses';
import { getCourseContent, getFlatSlides } from '@/data/courseContent';
import {
  AcademicCapIcon,
  PlayCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function MyCoursesPage() {
  const t = useTranslations('courseDetail');
  const { getEnrolledCourses, getProgress } = useEnrollment();

  const enrolledIds = getEnrolledCourses();

  const enrolledCourses = useMemo(() => {
    return enrolledIds
      .map((id) => {
        const course = getCourseById(id);
        if (!course) return null;
        const content = getCourseContent(id);
        const progress = getProgress(id);
        const totalSlides = content ? getFlatSlides(content).length : 0;
        const completedSlides = progress?.completedSlides?.length || 0;
        const progressPct = totalSlides > 0 ? Math.round((completedSlides / totalSlides) * 100) : 0;
        return { course, progressPct, enrolledAt: progress?.enrolledAt };
      })
      .filter(Boolean) as Array<{ course: NonNullable<ReturnType<typeof getCourseById>>; progressPct: number; enrolledAt?: string }>;
  }, [enrolledIds, getProgress]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-oxford pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold text-oxford dark:text-white mb-2">
              {t('myCourses')}
            </h1>
            <p className="text-silver dark:text-gray-400">
              {enrolledCourses.length > 0
                ? `${enrolledCourses.length} ${enrolledCourses.length === 1 ? 'course' : 'courses'}`
                : ''}
            </p>
          </motion.div>

          {enrolledCourses.length === 0 ? (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <AcademicCapIcon className="w-12 h-12 text-gray-400 dark:text-white/20" />
              </div>
              <h2 className="text-xl font-semibold text-oxford dark:text-white mb-3">
                {t('noCoursesYet')}
              </h2>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold hover:bg-gold/90 text-oxford font-semibold rounded-xl transition-colors mt-4"
              >
                {t('browseCatalog')}
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            /* Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(({ course, progressPct }, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-lg dark:hover:shadow-gold/5 transition-all group"
                >
                  {/* Course Image */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Progress badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-white/90 dark:bg-white/20 text-oxford dark:text-white text-xs font-bold rounded-full backdrop-blur">
                        {progressPct}% {t('courseProgress')}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors">
                      {course.title}
                    </h3>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPct}%`,
                            background: progressPct === 100
                              ? '#10b981'
                              : 'linear-gradient(90deg, #D4A843, #E8C76A)',
                          }}
                        />
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/courses/${course.id}/learn`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      <PlayCircleIcon className="w-4 h-4" />
                      {progressPct > 0 ? t('continueLeaning') : t('startNow')}
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

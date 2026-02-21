"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";

/** Format large student counts as e.g. "2.4k" */
function formatStudents(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

export interface CourseCardData {
  id: number | string;
  title: string;
  slug: string;
  image: string;
  level: string;
  duration: number;
  rating: string;
  reviews: number;
  students: number;
  category?: string;
  price?: number;
  originalPrice?: number;
}

export interface CourseCardProps {
  course: CourseCardData;
  index?: number;
  /** Text to show in the badge (e.g. level or category label) */
  badgeText?: string;
  /** Translated level label for the metadata row */
  levelLabel?: string;
  /** Hours label */
  hoursLabel?: string;
  /** Optional overlay badge (e.g. "Enrolled") on the thumbnail */
  overlayBadge?: React.ReactNode;
  /** Optional footer content (e.g. enroll button) rendered below the rating row */
  footer?: React.ReactNode;
}

export default function CourseCard({
  course,
  index = 0,
  badgeText,
  levelLabel,
  hoursLabel = "h",
  overlayBadge,
  footer,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="block">
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
          {overlayBadge}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Badge */}
          <div className="inline-block px-2.5 py-1 bg-gold/10 dark:bg-gold/15 text-gold text-xs font-medium rounded-full mb-3 self-start group-hover:bg-gold group-hover:text-oxford transition-colors duration-300">
            {badgeText || course.level}
          </div>

          <h3 className="font-semibold text-oxford dark:text-white mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300 leading-snug">
            {course.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-silver mb-4">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>
                {course.duration}{hoursLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ChartBarIcon className="w-3.5 h-3.5" />
              <span>{levelLabel || course.level}</span>
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

          {/* Optional footer (e.g. enroll button) */}
          {footer && <div className="mt-auto">{footer}</div>}
        </div>
      </motion.div>
    </Link>
  );
}

/** Loading skeleton for a course card */
export function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-20 bg-gray-200 dark:bg-white/5 rounded-full" />
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/5 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/5 rounded" />
        <div className="h-px bg-gray-100 dark:bg-white/5" />
        <div className="h-4 w-full bg-gray-200 dark:bg-white/5 rounded" />
      </div>
    </div>
  );
}

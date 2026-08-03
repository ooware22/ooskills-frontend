"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HeartIcon, CheckCircleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useI18n, useTranslations } from "@/lib/i18n";
import StudentHeader from "@/components/student/StudentHeader";
import CourseCard, { CourseCardSkeleton } from "@/components/CourseCard";
import EnrollDialog from "@/components/EnrollDialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchMyEnrollments } from "@/store/slices/enrollmentSlice";
import { fetchMyWishlist, toggleWishlist } from "@/store/slices/wishlistSlice";
import type { PublicCourse } from "@/services/publicCoursesApi";

export default function WishlistPage() {
  const { t } = useI18n();
  const tp = useTranslations("coursesPage");
  const tc = (key: string) => t(`student.wishlist.${key}`);
  const dispatch = useAppDispatch();

  const { items, loading } = useAppSelector((s) => s.wishlist);
  const enrollments = useAppSelector((s) => s.enrollment.enrollments);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const enrolledIds = useMemo(
    () => new Set(enrollments.map((e) => e.course_slug)),
    [enrollments],
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyWishlist());
      dispatch(fetchMyEnrollments());
    }
  }, [dispatch, isAuthenticated]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCourse, setDialogCourse] = useState<{
    id: string;
    title: string;
    price: number;
    originalPrice: number;
  } | null>(null);

  const openEnrollDialog = (e: React.MouseEvent, course: PublicCourse) => {
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

  const handleRemove = (course: PublicCourse) => {
    dispatch(toggleWishlist({ slug: course.slug, course }));
  };

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <StudentHeader
          titleKey="student.wishlist.title"
          subtitleKey="student.wishlist.subtitle"
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StudentHeader
        titleKey="student.wishlist.title"
        subtitleKey="student.wishlist.subtitle"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const course = item.course;
              const isEnrolled = enrolledIds.has(course.slug);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.04 }}
                  layout
                >
                  <CourseCard
                    course={course}
                    index={index}
                    hoursLabel={` ${tp("hours")}`}
                    wishlisted
                    onToggleWishlist={() => handleRemove(course)}
                    overlayBadge={
                      isEnrolled ? (
                        <span className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {tp("enrolled")}
                        </span>
                      ) : undefined
                    }
                    footer={
                      isEnrolled ? (
                        <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircleIcon className="w-4 h-4" />
                          {tp("enrolled")}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => openEnrollDialog(e, course)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium bg-gold text-oxford hover:bg-gold-light transition-colors duration-200"
                        >
                          <PlusIcon className="w-4 h-4" />
                          {tp("enrollNow")}
                        </button>
                      )
                    }
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <HeartIcon className="w-12 h-12 text-silver/30 dark:text-white/10 mx-auto mb-4" />
            <p className="text-silver dark:text-white/50 mb-4">
              {tc("empty")}
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-oxford rounded-xl text-sm font-medium hover:bg-gold-light transition-colors"
            >
              {tc("browseCatalog")}
            </Link>
          </motion.div>
        )}
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

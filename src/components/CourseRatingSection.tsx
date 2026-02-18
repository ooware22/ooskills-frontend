"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline, UserCircleIcon } from "@heroicons/react/24/outline";
import { ratingApi, type CourseRatingItem } from "@/services/publicCoursesApi";
import { useI18n } from "@/lib/i18n";

interface CourseRatingSectionProps {
  slug: string;
  enrolled: boolean;
  isAuthenticated: boolean;
  courseRating: string;
  courseReviews: number;
}

/** Interactive star row — used for both display and input */
function Stars({
  value,
  onChange,
  size = "w-5 h-5",
  interactive = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: string;
  interactive?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            {filled ? (
              <StarSolid className={`${size} text-gold`} />
            ) : (
              <StarOutline className={`${size} text-gray-300 dark:text-white/20`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function CourseRatingSection({
  slug,
  enrolled,
  isAuthenticated,
  courseRating,
  courseReviews,
}: CourseRatingSectionProps) {
  const { t } = useI18n();
  const tr = (key: string) => t(`courseDetail.rating_section.${key}`);

  const [ratings, setRatings] = useState<CourseRatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchRatings = useCallback(async () => {
    try {
      const data = await ratingApi.getCourseRatings(slug);
      setRatings(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Pre-fill if user already rated
  useEffect(() => {
    if (ratings.length > 0 && isAuthenticated) {
      const existing = ratings.find((r) => r.user_name); // we'll match by checking later
      // We can't match by user id easily, so we just allow re-submit via update_or_create
    }
  }, [ratings, isAuthenticated]);

  const handleSubmit = async () => {
    if (myRating === 0) return;
    setSubmitting(true);
    try {
      await ratingApi.submitCourseRating(slug, myRating, myReview);
      setSubmitted(true);
      await fetchRatings();
      // Reset form
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  // Distribution of star counts
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
    pct: ratings.length > 0
      ? Math.round((ratings.filter((r) => r.rating === star).length / ratings.length) * 100)
      : 0,
  }));

  const avgRating = parseFloat(courseRating) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white dark:bg-oxford-light rounded-2xl border border-gray-100 dark:border-white/5 p-6 lg:p-8"
    >
      <h2 className="text-xl font-bold text-oxford dark:text-white mb-6 flex items-center gap-2">
        <StarSolid className="w-6 h-6 text-gold" />
        {tr("title") || "Ratings & Reviews"}
      </h2>

      {/* Summary Row */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Big number */}
        <div className="text-center sm:text-start">
          <div className="text-5xl font-bold text-oxford dark:text-white">
            {avgRating.toFixed(1)}
          </div>
          <Stars value={Math.round(avgRating)} size="w-4 h-4" />
          <p className="text-xs text-silver dark:text-white/50 mt-1">
            {courseReviews} {tr("reviewsCount") || "reviews"}
          </p>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-2">
              <span className="text-xs text-silver dark:text-white/50 w-3 text-end">
                {d.star}
              </span>
              <StarSolid className="w-3 h-3 text-gold" />
              <div className="flex-1 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-xs text-silver dark:text-white/50 w-6 text-end">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Rating Form — Only if enrolled */}
      {enrolled && isAuthenticated && (
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-5 mb-8 border border-gray-100 dark:border-white/5">
          <h3 className="text-sm font-semibold text-oxford dark:text-white mb-3">
            {tr("rateThisCourse") || "Rate this course"}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <Stars
              value={myRating}
              onChange={setMyRating}
              size="w-7 h-7"
              interactive
            />
            {myRating > 0 && (
              <span className="text-sm text-gold font-semibold">
                {myRating}/5
              </span>
            )}
          </div>
          <textarea
            value={myReview}
            onChange={(e) => setMyReview(e.target.value)}
            placeholder={tr("reviewPlaceholder") || "Share your experience (optional)..."}
            className="w-full px-4 py-3 bg-white dark:bg-oxford-light border border-gray-200 dark:border-white/10 rounded-xl text-sm text-oxford dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none transition-all"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            {submitted && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ {tr("submitted") || "Rating submitted!"}
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={myRating === 0 || submitting}
              className="ms-auto px-6 py-2.5 bg-gold hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed text-oxford font-medium rounded-xl text-sm transition-colors"
            >
              {submitting
                ? tr("submitting") || "Submitting..."
                : tr("submitRating") || "Submit Rating"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded" />
                <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-8">
          <StarOutline className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-3" />
          <p className="text-sm text-silver dark:text-white/50">
            {tr("noReviews") || "No reviews yet. Be the first!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5"
            >
              <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircleIcon className="w-6 h-6 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-oxford dark:text-white">
                    {r.user_name}
                  </span>
                  <span className="text-xs text-silver dark:text-white/40">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Stars value={r.rating} size="w-3.5 h-3.5" />
                {r.review_text && (
                  <p className="text-sm text-silver dark:text-gray-300 mt-2 leading-relaxed">
                    {r.review_text}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

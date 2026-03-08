"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AcademicCapIcon,
  BookOpenIcon,
  FlagIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectRecentAchievement, dismissAchievement } from "@/store/slices/gamificationSlice";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useI18n } from "@/lib/i18n";

const ICON_MAP: Record<string, React.ElementType> = {
  AcademicCapIcon,
  BookOpenIcon,
  FlagIcon,
  StarIcon,
  TrophyIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  FireIcon,
};

export default function AchievementToast() {
  const dispatch = useAppDispatch();
  const achievement = useAppSelector(selectRecentAchievement);
  const { playAchievement } = useSoundEffects();
  const { t } = useI18n();

  useEffect(() => {
    if (achievement) {
      playAchievement();
      const timer = setTimeout(() => dispatch(dismissAchievement()), 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, dispatch, playAchievement]);

  const Icon = achievement ? (ICON_MAP[achievement.icon] || StarIcon) : StarIcon;
  const title = achievement
    ? (achievement.titleKey && t(achievement.titleKey)) || achievement.titleFallback || achievement.title?.en || achievement.title?.fr || ""
    : "";

  return (
    <div className="fixed top-6 right-6 z-[95] pointer-events-none">
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto flex items-center gap-3 px-5 py-4 bg-white dark:bg-oxford-light rounded-xl shadow-xl border border-gold/20 dark:border-gold/15 min-w-[280px]"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gold/10 dark:bg-gold/15 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-gold" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gold mb-0.5">
                {t("gamification.achievementUnlocked") || "Achievement Unlocked!"}
              </p>
              <p className="text-sm font-semibold text-oxford dark:text-white truncate">
                {title}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={() => dispatch(dismissAchievement())}
              className="p-1 text-silver hover:text-oxford dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

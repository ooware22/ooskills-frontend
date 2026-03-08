"use client";

import { motion } from "framer-motion";
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
} from "@heroicons/react/24/outline";
import { FireIcon } from "@heroicons/react/24/solid";
import type { Achievement } from "@/store/slices/gamificationSlice";
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

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
  delay?: number;
}

export default function AchievementCard({
  achievement,
  compact = false,
  delay = 0,
}: AchievementCardProps) {
  const { t } = useI18n();
  const Icon = ICON_MAP[achievement.icon] || StarIcon;
  const title = (achievement.titleKey && t(achievement.titleKey)) || achievement.titleFallback || achievement.title?.en || achievement.title?.fr || "";
  const description = (achievement.descriptionKey && t(achievement.descriptionKey)) || achievement.descriptionFallback || achievement.description?.en || achievement.description?.fr || "";
  const unlockedDate = achievement.unlocked_at || (achievement as any).unlockedAt;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          achievement.unlocked
            ? "bg-gold/5 border-gold/20 dark:bg-gold/10 dark:border-gold/20"
            : "bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10 opacity-50"
        }`}
      >
        <Icon
          className={`w-4 h-4 flex-shrink-0 ${
            achievement.unlocked ? "text-gold" : "text-gray-400 dark:text-white/30"
          }`}
        />
        <span
          className={`text-xs font-medium truncate ${
            achievement.unlocked
              ? "text-oxford dark:text-white"
              : "text-gray-400 dark:text-white/30"
          }`}
        >
          {title}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative rounded-xl border p-4 transition-all duration-200 ${
        achievement.unlocked
          ? "bg-white dark:bg-oxford-light border-gold/20 dark:border-gold/15 hover:border-gold/40 dark:hover:border-gold/30 hover:shadow-md"
          : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5"
      }`}
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
          achievement.unlocked
            ? "bg-gold/10 dark:bg-gold/15"
            : "bg-gray-100 dark:bg-white/5"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${
            achievement.unlocked
              ? "text-gold"
              : "text-gray-300 dark:text-white/20"
          }`}
        />
      </div>

      {/* Title & description */}
      <h4
        className={`text-sm font-semibold mb-1 ${
          achievement.unlocked
            ? "text-oxford dark:text-white"
            : "text-gray-400 dark:text-white/25"
        }`}
      >
        {title}
      </h4>
      <p
        className={`text-xs leading-relaxed ${
          achievement.unlocked
            ? "text-silver dark:text-white/50"
            : "text-gray-300 dark:text-white/15"
        }`}
      >
        {description}
      </p>

      {/* Unlocked date */}
      {achievement.unlocked && unlockedDate && (
        <p className="text-[10px] text-gold/80 dark:text-gold/60 mt-2">
          {new Date(unlockedDate).toLocaleDateString()}
        </p>
      )}

      {/* Lock overlay */}
      {!achievement.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
            <svg className="w-3 h-3 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
        </div>
      )}
    </motion.div>
  );
}

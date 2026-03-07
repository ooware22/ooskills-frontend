"use client";

import { motion } from "framer-motion";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n";
import { useAppSelector } from "@/store/hooks";
import { selectGamification, selectLevelProgress, LEVEL_THRESHOLDS } from "@/store/slices/gamificationSlice";

export default function XPProgressBar() {
  const { t } = useI18n();
  const { totalXp, currentLevel, xpForCurrentLevel, xpForNextLevel } = useAppSelector(selectGamification);
  const progress = useAppSelector(selectLevelProgress);
  const isMaxLevel = currentLevel >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;

  const currentLevelInfo = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel);
  const nextLevelInfo = LEVEL_THRESHOLDS.find((l) => l.level === currentLevel + 1);

  const levelTitle = t(currentLevelInfo?.titleKey || "") || currentLevelInfo?.titleFallback || "";
  const nextLevelTitle = t(nextLevelInfo?.titleKey || "") || nextLevelInfo?.titleFallback || "";

  const xpInLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 p-5"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5 text-gold" />
          </div>
          <div>
            <p className="text-sm font-semibold text-oxford dark:text-white">
              {t("gamification.level") || "Level"} {currentLevel}
              <span className="text-gold ms-1.5">{levelTitle}</span>
            </p>
          </div>
        </div>
        <div className="text-end">
          <p className="text-xs font-medium text-oxford dark:text-white/80">
            {totalXp.toLocaleString()} XP
          </p>
          {!isMaxLevel && (
            <p className="text-[10px] text-silver dark:text-white/40">
              {xpInLevel} / {xpNeeded} {t("gamification.toNextLevel") || "to next level"}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
          style={{ width: "50%" }}
        />
      </div>

      {/* Level labels */}
      {!isMaxLevel && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-silver dark:text-white/40">
            Lv.{currentLevel}
          </span>
          <span className="text-[10px] text-silver dark:text-white/40">
            Lv.{currentLevel + 1} · {nextLevelTitle}
          </span>
        </div>
      )}
    </motion.div>
  );
}

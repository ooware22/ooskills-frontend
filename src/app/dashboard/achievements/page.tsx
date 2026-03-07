"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import StudentHeader from "@/components/student/StudentHeader";
import AchievementCard from "@/components/student/AchievementCard";
import { useAppSelector } from "@/store/hooks";
import { selectAchievements } from "@/store/slices/gamificationSlice";
import { useI18n } from "@/lib/i18n";

type Filter = "all" | "unlocked" | "locked";

export default function AchievementsPage() {
  const { t } = useI18n();
  const achievements = useAppSelector(selectAchievements);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = achievements.filter((a) => {
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const filters: { value: Filter; labelKey: string; fallback: string }[] = [
    { value: "all", labelKey: "gamification.filter.all", fallback: "All" },
    { value: "unlocked", labelKey: "gamification.filter.unlocked", fallback: "Unlocked" },
    { value: "locked", labelKey: "gamification.filter.locked", fallback: "Locked" },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <StudentHeader
        title={t("gamification.achievements.pageTitle") || "Achievements"}
        subtitle={
          t("gamification.achievements.pageSubtitle") ||
          "Track your milestones and unlock rewards"
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-oxford dark:text-white">
                {unlockedCount} / {totalCount}
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                {t("gamification.achievements.completed") || "achievements completed"}
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-white dark:bg-oxford-light text-oxford dark:text-white shadow-sm"
                    : "text-silver dark:text-white/50 hover:text-oxford dark:hover:text-white"
                }`}
              >
                {t(f.labelKey) || f.fallback}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              delay={index * 0.05}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FunnelIcon className="w-10 h-10 text-silver/40 mx-auto mb-3" />
            <p className="text-sm text-silver dark:text-white/50">
              {t("gamification.achievements.noResults") || "No achievements match this filter"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


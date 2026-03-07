"use client";

import { motion } from "framer-motion";
import {
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import StudentHeader from "@/components/student/StudentHeader";
import LevelAvatar from "@/components/student/LevelAvatar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectLeaderboard,
  selectGamification,
  setLeaderboardPeriod,
  LEVEL_THRESHOLDS,
  selectLevelProgress,
} from "@/store/slices/gamificationSlice";
import { useI18n } from "@/lib/i18n";

export default function LeaderboardPage() {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const leaderboard = useAppSelector(selectLeaderboard);
  const { leaderboardPeriod } = useAppSelector(selectGamification);

  const periods: { value: "weekly" | "alltime"; labelKey: string; fallback: string; icon: React.ElementType }[] = [
    { value: "weekly", labelKey: "gamification.leaderboard.weekly", fallback: "This Week", icon: CalendarDaysIcon },
    { value: "alltime", labelKey: "gamification.leaderboard.alltime", fallback: "All Time", icon: ClockIcon },
  ];

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-500 bg-amber-500/10";
      case 2:
        return "text-gray-400 bg-gray-400/10";
      case 3:
        return "text-orange-600 bg-orange-600/10";
      default:
        return "text-silver dark:text-white/40 bg-gray-100 dark:bg-white/5";
    }
  };

  return (
    <div className="min-h-screen">
      <StudentHeader
        title={t("gamification.leaderboard.pageTitle") || "Leaderboard"}
        subtitle={
          t("gamification.leaderboard.pageSubtitle") ||
          "See how you rank among other learners"
        }
      />

      <div className="p-6">
        {/* Period toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-oxford dark:text-white">
                {t("gamification.leaderboard.title") || "Rankings"}
              </p>
              <p className="text-xs text-silver dark:text-white/50">
                {t("gamification.leaderboard.subtitle") || "Top learners by XP"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 rounded-lg p-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => dispatch(setLeaderboardPeriod(p.value))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  leaderboardPeriod === p.value
                    ? "bg-white dark:bg-oxford-light text-oxford dark:text-white shadow-sm"
                    : "text-silver dark:text-white/50 hover:text-oxford dark:hover:text-white"
                }`}
              >
                <p.icon className="w-3.5 h-3.5" />
                {t(p.labelKey) || p.fallback}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-oxford-light rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden"
        >
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {leaderboard.map((entry, index) => {
              const levelInfo = LEVEL_THRESHOLDS.find((l) => l.level === entry.level);
              const nextLevel = LEVEL_THRESHOLDS.find((l) => l.level === entry.level + 1);
              const progress = nextLevel
                ? (entry.xp - (levelInfo?.xpRequired || 0)) /
                  (nextLevel.xpRequired - (levelInfo?.xpRequired || 0))
                : 1;

              return (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    entry.isCurrentUser
                      ? "bg-gold/5 dark:bg-gold/10"
                      : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Rank */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${getRankStyle(entry.rank)}`}
                  >
                    {entry.rank}
                  </div>

                  {/* Avatar */}
                  <LevelAvatar
                    src={entry.avatar}
                    name={entry.name}
                    size="sm"
                    level={entry.level}
                    progress={progress}
                  />

                  {/* Name & level */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        entry.isCurrentUser
                          ? "text-gold"
                          : "text-oxford dark:text-white"
                      }`}
                    >
                      {entry.name}
                      {entry.isCurrentUser && (
                        <span className="text-xs text-gold/60 ms-1.5">
                          ({t("gamification.leaderboard.you") || "You"})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-silver dark:text-white/40">
                      {t(levelInfo?.titleKey || "") || levelInfo?.titleFallback}
                    </p>
                  </div>

                  {/* XP */}
                  <div className="text-end flex-shrink-0">
                    <p className="text-sm font-bold text-oxford dark:text-white">
                      {entry.xp.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-silver dark:text-white/40">XP</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

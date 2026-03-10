"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FireIcon } from "@heroicons/react/24/solid";
import { useAppSelector } from "@/store/hooks";
import { selectGamification } from "@/store/slices/gamificationSlice";
import { useI18n } from "@/lib/i18n";

// Spark particle component
function Spark({ delay, angle }: { delay: number; angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * 18;
  const y = Math.sin(rad) * 18;

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-orange-400"
      style={{ left: "50%", top: "50%", marginLeft: -2, marginTop: -2 }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x: [0, x * 0.5, x],
        y: [0, y * 0.5 - 4, y - 8],
        opacity: [0, 1, 0],
        scale: [0, 1.2, 0],
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export default function StreakCounter() {
  const { streak, longestStreak } = useAppSelector(selectGamification);
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);

  if (streak <= 0) return null;

  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  // Generate spark angles
  const sparks = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 cursor-pointer"
      >
        {/* Fire icon container */}
        <div className="relative">
          {/* Animated fire icon */}
          <motion.div
            animate={
              hovered
                ? { scale: [1, 1.3, 1.15, 1.25, 1.1], rotate: [0, -8, 8, -5, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={
              hovered
                ? { duration: 0.5, ease: "easeInOut" }
                : { duration: 0.3 }
            }
          >
            <FireIcon
              className={`w-5 h-5 transition-colors duration-300 ${
                hovered
                  ? "text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                  : isOnFire
                    ? "text-red-500"
                    : isHot
                      ? "text-orange-500"
                      : "text-orange-500"
              }`}
            />
          </motion.div>

          {/* Ambient glow (always on if hot) */}
          {isHot && !hovered && (
            <motion.div
              className="absolute -inset-1 rounded-full opacity-30 pointer-events-none"
              style={{
                background: isOnFire
                  ? "radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}

          {/* Hover sparks explosion */}
          <AnimatePresence>
            {hovered && (
              <>
                {sparks.map((angle, i) => (
                  <Spark key={`${angle}-${i}`} delay={i * 0.04} angle={angle} />
                ))}
                {/* Intense glow on hover */}
                <motion.div
                  className="absolute -inset-2 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(239,68,68,0.2) 50%, transparent 70%)",
                  }}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 0.8, 0.5], scale: [0.5, 1.4, 1.2] }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.4 }}
                />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Streak number — animate on hover */}
        <motion.span
          className="text-sm font-bold text-oxford dark:text-white"
          animate={
            hovered
              ? { scale: [1, 1.15, 1], color: "#f97316" }
              : { scale: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          {streak}
        </motion.span>
        <span className="text-xs text-silver dark:text-white/50 hidden sm:inline">
          {t("gamification.streak.days") || "days"}
        </span>
      </motion.div>

      {/* Hover tooltip — streak details */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 pointer-events-none"
          >
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-oxford dark:border-b-[#1a2744] absolute right-3 -top-[5px]" />
            <div className="bg-oxford dark:bg-[#1a2744] text-white rounded-lg shadow-xl border border-white/10 px-3 py-2 min-w-[120px]">
              <div className="flex items-center gap-1.5 mb-1">
                <FireIcon className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-semibold">
                  {streak} {t("gamification.streak.days") || "days"}
                </span>
              </div>
              <div className="text-[9px] text-white/40 border-t border-white/10 pt-1">
                🏆 {t("gamification.streak.best") || "Best"}: {longestStreak} {t("gamification.streak.days") || "days"}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

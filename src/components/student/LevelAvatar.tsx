"use client";

import { useState, useEffect, useId } from "react";
import Image from "next/image";
import { LEVEL_THRESHOLDS } from "@/store/slices/gamificationSlice";
import { useAppSelector } from "@/store/hooks";
import { selectGamification } from "@/store/slices/gamificationSlice";
import { useI18n } from "@/lib/i18n";

interface LevelAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  level: number;
  progress: number; // 0 to 1
}

const sizeMap = {
  sm: { container: 36, avatar: 28, strokeWidth: 2.5, badge: 14, fontSize: 7.5 },
  md: { container: 44, avatar: 34, strokeWidth: 3, badge: 16, fontSize: 8.5 },
  lg: { container: 56, avatar: 44, strokeWidth: 3.5, badge: 20, fontSize: 10 },
};

export default function LevelAvatar({
  src,
  alt = "",
  name = "",
  size = "md",
  level,
  progress,
}: LevelAvatarProps) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const uid = useId();
  const { totalXp, xpForNextLevel } = useAppSelector(selectGamification);

  const s = sizeMap[size];
  const center = s.container / 2;
  const radius = (s.container - s.strokeWidth) / 2 - 1;
  const circumference = 2 * Math.PI * radius;
  const currentOffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  // Key counter — incrementing remounts the progress circle, replaying the animation
  const [animKey, setAnimKey] = useState(0);
  const [filled, setFilled] = useState(false);

  // On mount or when animKey changes, trigger the fill after a frame
  useEffect(() => {
    setFilled(false);
    const timer = setTimeout(() => setFilled(true), 50);
    return () => clearTimeout(timer);
  }, [animKey]);

  // Replay sweep on hover
  const handleMouseEnter = () => {
    setHovered(true);
    setAnimKey((k) => k + 1); // remount circle → replays animation
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  // Badge colors based on level tier
  const isHighTier = level >= 8;
  const isMaxTier = level >= 10;

  // Level info for tooltip
  const levelInfo = LEVEL_THRESHOLDS.find((l) => l.level === level);
  const levelTitle = t(levelInfo?.titleKey || "") || levelInfo?.titleFallback || "";
  const xpRemaining = Math.max(xpForNextLevel - totalXp, 0);

  const gradientId = `grad_${uid}`;

  return (
    <div
      className="relative flex-shrink-0 group"
      style={{ width: s.container, height: s.container }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hover glow */}
      <div className="absolute inset-[-4px] rounded-full bg-gold/0 group-hover:bg-gold/10 transition-all duration-300 pointer-events-none" />

      {/* SVG Progress Ring */}
      <svg
        width={s.container}
        height={s.container}
        className="absolute inset-0"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-white/10"
          strokeWidth={s.strokeWidth}
        />
        {/* Progress arc — key forces remount to replay animation */}
        <circle
          key={animKey}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={s.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={filled ? currentOffset : circumference}
          style={{
            transition: filled
              ? "stroke-dashoffset 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "none",
          }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CFB53B" />
            <stop offset="100%" stopColor="#E8D48A" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar */}
      <div
        className="absolute rounded-full overflow-hidden"
        style={{
          width: s.avatar,
          height: s.avatar,
          top: (s.container - s.avatar) / 2,
          left: (s.container - s.avatar) / 2,
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={s.avatar}
            height={s.avatar}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gold flex items-center justify-center transition-all duration-300 group-hover:brightness-110">
            <span
              className="text-oxford font-semibold"
              style={{ fontSize: s.avatar * 0.4 }}
            >
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Level Badge */}
      <div
        className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:scale-125 ${
          isMaxTier
            ? "border-white dark:border-gold/50 bg-gradient-to-br from-yellow-400 via-gold to-amber-600 shadow-lg shadow-gold/30"
            : isHighTier
              ? "border-white dark:border-gold/40 bg-gradient-to-br from-gold to-gold-light shadow-md shadow-gold/20"
              : "border-white dark:border-white/20 bg-oxford dark:bg-[#1a2744]"
        }`}
        style={{
          width: s.badge,
          height: s.badge,
          bottom: -2,
          insetInlineEnd: -2,
        }}
      >
        <span
          className={`font-bold leading-none ${
            isHighTier ? "text-oxford" : "text-gold"
          }`}
          style={{ fontSize: s.fontSize }}
        >
          {level}
        </span>
      </div>

      {/* Tooltip — shows level + XP remaining on hover */}
      <div
        className={`absolute end-0 whitespace-nowrap pointer-events-none z-50 transition-all duration-200 ${
          hovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-1"
        }`}
        style={{ top: s.container + 6 }}
      >
        {/* Arrow pointing up */}
        <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-oxford dark:border-b-[#1a2744] absolute end-2 -top-[5px]" />
        <div className="bg-oxford dark:bg-[#1a2744] text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 flex flex-col items-center gap-0.5">
          <div>
            <span className="text-gold font-bold">Lv.{level}</span>
            <span className="mx-1 text-white/30">·</span>
            <span>{levelTitle}</span>
          </div>
          {!isMaxTier && (
            <div className="text-[9px] text-white/50">
              {xpRemaining} XP {t("gamification.toNextLevel") || "to next level"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


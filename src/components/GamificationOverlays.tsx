"use client";

import LevelUpModal from "@/components/student/LevelUpModal";
import XPGainToast from "@/components/student/XPGainToast";
import AchievementToast from "@/components/student/AchievementToast";
import { useAppSelector } from "@/store/hooks";

/**
 * Renders the gamification overlays (XP toast, level-up modal, achievement toast)
 * globally on every page. Only renders when the user is authenticated.
 */
export default function GamificationOverlays() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (!isAuthenticated) return null;

  return (
    <>
      <LevelUpModal />
      <XPGainToast />
      <AchievementToast />
    </>
  );
}

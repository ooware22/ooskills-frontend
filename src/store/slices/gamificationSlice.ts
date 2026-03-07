"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

// ─── Level Thresholds ────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  titleKey: string;       // translation key
  titleFallback: string;  // English fallback
  xpRequired: number;     // total XP needed to reach this level
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1,  titleKey: "gamification.levels.beginner",   titleFallback: "Beginner",   xpRequired: 0 },
  { level: 2,  titleKey: "gamification.levels.apprentice", titleFallback: "Apprentice", xpRequired: 100 },
  { level: 3,  titleKey: "gamification.levels.student",    titleFallback: "Student",    xpRequired: 300 },
  { level: 4,  titleKey: "gamification.levels.explorer",   titleFallback: "Explorer",   xpRequired: 600 },
  { level: 5,  titleKey: "gamification.levels.scholar",    titleFallback: "Scholar",    xpRequired: 1000 },
  { level: 6,  titleKey: "gamification.levels.expert",     titleFallback: "Expert",     xpRequired: 1500 },
  { level: 7,  titleKey: "gamification.levels.master",     titleFallback: "Master",     xpRequired: 2200 },
  { level: 8,  titleKey: "gamification.levels.champion",   titleFallback: "Champion",   xpRequired: 3000 },
  { level: 9,  titleKey: "gamification.levels.legend",     titleFallback: "Legend",     xpRequired: 4000 },
  { level: 10, titleKey: "gamification.levels.genius",     titleFallback: "Genius",     xpRequired: 5500 },
];

// ─── Achievement Types ───────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  titleKey: string;
  descriptionKey: string;
  titleFallback: string;
  descriptionFallback: string;
  icon: string;         // Heroicon component name
  unlocked: boolean;
  unlockedAt: string | null;
  category: "learning" | "streak" | "mastery" | "social";
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string | null;
  level: number;
  xp: number;
  isCurrentUser: boolean;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface GamificationState {
  totalXp: number;
  currentLevel: number;
  currentLevelTitle: string;
  xpForCurrentLevel: number;     // XP threshold for current level
  xpForNextLevel: number;        // XP threshold for next level
  streak: number;                 // consecutive days
  longestStreak: number;
  lastLoginDate: string | null;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  leaderboardPeriod: "weekly" | "alltime";
  showLevelUpModal: boolean;
  newLevel: number | null;
  xpGainQueue: { id: string; amount: number; label: string }[];
  recentAchievement: Achievement | null;
  soundEnabled: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_step",
    titleKey: "gamification.achievements.firstStep.title",
    descriptionKey: "gamification.achievements.firstStep.desc",
    titleFallback: "First Step",
    descriptionFallback: "Complete your first lesson",
    icon: "AcademicCapIcon",
    unlocked: true,
    unlockedAt: "2026-02-15T10:30:00Z",
    category: "learning",
  },
  {
    id: "avid_reader",
    titleKey: "gamification.achievements.avidReader.title",
    descriptionKey: "gamification.achievements.avidReader.desc",
    titleFallback: "Avid Reader",
    descriptionFallback: "Complete 10 lessons",
    icon: "BookOpenIcon",
    unlocked: true,
    unlockedAt: "2026-02-20T14:00:00Z",
    category: "learning",
  },
  {
    id: "finisher",
    titleKey: "gamification.achievements.finisher.title",
    descriptionKey: "gamification.achievements.finisher.desc",
    titleFallback: "Finisher",
    descriptionFallback: "Complete your first course",
    icon: "FlagIcon",
    unlocked: true,
    unlockedAt: "2026-02-25T09:00:00Z",
    category: "learning",
  },
  {
    id: "perfectionist",
    titleKey: "gamification.achievements.perfectionist.title",
    descriptionKey: "gamification.achievements.perfectionist.desc",
    titleFallback: "Perfectionist",
    descriptionFallback: "Get 100% on any quiz",
    icon: "StarIcon",
    unlocked: true,
    unlockedAt: "2026-02-22T11:00:00Z",
    category: "mastery",
  },
  {
    id: "on_fire_7",
    titleKey: "gamification.achievements.onFire7.title",
    descriptionKey: "gamification.achievements.onFire7.desc",
    titleFallback: "On Fire",
    descriptionFallback: "7-day login streak",
    icon: "FireIcon",
    unlocked: true,
    unlockedAt: "2026-03-01T08:00:00Z",
    category: "streak",
  },
  {
    id: "unstoppable_30",
    titleKey: "gamification.achievements.unstoppable30.title",
    descriptionKey: "gamification.achievements.unstoppable30.desc",
    titleFallback: "Unstoppable",
    descriptionFallback: "30-day login streak",
    icon: "FireIcon",
    unlocked: false,
    unlockedAt: null,
    category: "streak",
  },
  {
    id: "multi_graduate",
    titleKey: "gamification.achievements.multiGraduate.title",
    descriptionKey: "gamification.achievements.multiGraduate.desc",
    titleFallback: "Multi-Graduate",
    descriptionFallback: "Earn 3 certificates",
    icon: "TrophyIcon",
    unlocked: false,
    unlockedAt: null,
    category: "learning",
  },
  {
    id: "critic",
    titleKey: "gamification.achievements.critic.title",
    descriptionKey: "gamification.achievements.critic.desc",
    titleFallback: "Critic",
    descriptionFallback: "Leave 5 course reviews",
    icon: "ChatBubbleLeftRightIcon",
    unlocked: false,
    unlockedAt: null,
    category: "social",
  },
  {
    id: "speedster",
    titleKey: "gamification.achievements.speedster.title",
    descriptionKey: "gamification.achievements.speedster.desc",
    titleFallback: "Speedster",
    descriptionFallback: "Complete a course in under 7 days",
    icon: "BoltIcon",
    unlocked: false,
    unlockedAt: null,
    category: "mastery",
  },
  {
    id: "rising_star",
    titleKey: "gamification.achievements.risingStar.title",
    descriptionKey: "gamification.achievements.risingStar.desc",
    titleFallback: "Rising Star",
    descriptionFallback: "Reach Level 5",
    icon: "SparklesIcon",
    unlocked: true,
    unlockedAt: "2026-03-04T16:00:00Z",
    category: "mastery",
  },
  {
    id: "legend",
    titleKey: "gamification.achievements.legend.title",
    descriptionKey: "gamification.achievements.legend.desc",
    titleFallback: "Legend",
    descriptionFallback: "Reach Level 10",
    icon: "ShieldCheckIcon",
    unlocked: false,
    unlockedAt: null,
    category: "mastery",
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Ahmed Benali",     avatar: null, level: 8, xp: 3450, isCurrentUser: false },
  { rank: 2, name: "Fatima Zohra",     avatar: null, level: 7, xp: 2800, isCurrentUser: false },
  { rank: 3, name: "Karim Messaoudi",  avatar: null, level: 6, xp: 1950, isCurrentUser: false },
  { rank: 4, name: "Amina Khelif",     avatar: null, level: 5, xp: 1200, isCurrentUser: true },
  { rank: 5, name: "Yacine Brahimi",   avatar: null, level: 5, xp: 1100, isCurrentUser: false },
  { rank: 6, name: "Sara Bouzid",      avatar: null, level: 4, xp: 850,  isCurrentUser: false },
  { rank: 7, name: "Mohamed Ait",      avatar: null, level: 4, xp: 780,  isCurrentUser: false },
  { rank: 8, name: "Nadia Cherif",     avatar: null, level: 3, xp: 520,  isCurrentUser: false },
  { rank: 9, name: "Rami Djoudi",      avatar: null, level: 3, xp: 410,  isCurrentUser: false },
  { rank: 10, name: "Lina Hadjeres",   avatar: null, level: 2, xp: 180,  isCurrentUser: false },
];

// ─── Helper ──────────────────────────────────────────────────────────────────

function getLevelForXP(xp: number): LevelInfo {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xpRequired) return LEVEL_THRESHOLDS[i];
  }
  return LEVEL_THRESHOLDS[0];
}

function getNextLevel(currentLevel: number): LevelInfo | null {
  const idx = LEVEL_THRESHOLDS.findIndex((l) => l.level === currentLevel);
  if (idx < LEVEL_THRESHOLDS.length - 1) return LEVEL_THRESHOLDS[idx + 1];
  return null;
}

// ─── Initial State (mock: level 5 with 1200 XP) ─────────────────────────────

const MOCK_XP = 1200;
const mockLevel = getLevelForXP(MOCK_XP);
const mockNextLevel = getNextLevel(mockLevel.level);

const initialState: GamificationState = {
  totalXp: MOCK_XP,
  currentLevel: mockLevel.level,
  currentLevelTitle: mockLevel.titleFallback,
  xpForCurrentLevel: mockLevel.xpRequired,
  xpForNextLevel: mockNextLevel?.xpRequired ?? mockLevel.xpRequired,
  streak: 12,
  longestStreak: 18,
  lastLoginDate: "2026-03-07",
  achievements: MOCK_ACHIEVEMENTS,
  leaderboard: MOCK_LEADERBOARD,
  leaderboardPeriod: "weekly",
  showLevelUpModal: false,
  newLevel: null,
  xpGainQueue: [],
  recentAchievement: null,
  soundEnabled: true,
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    /** Add XP and check for level-up */
    addXP(state, action: PayloadAction<{ amount: number; label: string }>) {
      const prev = getLevelForXP(state.totalXp);
      state.totalXp += action.payload.amount;
      const next = getLevelForXP(state.totalXp);

      // Queue XP gain toast
      state.xpGainQueue.push({
        id: `${Date.now()}-${Math.random()}`,
        amount: action.payload.amount,
        label: action.payload.label,
      });

      // Level up?
      if (next.level > prev.level) {
        state.currentLevel = next.level;
        state.currentLevelTitle = next.titleFallback;
        state.xpForCurrentLevel = next.xpRequired;
        const nextNext = getNextLevel(next.level);
        state.xpForNextLevel = nextNext?.xpRequired ?? next.xpRequired;
        state.showLevelUpModal = true;
        state.newLevel = next.level;
      }
    },

    /** Dismiss the XP gain toast */
    dismissXPGain(state, action: PayloadAction<string>) {
      state.xpGainQueue = state.xpGainQueue.filter((g) => g.id !== action.payload);
    },

    /** Close the level-up modal */
    dismissLevelUp(state) {
      state.showLevelUpModal = false;
      state.newLevel = null;
    },

    /** Trigger an achievement unlock */
    unlockAchievement(state, action: PayloadAction<string>) {
      const ach = state.achievements.find((a) => a.id === action.payload);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        state.recentAchievement = { ...ach };
      }
    },

    /** Dismiss achievement toast */
    dismissAchievement(state) {
      state.recentAchievement = null;
    },

    /** Toggle leaderboard period */
    setLeaderboardPeriod(state, action: PayloadAction<"weekly" | "alltime">) {
      state.leaderboardPeriod = action.payload;
    },

    /** Toggle sound on/off */
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },

    /** Set sound preference */
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },

    /** Demo: trigger a level up for testing */
    demoLevelUp(state) {
      state.showLevelUpModal = true;
      state.newLevel = state.currentLevel + 1;
    },

    /** Demo: trigger an achievement for testing */
    demoAchievement(state) {
      const locked = state.achievements.find((a) => !a.unlocked);
      if (locked) {
        locked.unlocked = true;
        locked.unlockedAt = new Date().toISOString();
        state.recentAchievement = { ...locked };
      }
    },
  },
});

export const {
  addXP,
  dismissXPGain,
  dismissLevelUp,
  unlockAchievement,
  dismissAchievement,
  setLeaderboardPeriod,
  toggleSound,
  setSoundEnabled,
  demoLevelUp,
  demoAchievement,
} = gamificationSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectGamification = (state: RootState) => state.gamification;
export const selectLevel = (state: RootState) => state.gamification.currentLevel;
export const selectTotalXP = (state: RootState) => state.gamification.totalXp;
export const selectStreak = (state: RootState) => state.gamification.streak;
export const selectAchievements = (state: RootState) => state.gamification.achievements;
export const selectLeaderboard = (state: RootState) => state.gamification.leaderboard;
export const selectShowLevelUp = (state: RootState) => state.gamification.showLevelUpModal;
export const selectXPGainQueue = (state: RootState) => state.gamification.xpGainQueue;
export const selectRecentAchievement = (state: RootState) => state.gamification.recentAchievement;
export const selectSoundEnabled = (state: RootState) => state.gamification.soundEnabled;

/** Returns 0–1 progress toward next level */
export const selectLevelProgress = (state: RootState) => {
  const { totalXp, xpForCurrentLevel, xpForNextLevel } = state.gamification;
  if (xpForNextLevel <= xpForCurrentLevel) return 1; // max level
  return (totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
};

export default gamificationSlice.reducer;

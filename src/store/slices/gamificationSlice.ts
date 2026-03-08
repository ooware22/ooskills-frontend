"use client";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/axios";
import type { RootState } from "@/store";
import { logout, clearCredentials } from "./authSlice";

// ─── Level Thresholds ────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number;
  titleKey: string;       // translation key
  titleFallback: string;  // English fallback
  xpRequired: number;     // total XP needed to reach this level
}

export const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, titleKey: "gamification.levels.beginner", titleFallback: "Beginner", xpRequired: 0 },
  { level: 2, titleKey: "gamification.levels.apprentice", titleFallback: "Apprentice", xpRequired: 100 },
  { level: 3, titleKey: "gamification.levels.student", titleFallback: "Student", xpRequired: 300 },
  { level: 4, titleKey: "gamification.levels.explorer", titleFallback: "Explorer", xpRequired: 600 },
  { level: 5, titleKey: "gamification.levels.scholar", titleFallback: "Scholar", xpRequired: 1000 },
  { level: 6, titleKey: "gamification.levels.expert", titleFallback: "Expert", xpRequired: 1500 },
  { level: 7, titleKey: "gamification.levels.master", titleFallback: "Master", xpRequired: 2200 },
  { level: 8, titleKey: "gamification.levels.champion", titleFallback: "Champion", xpRequired: 3000 },
  { level: 9, titleKey: "gamification.levels.legend", titleFallback: "Legend", xpRequired: 4000 },
  { level: 10, titleKey: "gamification.levels.genius", titleFallback: "Genius", xpRequired: 5500 },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  key: string;
  title: Record<string, string>;         // i18n: { fr, en, ar }
  description: Record<string, string>;   // i18n: { fr, en, ar }
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
  unlocked: boolean;
  unlocked_at: string | null;
  // Frontend-only convenience fields (computed from i18n)
  titleKey?: string;
  descriptionKey?: string;
  titleFallback?: string;
  descriptionFallback?: string;
  category?: "learning" | "streak" | "mastery" | "social";
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  level: number;
  total_xp: number;
  // Frontend convenience
  isCurrentUser?: boolean;
}

export interface XPTransaction {
  id: string;
  source: string;
  amount: number;
  reference_id: string;
  description: string;
  created_at: string;
}

export interface XPProfile {
  total_xp: number;
  level: number;
  level_title: Record<string, string>;  // i18n
  xp_for_current_level: number;
  xp_for_next_level: number | null;
  progress: number;                      // 0–100
  streak_days: number;
  longest_streak: number;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface GamificationState {
  // Profile data (from backend)
  totalXp: number;
  currentLevel: number;
  currentLevelTitle: string;
  levelTitleI18n: Record<string, string>;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  streak: number;
  longestStreak: number;
  profileLoading: boolean;
  profileError: string | null;
  lastFetchedProfile: number | null;
  _initialProfileLoaded: boolean;  // prevents false level-up on first fetch

  // Achievements (from backend)
  achievements: Achievement[];
  achievementsLoading: boolean;
  lastFetchedAchievements: number | null;

  // XP History (from backend)
  xpHistory: XPTransaction[];
  xpHistoryLoading: boolean;
  lastFetchedHistory: number | null;

  // Leaderboard (from backend)
  leaderboard: LeaderboardEntry[];
  leaderboardLoading: boolean;
  leaderboardPeriod: "weekly" | "alltime";
  lastFetchedLeaderboard: number | null;

  // UI state (local only)
  showLevelUpModal: boolean;
  newLevel: number | null;
  xpGainQueue: { id: string; amount: number; label: string }[];
  recentAchievement: Achievement | null;
  soundEnabled: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CACHE_TTL = 60_000; // 60 seconds

function isCacheValid(lastFetched: number | null): boolean {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < CACHE_TTL;
}

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

function extractResults<T>(data: T[] | { results: T[]; count: number }): T[] {
  if (Array.isArray(data)) return data;
  if (data && "results" in data) return data.results;
  return [];
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: GamificationState = {
  totalXp: 0,
  currentLevel: 1,
  currentLevelTitle: "Beginner",
  levelTitleI18n: { en: "Beginner", fr: "Débutant", ar: "مبتدئ" },
  xpForCurrentLevel: 0,
  xpForNextLevel: 100,
  streak: 0,
  longestStreak: 0,
  profileLoading: false,
  profileError: null,
  lastFetchedProfile: null,
  _initialProfileLoaded: false,

  achievements: [],
  achievementsLoading: false,
  lastFetchedAchievements: null,

  xpHistory: [],
  xpHistoryLoading: false,
  lastFetchedHistory: null,

  leaderboard: [],
  leaderboardLoading: false,
  leaderboardPeriod: "weekly",
  lastFetchedLeaderboard: null,

  showLevelUpModal: false,
  newLevel: null,
  xpGainQueue: [],
  recentAchievement: null,
  soundEnabled: true,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

/** Fetch the current user's XP profile from the backend */
export const fetchGamificationProfile = createAsyncThunk(
  "gamification/fetchProfile",
  async (_, { getState }) => {
    const state = (getState() as RootState).gamification;
    if (isCacheValid(state.lastFetchedProfile)) {
      return null; // Use cached data
    }
    const { data } = await api.get<XPProfile>("/gamification/profile/");
    return data;
  },
);

/** Fetch all achievements with unlock status */
export const fetchAchievements = createAsyncThunk(
  "gamification/fetchAchievements",
  async (_, { getState }) => {
    const state = (getState() as RootState).gamification;
    if (isCacheValid(state.lastFetchedAchievements)) {
      return null;
    }
    const { data } = await api.get("/gamification/achievements/");
    return extractResults<Achievement>(data);
  },
);

/** Fetch XP transaction history */
export const fetchXPHistory = createAsyncThunk(
  "gamification/fetchXPHistory",
  async (_, { getState }) => {
    const state = (getState() as RootState).gamification;
    if (isCacheValid(state.lastFetchedHistory)) {
      return null;
    }
    const { data } = await api.get("/gamification/xp-history/");
    return extractResults<XPTransaction>(data);
  },
);

/** Fetch leaderboard for a given period */
export const fetchLeaderboard = createAsyncThunk(
  "gamification/fetchLeaderboard",
  async (period: "weekly" | "alltime", { getState }) => {
    const { data } = await api.get(`/gamification/leaderboard/?period=${period}`);
    return {
      period,
      entries: extractResults<LeaderboardEntry>(data),
    };
  },
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    /** Add XP locally and check for level-up (optimistic update + toast) */
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

      // Invalidate profile cache so next fetch gets fresh data
      state.lastFetchedProfile = null;
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

    /** Trigger an achievement unlock (local) */
    unlockAchievement(state, action: PayloadAction<string>) {
      const ach = state.achievements.find((a) => a.id === action.payload || a.key === action.payload);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlocked_at = new Date().toISOString();
        state.recentAchievement = { ...ach };
        // Invalidate achievements cache
        state.lastFetchedAchievements = null;
      }
    },

    /** Dismiss achievement toast */
    dismissAchievement(state) {
      state.recentAchievement = null;
    },

    /** Toggle leaderboard period */
    setLeaderboardPeriod(state, action: PayloadAction<"weekly" | "alltime">) {
      state.leaderboardPeriod = action.payload;
      // Invalidate leaderboard cache to fetch new period
      state.lastFetchedLeaderboard = null;
    },

    /** Toggle sound on/off */
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled;
    },

    /** Set sound preference */
    setSoundEnabled(state, action: PayloadAction<boolean>) {
      state.soundEnabled = action.payload;
    },

    /** Invalidate all caches (force re-fetch on next read) */
    invalidateGamification(state) {
      state.lastFetchedProfile = null;
      state.lastFetchedAchievements = null;
      state.lastFetchedHistory = null;
      state.lastFetchedLeaderboard = null;
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
        locked.unlocked_at = new Date().toISOString();
        state.recentAchievement = { ...locked };
      }
    },
  },
  extraReducers: (builder) => {
    // ── Profile ──────────────────────────────────────────────────
    builder
      .addCase(fetchGamificationProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchGamificationProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        if (action.payload) {
          const data = action.payload;
          const prevXp = state.totalXp;
          const prevLevel = state.currentLevel;
          const wasLoaded = state._initialProfileLoaded;

          state.totalXp = data.total_xp;
          state.currentLevel = data.level;
          state.levelTitleI18n = data.level_title;
          state.currentLevelTitle = data.level_title?.en || data.level_title?.fr || "Beginner";
          state.xpForCurrentLevel = data.xp_for_current_level;
          state.xpForNextLevel = data.xp_for_next_level ?? data.xp_for_current_level;
          state.streak = data.streak_days;
          state.longestStreak = data.longest_streak;
          state.lastFetchedProfile = Date.now();
          state._initialProfileLoaded = true;

          // Only detect changes AFTER initial load (skip the very first fetch)
          if (wasLoaded) {
            // Detect level-up
            if (data.level > prevLevel) {
              state.showLevelUpModal = true;
              state.newLevel = data.level;
            }

            // Detect XP gain (show toast for the difference)
            const xpDelta = data.total_xp - prevXp;
            if (xpDelta > 0) {
              state.xpGainQueue.push({
                id: `api-${Date.now()}`,
                amount: xpDelta,
                label: "XP earned",
              });
            }
          }
        }
      })
      .addCase(fetchGamificationProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.error.message || "Failed to fetch profile";
      });

    // ── Achievements ─────────────────────────────────────────────
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.achievementsLoading = true;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.achievementsLoading = false;
        if (action.payload) {
          // Check for newly unlocked achievements (compare with previous state)
          const prevUnlockedKeys = new Set(
            state.achievements.filter((a) => a.unlocked).map((a) => a.key)
          );

          state.achievements = action.payload;
          state.lastFetchedAchievements = Date.now();

          // Detect newly unlocked achievement for toast
          const newlyUnlocked = action.payload.find(
            (a) => a.unlocked && !prevUnlockedKeys.has(a.key)
          );
          if (newlyUnlocked && prevUnlockedKeys.size > 0) {
            state.recentAchievement = newlyUnlocked;
          }
        }
      })
      .addCase(fetchAchievements.rejected, (state) => {
        state.achievementsLoading = false;
      });

    // ── XP History ───────────────────────────────────────────────
    builder
      .addCase(fetchXPHistory.pending, (state) => {
        state.xpHistoryLoading = true;
      })
      .addCase(fetchXPHistory.fulfilled, (state, action) => {
        state.xpHistoryLoading = false;
        if (action.payload) {
          state.xpHistory = action.payload;
          state.lastFetchedHistory = Date.now();
        }
      })
      .addCase(fetchXPHistory.rejected, (state) => {
        state.xpHistoryLoading = false;
      });

    // ── Leaderboard ──────────────────────────────────────────────
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboardLoading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboardLoading = false;
        state.leaderboard = action.payload.entries;
        state.leaderboardPeriod = action.payload.period;
        state.lastFetchedLeaderboard = Date.now();
      })
      .addCase(fetchLeaderboard.rejected, (state) => {
        state.leaderboardLoading = false;
      });

    // ── Reset on logout ──────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(clearCredentials, () => initialState);
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
  invalidateGamification,
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
export const selectProfileLoading = (state: RootState) => state.gamification.profileLoading;
export const selectAchievementsLoading = (state: RootState) => state.gamification.achievementsLoading;
export const selectLeaderboardLoading = (state: RootState) => state.gamification.leaderboardLoading;
export const selectXPHistory = (state: RootState) => state.gamification.xpHistory;
export const selectXPHistoryLoading = (state: RootState) => state.gamification.xpHistoryLoading;
export const selectLeaderboardPeriod = (state: RootState) => state.gamification.leaderboardPeriod;
export const selectLevelTitleI18n = (state: RootState) => state.gamification.levelTitleI18n;

/** Returns 0–1 progress toward next level */
export const selectLevelProgress = (state: RootState) => {
  const { totalXp, xpForCurrentLevel, xpForNextLevel } = state.gamification;
  if (xpForNextLevel <= xpForCurrentLevel) return 1; // max level
  return (totalXp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel);
};

export default gamificationSlice.reducer;

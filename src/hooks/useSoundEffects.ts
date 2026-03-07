"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectSoundEnabled } from "@/store/slices/gamificationSlice";

/**
 * Hook for playing gamification sound effects.
 * Reads the sound enabled preference from the gamification store.
 * Audio files are located in /public/sounds/
 */
export function useSoundEffects() {
  const soundEnabled = useAppSelector(selectSoundEnabled);
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Preload audio files
  useEffect(() => {
    if (typeof window === "undefined") return;

    const files = ["level-up.mp3", "achievement.mp3", "xp-gain.mp3"];
    files.forEach((file) => {
      if (!audioCache.current.has(file)) {
        const audio = new Audio(`/sounds/${file}`);
        audio.preload = "auto";
        audio.volume = 0.5;
        audioCache.current.set(file, audio);
      }
    });
  }, []);

  const play = useCallback(
    (file: string, volume = 0.5) => {
      if (!soundEnabled || typeof window === "undefined") return;

      const cached = audioCache.current.get(file);
      if (cached) {
        cached.currentTime = 0;
        cached.volume = volume;
        cached.play().catch(() => {
          // Autoplay blocked — user hasn't interacted yet
        });
      } else {
        // Fallback: create on the fly
        const audio = new Audio(`/sounds/${file}`);
        audio.volume = volume;
        audio.play().catch(() => {});
        audioCache.current.set(file, audio);
      }
    },
    [soundEnabled],
  );

  const playLevelUp = useCallback(() => play("level-up.mp3", 0.6), [play]);
  const playAchievement = useCallback(() => play("achievement.mp3", 0.5), [play]);
  const playXPGain = useCallback(() => play("xp-gain.mp3", 0.3), [play]);

  return { playLevelUp, playAchievement, playXPGain, soundEnabled };
}

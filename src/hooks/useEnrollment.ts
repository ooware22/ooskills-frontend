'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ooskills_enrolled_courses';
const PROGRESS_KEY = 'ooskills_course_progress';

export interface CourseProgress {
  currentSlideIndex: number;
  completedSlides: number[];
  completedModules: number[];
  quizScores: Record<string, number>;
  enrolledAt: string;
  lastAccessedAt: string;
}

function getEnrolledIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Progress map keyed per-user when userId is provided */
function getProgressStorageKey(userId?: string | null): string {
  if (userId) return `${PROGRESS_KEY}_${userId}`;
  return PROGRESS_KEY;
}

function getProgressMap(userId?: string | null): Record<string, CourseProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(getProgressStorageKey(userId));
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function createDefaultProgress(): CourseProgress {
  return {
    currentSlideIndex: 0,
    completedSlides: [],
    completedModules: [],
    quizScores: {},
    enrolledAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
  };
}

/**
 * @param userId — optional user ID to isolate progress per student.
 *                  When provided, localStorage progress is stored separately.
 */
export function useEnrollment(userId?: string | null) {
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEnrolledIds(getEnrolledIds());
    setLoaded(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEnrolledIds(getEnrolledIds());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isEnrolled = useCallback((courseId: number) => {
    return enrolledIds.includes(courseId);
  }, [enrolledIds]);

  const enroll = useCallback((courseId: number) => {
    const ids = getEnrolledIds();
    if (!ids.includes(courseId)) {
      const updated = [...ids, courseId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setEnrolledIds(updated);

      // Initialize progress
      const progress = getProgressMap(userId);
      if (!progress[courseId]) {
        progress[courseId] = createDefaultProgress();
        localStorage.setItem(getProgressStorageKey(userId), JSON.stringify(progress));
      }
    }
  }, [userId]);

  /**
   * Get progress by course key (slug or numeric ID).
   * Accepts string (slug) or number (legacy ID).
   */
  const getProgress = useCallback((courseKey: string | number): CourseProgress | null => {
    const progress = getProgressMap(userId);
    return progress[String(courseKey)] || null;
  }, [userId]);

  /**
   * Update progress by course key (slug or numeric ID).
   * Auto-initializes progress if it doesn't exist yet (handles API-enrolled courses).
   */
  const updateProgress = useCallback((courseKey: string | number, updates: Partial<CourseProgress>) => {
    const key = String(courseKey);
    const progress = getProgressMap(userId);
    // Auto-init if missing (API-enrolled courses won't have localStorage entry)
    if (!progress[key]) {
      progress[key] = createDefaultProgress();
    }
    progress[key] = {
      ...progress[key],
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };
    localStorage.setItem(getProgressStorageKey(userId), JSON.stringify(progress));
  }, [userId]);

  const getEnrolledCourses = useCallback(() => {
    return enrolledIds;
  }, [enrolledIds]);

  return { isEnrolled, enroll, getProgress, updateProgress, getEnrolledCourses, loaded };
}


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

/** Progress map now supports both numeric IDs (legacy) and string slugs as keys */
function getProgressMap(): Record<string, CourseProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
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

export function useEnrollment() {
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
      const progress = getProgressMap();
      if (!progress[courseId]) {
        progress[courseId] = createDefaultProgress();
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      }
    }
  }, []);

  /**
   * Get progress by course key (slug or numeric ID).
   * Accepts string (slug) or number (legacy ID).
   */
  const getProgress = useCallback((courseKey: string | number): CourseProgress | null => {
    const progress = getProgressMap();
    return progress[String(courseKey)] || null;
  }, []);

  /**
   * Update progress by course key (slug or numeric ID).
   * Auto-initializes progress if it doesn't exist yet (handles API-enrolled courses).
   */
  const updateProgress = useCallback((courseKey: string | number, updates: Partial<CourseProgress>) => {
    const key = String(courseKey);
    const progress = getProgressMap();
    // Auto-init if missing (API-enrolled courses won't have localStorage entry)
    if (!progress[key]) {
      progress[key] = createDefaultProgress();
    }
    progress[key] = {
      ...progress[key],
      ...updates,
      lastAccessedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, []);

  const getEnrolledCourses = useCallback(() => {
    return enrolledIds;
  }, [enrolledIds]);

  return { isEnrolled, enroll, getProgress, updateProgress, getEnrolledCourses, loaded };
}

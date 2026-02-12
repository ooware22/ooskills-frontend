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

function getProgressMap(): Record<number, CourseProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
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
        progress[courseId] = {
          currentSlideIndex: 0,
          completedSlides: [],
          completedModules: [],
          quizScores: {},
          enrolledAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
        };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      }
    }
  }, []);

  const getProgress = useCallback((courseId: number): CourseProgress | null => {
    const progress = getProgressMap();
    return progress[courseId] || null;
  }, []);

  const updateProgress = useCallback((courseId: number, updates: Partial<CourseProgress>) => {
    const progress = getProgressMap();
    if (progress[courseId]) {
      progress[courseId] = {
        ...progress[courseId],
        ...updates,
        lastAccessedAt: new Date().toISOString(),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    }
  }, []);

  const getEnrolledCourses = useCallback(() => {
    return enrolledIds;
  }, [enrolledIds]);

  return { isEnrolled, enroll, getProgress, updateProgress, getEnrolledCourses, loaded };
}

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EnrollmentInfo {
  courseId: number;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  completedLessons: number;
  enrolledAt: string;
}

interface EnrollmentState {
  enrollments: EnrollmentInfo[];
}

// Pre-seed with some enrolled courses so the dashboard isn't empty on first load
const initialState: EnrollmentState = {
  enrollments: [
    { courseId: 1, status: "in-progress", progress: 65, completedLessons: 32, enrolledAt: "2026-01-20" },
    { courseId: 5, status: "in-progress", progress: 30, completedLessons: 17, enrolledAt: "2026-01-25" },
    { courseId: 6, status: "completed", progress: 100, completedLessons: 46, enrolledAt: "2025-12-01" },
    { courseId: 7, status: "completed", progress: 100, completedLessons: 38, enrolledAt: "2026-01-10" },
    { courseId: 11, status: "in-progress", progress: 45, completedLessons: 14, enrolledAt: "2026-02-01" },
  ],
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    enrollCourse(state, action: PayloadAction<number>) {
      const courseId = action.payload;
      if (!state.enrollments.find((e) => e.courseId === courseId)) {
        state.enrollments.push({
          courseId,
          status: "not-started",
          progress: 0,
          completedLessons: 0,
          enrolledAt: new Date().toISOString().split("T")[0],
        });
      }
    },
    unenrollCourse(state, action: PayloadAction<number>) {
      state.enrollments = state.enrollments.filter(
        (e) => e.courseId !== action.payload
      );
    },
  },
});

export const { enrollCourse, unenrollCourse } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

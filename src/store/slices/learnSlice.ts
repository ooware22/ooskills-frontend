"use client";

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { learnApi } from "@/services/learnApi";
import type {
  FinalQuizConfig,
  FinalQuizQuestion,
  FinalQuizResult,
} from "@/services/learnApi";
import type { CourseContent } from "@/data/courseContent";
import { logout, clearCredentials } from "./authSlice";

// ─── Types ──────────────────────────────────────────────────────────────────

export type { FinalQuizConfig, FinalQuizQuestion, FinalQuizResult };

// ─── State ──────────────────────────────────────────────────────────────────

interface LearnState {
  // Course content (from API)
  courseContent: CourseContent | null;
  contentLoading: boolean;
  contentError: string | null;

  // Quiz attempts — passed scores keyed by quiz_id
  quizPassedScores: Record<string, number>;
  quizAttemptsLoading: boolean;

  // Final quiz
  finalQuizConfig: FinalQuizConfig | null;
  finalQuizQuestions: FinalQuizQuestion[];
  finalQuizResult: FinalQuizResult | null;
  finalQuizLoading: boolean;
  finalQuizError: string | null;
}

const initialState: LearnState = {
  courseContent: null,
  contentLoading: false,
  contentError: null,

  quizPassedScores: {},
  quizAttemptsLoading: false,

  finalQuizConfig: null,
  finalQuizQuestions: [],
  finalQuizResult: null,
  finalQuizLoading: false,
  finalQuizError: null,
};

// ─── Async Thunks ───────────────────────────────────────────────────────────

/** Fetch course content from API by slug */
export const fetchCourseContentBySlug = createAsyncThunk(
  "learn/fetchCourseContent",
  async (slug: string, { rejectWithValue }) => {
    try {
      return await learnApi.fetchCourseContent(slug);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.detail || "Failed to load course content"
      );
    }
  }
);

/** Fetch quiz attempts and extract passed scores */
export const fetchQuizAttempts = createAsyncThunk(
  "learn/fetchQuizAttempts",
  async () => {
    const attempts = await learnApi.fetchQuizAttempts();

    // Build a map of quiz_id → best PASSED score
    const passedScores: Record<string, number> = {};
    for (const att of attempts as any[]) {
      const qid = att.quiz?.id || att.quiz_id || att.quiz;
      if (!qid) continue;
      if (!att.passed) continue;
      const score = Number(att.score) || 0;
      if (!passedScores[String(qid)] || score > passedScores[String(qid)]) {
        passedScores[String(qid)] = score;
      }
    }
    return passedScores;
  }
);

/** Submit a section quiz attempt */
export const submitQuizAttempt = createAsyncThunk(
  "learn/submitQuizAttempt",
  async (
    { quizId, answers }: { quizId: string; answers: Record<string, number> },
    { rejectWithValue }
  ) => {
    try {
      return await learnApi.submitQuizAttempt(quizId, answers);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.detail || "Failed to submit quiz attempt"
      );
    }
  }
);

/** Fetch final quiz configuration */
export const fetchFinalQuizConfig = createAsyncThunk(
  "learn/fetchFinalQuizConfig",
  async (courseSlug: string, { rejectWithValue }) => {
    try {
      return await learnApi.fetchFinalQuizConfig(courseSlug);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.detail || "Failed to load final quiz config"
      );
    }
  }
);

/** Generate final quiz questions */
export const generateFinalQuizQuestions = createAsyncThunk(
  "learn/generateFinalQuizQuestions",
  async (courseId: string, { rejectWithValue }) => {
    try {
      return await learnApi.generateFinalQuizQuestions(courseId);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.detail || "Failed to generate questions"
      );
    }
  }
);

/** Submit final quiz answers */
export const submitFinalQuiz = createAsyncThunk(
  "learn/submitFinalQuiz",
  async (
    payload: {
      courseId: string;
      questionIds: string[];
      answers: Record<string, number>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await learnApi.submitFinalQuiz(
        payload.courseId,
        payload.questionIds,
        payload.answers
      );
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.detail || "Failed to submit quiz"
      );
    }
  }
);

// ─── Slice ──────────────────────────────────────────────────────────────────

const learnSlice = createSlice({
  name: "learn",
  initialState,
  reducers: {
    /** Reset learn state (e.g., when navigating away) */
    resetLearnState() {
      return initialState;
    },
    /** Clear final quiz state for retry */
    resetFinalQuiz(state) {
      state.finalQuizQuestions = [];
      state.finalQuizResult = null;
      state.finalQuizError = null;
    },
    /** Clear content error */
    clearContentError(state) {
      state.contentError = null;
    },
    /** Clear final quiz error */
    clearFinalQuizError(state) {
      state.finalQuizError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Course Content ──────────────────────────────────────────
    builder
      .addCase(fetchCourseContentBySlug.pending, (state) => {
        state.contentLoading = true;
        state.contentError = null;
      })
      .addCase(fetchCourseContentBySlug.fulfilled, (state, action) => {
        state.courseContent = action.payload;
        state.contentLoading = false;
      })
      .addCase(fetchCourseContentBySlug.rejected, (state, action) => {
        state.contentLoading = false;
        state.contentError = (action.payload as string) || "Failed to load content";
      });

    // ── Quiz Attempts ───────────────────────────────────────────
    builder
      .addCase(fetchQuizAttempts.pending, (state) => {
        state.quizAttemptsLoading = true;
      })
      .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
        state.quizPassedScores = action.payload;
        state.quizAttemptsLoading = false;
      })
      .addCase(fetchQuizAttempts.rejected, (state) => {
        state.quizAttemptsLoading = false;
      });

    // ── Submit Quiz Attempt (no state change needed — fire-and-forget) ──

    // ── Final Quiz Config ───────────────────────────────────────
    builder
      .addCase(fetchFinalQuizConfig.pending, (state) => {
        state.finalQuizLoading = true;
        state.finalQuizError = null;
      })
      .addCase(fetchFinalQuizConfig.fulfilled, (state, action) => {
        state.finalQuizConfig = action.payload;
        state.finalQuizLoading = false;
      })
      .addCase(fetchFinalQuizConfig.rejected, (state, action) => {
        state.finalQuizLoading = false;
        state.finalQuizError = (action.payload as string) || "Failed to load config";
      });

    // ── Generate Final Quiz Questions ───────────────────────────
    builder
      .addCase(generateFinalQuizQuestions.pending, (state) => {
        state.finalQuizLoading = true;
        state.finalQuizError = null;
      })
      .addCase(generateFinalQuizQuestions.fulfilled, (state, action) => {
        state.finalQuizQuestions = action.payload;
        state.finalQuizLoading = false;
      })
      .addCase(generateFinalQuizQuestions.rejected, (state, action) => {
        state.finalQuizLoading = false;
        state.finalQuizError = (action.payload as string) || "Failed to generate questions";
      });

    // ── Submit Final Quiz ───────────────────────────────────────
    builder
      .addCase(submitFinalQuiz.pending, (state) => {
        state.finalQuizLoading = true;
        state.finalQuizError = null;
      })
      .addCase(submitFinalQuiz.fulfilled, (state, action) => {
        state.finalQuizResult = action.payload;
        state.finalQuizLoading = false;
      })
      .addCase(submitFinalQuiz.rejected, (state, action) => {
        state.finalQuizLoading = false;
        state.finalQuizError = (action.payload as string) || "Failed to submit quiz";
      });

    // ── Reset on logout ─────────────────────────────────────────
    builder
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(clearCredentials, () => initialState);
  },
});

// ─── Selectors ──────────────────────────────────────────────────────────────

export const selectLearnState = (state: { learn: LearnState }) => state.learn;
export const selectCourseContent = (state: { learn: LearnState }) => state.learn.courseContent;
export const selectContentLoading = (state: { learn: LearnState }) => state.learn.contentLoading;
export const selectContentError = (state: { learn: LearnState }) => state.learn.contentError;
export const selectQuizPassedScores = (state: { learn: LearnState }) => state.learn.quizPassedScores;
export const selectFinalQuizConfig = (state: { learn: LearnState }) => state.learn.finalQuizConfig;
export const selectFinalQuizQuestions = (state: { learn: LearnState }) => state.learn.finalQuizQuestions;
export const selectFinalQuizResult = (state: { learn: LearnState }) => state.learn.finalQuizResult;
export const selectFinalQuizLoading = (state: { learn: LearnState }) => state.learn.finalQuizLoading;
export const selectFinalQuizError = (state: { learn: LearnState }) => state.learn.finalQuizError;

// ─── Exports ────────────────────────────────────────────────────────────────

export const {
  resetLearnState,
  resetFinalQuiz,
  clearContentError,
  clearFinalQuizError,
} = learnSlice.actions;

export default learnSlice.reducer;
